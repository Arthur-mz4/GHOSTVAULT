import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const CACHE_PREFIX = 'scan_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// API Endpoints
const APIS = {
  urlscan: 'https://urlscan.io/api/v1',
  virustotal: 'https://www.virustotal.com/api/v3',
  phishtank: 'https://checkurl.phishtank.com/checkurl/',
  safebrowsing: 'https://safebrowsing.googleapis.com/v4/threatMatches:find',
  rapidPhish: 'https://harmful-link-phishing-detection.p.rapidapi.com/analyze-urls',
};

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

// Offline heuristic scanning (always runs first)
const offlineHeuristicScan = (url) => {
  const suspicious = [
    'exe', 'bat', 'cmd', 'scr', 'vbs', 'js', 'jar',
    'dll', 'sys', 'drv', 'ps1', 'msi', 'apk', 'zip'
  ];
  
  const phishing = [
    'login', 'verify', 'account', 'update', 'secure',
    'banking', 'paypal', 'amazon', 'confirm', 'suspended',
    'unusual', 'activity', 'locked', 'click-here', 'urgent',
    'signin', 'password', 'credential', 'validate'
  ];
  
  const malicious = [
    'crack', 'keygen', 'patch', 'hack', 'exploit',
    'trojan', 'virus', 'malware', 'ransomware', 'warez',
    'nulled', 'cracked'
  ];

  const urlLower = url.toLowerCase();
  
  // Check for suspicious patterns
  const checks = [
    { patterns: suspicious, type: 'file type', severity: 'high' },
    { patterns: phishing, type: 'phishing keyword', severity: 'high' },
    { patterns: malicious, type: 'malware keyword', severity: 'high' }
  ];

  for (const check of checks) {
    for (const pattern of check.patterns) {
      if (urlLower.includes(pattern)) {
        return {
          safe: false,
          source: 'Offline Heuristics',
          reason: `⚠️ Suspicious ${check.type} detected: "${pattern}"`,
          severity: check.severity
        };
      }
    }
  }
  
  // Check for IP addresses (often suspicious)
  const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
  if (ipPattern.test(url)) {
    return {
      safe: false,
      source: 'Offline Heuristics',
      reason: '⚠️ Direct IP address detected (potentially suspicious)',
      severity: 'medium'
    };
  }

  // Check for suspicious TLDs
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.zip', '.mov', '.top', '.xyz'];
  for (const tld of suspiciousTlds) {
    if (urlLower.endsWith(tld)) {
      return {
        safe: false,
        source: 'Offline Heuristics',
        reason: `⚠️ Suspicious domain extension: ${tld}`,
        severity: 'medium'
      };
    }
  }

  // Check for URL shorteners
  const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly'];
  for (const shortener of shorteners) {
    if (urlLower.includes(shortener)) {
      return {
        safe: false,
        source: 'Offline Heuristics',
        reason: `⚠️ URL shortener detected: ${shortener} (link destination unknown)`,
        severity: 'medium'
      };
    }
  }

  // Check for excessive subdomains (often used in phishing)
  try {
    const urlObj = new URL(url);
    const parts = urlObj.hostname.split('.');
    if (parts.length > 4) {
      return {
        safe: false,
        source: 'Offline Heuristics',
        reason: '⚠️ Excessive subdomains detected (common phishing technique)',
        severity: 'medium'
      };
    }
  } catch (e) {
    return {
      safe: false,
      source: 'Offline Heuristics',
      reason: '❌ Invalid URL format',
      severity: 'high'
    };
  }
  
  return {
    safe: true,
    source: 'Offline Heuristics',
    reason: '✅ No obvious threats detected',
    severity: 'none'
  };
};

// URLScan.io API
const scanWithUrlScan = async (url, apiKey) => {
  if (!apiKey) return null;
  
  try {
    // Submit URL for scanning
    const submitResponse = await fetch(`${APIS.urlscan}/scan/`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, visibility: 'public' })
    });
    
    const submitData = await submitResponse.json();
    
    if (submitData.uuid) {
      // Wait 5 seconds for scan to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get results
      const resultResponse = await fetch(`${APIS.urlscan}/result/${submitData.uuid}/`, {
        headers: { 'API-Key': apiKey }
      });
      
      const resultData = await resultResponse.json();
      
      return {
        safe: resultData.verdicts?.overall?.malicious === false,
        source: 'URLScan.io',
        reason: resultData.verdicts?.overall?.score 
          ? `Threat score: ${resultData.verdicts.overall.score}/100`
          : 'Scan completed',
        details: resultData
      };
    }
  } catch (error) {
    console.error('URLScan error:', error);
  }
  
  return null;
};

// VirusTotal API v3
const scanWithVirusTotal = async (url, apiKey) => {
  if (!apiKey) return null;
  
  try {
    // Encode URL in base64 (React Native compatible)
    const urlId = btoa(url).replace(/=/g, '');
    
    const response = await fetch(`${APIS.virustotal}/urls/${urlId}`, {
      headers: {
        'x-apikey': apiKey
      }
    });
    
    const data = await response.json();
    
    if (data.data?.attributes?.last_analysis_stats) {
      const stats = data.data.attributes.last_analysis_stats;
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;
      const total = malicious + suspicious + (stats.harmless || 0) + (stats.undetected || 0);
      
      return {
        safe: malicious === 0 && suspicious === 0,
        source: 'VirusTotal',
        reason: malicious > 0 
          ? `Flagged by ${malicious}/${total} engines`
          : suspicious > 0 
          ? `Suspicious: ${suspicious}/${total} engines`
          : 'Clean',
        details: data
      };
    }
  } catch (error) {
    console.error('VirusTotal error:', error);
  }
  
  return null;
};

// PhishTank API (no key needed!)
// RapidAPI Phishing Detection
const scanWithRapidPhish = async (url, apiKey) => {
  try {
    if (!apiKey) {
      console.warn('RapidAPI key not provided');
      return null;
    }

    const response = await fetch(APIS.rapidPhish, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'harmful-link-phishing-detection.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      },
      body: JSON.stringify({
        urls: [url],
        sender_metadata: {}, // Optional sender info
        past_reports: 1 // Minimum reports to check
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('RapidAPI error response:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && Array.isArray(data.analysis_results) && data.analysis_results.length > 0) {
      const result = data.analysis_results[0]; // Get first URL result
      return {
        safe: !result.is_phishing,
        source: 'RapidAPI Phishing Detection',
        reason: result.is_phishing 
          ? `⚠️ Phishing probability: ${(result.phishing_probability * 100).toFixed(1)}%`
          : '✅ Low phishing probability',
        details: {
          probability: result.phishing_probability,
          risk_factors: result.risk_factors || []
        }
      };
    } else {
      console.warn('Invalid or empty response from RapidAPI:', data);
      return {
        safe: true,
        source: 'RapidAPI Phishing Detection',
        reason: '⚠️ Unable to analyze URL (service limitation)',
        details: { error: 'Invalid response format' }
      };
    }
  } catch (error) {
    console.warn('RapidAPI error:', error);
    return {
      safe: true,
      source: 'RapidAPI Phishing Detection',
      reason: `⚠️ Service error: ${error.message}`,
      error: true
    };
  }
};

const scanWithPhishTank = async (url) => {
  try {
    const response = await fetch(APIS.phishtank, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: `url=${encodeURIComponent(url)}&format=json&app_key=ghostguard`
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('PhishTank response is not JSON:', await response.text());
      return {
        safe: true,
        source: 'PhishTank',
        reason: 'Service temporarily unavailable (non-JSON response)',
        fallback: true
      };
    }
    
    const data = await response.json();
    
    if (data.results) {
      return {
        safe: !data.results.in_database,
        source: 'PhishTank',
        reason: data.results.in_database 
          ? 'Known phishing site!' 
          : 'Not in phishing database',
        verified: data.results.verified
      };
    }
  } catch (error) {
    console.warn('PhishTank error:', error);
    return {
      safe: true,
      source: 'PhishTank',
      reason: 'Service temporarily unavailable',
      error: true
    };
  }
  
  return null;
};

// Google Safe Browsing API
const scanWithSafeBrowsing = async (url, apiKey) => {
  if (!apiKey) return null;
  
  try {
    const response = await fetch(`${APIS.safebrowsing}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          clientId: 'ghostguard',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      })
    });
    
    const data = await response.json();
    
    return {
      safe: !data.matches || data.matches.length === 0,
      source: 'Google Safe Browsing',
      reason: data.matches && data.matches.length > 0
        ? `Threat type: ${data.matches[0].threatType}`
        : 'Safe',
      details: data
    };
  } catch (error) {
    console.error('Safe Browsing error:', error);
  }
  
  return null;
};

// Main scanning function
export const simplifiedApiScan = async (url, settings = {}) => {
  try {
    console.log('Starting scan for URL:', url);
    console.log('Available settings:', Object.keys(settings));

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return {
        safe: false,
        reason: '❌ Invalid URL format',
        error: true
      };
    }

    // Check cache first
    const cached = await getCachedResult(url);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const results = [];
    
    // 1. Always run offline heuristics first (instant, no API needed)
    const offlineResult = offlineHeuristicScan(url);
    results.push(offlineResult);
    
    // 2. Try RapidAPI Phishing Detection
    if (settings?.rapidApiKey) {
      try {
        const rapidResult = await Promise.race([
          scanWithRapidPhish(url, settings.rapidApiKey),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        if (rapidResult) results.push(rapidResult);
      } catch (error) {
        console.log('RapidAPI Phishing Detection unavailable:', error.message);
      }
    }
    
    // 3. Try PhishTank (as fallback)
    if (!settings?.rapidApiKey) {
      try {
        const phishTankResult = await Promise.race([
          scanWithPhishTank(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        if (phishTankResult) results.push(phishTankResult);
      } catch (error) {
        console.log('PhishTank unavailable:', error.message);
      }
    }
    
    // 4. URLScan.io (if API key provided)
    if (settings?.urlscanKey) {
      const urlscanResult = await scanWithUrlScan(url, settings.urlscanKey);
      if (urlscanResult) results.push(urlscanResult);
    }
    
    // 4. VirusTotal (if API key provided)
    if (settings?.vtApiKey) {
      const vtResult = await scanWithVirusTotal(url, settings.vtApiKey);
      if (vtResult) results.push(vtResult);
    }
    
    // 5. Google Safe Browsing (if API key provided)
    if (settings?.safeBrowsingKey) {
      const sbResult = await scanWithSafeBrowsing(url, settings.safeBrowsingKey);
      if (sbResult) results.push(sbResult);
    }
    
    // Aggregate results
    const unsafeResults = results.filter(r => !r.safe);
    const safeResults = results.filter(r => r.safe);
    
    let finalReason;
    if (unsafeResults.length > 0) {
      const mainThreat = unsafeResults[0];
      finalReason = mainThreat.reason;
    } else if (safeResults.length > 0) {
      finalReason = '✅ No threats detected by ' + results.length + ' check(s)';
    } else {
      finalReason = '✅ Basic scan completed - no obvious threats';
    }
    
    const finalResult = {
      safe: unsafeResults.length === 0,
      reason: finalReason,
      sources: results.map(r => r.source).join(', '),
      details: results,
      scanCount: results.length,
      timestamp: Date.now()
    };
    
    // Cache the result
    await setCachedResult(url, finalResult);
    
    return finalResult;
  } catch (error) {
    console.error('Simplified API scan error:', error);
    return {
      safe: false,
      reason: '❌ Scan error: ' + error.message,
      sources: 'Error',
      error: true
    };
  }
};

// Clear cache
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

