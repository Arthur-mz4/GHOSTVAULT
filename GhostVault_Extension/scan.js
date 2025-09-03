// Load latest pending scan and render actions
document.addEventListener('DOMContentLoaded', () => {
  const resultEl = document.getElementById('scanResult');
  const actionsEl = document.getElementById('scanActions');
  const acceptBtn = document.getElementById('scanAccept');
  const rejectBtn = document.getElementById('scanReject');

  function summarize(tcText, cookies) {
    try {
      const simplified = [];
      const text = (tcText || '').toLowerCase();
      const checks = [
        [/track your activity|behavioral advertising|personalized ads/i, 'YOU MAY BE PROFILED FOR ADVERTISING.'],
        [/we may share your data|third parties|share with partners|affiliates/i, 'YOUR DATA MAY BE SHARED WITH THIRD PARTIES.'],
        [/sell your data|monetize your data/i, 'THIS SERVICE MAY SELL YOUR DATA.'],
        [/change terms|modify this agreement|without notifying you/i, 'TERMS MAY CHANGE WITHOUT TELLING YOU.'],
        [/retain your data|indefinitely|permanent storage/i, 'YOUR DATA MAY BE STORED FOR A LONG TIME.'],
        [/collect information about|any information|all data/i, 'THIS SERVICE MAY COLLECT A LOT OF YOUR INFORMATION.'],
        [/disclose information to comply|law enforcement|government/i, 'YOUR DATA MAY BE DISCLOSED TO AUTHORITIES.'],
        [/cross-device tracking/i, 'YOU MAY BE TRACKED ACROSS DEVICES.'],
        [/location data/i, 'YOUR LOCATION MAY BE TRACKED.'],
        [/biometric data/i, 'BIOMETRIC DATA MAY BE COLLECTED.']
      ];
      checks.forEach(([re, msg]) => { if (re.test(text)) simplified.push(msg); });
      const cookieList = (cookies || '').split(';').map(c => c.trim()).filter(Boolean);
      const seen = new Set();
      cookieList.forEach(c => {
        const name = (c.split('=')[0] || '').trim();
        if (!name || seen.has(name)) return; seen.add(name);
        if (/_ga|_gid|_fbp|_gcl|utm|vwo|ttc|hj|uet|track|ad|analytics/i.test(name)) {
          simplified.push(`THIS (${name}) WILL TRACK YOU. WE BLOCK MOST TRACKING REQUESTS.`);
        } else if (/auth|login|session|token/i.test(name)) {
          simplified.push(`THIS (${name}) MAY CONTAIN SIGN-IN INFO. BE CAUTIOUS.`);
        }
      });
      if (simplified.length === 0) return '✅ No major issues found.';
      return simplified.join('\n');
    } catch {
      return '✅ No major issues found.';
    }
  }

  chrome.storage.local.get(['pendingTCScan'], data => {
    const scan = data && data.pendingTCScan;
    if (!scan) {
      if (resultEl) {
        resultEl.style.color = '#f57c00';
        resultEl.textContent = 'No pending scan data.';
      }
      return;
    }
    // Show quick local summary while background wakes up
    if (resultEl) {
      const local = summarize(scan.tcText, scan.cookies);
      resultEl.style.color = local.includes('✅') ? 'green' : 'orange';
      resultEl.textContent = local;
    }
    // Request background analysis with safe callback
    try {
      chrome.runtime.sendMessage({ action: 'scanTandCAndCookies', tcText: scan.tcText, cookies: scan.cookies }, response => {
        if (chrome.runtime.lastError) { if (actionsEl) actionsEl.style.display = 'flex'; return; }
        const out = response && response.result ? response.result : summarize(scan.tcText, scan.cookies);
        if (resultEl) {
          resultEl.style.color = out.includes('✅') ? 'green' : 'orange';
          resultEl.textContent = out;
        }
        if (actionsEl) actionsEl.style.display = 'flex';
      });
    } catch (e) {
      if (actionsEl) actionsEl.style.display = 'flex';
    }

    function sendDecision(accepted) {
      if (typeof scan.tabId === 'number' && scan.btnSelector) {
        try { chrome.tabs.sendMessage(scan.tabId, { action: 'ghostvaultTCAcceptResult', accepted, btnSelector: scan.btnSelector }); } catch (e) {}
      }
      // Notify background to update history
      try { chrome.runtime.sendMessage({ action: 'ghostvaultTCAcceptResult', accepted: !!accepted, btnSelector: scan.btnSelector, tabId: scan.tabId }, () => {}); } catch (e) {}
      window.close();
    }

    if (acceptBtn) acceptBtn.onclick = () => sendDecision(true);
    if (rejectBtn) rejectBtn.onclick = () => sendDecision(false);
  });
});


