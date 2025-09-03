import { scanFileHash } from './scanService';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export async function scanPickedFiles(assets, settings) {
  const out = [];
  for (const f of assets) {
    try {
      const info = await FileSystem.getInfoAsync(f.uri, { size: true });
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, f.uri, { encoding: Crypto.CryptoEncoding.HEX });
      const vt = await scanFileHash(hash, settings);
      out.push({ name: f.name || 'file', safe: !!vt.safe, reason: vt.reason || 'Checked', size: info.size, sha256: hash });
    } catch (e) {
      out.push({ name: f.name || 'file', safe: false, reason: e?.message || 'Unable to scan' });
    }
  }
  return out;
}


