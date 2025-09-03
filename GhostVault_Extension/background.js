// Import database functions
import './db.js';

// Encryption removed: storing plaintext per user request

// --- Listen for login detection from content script ---
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'loginDetected') {
    try {
      const login = {
        url: message.url,
        user: message.username,
        pass: message.password,
        savedAt: Date.now()
      };
      await self.GhostVaultDB.saveLogin(login);
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.png',
        title: 'GhostVault',
        message: `Login for ${message.username} on ${message.url} saved successfully.`
      });
      
      sendResponse({ status: 'saved' });
    } catch (error) {
      console.error('Error saving login:', error);
      sendResponse({ status: 'error', message: error.message });
    }
    return true;
  }
  
  if (message.action === 'scanTandC' && message.tcText) {
    // Analyze T&C text for risks
    const redFlags = [
      { phrase: 'we may share your data', issue: 'Data sharing without specific consent' },
      { phrase: 'third parties', issue: 'Involves external services or trackers' },
      { phrase: 'track your activity', issue: 'Activity tracking' },
      { phrase: 'sell your data', issue: 'Your data may be sold' },
      { phrase: 'change terms at any time', issue: 'Unilateral changes allowed' },
      { phrase: 'without notifying you', issue: 'No obligation to notify of changes' },
      { phrase: 'retain your data', issue: 'Data stored for unclear duration' },
      { phrase: 'collect information about', issue: 'Unclear data collection scope' },
      { phrase: 'consent to all future updates', issue: 'Blanket consent required' },
      { phrase: 'disclose information to comply', issue: 'Broad disclosure to authorities' }
    ];
    const text = message.tcText.toLowerCase();
    const foundIssues = redFlags.filter(item => text.includes(item.phrase));
    let result = '';
    if (foundIssues.length === 0) {
      result = '✅ No major red flags found in the T&Cs.';
    } else {
      result = '⚠️ Potential concerns found:\n' + foundIssues.map(i => `- ${i.issue}`).join('\n');
    }
    // Send result back to content script for user prompt
    if (sender.tab && sender.tab.id) {
      chrome.tabs.sendMessage(sender.tab.id, { action: 'showTandCScanResult', result }, () => {});
    }
    sendResponse({ status: 'scanned' });
    return true;
  }
  
  if (message.action === 'scanTandCAndCookies') {
    // --- Enhanced T&C scan ---
    const redFlags = [
      // Data sharing and third parties
      { phrase: 'we may share your data', issue: 'Data sharing without specific consent', severity: 'high' },
      { phrase: 'third parties', issue: 'Involves external services or trackers', severity: 'medium' },
      { phrase: 'share with partners', issue: 'Data sharing with business partners', severity: 'medium' },
      { phrase: 'affiliates', issue: 'Data sharing with affiliated companies', severity: 'medium' },
      
      // Tracking and monitoring
      { phrase: 'track your activity', issue: 'Activity tracking', severity: 'high' },
      { phrase: 'monitor your usage', issue: 'Usage monitoring', severity: 'medium' },
      { phrase: 'behavioral advertising', issue: 'Behavioral advertising', severity: 'high' },
      { phrase: 'personalized ads', issue: 'Personalized advertising', severity: 'medium' },
      
      // Data selling
      { phrase: 'sell your data', issue: 'Your data may be sold', severity: 'high' },
      { phrase: 'monetize your data', issue: 'Data monetization', severity: 'high' },
      { phrase: 'commercial use', issue: 'Commercial use of your data', severity: 'medium' },
      
      // Terms changes
      { phrase: 'change terms at any time', issue: 'Unilateral changes allowed', severity: 'medium' },
      { phrase: 'without notifying you', issue: 'No obligation to notify of changes', severity: 'high' },
      { phrase: 'modify this agreement', issue: 'Agreement can be modified', severity: 'medium' },
      
      // Data retention
      { phrase: 'retain your data', issue: 'Data stored for unclear duration', severity: 'medium' },
      { phrase: 'indefinitely', issue: 'Data stored indefinitely', severity: 'high' },
      { phrase: 'permanent storage', issue: 'Permanent data storage', severity: 'high' },
      
      // Data collection
      { phrase: 'collect information about', issue: 'Unclear data collection scope', severity: 'medium' },
      { phrase: 'any information', issue: 'Broad data collection', severity: 'medium' },
      { phrase: 'all data', issue: 'Comprehensive data collection', severity: 'medium' },
      
      // Consent issues
      { phrase: 'consent to all future updates', issue: 'Blanket consent required', severity: 'high' },
      { phrase: 'automatic consent', issue: 'Automatic consent to changes', severity: 'high' },
      
      // Legal disclosure
      { phrase: 'disclose information to comply', issue: 'Broad disclosure to authorities', severity: 'medium' },
      { phrase: 'law enforcement', issue: 'Data sharing with law enforcement', severity: 'medium' },
      { phrase: 'government requests', issue: 'Government data requests', severity: 'medium' },
      
      // Additional privacy concerns
      { phrase: 'cross-device tracking', issue: 'Cross-device tracking', severity: 'high' },
      { phrase: 'location data', issue: 'Location tracking', severity: 'medium' },
      { phrase: 'biometric data', issue: 'Biometric data collection', severity: 'high' },
      { phrase: 'social media integration', issue: 'Social media data access', severity: 'medium' }
    ];
    const text = (message.tcText || '').toLowerCase();
    const foundIssues = redFlags.filter(item => text.includes(item.phrase));
    const simplified = [];

    // T&C simplified messages
    if (foundIssues.length === 0) {
      simplified.push('✅ No major issues found in the Terms.');
    } else {
      foundIssues.forEach(i => {
        const issue = i.issue.toLowerCase();
        if (issue.includes('track')) simplified.push('THIS SERVICE WILL TRACK YOUR ACTIVITY.');
        else if (issue.includes('sell')) simplified.push('THIS SERVICE MAY SELL YOUR DATA.');
        else if (issue.includes('share')) simplified.push('YOUR DATA MAY BE SHARED WITH THIRD PARTIES.');
        else if (issue.includes('retain') || issue.includes('indefinite') || issue.includes('permanent')) simplified.push('YOUR DATA MAY BE STORED FOR A LONG TIME.');
        else if (issue.includes('collect') || issue.includes('any information') || issue.includes('all data')) simplified.push('THIS SERVICE MAY COLLECT A LOT OF YOUR INFORMATION.');
        else if (issue.includes('change') || issue.includes('modify') || issue.includes('without notifying')) simplified.push('TERMS MAY CHANGE WITHOUT TELLING YOU.');
        else if (issue.includes('disclose') || issue.includes('law enforcement') || issue.includes('government')) simplified.push('YOUR DATA MAY BE DISCLOSED TO AUTHORITIES.');
        else if (issue.includes('behavioral') || issue.includes('personalized ads')) simplified.push('YOU MAY BE PROFILED FOR ADVERTISING.');
        else if (issue.includes('cross-device')) simplified.push('YOU MAY BE TRACKED ACROSS DEVICES.');
        else if (issue.includes('location')) simplified.push('YOUR LOCATION MAY BE TRACKED.');
        else if (issue.includes('biometric')) simplified.push('BIOMETRIC DATA MAY BE COLLECTED.');
        else simplified.push(`POTENTIAL RISK: ${i.issue}.`);
      });
    }

    // Cookie simplified messages
    const cookies = (message.cookies || '').split(';').map(c => c.trim()).filter(Boolean);
    const seen = new Set();
    cookies.forEach(cookie => {
      const [rawName] = cookie.split('=');
      const name = (rawName || '').trim();
      if (!name || seen.has(name)) return; seen.add(name);
      if (/_ga|_gid|_fbp|_gcl|utm|vwo|ttc|hj|uet|track|ad|analytics/i.test(name)) {
        simplified.push(`THIS (${name}) WILL TRACK YOU. WE BLOCK MOST TRACKING REQUESTS.`);
      } else if (/auth|login|session|token/i.test(name)) {
        simplified.push(`THIS (${name}) MAY CONTAIN SIGN-IN INFO. BE CAUTIOUS.`);
      }
    });

    if (simplified.length === 0) simplified.push('✅ No major cookie risks detected.');

    const result = simplified.join('\n');
    // Persist scan summary for history (site + count + timestamp + accepted: null)
    try {
      const site = (sender && sender.tab && sender.tab.url) ? new URL(sender.tab.url).origin : 'Unknown site';
      const count = simplified.filter(s => !s.startsWith('✅')).length;
      await self.GhostVaultDB.saveTCScan({
        site,
        timestamp: Date.now(),
        result,
        count,
        accepted: null
      });
    } catch {}
    sendResponse({ result: result, status: 'scanned' });
    return true;
  }
  
  if (message.action === 'addNeverSaveSite' && message.site) {
    await self.GhostVaultDB.addNeverSaveSite(message.site);
    sendResponse({ status: 'added' });
    return true;
  }

  if (message.action === 'ghostvaultTCScanDetected') {
    // Store scan data for popup to access
    const scanData = {
      tcText: message.tcText,
      cookies: message.cookies,
      btnSelector: message.btnSelector,
      tabId: sender.tab?.id,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({ pendingTCScan: scanData }, () => {
      // Set badge to indicate pending scan
      if (sender.tab?.id) {
        chrome.action.setBadgeText({ text: '!', tabId: sender.tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#f56565', tabId: sender.tab.id });
      }
      // Open a dedicated scan popup window
      try {
        chrome.windows.create({
          url: chrome.runtime.getURL('scan.html'),
          type: 'popup',
          width: 420,
          height: 560,
          focused: true
        });
      } catch (e) {}
    });
    
    sendResponse({ status: 'stored' });
    return true;
  }

  if (message.action === 'ghostvaultTCAcceptResult') {
    // Handle accept/reject result from popup
    if (message.btnSelector && message.tabId) {
      chrome.tabs.sendMessage(message.tabId, {
        action: 'ghostvaultTCAcceptResult',
        accepted: message.accepted,
        btnSelector: message.btnSelector
      });
    }
    // Update last scan record with acceptance
    try {
      const scans = await self.GhostVaultDB.getTCScans();
      if (Array.isArray(scans) && scans.length) {
        const last = scans[scans.length - 1];
        if (last && typeof last.id !== 'undefined') {
          await self.GhostVaultDB.saveTCScan({ ...last, accepted: !!message.accepted });
        }
      }
    } catch {}
    sendResponse({ status: 'sent' });
    return true;
  }

  if (message.action === 'updateSetting') {
    // Handle setting updates
    if (message.settingId === 'blockTrackers') {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: message.value ? ["ruleset_1"] : [],
        disableRulesetIds: message.value ? [] : ["ruleset_1"]
      });
    }
    sendResponse({ status: 'updated' });
    return true;
  }
  
  // Always respond to avoid connection errors
  sendResponse({ status: 'ignored' });
  return true;
});

// Removed master-password dependent notification flow

// Show onboarding page on first install
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

// Tracker blocking ruleset setup (optional, auto-load based on setting)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["blockTrackers"], (data) => {
    const enabled = data.blockTrackers ?? true;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enabled ? ["ruleset_1"] : [],
      disableRulesetIds: enabled ? [] : ["ruleset_1"]
    });
  });
});

// Removed master password request handler