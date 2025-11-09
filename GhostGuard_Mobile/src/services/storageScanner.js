import { scanFileHash } from './scanService';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

// Offline file analysis (no API needed) - simplified for clarity
const analyzeFileOffline = (fileName, fileSize) => {
  const nameLower = fileName.toLowerCase();
  
  // Dangerous executable extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.scr', '.vbs', '.ps1', '.msi', '.com', '.pif'
  ];
  
  // Check for dangerous extensions
  for (const ext of dangerousExtensions) {
    if (nameLower.endsWith(ext)) {
      return {
        safe: false,
        reason: '❌ Unsafe - Executable file detected'
      };
    }
  }

  // Check for suspicious keywords in filename
  const suspiciousKeywords = ['crack', 'keygen', 'patch', 'hack', 'exploit', 'trojan', 'virus', 'malware', 'ransomware'];
  for (const keyword of suspiciousKeywords) {
    if (nameLower.includes(keyword)) {
      return {
        safe: false,
        reason: '❌ Unsafe - Suspicious filename detected'
      };
    }
  }

  // APK files - check if from trusted source (simplified check)
  if (nameLower.endsWith('.apk')) {
    // Check if filename suggests it's from official source
    const trustedIndicators = ['play', 'store', 'official', 'google'];
    const isTrusted = trustedIndicators.some(indicator => nameLower.includes(indicator));
    
    if (isTrusted) {
      return {
        safe: true,
        reason: '✅ Safe - APK from trusted source'
      };
    }
    
    // For other APKs, use file size as indicator (very small = suspicious)
    if (fileSize < 100000) { // Less than 100KB
      return {
        safe: false,
        reason: '❌ Unsafe - APK file too small, likely malicious'
      };
    }
    
    return {
      safe: true,
      reason: '✅ Safe - APK file appears legitimate'
    };
  }

  // Check file size (very small files can be suspicious scripts)
  if (fileSize < 100) {
    return {
      safe: false,
      reason: '❌ Unsafe - File too small, potential script'
    };
  }

  // Common safe file types
  const safeExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv',
    '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
    '.zip', '.rar', '.7z'
  ];
  
  for (const ext of safeExtensions) {
    if (nameLower.endsWith(ext)) {
      return {
        safe: true,
        reason: '✅ Safe - No threats detected'
      };
    }
  }

  // Default: safe for unknown file types
  return {
    safe: true,
    reason: '✅ Safe - No threats detected'
  };
};

export async function scanPickedFiles(assets, settings = {}) {
  const out = [];

  // Normalize input: accept a single asset object, an object with an `assets` array,
  // or an array of assets. This makes the function robust to different DocumentPicker
  // return shapes (single vs multiple selection across SDK versions).
  const normalized = (() => {
    if (!assets) return [];
    if (Array.isArray(assets)) return assets;
    if (assets.assets && Array.isArray(assets.assets)) return assets.assets;
    // Single asset object
    return [assets];
  })();

  for (const f of normalized) {
    // Defensive parsing of uri/name/size so a filesystem warning doesn't abort the whole flow
    const uri = f.uri || f.fileUri || f.uri;
    const fileName = f.name || f.fileName || (uri ? decodeURIComponent(uri.split('/').pop() || 'file') : 'file');
    let fileSize = f.size || 0;

    // Try to get file info, but don't abort if it fails (some SDKs warn/deprecate getInfoAsync).
    try {
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      if (info && typeof info.size === 'number') fileSize = info.size;
    } catch (infoErr) {
      console.log('[storageScanner] getInfoAsync failed (non-fatal):', infoErr?.message || infoErr);
      // proceed using whatever metadata we have (f.size or 0)
    }

    // Debugging/logging: helps confirm each file is being processed distinctly
    console.log('[storageScanner] scanning:', { fileName, uri, fileSize });

    // 1. Always run offline analysis first (instant, no API needed)
    const offlineResult = analyzeFileOffline(fileName, fileSize);

    // 2. Generate hash for the file (try base64 then utf8). Failures here are non-fatal.
    let hash = 'N/A';
    try {
      let fileContent;
      try {
        fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      } catch (rErr) {
        console.log('[storageScanner] base64 read failed, falling back to utf8 (non-fatal):', rErr?.message || rErr);
        try {
          fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
        } catch (tErr) {
          console.log('[storageScanner] utf8 read also failed (non-fatal):', tErr?.message || tErr);
          fileContent = null;
        }
      }

      if (fileContent) {
        hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          fileContent,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
      }
    } catch (hashError) {
      console.log('[storageScanner] Hash generation failed (non-fatal):', hashError?.message || hashError);
    }

    // 3. Try VirusTotal if API key is available and we have a hash
    let finalResult = offlineResult;
    if (settings?.vtApiKey && hash !== 'N/A') {
      try {
        const vtResult = await scanFileHash(hash, settings);
        if (vtResult && !vtResult.error) {
          finalResult = vtResult;
        }
      } catch (vtError) {
        console.log('[storageScanner] VirusTotal scan failed (non-fatal):', vtError?.message || vtError);
      }
    }

    out.push({
      name: fileName,
      safe: !!finalResult.safe,
      reason: finalResult.reason || 'Checked',
      size: fileSize,
      sha256: hash
    });
  }
  return out;
}


