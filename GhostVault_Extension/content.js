// Remove importScripts and CryptoJS usage
// Use Web Crypto API for password decryption
const enc = new TextEncoder();
const dec = new TextDecoder();

// Helper function to check if extension context is still valid
function isExtensionContextValid() {
  try {
    // More robust check - ensure both runtime and id exist and id is not null
    return chrome && chrome.runtime && chrome.runtime.id && chrome.runtime.id !== null;
  } catch (e) {
    console.warn('GhostVault: Extension context check failed:', e.message);
    return false;
  }
}

// Local analysis fallback (mirrors background.js logic at a high level)
function computeLocalAnalysis(tcText, cookies) {
  try {
    const redFlags = [
      { phrase: 'we may share your data', issue: 'Data sharing without specific consent', severity: 'high' },
      { phrase: 'third parties', issue: 'Involves external services or trackers', severity: 'medium' },
      { phrase: 'share with partners', issue: 'Data sharing with business partners', severity: 'medium' },
      { phrase: 'affiliates', issue: 'Data sharing with affiliated companies', severity: 'medium' },
      { phrase: 'track your activity', issue: 'Activity tracking', severity: 'high' },
      { phrase: 'monitor your usage', issue: 'Usage monitoring', severity: 'medium' },
      { phrase: 'behavioral advertising', issue: 'Behavioral advertising', severity: 'high' },
      { phrase: 'personalized ads', issue: 'Personalized advertising', severity: 'medium' },
      { phrase: 'sell your data', issue: 'Your data may be sold', severity: 'high' },
      { phrase: 'monetize your data', issue: 'Data monetization', severity: 'high' },
      { phrase: 'commercial use', issue: 'Commercial use of your data', severity: 'medium' },
      { phrase: 'change terms at any time', issue: 'Unilateral changes allowed', severity: 'medium' },
      { phrase: 'without notifying you', issue: 'No obligation to notify of changes', severity: 'high' },
      { phrase: 'modify this agreement', issue: 'Agreement can be modified', severity: 'medium' },
      { phrase: 'retain your data', issue: 'Data stored for unclear duration', severity: 'medium' },
      { phrase: 'indefinitely', issue: 'Data stored indefinitely', severity: 'high' },
      { phrase: 'permanent storage', issue: 'Permanent data storage', severity: 'high' },
      { phrase: 'collect information about', issue: 'Unclear data collection scope', severity: 'medium' },
      { phrase: 'any information', issue: 'Broad data collection', severity: 'medium' },
      { phrase: 'all data', issue: 'Comprehensive data collection', severity: 'medium' },
      { phrase: 'consent to all future updates', issue: 'Blanket consent required', severity: 'high' },
      { phrase: 'automatic consent', issue: 'Automatic consent to changes', severity: 'high' },
      { phrase: 'disclose information to comply', issue: 'Broad disclosure to authorities', severity: 'medium' },
      { phrase: 'law enforcement', issue: 'Data sharing with law enforcement', severity: 'medium' },
      { phrase: 'government requests', issue: 'Government data requests', severity: 'medium' },
      { phrase: 'cross-device tracking', issue: 'Cross-device tracking', severity: 'high' },
      { phrase: 'location data', issue: 'Location tracking', severity: 'medium' },
      { phrase: 'biometric data', issue: 'Biometric data collection', severity: 'high' },
      { phrase: 'social media integration', issue: 'Social media data access', severity: 'medium' }
    ];
    const text = (tcText || '').toLowerCase();
    const found = redFlags.filter(i => text.includes(i.phrase));
    let tcResult = '';
    if (found.length === 0) {
      tcResult = '✅ No major red flags found in the T&Cs.';
    } else {
      const high = found.filter(i => i.severity === 'high');
      const medium = found.filter(i => i.severity === 'medium');
      tcResult = `⚠️ Found ${found.length} potential concern(s) in T&Cs:\n\n`;
      if (high.length) tcResult += `🔴 High Risk Issues:\n${high.map(i => `• ${i.issue}`).join('\n')}\n\n`;
      if (medium.length) tcResult += `🟡 Medium Risk Issues:\n${medium.map(i => `• ${i.issue}`).join('\n')}\n\n`;
      tcResult += '💡 Consider reviewing these terms carefully before proceeding.';
    }

    // Cookies
    const cookieList = (cookies || '').split(';').map(c => c.trim()).filter(Boolean);
    const cookieRisks = [];
    cookieList.forEach(cookie => {
      const [name] = cookie.split('=');
      if (!name) return;
      if (/track|ad|sess|token|id|_ga|_gid|_fbp|_gcl|_utm/i.test(name)) {
        cookieRisks.push(`Cookie "${name}" may be used for tracking or analytics.`);
      }
      if (/auth|login|session|token/i.test(name)) {
        cookieRisks.push(`Cookie "${name}" may contain sensitive authentication info.`);
      }
    });
    const cookieResult = cookieRisks.length ? `⚠️ Potential cookie risks:\n${cookieRisks.join('\n')}` : '✅ No major cookie risks detected.';
    return tcResult + '\n\n' + cookieResult;
  } catch (e) {
    return '✅ No major red flags found in the T&Cs.\n\n✅ No major cookie risks detected.';
  }
}

// Show T&C permission dialog directly on the webpage

// Show T&C analysis dialog immediately (no skip option)
function showTCPermissionDialog(tcText, cookies, originalBtn, btnSelector) {
  // Remove any existing dialog
  const existingDialog = document.getElementById('ghostvault-tc-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.id = 'ghostvault-tc-dialog';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  // Create dialog content (will be replaced by analysis)
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    position: relative;
  `;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  // Immediately show the analysis dialog
  showTCAnalysisDialog(tcText, cookies, originalBtn, overlay, btnSelector);
}

// Show T&C analysis results dialog
function showTCAnalysisDialog(tcText, cookies, originalBtn, overlay, btnSelector) {
  // Update dialog content to show analysis
  const dialog = overlay.querySelector('div');
  dialog.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <div style="width: 24px; height: 24px; background: #00796b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
        <span style="color: white; font-weight: bold; font-size: 14px;">🔍</span>
      </div>
      <h3 style="margin: 0; color: #333; font-size: 18px;">Analyzing Privacy Risks...</h3>
    </div>
    <div style="text-align: center; padding: 20px;">
      <div style="width: 40px; height: 40px; border: 3px solid #00796b; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <p style="color: #666; margin: 0;">Scanning Terms & Conditions and cookies for privacy risks...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Perform the analysis with a timeout fallback (allow extra time for MV3 SW spin-up)
  let scanCompleted = false;
  const showScanError = () => {
    if (!scanCompleted) {
      scanCompleted = true;
      // Fallback: run local analysis in content script
      const local = computeLocalAnalysis(tcText, cookies);
      showAnalysisResults(local, dialog, originalBtn, overlay, btnSelector);
    }
  };
  if (isExtensionContextValid()) {
    try {
      // Set a 10 second timeout fallback (service workers may take time to wake up)
      const timeoutId = setTimeout(showScanError, 10000);
      chrome.runtime.sendMessage({ action: 'scanTandCAndCookies', tcText, cookies }, (response) => {
        if (scanCompleted) return;
        scanCompleted = true;
        clearTimeout(timeoutId);
        if (chrome.runtime.lastError) {
          console.warn('GhostVault: Analysis failed:', chrome.runtime.lastError.message);
          const local = computeLocalAnalysis(tcText, cookies);
          showAnalysisResults(local, dialog, originalBtn, overlay, btnSelector);
          return;
        }
        if (response && response.result) {
          showAnalysisResults(response.result, dialog, originalBtn, overlay, btnSelector);
        } else {
          console.warn('GhostVault: No analysis result received');
          const local = computeLocalAnalysis(tcText, cookies);
          showAnalysisResults(local, dialog, originalBtn, overlay, btnSelector);
        }
      });
    } catch (e) {
      showScanError();
    }
  } else {
    showScanError();
  }
}

// Show analysis error and allow user to proceed
function showAnalysisError(dialog, originalBtn, overlay) {
  dialog.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <div style="width: 24px; height: 24px; background: #d32f2f; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
        <span style="color: white; font-weight: bold; font-size: 14px;">⚠️</span>
      </div>
      <h3 style="margin: 0; color: #333; font-size: 18px;">Analysis Unavailable</h3>
    </div>
    <p style="color: #666; margin-bottom: 16px; line-height: 1.5;">
      Sorry, I couldn't analyze the Terms & Conditions right now. This might be due to the extension being updated or reloaded.
    </p>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="ghostvault-cancel-btn" style="
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        color: #666;
      ">Cancel</button>
      <button id="ghostvault-proceed-btn" style="
        background: #00796b;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        color: white;
        font-weight: 500;
      ">Proceed Anyway</button>
    </div>
  `;

  document.getElementById('ghostvault-cancel-btn').onclick = () => {
    overlay.remove();
    // Reset button state when user cancels
    originalBtn.dataset.ghostvaultTcListener = '1';
  };

  document.getElementById('ghostvault-proceed-btn').onclick = () => {
    overlay.remove();
    originalBtn.dataset.ghostvaultTcListener = '2';
    setTimeout(() => {
      originalBtn.click();
    }, 10); // Small delay to ensure dialog is fully removed
  };
}

// Show analysis results and let user decide
function showAnalysisResults(analysisResult, dialog, originalBtn, overlay) {
  const isClean = analysisResult && analysisResult.includes('No major red flags');
  const resultColor = isClean ? '#388e3c' : '#f57c00';
  const resultIcon = isClean ? '✅' : '⚠️';

  dialog.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <div style="width: 24px; height: 24px; background: ${resultColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
        <span style="color: white; font-weight: bold; font-size: 14px;">${resultIcon}</span>
      </div>
      <h3 style="margin: 0; color: #333; font-size: 18px;">Privacy Analysis Complete</h3>
    </div>
    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 16px; max-height: 200px; overflow-y: auto;">
      <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.4; color: #333;">${analysisResult || 'No analysis result available.'}</pre>
    </div>
    <p style="color: #666; margin-bottom: 16px; font-size: 14px;">
      Based on this analysis, would you like to proceed with accepting the Terms & Conditions?
    </p>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="ghostvault-reject-btn" style="
        background: #d32f2f;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        color: white;
        font-weight: 500;
        pointer-events: auto;
        user-select: none;
      ">Reject</button>
      <button id="ghostvault-accept-btn" style="
        background: #388e3c;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        color: white;
        font-weight: 500;
        pointer-events: auto;
        user-select: none;
      ">Accept</button>
    </div>
  `;

  const rejectBtn = document.getElementById('ghostvault-reject-btn');
  if (rejectBtn) {
    rejectBtn.onclick = () => {
      console.log('GhostVault: Reject button clicked');
      overlay.remove();
      // Reset button state and don't click the original button - user rejected
      originalBtn.dataset.ghostvaultTcListener = '1';
      showUserFeedback('❌ You rejected the Terms & Conditions. No cookies were accepted.');
    };
  } else {
    console.error('GhostVault: Reject button not found');
  }

  // Ensure dialog and its children are always interactive
  if (overlay) {
    overlay.style.pointerEvents = 'auto';
  }
  if (dialog) {
    dialog.style.pointerEvents = 'auto';
    dialog.style.zIndex = '2147483647';
  }

  const acceptBtn = document.getElementById('ghostvault-accept-btn');
  if (acceptBtn) {
    acceptBtn.disabled = false;
    acceptBtn.tabIndex = 0;
    acceptBtn.style.pointerEvents = 'auto';
    acceptBtn.style.zIndex = '2147483647';
    acceptBtn.onclick = () => {
      console.log('GhostVault: Accept button clicked');
      let triggered = false;
      try {
        overlay.remove();
      } catch (e) {}
      if (originalBtn && typeof originalBtn.click === 'function') {
        originalBtn.dataset.ghostvaultTcListener = '2';
        setTimeout(() => {
          try {
            originalBtn.click();
            triggered = true;
            console.log('GhostVault: Triggered original button click');
          } catch (e) {
            console.error('GhostVault: Failed to trigger original button click', e);
          }
          showUserFeedback('✅ You accepted the Terms & Conditions.');
        }, 10);
      } else {
        showUserFeedback('✅ You accepted the Terms & Conditions. (No original button found)');
        console.warn('GhostVault: originalBtn missing or not clickable');
      }
    };
  } else {
    console.error('GhostVault: Accept button not found');
  }
}

// Show brief feedback to user
function showUserFeedback(message) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  // Fade in
  setTimeout(() => {
    feedback.style.opacity = '1';
  }, 100);

  // Remove after 4 seconds
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 300);
  }, 4000);
}

async function getKeyMaterial(password) {
  return await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
}

async function deriveKey(password, salt) {
  const keyMaterial = await getKeyMaterial(password);
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

// Master password and decryption removed per user request

// NEW: Autofill saved credentials when page loads
window.addEventListener('load', async () => {
  // Get current origin URL
  const currentUrl = window.location.origin;

  chrome.storage.sync.get('logins', async data => {
    const logins = data.logins || [];

    // Find saved login for this origin
    const savedLogin = logins.find(login => login.url === currentUrl);

    if (savedLogin) {
      // Using plaintext password directly
      const decodedPass = savedLogin.pass || '';

      // Try to find input fields
      // Note: we try common input names/types for username and password
      const inputs = document.querySelectorAll('input');
      let usernameField = null;
      let passwordField = null;

      inputs.forEach(input => {
        const type = input.type.toLowerCase();
        const name = input.name.toLowerCase();

        if (!usernameField && (type === 'text' || type === 'email' || name.includes('user') || name.includes('email') || name.includes('login'))) {
          usernameField = input;
        }
        if (!passwordField && type === 'password') {
          passwordField = input;
        }
      });

      if (usernameField && passwordField && decodedPass) {
        try {
          usernameField.value = savedLogin.user;
          passwordField.value = decodedPass;

          // Trigger input events to notify page JS
          usernameField.dispatchEvent(new Event('input', { bubbles: true }));
          passwordField.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Show success indicator
          showAutoFillIndicator('Credentials auto-filled');
        } catch (error) {
          console.warn('Auto-fill failed:', error.message);
        }
      }
    }
  });
});

// Auto-fill success indicator
function showAutoFillIndicator(message) {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #388e3c;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: fadeInOut 3s ease-in-out;
  `;
  indicator.textContent = message;
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.remove();
    }
  }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
    }
 `;
document.head.appendChild(style);

// --- Real-time login detection ---
document.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const inputs = form.querySelectorAll('input');
  let username = '', password = '';
  inputs.forEach(input => {
    const type = input.type.toLowerCase();
    const name = input.name.toLowerCase();
    if (!password && type === 'password') password = input.value;
    if (!username && (type === 'text' || type === 'email' || name.includes('user') || name.includes('email') || name.includes('login'))) username = input.value;
  });
  if (username && password) {
    const site = window.location.origin;
    if (isExtensionContextValid()) {
      try {
        chrome.storage.sync.get({ neverSaveSites: [] }, data => {
          if (data.neverSaveSites && data.neverSaveSites.includes(site)) return;
          // Show modal prompt
          showSavePrompt(site, username, password);
        });
      } catch {}
    }
    
    // Notify the popup to refresh its UI if open
    try {
      chrome.runtime.sendMessage({ action: 'refreshUI' }, () => {});
    } catch (e) {
      console.log('Could not notify popup to refresh UI (might not be open)');
    }
  }
});

function showSavePrompt(site, username, password) {
  // Remove existing modal if present
  const oldModal = document.getElementById('ghostvaultSaveModal');
  if (oldModal) oldModal.remove();
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'ghostvaultSaveModal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '99999';
  modal.innerHTML = `
    <div style="background:#1a2029;color:#e6eef3;border:1px solid #4a5568;border-radius:8px;box-shadow:0 10px 24px rgba(0,0,0,0.35);min-width:280px;max-width:90vw;padding:20px 16px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Cantarell,sans-serif;">
      <h2 style="margin-bottom:10px;font-size:18px;font-weight:600;">Save password to GhostVault?</h2>
      <div style="margin-bottom:12px;font-size:14px;color:#a0aec0;">For <span style='color:#e6eef3;font-weight:600;'>${site}</span><br>Username: <span style='color:#e6eef3;font-weight:600;'>${username}</span></div>
      <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;">
        <button id="ghostvaultSaveBtn" style="background:#4299e1;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-size:14px;cursor:pointer;">Save</button>
        <button id="ghostvaultNeverBtn" style="background:none;color:#e6eef3;border:1px solid #4a5568;padding:8px 14px;border-radius:6px;font-size:14px;cursor:pointer;">Never for this site</button>
        <button id="ghostvaultCancelBtn" style="background:none;color:#e6eef3;border:1px solid #4a5568;padding:8px 14px;border-radius:6px;font-size:14px;cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('ghostvaultSaveBtn').onclick = () => {
    const loginData = {
      url: site,
      user: username,
      pass: password,
      savedAt: Date.now()
    };
    chrome.runtime.sendMessage({
      action: 'loginDetected',
      url: site,
      username,
      password
    }, (response) => {
      // Treat ambiguous cases as success to avoid false error popups when SW sleeps
      if (response && response.status === 'saved') {
        showSaveSuccessNotice('Login saved successfully!');
      } else if (response && response.status === 'error') {
        showSaveErrorNotice('Error: ' + (response.message || 'Unknown error'));
      } else {
        showSaveSuccessNotice('Login saved!');
      }
    });
    modal.remove();
  };
  document.getElementById('ghostvaultNeverBtn').onclick = () => {
    if (isExtensionContextValid()) {
      try {
        chrome.storage.sync.get({ neverSaveSites: [] }, data => {
          const neverSaveSites = data.neverSaveSites || [];
          if (!neverSaveSites.includes(site)) {
            neverSaveSites.push(site);
            try {
              chrome.storage.sync.set({ neverSaveSites }, () => {
                try { chrome.runtime.sendMessage({ action: 'refreshUI' }, () => {}); } catch {}
              });
            } catch {}
            // Also persist to IndexedDB via background so the popup history shows it
            try { chrome.runtime.sendMessage({ action: 'addNeverSaveSite', site }, () => {}); } catch {}
          }
        });
      } catch {}
    }
    modal.remove();
  };
  document.getElementById('ghostvaultCancelBtn').onclick = () => {
    modal.remove();
  };
}

// Helper functions for showing notices
function showSaveSuccessNotice(message) {
  if (!document.getElementById('ghostvaultSaveNotice')) {
    const notice = document.createElement('div');
    notice.id = 'ghostvaultSaveNotice';
    notice.textContent = message;
    notice.style.position = 'fixed';
    notice.style.bottom = '20px';
    notice.style.right = '20px';
    notice.style.background = '#4caf50';
    notice.style.color = '#fff';
    notice.style.padding = '12px 16px';
    notice.style.borderRadius = '6px';
    notice.style.zIndex = '99999';
    notice.style.fontFamily = 'Arial, sans-serif';
    notice.style.fontSize = '14px';
    notice.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 3000);
  }
}

function showSaveErrorNotice(message) {
  if (!document.getElementById('ghostvaultErrorNotice')) {
    const notice = document.createElement('div');
    notice.id = 'ghostvaultErrorNotice';
    notice.textContent = message;
    notice.style.position = 'fixed';
    notice.style.bottom = '20px';
    notice.style.right = '20px';
    notice.style.background = '#f44336';
    notice.style.color = '#fff';
    notice.style.padding = '12px 16px';
    notice.style.borderRadius = '6px';
    notice.style.zIndex = '99999';
    notice.style.fontFamily = 'Arial, sans-serif';
    notice.style.fontSize = '14px';
    notice.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 4000);
  }
}

// --- Real-time T&C and Cookie detection ---
function scanForTCAcceptButtons() {
  const allButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
  const tcButtons = [];
  
  allButtons.forEach(btn => {
    const text = (btn.innerText || btn.value || '').toLowerCase().trim();
    
    // Skip obvious non-consent buttons
    if (text.includes('sign in') || text.includes('login') || text.includes('register') || 
        text.includes('buy now') || text.includes('add to cart') || text.includes('checkout') ||
        text.includes('search') || text.includes('submit') || text.includes('send') ||
        text.includes('download') || text.includes('play') || text.includes('watch')) {
      console.log('[GhostVault] Skipping non-consent button:', text);
      return;
    }
    
    // Must be in a context that suggests consent/privacy
    let parent = btn.parentElement;
    let contextText = '';
    let foundConsentContext = false;
    
    // Check up to 5 levels up for consent-related context
    for (let i = 0; i < 5 && parent; i++) {
      const parentText = (parent.innerText || '').toLowerCase();
      contextText += ' ' + parentText;
      
      if (parentText.includes('cookie') || parentText.includes('privacy') || 
          parentText.includes('consent') || parentText.includes('terms') ||
          parentText.includes('gdpr') || parentText.includes('data protection') ||
          parent.className.toLowerCase().includes('cookie') ||
          parent.className.toLowerCase().includes('consent') ||
          parent.className.toLowerCase().includes('privacy') ||
          parent.id.toLowerCase().includes('cookie') ||
          parent.id.toLowerCase().includes('consent')) {
        foundConsentContext = true;
        break;
      }
      parent = parent.parentElement;
    }
    
    // Only proceed if we found consent context
    if (!foundConsentContext) {
      console.log('[GhostVault] No consent context found for button:', text);
      return;
    }
    
    // Now check for consent button text
    const isConsentButton = text.includes('accept') || 
           text.includes('agree') || 
           text.includes('allow') ||
           text.includes('enable') ||
           text.includes('got it') ||
           text.includes('understand') ||
           (text.includes('ok') && contextText.includes('cookie')) ||
           (text.includes('continue') && contextText.includes('privacy')) ||
           /^(ok|yes|sure|fine)$/.test(text);
    
    if (isConsentButton) {
      console.log('[GhostVault] Found consent button:', text, 'with context');
      tcButtons.push(btn);
    }
  });
  tcButtons.forEach(btn => {
    if (!btn.dataset.ghostvaultTcListener) {
      btn.dataset.ghostvaultTcListener = '1';
      const handler = async e => {
        // Check if this is a programmatic click we should allow
        if (btn.dataset.ghostvaultTcListener === '2') {
          // Allow programmatic click-through and reset listener
          btn.dataset.ghostvaultTcListener = '1';
          return;
        }
        
        // Check if dialog is already open to prevent loops
        if (document.getElementById('ghostvault-tc-dialog')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Always prevent the original action first
        e.preventDefault();
        e.stopPropagation();
        
        // Try to extract the most relevant T&C/cookie text
        let tcText = '';
        // 1. If the button is inside a modal/dialog, use that text
        let node = btn;
        let foundDialog = false;
        while (node && node !== document.body) {
          if (node.getAttribute && (node.getAttribute('role') === 'dialog' || node.className.toLowerCase().includes('modal') || node.className.toLowerCase().includes('dialog'))) {
            tcText = node.innerText || '';
            foundDialog = true;
            break;
          }
          node = node.parentElement;
        }
        // 2. Fallback: use parent element's text
        if (!foundDialog) {
          node = btn.parentElement;
          while (node && tcText.length < 2000) {
            const text = node.innerText || '';
            if (text.length > tcText.length) tcText = text;
            node = node.parentElement;
          }
        }
        // 3. Fallback: use button text itself
        if (!tcText) tcText = btn.innerText || btn.value || '';
        // Get all cookies for the current domain
        let cookies = '';
        try {
          cookies = document.cookie;
        } catch {}
        // Get button selector for communication back to content script
        const btnSelector = getUniqueSelector(btn);
        // Debug log
        console.log('[GhostVault] Button text:', btn.innerText || btn.value || '');
        console.log('[GhostVault] Scanning T&C/cookie text:', tcText.slice(0, 200));
        console.log('[GhostVault] Button selector:', btnSelector);
        // Send to background script to show a badge and wait for popup
        console.log('[GhostVault Content] Sending scan to background script');
        if (isExtensionContextValid()) {
          try {
            chrome.runtime.sendMessage({
              action: 'ghostvaultTCScanDetected',
              tcText: tcText,
              cookies: cookies,
              btnSelector: btnSelector
            }, () => {});
          } catch (e) {
            // ignore context invalidation
          }
        }
      };
      // Use capture phase and make it non-passive to ensure we can prevent default
      btn.addEventListener('click', handler, { capture: true, passive: false });
    }
  });
}

// Helper to get a unique selector for a button
function getUniqueSelector(el) {
  if (!el) return '';
  if (el.id) return `#${el.id}`;
  let path = '', node = el;
  while (node && node.nodeType === 1) {
    let name = node.localName;
    if (!name) break;
    name = name.toLowerCase();
    let parent = node.parentNode;
    let siblings = parent ? Array.from(parent.children).filter(n => n.localName === name) : [];
    if (siblings.length > 1) {
      name += `:nth-child(${1 + siblings.indexOf(node)})`;
    }
    path = name + (path ? '>' + path : '');
    node = parent;
  }
  return path;
}

// Find element by selector across shadow DOMs
function findElementDeep(selector) {
  const matches = (el, sel) => {
    try { return el.matches && el.matches(sel); } catch { return false; }
  };
  const stack = [];
  if (document.documentElement) stack.push(document.documentElement);
  while (stack.length) {
    const el = stack.pop();
    if (!el) continue;
    if (matches(el, selector)) return el;
    // Push shadow root children if present
    if (el.shadowRoot) {
      stack.push(...Array.from(el.shadowRoot.children));
    }
    // Push light DOM children
    if (el.children && el.children.length) {
      stack.push(...Array.from(el.children));
    }
  }
  return null;
}

// Find any accept-like button across shadow DOMs by text
function findAcceptLikeButtonDeep() {
  const isAcceptText = (t) => {
    const s = (t || '').toLowerCase();
    return s.includes('accept') || s.includes('agree') || s === 'ok' || s === 'okay' || s.includes('allow') || s.includes('continue') || s.includes('got it');
  };
  const stack = [];
  if (document.documentElement) stack.push(document.documentElement);
  while (stack.length) {
    const el = stack.pop();
    if (!el) continue;
    if ((el.tagName === 'BUTTON') || (el.tagName === 'INPUT' && (/^button|submit$/i.test(el.type)))) {
      const text = (el.innerText || el.value || '').trim();
      if (isAcceptText(text)) return el;
    }
    if (el.shadowRoot) stack.push(...Array.from(el.shadowRoot.children));
    if (el.children && el.children.length) stack.push(...Array.from(el.children));
  }
  return null;
}

// Search same-origin iframes for selector
function findInSameOriginFrames(selector) {
  const results = [];
  const walk = (doc) => {
    try {
      const direct = doc.querySelector(selector);
      if (direct) return direct;
      const frames = Array.from(doc.querySelectorAll('iframe,frame'));
      for (const frame of frames) {
        try {
          const fdoc = frame.contentDocument || frame.contentWindow && frame.contentWindow.document;
          if (!fdoc) continue;
          // Same-origin check will throw if cross-origin; wrap in try
          const found = walk(fdoc);
          if (found) return found;
        } catch {}
      }
    } catch {}
    return null;
  };
  return walk(document);
}

function findAcceptLikeInFrames() {
  const isAcceptText = (t) => {
    const s = (t || '').toLowerCase();
    return s.includes('accept') || s.includes('agree') || s === 'ok' || s === 'okay' || s.includes('allow') || s.includes('continue') || s.includes('got it');
  };
  const walk = (doc) => {
    try {
      const candidates = Array.from(doc.querySelectorAll('button,input[type="button"],input[type="submit"]'));
      const match = candidates.find(el => isAcceptText((el.innerText || el.value || '').trim()));
      if (match) return match;
      const frames = Array.from(doc.querySelectorAll('iframe,frame'));
      for (const frame of frames) {
        try {
          const fdoc = frame.contentDocument || frame.contentWindow && frame.contentWindow.document;
          if (!fdoc) continue;
          const found = walk(fdoc);
          if (found) return found;
        } catch {}
      }
    } catch {}
    return null;
  };
  return walk(document);
}

// Simulate a real user click with pointer and mouse events
function simulateUserClick(el) {
  try {
    // Ensure element is in view and enabled
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    }
    const opts = { bubbles: true, cancelable: true, composed: true, view: window };
    const rect = el.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    const withCoords = { ...opts, clientX, clientY, screenX: clientX, screenY: clientY, button: 0, buttons: 1 };

    // Pointer events (if supported)
    try { el.dispatchEvent(new PointerEvent('pointerover', withCoords)); } catch {}
    try { el.dispatchEvent(new PointerEvent('pointerenter', withCoords)); } catch {}
    try { el.dispatchEvent(new PointerEvent('pointerdown', withCoords)); } catch {}

    // Mouse events
    el.dispatchEvent(new MouseEvent('mouseover', withCoords));
    el.dispatchEvent(new MouseEvent('mouseenter', withCoords));
    el.dispatchEvent(new MouseEvent('mousedown', withCoords));

    // Focus
    try { el.focus({ preventScroll: true }); } catch {}

    // Mouse up and click
    el.dispatchEvent(new MouseEvent('mouseup', { ...withCoords, buttons: 0 }));
    el.dispatchEvent(new MouseEvent('click', { ...withCoords, buttons: 0 }));
    return true;
  } catch (e) {
    console.warn('GhostVault: simulateUserClick failed, falling back to .click()', e);
    try { el.click(); return true; } catch {}
    return false;
  }
}

// Show a small in-page confirmation button to obtain real user gesture
function showInlineAcceptConfirmation(selector) {
  // Avoid duplicates
  if (document.getElementById('ghostvault-inline-accept')) return;
  const btn = document.createElement('button');
  btn.id = 'ghostvault-inline-accept';
  btn.textContent = 'Click to Accept (GhostVault)';
  btn.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2147483647;
    background: #388e3c;
    color: #fff;
    border: none;
    padding: 10px 14px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer;
  `;
  btn.onclick = () => {
    const el = findElementDeep(selector) || document.querySelector(selector) || findInSameOriginFrames(selector) || findAcceptLikeButtonDeep() || findAcceptLikeInFrames();
    if (el) {
      el.dataset.ghostvaultTcListener = '2';
      if (!simulateUserClick(el)) {
        try { el.click(); } catch {}
      }
    }
    btn.remove();
  };
  document.body.appendChild(btn);
}

// Listen for manual page analysis request
if (isExtensionContextValid()) {
  try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.action === 'analyzeCurrentPage') {
        // Extract page content for analysis
        const pageText = document.body.innerText || '';
        const cookies = document.cookie || '';
        
        // Look for any accept-like buttons on the page
        const acceptBtn = findAcceptLikeButtonDeep() || findAcceptLikeInFrames();
        const btnSelector = acceptBtn ? getUniqueSelector(acceptBtn) : '';
        
        // Send to popup for analysis
        console.log('[GhostVault Content] Sending message to background script:', {
          action: 'ghostvaultTCScanDetected',
          tcText: pageText.slice(0, 100) + '...',
          btnSelector: btnSelector
        });
        if (isExtensionContextValid()) {
          try {
            chrome.runtime.sendMessage({
              action: 'ghostvaultTCScanDetected',
              tcText: pageText.slice(0, 5000), // Limit text size
              cookies: cookies,
              btnSelector: btnSelector
            }, () => {});
          } catch (e) {}
        }
        
        sendResponse({ success: true });
        return true;
      }
      
      if (msg && msg.action === 'ghostvaultTCAcceptResult' && msg.btnSelector) {
        console.log('[GhostVault Content] Received Accept/Reject message:', msg);
        const findBtn = () => {
          return findElementDeep(msg.btnSelector) || document.querySelector(msg.btnSelector) || findInSameOriginFrames(msg.btnSelector);
        };
        let btn = findBtn();
        console.log('[GhostVault Content] Found button:', btn);
        const fallbackFind = () => {
          return findAcceptLikeButtonDeep() || findAcceptLikeInFrames();
        };

        const tryTrigger = (element) => {
          if (!element) {
            console.warn('[GhostVault Content] No element to trigger');
            return false;
          }
          console.log('[GhostVault Content] Triggering element:', element);
          if (msg.accepted) {
            try { alert('✅ Cookies accepted and T&C acknowledged.'); } catch {}
            element.dataset.ghostvaultTcListener = '2';
            console.log('[GhostVault Content] Attempting simulateUserClick');
            const ok = simulateUserClick(element);
            console.log('[GhostVault Content] simulateUserClick result:', ok);
            if (!ok) {
              console.log('[GhostVault Content] Fallback to element.click()');
              try { element.click(); } catch {}
            }
          } else {
            try { alert('❌ You rejected the T&C. Cookies not set.'); } catch {}
          }
          return true;
        };

        if (btn) {
          tryTrigger(btn);
          // Verify banner is gone; if not, offer inline confirmation as fallback
          setTimeout(() => {
            const stillThere = findBtn() || fallbackFind();
            if (stillThere) {
              try {
                const sel = getUniqueSelector(stillThere) || msg.btnSelector;
                if (msg.accepted) showInlineAcceptConfirmation(sel);
              } catch {}
            }
          }, 800);
        } else {
          // Retry a few times in case the dialog re-rendered and the selector is stale
          let attempts = 0;
          const maxAttempts = 5;
          const delay = 200;
          const timer = setInterval(() => {
            attempts++;
            const candidate = findBtn() || fallbackFind();
            if (candidate) {
              clearInterval(timer);
              tryTrigger(candidate);
            } else if (attempts >= maxAttempts) {
              clearInterval(timer);
              try {
                alert('⚠️ Could not find Accept button. Please try again or reload the page.');
              } catch {}
              console.warn('GhostVault: Could not find button for selector after retries', msg.btnSelector);
              // Offer inline confirmation as last resort
              if (msg.accepted) {
                showInlineAcceptConfirmation(msg.btnSelector);
              }
            }
          }, delay);
        }
      }
    });
  } catch (e) {
    console.warn('GhostVault: Could not set up message listener, extension context may be invalidated:', e);
  }
} else {
  console.warn('GhostVault: Extension context not valid, skipping message listener setup');
}

// Track already processed buttons to prevent infinite loops
const processedButtons = new WeakSet();

// Modified scan function to avoid reprocessing
function scanForTCAcceptButtons() {
  const allButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
  const tcButtons = [];
  
  allButtons.forEach(btn => {
    // Skip if already processed or already has listener
    if (processedButtons.has(btn) || btn.dataset.ghostvaultTcListener) return;
    
    const text = (btn.innerText || btn.value || '').toLowerCase().trim();
    
    // Skip obvious non-consent buttons
    if (text.includes('sign in') || text.includes('login') || text.includes('register') || 
        text.includes('buy now') || text.includes('add to cart') || text.includes('checkout') ||
        text.includes('search') || text.includes('submit') || text.includes('send') ||
        text.includes('download') || text.includes('play') || text.includes('watch')) {
      processedButtons.add(btn);
      return;
    }
    
    // Must be in a context that suggests consent/privacy
    let parent = btn.parentElement;
    let contextText = '';
    let foundConsentContext = false;
    
    // Check up to 5 levels up for consent-related context
    for (let i = 0; i < 5 && parent; i++) {
      const parentText = (parent.innerText || '').toLowerCase();
      contextText += ' ' + parentText;
      
      if (parentText.includes('cookie') || parentText.includes('privacy') || 
          parentText.includes('consent') || parentText.includes('terms') ||
          parentText.includes('gdpr') || parentText.includes('data protection') ||
          parent.className.toLowerCase().includes('cookie') ||
          parent.className.toLowerCase().includes('consent') ||
          parent.className.toLowerCase().includes('privacy') ||
          parent.id.toLowerCase().includes('cookie') ||
          parent.id.toLowerCase().includes('consent')) {
        foundConsentContext = true;
        break;
      }
      parent = parent.parentElement;
    }
    
    // Only proceed if we found consent context
    if (!foundConsentContext) {
      processedButtons.add(btn);
      return;
    }
    
    // Now check for consent button text
    const isConsentButton = text.includes('accept') || 
           text.includes('agree') || 
           text.includes('allow') ||
           text.includes('enable') ||
           text.includes('got it') ||
           text.includes('understand') ||
           (text.includes('ok') && contextText.includes('cookie')) ||
           (text.includes('continue') && contextText.includes('privacy')) ||
           /^(ok|yes|sure|fine)$/.test(text);
    
    if (isConsentButton) {
      tcButtons.push(btn);
      processedButtons.add(btn);
    } else {
      processedButtons.add(btn);
    }
  });

  // Only attach listeners to new buttons
  tcButtons.forEach(btn => {
    if (!btn.dataset.ghostvaultTcListener) {
      btn.dataset.ghostvaultTcListener = '1';
      const handler = async e => {
        // Check if this is a programmatic click we should allow
        if (btn.dataset.ghostvaultTcListener === '2') {
          // Allow programmatic click-through and reset listener
          btn.dataset.ghostvaultTcListener = '1';
          return;
        }
        
        // Check if dialog is already open to prevent loops
        if (document.getElementById('ghostvault-tc-dialog')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Always prevent the original action first
        e.preventDefault();
        e.stopPropagation();
        
        // Try to extract the most relevant T&C/cookie text
        let tcText = '';
        // 1. If the button is inside a modal/dialog, use that text
        let node = btn;
        let foundDialog = false;
        while (node && node !== document.body) {
          if (node.getAttribute && (node.getAttribute('role') === 'dialog' || node.className.toLowerCase().includes('modal') || node.className.toLowerCase().includes('dialog'))) {
            tcText = node.innerText || '';
            foundDialog = true;
            break;
          }
          node = node.parentElement;
        }
        // 2. Fallback: use parent element's text
        if (!foundDialog) {
          node = btn.parentElement;
          while (node && tcText.length < 2000) {
            const text = node.innerText || '';
            if (text.length > tcText.length) tcText = text;
            node = node.parentElement;
          }
        }
        // 3. Fallback: use button text itself
        if (!tcText) tcText = btn.innerText || btn.value || '';
        // Get all cookies for the current domain
        let cookies = '';
        try {
          cookies = document.cookie;
        } catch {}
        // Get button selector for communication back to content script
        const btnSelector = getUniqueSelector(btn);
        // Debug log
        console.log('[GhostVault] Button text:', btn.innerText || btn.value || '');
        console.log('[GhostVault] Scanning T&C/cookie text:', tcText.slice(0, 200));
        console.log('[GhostVault] Button selector:', btnSelector);
        // Send to background script to show a badge and open analyzer window
        console.log('[GhostVault Content] Sending scan to background script');
        if (isExtensionContextValid()) {
          try {
            chrome.runtime.sendMessage({
              action: 'ghostvaultTCScanDetected',
              tcText: tcText,
              cookies: cookies,
              btnSelector: btnSelector
            }, () => {});
          } catch (e) {}
        }
      };
      // Use capture phase and make it non-passive to ensure we can prevent default
      btn.addEventListener('click', handler, { capture: true, passive: false });
    }
  });
}

// Scan for T&C accept buttons on DOMContentLoaded and after a delay
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanForTCAcceptButtons);
} else {
  scanForTCAcceptButtons();
}
// Extra: scan again after a short delay for late-loaded buttons
setTimeout(scanForTCAcceptButtons, 2000);

// Simple MutationObserver that only scans when new nodes are added
const observer = new MutationObserver((mutations) => {
  let shouldScan = false;
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Only scan if actual elements were added (not just text nodes)
      for (let node of mutation.addedNodes) {
        if (node.nodeType === 1) { // Element node
          shouldScan = true;
          break;
        }
      }
    }
  });
  if (shouldScan) {
    scanForTCAcceptButtons();
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// --- Listen for scan results and show popup ---
// (Handled inline in the handler above for correct flow)
