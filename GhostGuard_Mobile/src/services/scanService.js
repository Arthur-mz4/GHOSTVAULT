import { Buffer } from 'buffer';

const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz'];
const phishingHints = ['login-', 'verify', 'reset', 'account-security', 'confirm'];
const knownShorteners = ['bit.ly', 'goo.gl', 't.co', 'ow.ly', 'tinyurl.com'];

export function normalizeUrl(url) { try { return new URL(url).toString(); } catch { return url; } }
function base64url(input) { return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }

function offlineHeuristics(url, level = 'standard') {
  try {
    const u = new URL(url); const host = u.hostname.toLowerCase(); const path = u.pathname.toLowerCase();
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return { safe: false, reason: 'Direct IP address in URL' };
    if (knownShorteners.includes(host)) return { safe: false, reason: 'Link shortener detected' };
    if (suspiciousTlds.some(t => host.endsWith(t))) return { safe: false, reason: 'Suspicious TLD' };
    if (phishingHints.some(k => host.includes(k) || path.includes(k))) return { safe: false, reason: 'Phishing keywords detected' };
    if (level === 'strict' && host.split('.').length <= 2) return { safe: false, reason: 'Top-level host under strict mode' };
  } catch { return { safe: false, reason: 'Invalid URL' }; }
  return { safe: true, reason: 'No obvious issues found' };
}

export async function scanUrl(url, settings) {
  const target = normalizeUrl(url);
  const heur = offlineHeuristics(target, settings?.safeBrowsingLevel || 'standard');
  let final = { ...heur, details: '' };
  if (!settings?.vtApiKey) return final;

  try {
    const id = base64url(target);
    const res = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, { headers: { 'x-apikey': settings.vtApiKey } });
    if (res.status === 404) return final;
    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats;
    if (stats) {
      const malicious = Number(stats.malicious || 0) + Number(stats.suspicious || 0);
      final = malicious > 0
        ? { safe: false, reason: `VirusTotal flagged (${malicious})`, details: JSON.stringify(stats) }
        : { safe: true, reason: 'VirusTotal: no engines flagged', details: JSON.stringify(stats) };
    }
  } catch {}
  return final;
}

export async function scanFileHash(sha256, settings) {
  if (!settings?.vtApiKey) return { safe: true, reason: 'Heuristics only. No VT key.' };
  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, { headers: { 'x-apikey': settings.vtApiKey } });
    if (res.status === 404) return { safe: true, reason: 'Unknown hash on VirusTotal' };
    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats;
    if (stats) {
      const malicious = Number(stats.malicious || 0) + Number(stats.suspicious || 0);
      return malicious > 0
        ? { safe: false, reason: `VirusTotal flagged (${malicious})`, details: JSON.stringify(stats) }
        : { safe: true, reason: 'VirusTotal: no engines flagged', details: JSON.stringify(stats) };
    }
  } catch { return { safe: false, reason: 'VirusTotal check failed' }; }
  return { safe: true, reason: 'No flags' };
}


