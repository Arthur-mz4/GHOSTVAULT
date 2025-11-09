import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const CACHE_PREFIX = 'scan_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// API Endpoints
const APIS = {
  metadefender: 'https://api.metadefender.com/v4',
  hybridAnalysis: 'https://www.hybrid-analysis.com/api/v2',
  xcitium: 'https://verdict.valkyrie.comodo.com/api',
};

// Get API keys from settings
const getApiKeys = (settings) => ({
  metadefender: settings.metadefenderKey || '',
  hybridAnalysis: settings.hybridAnalysisKey || '',
  xcitium: settings.xcitiumKey || '',
});

// Cache management
const getCachedResult = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
};

const setCachedResult = async (key, data) => {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

// ClamAV-inspired heuristic scanning (offline)
const clamavHeuristicScan = (url) => {
  const suspicious = [
    'exe', 'bat', 'cmd', 'scr', 'vbs', 'js', 'jar',
    'dll', 'sys', 'drv', 'ps1', 'msi', 'apk'
  ];
  
  const phishing = [
    'login', 'verify', 'account', 'update', 'secure',
    'banking', 'paypal', 'amazon', 'confirm', 'suspended'
  ];
  
  const malicious = [
    'crack', 'keygen', 'patch', 'hack', 'exploit',
    'trojan', 'virus', 'malware', 'ransomware'
  ];

  const urlLower = url.toLowerCase();
  
  // Check for suspicious file extensions
  for (const ext of suspicious) {
    if (urlLower.endsWith(`.${ext}`)) {
      return { safe: false, source: 'ClamAV Heuristics', reason: `Suspicious file type: .${ext}` };
    }
  }
  
  // Check for phishing keywords
  for (const keyword of phishing) {
    if (urlLower.includes(keyword)) {
      return { safe: false, source: 'ClamAV Heuristics', reason: `Potential phishing: contains "${keyword}"` };
    }
  }
  
  // Check for malware keywords
  for (const keyword of malicious) {
    if (urlLower.includes(keyword)) {
      return { safe: false, source: 'ClamAV Heuristics', reason: `Malware indicator: "${keyword}"` };
    }
  }
  
  return { safe: true, source: 'ClamAV Heuristics', reason: 'No threats detected' };
};

// MetaDefender API scan
const scanWithMetaDefender = async (url, apiKey) => {
  if (!apiKey) return null;
  
  try {
    const response = await fetch(`${APIS.metadefender}/url`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url }),
      timeout: 10000
    });
    
    const data = await response.json();
    
    if (data.scan_results) {
      const detected = data.scan_results.total_detected_avs || 0;
      const total = data.scan_results.total_avs || 0;
      
      return {
        safe: detected === 0,
        source: 'MetaDefender',
        reason: detected > 0 ? `Detected by ${detected}/${total} engines` : 'Clean',
        details: data
      };
    }
  } catch (error) {
    console.error('MetaDefender error:', error);
  }
  
  return null;
};

// Hybrid Analysis API scan
const scanWithHybridAnalysis = async (url, apiKey) => {
  if (!apiKey) return null;
  
  try {
    const response = await fetch(`${APIS.hybridAnalysis}/quick-scan/url`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'GhostGuard Mobile'
      },
      body: `url=${encodeURIComponent(url)}`,
      timeout: 15000
    });
    
    const data = await response.json();
    
    if (data.verdict) {
      return {
        safe: data.verdict === 'no specific threat' || data.verdict === 'whitelisted',
        source: 'Hybrid Analysis',
        reason: `Verdict: ${data.verdict}`,
        threatScore: data.threat_score || 0,
        details: data
      };
    }
  } catch (error) {
    console.error('Hybrid Analysis error:', error);
  }
  
  return null;
};

// Xcitium (Comodo) API scan
const scanWithXcitium = async (url, apiKey) => {
  if (!apiKey) return null;
  
  try {
    // Generate hash for the URL
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      url
    );
    
    const response = await fetch(`${APIS.xcitium}/verdict`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sha256: hash }),
      timeout: 10000
    });
    
    const data = await response.json();
    
    if (data.verdict) {
      return {
        safe: data.verdict === 'trusted' || data.verdict === 'unknown',
        source: 'Xcitium',
        reason: `Verdict: ${data.verdict}`,
        details: data
      };
    }
  } catch (error) {
    console.error('Xcitium error:', error);
  }
  
  return null;
};

// Main multi-API scan function
export const multiApiScan = async (url, settings) => {
  try {
    // Check cache first
    const cached = await getCachedResult(url);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const apiKeys = getApiKeys(settings);
    const results = [];
    
    // 1. ClamAV Heuristics (always first, offline)
    const clamavResult = clamavHeuristicScan(url);
    results.push(clamavResult);
    
    // If ClamAV finds it unsafe, we might want to verify with APIs
    // But if it's safe, we still check APIs for thoroughness
    
    // 2. MetaDefender (fast, reliable)
    if (apiKeys.metadefender) {
      const mdResult = await scanWithMetaDefender(url, apiKeys.metadefender);
      if (mdResult) results.push(mdResult);
    }
    
    // 3. Hybrid Analysis (detailed, slower)
    if (apiKeys.hybridAnalysis) {
      const haResult = await scanWithHybridAnalysis(url, apiKeys.hybridAnalysis);
      if (haResult) results.push(haResult);
    }
    
    // 4. Xcitium (quick verdict)
    if (apiKeys.xcitium) {
      const xcResult = await scanWithXcitium(url, apiKeys.xcitium);
      if (xcResult) results.push(xcResult);
    }
    
    // Aggregate results
    const unsafeResults = results.filter(r => !r.safe);
    const finalResult = {
      safe: unsafeResults.length === 0,
      reason: unsafeResults.length > 0 
        ? `${unsafeResults.length} API(s) flagged as unsafe` 
        : 'All scans passed',
      sources: results.map(r => r.source).join(', '),
      details: results,
      timestamp: Date.now()
    };
    
    // Cache the result
    await setCachedResult(url, finalResult);
    
    return finalResult;
  } catch (error) {
    console.error('Multi-API scan error:', error);
    return {
      safe: false,
      reason: 'Scan error: ' + error.message,
      sources: 'Error',
      error: true
    };
  }
};

// File hash scanning
export const scanFileHash = async (hash, settings) => {
  try {
    const cached = await getCachedResult(hash);
    if (cached) return { ...cached, cached: true };
    
    const apiKeys = getApiKeys(settings);
    const results = [];
    
    // MetaDefender hash lookup
    if (apiKeys.metadefender) {
      try {
        const response = await fetch(`${APIS.metadefender}/hash/${hash}`, {
          headers: { 'apikey': apiKeys.metadefender },
          timeout: 10000
        });
        const data = await response.json();
        
        if (data.scan_results) {
          const detected = data.scan_results.total_detected_avs || 0;
          results.push({
            safe: detected === 0,
            source: 'MetaDefender',
            reason: detected > 0 ? `Detected by ${detected} engines` : 'Clean'
          });
        }
      } catch (error) {
        console.error('MetaDefender hash error:', error);
      }
    }
    
    // Hybrid Analysis hash lookup
    if (apiKeys.hybridAnalysis) {
      try {
        const response = await fetch(`${APIS.hybridAnalysis}/search/hash`, {
          method: 'POST',
          headers: {
            'api-key': apiKeys.hybridAnalysis,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `hash=${hash}`,
          timeout: 10000
        });
        const data = await response.json();
        
        if (data.length > 0 && data[0].verdict) {
          results.push({
            safe: data[0].verdict === 'no specific threat',
            source: 'Hybrid Analysis',
            reason: `Verdict: ${data[0].verdict}`
          });
        }
      } catch (error) {
        console.error('Hybrid Analysis hash error:', error);
      }
    }
    
    const unsafeResults = results.filter(r => !r.safe);
    const finalResult = {
      safe: unsafeResults.length === 0 && results.length > 0,
      reason: unsafeResults.length > 0 
        ? 'Hash flagged as malicious' 
        : results.length > 0 ? 'Hash is clean' : 'Unknown hash',
      sources: results.map(r => r.source).join(', '),
      details: results
    };
    
    await setCachedResult(hash, finalResult);
    return finalResult;
  } catch (error) {
    return {
      safe: false,
      reason: 'Hash scan error: ' + error.message,
      error: true
    };
  }
};

// Clear scan cache
export const clearScanCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};


