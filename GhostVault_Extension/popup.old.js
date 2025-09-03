// Wrap everything in DOMContentLoaded to ensure the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Global error handler for debugging blank popup issues
  window.addEventListener('error', function(event) {
    console.error('GhostVault Popup Uncaught Error:', event.error || event.message, event);
  });

  // Message listeners
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Focus or open the popup when requested
    if (msg && msg.action === 'ghostvaultFocusPopup') {
      window.focus();
      return true;
    }
    
    // Handle scan requests from content script
    if (msg && msg.action === 'ghostvaultShowScanInPopup') {
      const tcAnalyzer = document.getElementById('tcAnalyzer');
      const result = document.getElementById('tcResult');
      const actions = document.getElementById('tcActions');
      if (tcAnalyzer && result && actions) {
        tcAnalyzer.style.display = 'block';
        result.style.color = '#1976d2';
        result.textContent = 'Analyzing Terms & Conditions and cookies...';
        actions.style.display = 'none';
        
        // Request scan from background
        chrome.runtime.sendMessage({ 
          action: 'scanTandCAndCookies', 
          tcText: msg.tcText, 
          cookies: msg.cookies 
        }, response => {
          if (chrome.runtime.lastError) return;
          result.style.color = response && response.result && 
            response.result.includes('No major red flags') ? 'green' : 'orange';
          result.textContent = response?.result || 'No result.';
          actions.style.display = 'block';
          actions.dataset.btnSelector = msg.btnSelector || '';
        });
      }
      return true;
    }
    
    // Handle UI refresh requests
    if (msg?.action === 'refreshUI') {
      console.log('Refreshing UI from message...');
      if (tabLogins?.classList?.contains('active') && typeof loadSavedLogins === 'function') {
        loadSavedLogins();
      } else if (tabNever?.classList?.contains('active') && typeof showNever === 'function') {
        showNever();
      }
      return true;
    }
    
    return true; // Keep the message channel open for async responses
  });
  
  // --- UI Elements ---
  const tabLogins = document.getElementById('tabLogins');
  const tabScans = document.getElementById('tabScans');
  const tabNever = document.getElementById('tabNever');
  const tabExport = document.getElementById('tabExport');
  const tabContent = document.getElementById('tabContent');
  const settingsBtn = document.getElementById('settingsBtn');
  const savedLoginsUl = document.getElementById('savedLogins');
  const loginForm = document.getElementById('loginForm');
  
  // --- Settings button ---
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  // Global error handler for debugging blank popup issues
  window.addEventListener('error', function(event) {
    console.error('GhostVault Popup Uncaught Error:', event.error || event.message, event);
  });

  // Focus or open the popup when requested
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.action === 'ghostvaultFocusPopup') {
      window.focus();
    }
    return true; // Keep the message channel open for async response if needed
  });

  // Listen for scan requests from content script and show in T&C analyzer UI
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.action === 'ghostvaultShowScanInPopup') {
      const tcAnalyzer = document.getElementById('tcAnalyzer');
      const result = document.getElementById('tcResult');
      const actions = document.getElementById('tcActions');
      if (tcAnalyzer && result && actions) {
        tcAnalyzer.style.display = 'block';
        result.style.color = '#1976d2';
        result.textContent = 'Analyzing Terms & Conditions and cookies...';
        actions.style.display = 'none';
        // Request scan from background
        chrome.runtime.sendMessage({ action: 'scanTandCAndCookies', tcText: msg.tcText, cookies: msg.cookies }, response => {
          if (chrome.runtime.lastError) return;
          // Show result in UI
          result.style.color = response && response.result && response.result.includes('No major red flags') ? 'green' : 'orange';
          result.textContent = response && response.result ? response.result : 'No result.';
          actions.style.display = 'block';
          // Store selector for Accept
          actions.dataset.btnSelector = msg.btnSelector || '';
        });
      }
    }
    return true; // Keep the message channel open for async response if needed
  });

  // --- Check for stored T&C scan data on popup open ---
  chrome.storage.local.get(['tcScanData'], (result) => {
    if (result.tcScanData && result.tcScanData.timestamp) {
      const scanData = result.tcScanData;
      // Check if scan is recent (within 30 seconds)
      if (Date.now() - scanData.timestamp < 30000) {
        showAnalyzerUI(scanData.tcText, scanData.cookies, scanData.btnSelector, scanData.tabId);
        // Clear the scan data after showing
        chrome.storage.local.remove(['tcScanData']);
      }
    }
  });

  // --- Error handling utility ---
  function logError(context, error) {
    console.error(`GhostVault ${context}:`, error);
  }

  // --- T&C Analyzer UI Logic (for auto-detected prompts) ---
  function showAnalyzerUI(tcText, cookies, btnSelector, tabId) {
    const tcAnalyzer = document.getElementById('tcAnalyzer');
    const result = document.getElementById('tcResult');
    const actions = document.getElementById('tcActions');
    if (!tcAnalyzer || !result || !actions) return;

    // Show loading state
    tcAnalyzer.style.display = 'block';
    result.style.color = '#1976d2';
    result.textContent = 'Analyzing Terms & Conditions and cookies...';
    actions.style.display = 'none';

    // Request scan from background script
    chrome.runtime.sendMessage({ action: 'scanTandCAndCookies', tcText, cookies }, response => {
      if (chrome.runtime.lastError) {
        result.style.color = 'red';
        result.textContent = 'Error: Could not analyze T&Cs.';
        return;
      }
      // Display result
      result.style.color = response?.result?.includes('No major red flags') ? 'green' : 'orange';
      result.textContent = response?.result || 'No result from analysis.';
      
      // Create accept/reject buttons for auto-detected prompts
      createAcceptRejectButtons(actions, btnSelector, tabId);
    });
  }

  // --- Accept/Reject Button Handlers (only for auto-detected T&C prompts) ---
  function createAcceptRejectButtons(actions, btnSelector, tabId) {
    // Clear existing buttons
    actions.innerHTML = '';
    
    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.className = 'btn-success';
    acceptBtn.style.marginRight = '8px';
    acceptBtn.setAttribute('aria-label', 'Accept Terms and Conditions');
    
    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject';
    rejectBtn.className = 'btn-danger';
    rejectBtn.setAttribute('aria-label', 'Reject Terms and Conditions');
    
    acceptBtn.onclick = () => {
      if (btnSelector && tabId) {
        chrome.runtime.sendMessage({
          action: 'ghostvaultTCAcceptResult',
          accepted: true,
          btnSelector,
          tabId: parseInt(tabId)
        }, response => {
          if (chrome.runtime.lastError) {
            logError('Accept SendMessage', chrome.runtime.lastError);
          }
        });
        window.close();
      } else {
        logError('Accept Click', 'Missing selector or tabId');
      }
    };
    
    rejectBtn.onclick = () => {
      if (btnSelector && tabId) {
        chrome.runtime.sendMessage({
          action: 'ghostvaultTCAcceptResult',
          accepted: false,
          btnSelector,
          tabId: parseInt(tabId)
        }, response => {
          if (chrome.runtime.lastError) {
            logError('Reject SendMessage', chrome.runtime.lastError);
          }
        });
        window.close();
      } else {
        logError('Reject Click', 'Missing selector or tabId');
      }
    };
    
    actions.appendChild(acceptBtn);
    actions.appendChild(rejectBtn);
    actions.style.display = 'block';
  }

  // --- Tips Loading Function ---
  async function loadRandomTip() {
    try {
      // Check if tips should be shown
      const settings = await new Promise(resolve => {
        chrome.storage.sync.get(['showTips'], resolve);
      });
      
      if (settings.showTips === false) {
        const tipEl = document.getElementById('tip');
        if (tipEl) tipEl.style.display = 'none';
        return;
      }
      
      // Load tips from tips.json
      const response = await fetch(chrome.runtime.getURL('tips.json'));
      const tips = await response.json();
      
      if (tips && tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        const tipEl = document.getElementById('tip');
        if (tipEl) {
          tipEl.textContent = `💡 ${randomTip.tip}`;
        }
      }
    } catch (error) {
      console.warn('Failed to load tips:', error);
      const tipEl = document.getElementById('tip');
      if (tipEl) {
        tipEl.textContent = '💡 Use strong passwords to protect your accounts.';
      }
    }
  }

  // --- Popup Initialization ---
  console.log('[GhostVault Popup] DOMContentLoaded event fired.');

  // Load and display a random tip
  loadRandomTip();

  // On popup open, check for a pending scan from the background script
  chrome.storage.local.get(['pendingTCScan'], (data) => {
    console.log('[GhostVault Popup] Checking storage for pendingTCScan. Data found:', data);
    if (data && data.pendingTCScan) {
      const { tcText, cookies, btnSelector, tabId } = data.pendingTCScan;
      console.log(`[GhostVault Popup] Found pending scan from storage for tab ${tabId}. Calling showAnalyzerUI.`);
      showAnalyzerUI(tcText, cookies, btnSelector, tabId);

      // Clear the pending scan and badge now that it's been displayed
      chrome.storage.local.remove('pendingTCScan', () => {
        console.log('[GhostVault Popup] Cleared pending scan from storage.');
      });
      if (tabId) {
        chrome.action.setBadgeText({ text: '', tabId });
      }
    } else {
      console.log('[GhostVault Popup] No pending scan found in storage. Hiding analyzer UI.');
      // Hide analyzer if no pending scan
      const tcAnalyzer = document.getElementById('tcAnalyzer');
      if (tcAnalyzer) {
        tcAnalyzer.style.display = 'none';
      }
    }
  });

  // ...existing code for termsBtn, analyzeTcBtn, etc...

  // --- Breach Check (working implementation with API key support) ---
  const breachBtn = document.getElementById('breachBtn');
  if (breachBtn) {
    breachBtn.addEventListener('click', async () => {
      const emailInput = document.getElementById('emailInput');
      const resultEl = document.getElementById('breachResult');
      if (!emailInput || !resultEl) return;
      
      const email = emailInput.value.trim();
      if (!email) {
        showError('Please enter an email address.');
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Please enter a valid email address.');
        return;
      }
      
      resultEl.style.color = '#1976d2';
      resultEl.textContent = 'Checking for breaches...';
      
      try {
        // Use BreachDirectory API via RapidAPI for breach check
        const response = await fetch(`https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'breachdirectory.p.rapidapi.com',
            'x-rapidapi-key': '3adb132cdemshbca70db3a8f255fp179c15jsn58eb7da060f3'
          }
        });
        
        if (response.status === 200) {
          const data = await response.json();
          if (data.success && data.result && data.result.length > 0) {
            resultEl.style.color = '#d32f2f';
            resultEl.innerHTML = `
              <div style="margin-bottom: 8px;">⚠️ Found ${data.result.length} breach(es) for this email:</div>
              <div style="max-height: 200px; overflow-y: auto; font-size: 0.9rem;">
                    ${data.result.map(breach => {
                      // If the only info is the email, show a simple message
                      if (breach.line && breach.line === email) {
                        return `<div style="margin-bottom: 4px; padding: 4px; background: #ffebee; border-radius: 3px;">
                          <strong>This email was found in at least one public breach, but no further details are available.</strong>
                        </div>`;
                      }
                      // Otherwise, show the full JSON for advanced users
                      return `<div style="margin-bottom: 4px; padding: 4px; background: #ffebee; border-radius: 3px;"><strong>${breach.line || breach.email || JSON.stringify(breach)}</strong><pre style='font-size:0.8em;white-space:pre-wrap;'>${JSON.stringify(breach, null, 2)}</pre></div>`;
                    }).join('')}
              </div>
            `;
          } else {
            resultEl.style.color = '#388e3c';
            resultEl.textContent = '✅ Good news! No breaches found for this email address.';
          }
        } else if (response.status === 429) {
          resultEl.style.color = '#f57c00';
          resultEl.textContent = 'Rate limit exceeded. Please try again later.';
        } else {
          resultEl.style.color = '#d32f2f';
          resultEl.textContent = 'Error checking breaches. Please try again.';
        }
      } catch (error) {
        console.error('Breach check failed:', error);
        resultEl.style.color = '#d32f2f';
        resultEl.textContent = 'Failed to check for breaches. Please try again.';
      }
    });
  }

  // --- T&C Analyzer ---
  const termsBtn = document.getElementById('termsBtn');
  if (termsBtn) {
    termsBtn.addEventListener('click', () => {
      // Send message to content script to analyze current page
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs && tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeCurrentPage' }, response => {
            if (chrome.runtime.lastError) {
              // Fallback: show manual input
              const tcAnalyzer = document.getElementById('tcAnalyzer');
              if (tcAnalyzer) {
                tcAnalyzer.style.display = 'block';
              }
            }
          });
        }
      });
    });
  }

  const analyzeTcBtn = document.getElementById('analyzeTcBtn');
  if (analyzeTcBtn) {
    analyzeTcBtn.addEventListener('click', () => {
      const text = (document.getElementById('tcInput')?.value || '').trim();
      const result = document.getElementById('tcResult');
      if (!result) return;
      
      if (!text) {
        result.style.color = '#d32f2f';
        result.textContent = 'Please paste Terms & Conditions to analyze.';
        return;
      }

      // Enhanced T&C analysis with more comprehensive patterns
      const textLower = text.toLowerCase();
      const highRiskPatterns = [
        { phrase: 'sell your data', issue: 'Your data may be sold to third parties', severity: 'high' },
        { phrase: 'share your data with third parties', issue: 'Data sharing with external companies', severity: 'high' },
        { phrase: 'track your activity across', issue: 'Cross-site activity tracking', severity: 'high' },
        { phrase: 'retain your data indefinitely', issue: 'Permanent data retention', severity: 'high' },
        { phrase: 'change terms without notice', issue: 'Unilateral changes without notification', severity: 'high' }
      ];

      const mediumRiskPatterns = [
        { phrase: 'we may share your data', issue: 'Potential data sharing', severity: 'medium' },
        { phrase: 'third parties', issue: 'Involves external services', severity: 'medium' },
        { phrase: 'track your activity', issue: 'Activity tracking', severity: 'medium' },
        { phrase: 'change terms at any time', issue: 'Terms may change unilaterally', severity: 'medium' },
        { phrase: 'collect information about', issue: 'Broad data collection scope', severity: 'medium' },
        { phrase: 'advertising partners', issue: 'Data sharing with advertisers', severity: 'medium' },
        { phrase: 'analytics providers', issue: 'Data sharing with analytics companies', severity: 'medium' },
        { phrase: 'retain your data', issue: 'Data retention policies', severity: 'medium' }
      ];

      const highRiskIssues = highRiskPatterns.filter(item => textLower.includes(item.phrase));
      const mediumRiskIssues = mediumRiskPatterns.filter(item => textLower.includes(item.phrase));

      let resultText = '';
      let resultColor = '#28c76f'; // Green by default

      if (highRiskIssues.length > 0) {
        resultColor = '#d32f2f'; // Red for high risk
        resultText = `🚨 HIGH RISK ISSUES FOUND (${highRiskIssues.length}):\n`;
        resultText += highRiskIssues.map(i => `• ${i.issue}`).join('\n');
        
        if (mediumRiskIssues.length > 0) {
          resultText += `\n\n⚠️ Additional concerns (${mediumRiskIssues.length}):\n`;
          resultText += mediumRiskIssues.map(i => `• ${i.issue}`).join('\n');
        }
        resultText += '\n\n❌ RECOMMENDATION: Consider avoiding this service or reviewing their privacy policy carefully.';
      } else if (mediumRiskIssues.length > 0) {
        resultColor = '#f57c00'; // Orange for medium risk
        resultText = `⚠️ POTENTIAL CONCERNS FOUND (${mediumRiskIssues.length}):\n`;
        resultText += mediumRiskIssues.map(i => `• ${i.issue}`).join('\n');
        resultText += '\n\n⚡ RECOMMENDATION: Review these concerns and decide if you\'re comfortable with the risks.';
      } else {
        resultText = '✅ ANALYSIS COMPLETE: No major privacy red flags detected in the provided text.\n\n';
        resultText += '💡 This doesn\'t guarantee complete privacy protection. Always read the full terms and privacy policy.';
      }

      result.style.color = resultColor;
      result.style.whiteSpace = 'pre-line';
      result.textContent = resultText;
    });
  }

  // --- Login Manager ---
  const loginBtn = document.getElementById('loginBtn');
  const loginManagerDiv = document.getElementById('loginManager');
  if (loginBtn && loginManagerDiv) {
    loginBtn.addEventListener('click', () => {
      const tcAnalyzer = document.getElementById('tcAnalyzer');
      if (tcAnalyzer) tcAnalyzer.style.display = 'none';
      loginManagerDiv.style.display = loginManagerDiv.style.display === 'none' ? 'block' : 'none';
      if (loginManagerDiv.style.display === 'block') loadSavedLogins();
    });
  }
  // Form elements are now declared above

  async function handleSaveLogin(url, user, pass) {
      // Save login to IndexedDB
      const meta = { url, user, savedAt: Date.now(), updatedAt: Date.now() };
      console.log('[GhostVault Popup] Saving to IndexedDB (no encryption)', meta);
      await GhostVaultDB.saveLogin({ ...meta, pass: pass });

      // Also update legacy storage so the Saved Logins UI shows items
      try {
        const { logins = [] } = await new Promise(resolve => chrome.storage.sync.get({ logins: [] }, resolve));
        const exists = logins.find(l => l.url === meta.url && l.user === meta.user);
        if (!exists) {
            logins.push({ url: meta.url, user: meta.user, pass: pass });
            await new Promise(resolve => chrome.storage.sync.set({ logins }, resolve));
        }
      } catch(e) {
          console.warn('Could not mirror login to chrome.storage.sync', e);
      }

      if (typeof loadSavedLogins === 'function') loadSavedLogins();
      // Refresh Data Manager tab if it's the active view
      try { if (typeof showLogins === 'function' && document.getElementById('tabLogins')?.classList.contains('active')) showLogins(); } catch {}
      loginForm.reset();
  }

  // Quick Save button removed - using main save button only

  // Check password strength (returns 0-3: weak, 1-2: medium, 3: strong)
  function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(3, Math.floor(strength / 2));
  }

  // Show password strength feedback
  function showPasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    let message = '';
    let color = '#888';
    
    if (password.length === 0) {
      message = '';
    } else if (strength === 0) {
      message = 'Weak password';
      color = '#ff4444';
    } else if (strength === 1) {
      message = 'Fair password';
      color = '#ff9800';
    } else if (strength === 2) {
      message = 'Good password';
      color = '#2196F3';
    } else {
      message = 'Strong password';
      color = '#4CAF50';
    }
    
    let strengthDisplay = document.getElementById('passwordStrength');
    if (!strengthDisplay) {
      strengthDisplay = document.createElement('div');
      strengthDisplay.id = 'passwordStrength';
      strengthDisplay.style.marginTop = '4px';
      strengthDisplay.style.fontSize = '12px';
      const passInput = document.getElementById('loginPass');
      passInput.parentNode.insertBefore(strengthDisplay, passInput.nextSibling);
    }
    
    strengthDisplay.textContent = message;
    strengthDisplay.style.color = color;
  }

  // --- Save login ---
  if (loginForm) {
    // Add real-time password strength feedback
    const passInput = document.getElementById('loginPass');
    if (passInput) {
      passInput.addEventListener('input', (e) => {
        showPasswordStrength(e.target.value);
      });
    }

    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      try {
        const url = loginForm.loginUrl.value.trim();
        const user = loginForm.loginUser.value.trim();
        const pass = loginForm.loginPass.value;

        if (!url || !user || !pass) {
          showError('Please fill in all fields');
          return;
        }
        try { 
          new URL(url); 
        } catch { 
          showError('Please enter a valid URL (e.g., https://example.com)'); 
          return; 
        }

        // Show strength feedback one last time before saving
        showPasswordStrength(pass);
        
        await handleSaveLogin(url, user, pass);
        showSuccess('Login saved successfully!');
        console.log('[GhostVault Popup] Save completed successfully.');
      } catch (error) {
        console.error('[GhostVault Popup] Error saving login:', error);
        showError('Failed to save login: ' + (error?.message || String(error)));
      }
    });
  }
  
  // --- Error and Success Message Functions ---
  function showError(message) { showMessage(message, 'error'); }
  function showSuccess(message) { showMessage(message, 'success'); }
  function showMessage(message, type = 'info') {
    const existingMessage = document.getElementById('messageDisplay');
    if (existingMessage) existingMessage.remove();
    const messageDiv = document.createElement('div');
    messageDiv.id = 'messageDisplay';
    messageDiv.style.cssText = 'position:fixed; top:20px; right:20px; padding:12px 16px; border-radius:6px; color:white; font-weight:500; z-index:10000; max-width:300px; word-wrap:break-word; animation:slideIn 0.3s ease-out;';
    if (type === 'error') { messageDiv.style.background = '#d32f2f'; }
    else if (type === 'success') { messageDiv.style.background = '#388e3c'; }
    else { messageDiv.style.background = '#1976d2'; }
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => { if (messageDiv.parentNode) messageDiv.remove(); }, 5000);
  }

  // --- Data Manager UI Elements ---
  const tabLogins = document.getElementById('tabLogins');
  const tabScans = document.getElementById('tabScans');
  const tabNever = document.getElementById('tabNever');
  const tabExport = document.getElementById('tabExport');
  const tabContent = document.getElementById('tabContent');
  const settingsBtn = document.getElementById('settingsBtn');
  const savedLoginsUl = document.getElementById('savedLogins');
  const loginForm = document.getElementById('loginForm');

  // --- Settings button ---
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // --- Load saved logins ---
  async function loadSavedLogins() {
    console.log('Loading saved logins...'); // Debug log
    if (!savedLoginsUl) return;
    try {
      const logins = await GhostVaultDB.getLogins();
      savedLoginsUl.innerHTML = '';
      if (!logins || logins.length === 0) {
        savedLoginsUl.textContent = 'No saved logins.';
        return;
      }
      
      for (const login of logins) {
        const li = document.createElement('li');
        li.style.cssText = 'border:1px solid #444; padding:12px; margin-bottom:8px; border-radius:8px; background:rgba(255,255,255,0.03);';
        
        // Main content
        const content = document.createElement('div');
        content.style.display = 'flex';
        content.style.justifyContent = 'space-between';
        content.style.alignItems = 'center';
        
        // Login info
        const loginInfo = document.createElement('div');
        const url = document.createElement('div');
        url.textContent = login.url;
        url.style.fontWeight = '600';
        url.style.marginBottom = '4px';
        
        const user = document.createElement('div');
        user.textContent = login.user;
        user.style.color = '#aaa';
        user.style.fontSize = '0.9em';
        
        loginInfo.appendChild(url);
        loginInfo.appendChild(user);
        
        // Buttons container
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.gap = '6px';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit';
        editBtn.style.background = 'none';
        editBtn.style.border = '1px solid #444';
        editBtn.style.borderRadius = '4px';
        editBtn.style.padding = '4px 8px';
        editBtn.style.cursor = 'pointer';
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = '1px solid #ff4444';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.padding = '4px 8px';
        deleteBtn.style.cursor = 'pointer';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.padding = '4px 12px';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.border = '1px solid #444';
        copyBtn.style.background = 'none';
        copyBtn.style.color = '#e6eef3';
        copyBtn.style.cursor = 'pointer';
        
        // Add buttons to container
        buttons.appendChild(editBtn);
        buttons.appendChild(deleteBtn);
        buttons.appendChild(copyBtn);
        
        // Add elements to content
        content.appendChild(loginInfo);
        content.appendChild(buttons);
        
        // Add content to list item
        li.appendChild(content);
        
        // Edit form (initially hidden)
        const editForm = document.createElement('div');
        editForm.style.display = 'none';
        editForm.style.marginTop = '10px';
        editForm.style.paddingTop = '10px';
        editForm.style.borderTop = '1px solid #444';
        
        // Add edit form HTML
        editForm.innerHTML = `
          <form style="display:flex; flex-direction:column; gap:8px;">
            <input type="url" value="${escapeHTML(login.url)}" required 
                   style="padding:6px; background:#1a2029; border:1px solid #444; color:#e6eef3; border-radius:4px;">
            <input type="text" value="${escapeHTML(login.user)}" required 
                   style="padding:6px; background:#1a2029; border:1px solid #444; color:#e6eef3; border-radius:4px;">
            <input type="text" value="${escapeHTML(login.pass)}" required 
                   style="padding:6px; background:#1a2029; border:1px solid #444; color:#e6eef3; border-radius:4px;">
            <div style="display:flex; gap:6px; margin-top:4px;">
              <button type="submit" style="padding:4px 12px; background:#2563eb; border:none; border-radius:4px; cursor:pointer;">
                Save
              </button>
              <button type="button" class="cancel-edit" style="padding:4px 12px; background:none; border:1px solid #444; border-radius:4px; cursor:pointer; color:#e6eef3;">
                Cancel
              </button>
            </div>
          </form>
        `;
        
        li.appendChild(editForm);
        
        // Toggle edit form
        editBtn.addEventListener('click', () => {
          editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
          if (editForm.style.display === 'block') {
            editForm.querySelector('input[type="url"]').focus();
          }
        });
        
        // Cancel edit
        editForm.querySelector('.cancel-edit').addEventListener('click', () => {
          editForm.style.display = 'none';
        });
        
        // Save changes
        editForm.querySelector('form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const inputs = e.target.elements;
          const updatedLogin = {
            ...login,
            url: inputs[0].value.trim(),
            user: inputs[1].value.trim(),
            pass: inputs[2].value,
            updatedAt: Date.now()
          };
          
          try {
            await GhostVaultDB.updateLogin(login.id, updatedLogin);
            showSuccess('Login updated successfully!');
            loadSavedLogins(); // Refresh the list
          } catch (error) {
            console.error('Error updating login:', error);
            showError('Failed to update login: ' + (error?.message || String(error)));
          }
        });
        
        // Delete login
        deleteBtn.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this login?')) {
            try {
              await GhostVaultDB.deleteLogin(login.id);
              showSuccess('Login deleted successfully!');
              loadSavedLogins(); // Refresh the list
            } catch (error) {
              console.error('Error deleting login:', error);
              showError('Failed to delete login: ' + (error?.message || String(error)));
            }
          }
        });
        
        // Copy password
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(login.pass);
            showSuccess('Password copied to clipboard!');
          } catch (error) {
            console.error('Error copying password:', error);
            showError('Failed to copy password');
          }
        });
        
        savedLoginsUl.appendChild(li);
      }
    } catch (e) {
      console.error('Error loading saved logins:', e);
      if (savedLoginsUl) {
        savedLoginsUl.textContent = 'Error loading saved logins.';
      }
    }
  }

  // --- SHA-1 for Pwned Passwords ---
  async function sha1(str) {
    const buf = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // Listen for storage changes to update UI
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      if (changes.logins) {
        console.log('Logins updated, refreshing UI...');
        if (typeof loadSavedLogins === 'function') {
          loadSavedLogins();
        }
      }
      if (changes.neverSaveSites) {
        console.log('Never save sites updated, refreshing UI...');
        if (typeof showNever === 'function' && tabNever?.classList.contains('active')) {
          showNever();
        }
      }
    }
  });

  function setActiveTab(activeTab) {
    [tabLogins, tabScans, tabNever, tabExport].forEach(tab => {
      if (tab) tab.classList.remove('active');
    });
    if (activeTab) activeTab.classList.add('active');
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str || ''));
    return p.innerHTML;
  }

  async function showLogins() {
    setActiveTab(tabLogins);
    try {
      const logins = await GhostVaultDB.getLogins();
      if (!tabContent) return;
      tabContent.innerHTML = '';

      if (!logins || logins.length === 0) {
        tabContent.textContent = 'No saved logins found.';
        return;
      }

      const table = document.createElement('table');
      table.className = 'data-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Website</th>
            <th>Username</th>
            <th>Saved On</th>
          </tr>
        </thead>
        <tbody>
          ${logins.map(login => `
            <tr>
              <td>${escapeHTML(login.url)}</td>
              <td>${escapeHTML(login.user)}</td>
              <td>${new Date(login.savedAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      tabContent.appendChild(table);
    } catch (error) {
      console.error('Error loading logins:', error);
      if (tabContent) tabContent.textContent = 'Error loading logins.';
    }
  }

  async function showScans() {
    setActiveTab(tabScans);
    try {
      const scans = await GhostVaultDB.getTCScans();
      if (!tabContent) return;
      tabContent.innerHTML = '';

      if (!scans || scans.length === 0) {
        tabContent.textContent = 'No T&C/Cookie scan history.';
        return;
      }

      const table = document.createElement('table');
      table.className = 'data-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Site</th>
            <th>Date</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          ${scans.map(scan => `
            <tr>
              <td>${escapeHTML(scan.site)}</td>
              <td>${new Date(scan.timestamp).toLocaleString()}</td>
              <td title="${escapeHTML(scan.result)}">${escapeHTML(scan.result).substring(0, 50)}...</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      tabContent.appendChild(table);
    } catch (error) {
      console.error('Error loading scans:', error);
      if (tabContent) tabContent.textContent = 'Error loading T&C/Cookie scans.';
    }
  }

  async function showNever() {
    setActiveTab(tabNever);
    try {
      const sites = await GhostVaultDB.getNeverSaveSites();
      if (!tabContent) return;
      tabContent.innerHTML = '';

      if (!sites || sites.length === 0) {
        tabContent.textContent = 'No sites in the "never save" list.';
        return;
      }

      const list = document.createElement('ul');
      list.className = 'never-save-list';
      list.innerHTML = sites.map(site => `<li>${escapeHTML(site)}</li>`).join('');
      tabContent.appendChild(list);
    } catch (error) {
      console.error('Error loading never-save list:', error);
      if (tabContent) tabContent.textContent = 'Error loading never-save list.';
    }
  }

  async function showExport() {
    setActiveTab(tabExport);
    if (!tabContent) return;
    tabContent.innerHTML = `
      <div class="export-container">
        <p>Export all your GhostVault data (logins, scans, never-save list) as a JSON file.</p>
        <p><strong>Warning:</strong> This file will contain unencrypted data.</p>
        <button id="exportBtn" class="btn-primary">Export Data</button>
      </div>
    `;
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.onclick = async () => {
        try {
          const logins = await GhostVaultDB.getLogins();
          const scans = await GhostVaultDB.getTCScans();
          const neverSites = await GhostVaultDB.getNeverSaveSites();
          const data = { logins, scans, neverSites };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ghostvault_export.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Export failed:', error);
          if (tabContent) {
            tabContent.innerHTML = '<p style="color:red;">Export failed. See console for details.</p>';
          }
        }
      };
    }

function setActiveTab(activeTab) {
  [tabLogins, tabScans, tabNever, tabExport].forEach(tab => {
    if (tab) tab.classList.remove('active');
  });
  if (activeTab) activeTab.classList.add('active');
}

function escapeHTML(str) {
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str || ''));
  return p.innerHTML;
}

async function showLogins() {
  setActiveTab(tabLogins);
  try {
    const logins = await GhostVaultDB.getLogins();
    if (!tabContent) return;
    tabContent.innerHTML = '';

    if (!logins || logins.length === 0) {
      tabContent.textContent = 'No saved logins found.';
      return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Website</th>
          <th>Username</th>
          <th>Saved On</th>
        </tr>
      </thead>
      <tbody>
        ${logins.map(login => `
          <tr>
            <td>${escapeHTML(login.url)}</td>
            <td>${escapeHTML(login.user)}</td>
            <td>${new Date(login.savedAt).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    tabContent.appendChild(table);
  } catch (error) {
    console.error('Error loading logins:', error);
    if (tabContent) tabContent.textContent = 'Error loading logins.';
  }
}

async function showScans() {
  setActiveTab(tabScans);
  try {
    const scans = await GhostVaultDB.getTCScans();
    if (!tabContent) return;
    tabContent.innerHTML = '';

    if (!scans || scans.length === 0) {
      tabContent.textContent = 'No T&C/Cookie scan history.';
      return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Site</th>
          <th>Date</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${scans.map(scan => `
          <tr>
            <td>${escapeHTML(scan.site)}</td>
            <td>${new Date(scan.timestamp).toLocaleString()}</td>
            <td title="${escapeHTML(scan.result)}">${escapeHTML(scan.result).substring(0, 50)}...</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    tabContent.appendChild(table);
  } catch (error) {
    console.error('Error loading scans:', error);
    if (tabContent) tabContent.textContent = 'Error loading T&C/Cookie scans.';
  }
}

async function showNever() {
  setActiveTab(tabNever);
  try {
    const sites = await GhostVaultDB.getNeverSaveSites();
    if (!tabContent) return;
    tabContent.innerHTML = '';

    if (!sites || sites.length === 0) {
      tabContent.textContent = 'No sites in the "never save" list.';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'never-save-list';
    list.innerHTML = sites.map(site => `<li>${escapeHTML(site)}</li>`).join('');
    tabContent.appendChild(list);
  } catch (error) {
    console.error('Error loading never-save list:', error);
    if (tabContent) tabContent.textContent = 'Error loading never-save list.';
  }
}

async function showExport() {
  setActiveTab(tabExport);
  if (!tabContent) return;
  tabContent.innerHTML = `
    <div class="export-container">
      <p>Export all your GhostVault data (logins, scans, never-save list) as a JSON file.</p>
      <p><strong>Warning:</strong> This file will contain unencrypted data.</p>
      <button id="exportBtn" class="btn-primary">Export Data</button>
    </div>
  `;
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.onclick = async () => {
      try {
        const logins = await GhostVaultDB.getLogins();
        const scans = await GhostVaultDB.getTCScans();
        const neverSites = await GhostVaultDB.getNeverSaveSites();
        const data = { logins, scans, neverSites };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ghostvault_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        tabContent.innerHTML = '<p style="color:red;">Export failed.</p>';
      }
    };
  }
}

// Initialize tab click handlers after all functions are defined
if (tabLogins && tabScans && tabNever && tabExport && tabContent) {
  tabLogins.onclick = showLogins;
  tabScans.onclick = showScans;
  tabNever.onclick = showNever;
  tabExport.onclick = showExport;
  
  // Set initial active tab
  tabLogins.click();
}

// Listen for refresh messages from content script or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'refreshUI') {
    console.log('Refreshing UI from message...');
    // Refresh the current tab view
    if (tabLogins?.classList.contains('active') && typeof loadSavedLogins === 'function') {
      loadSavedLogins();
    } else if (tabNever?.classList.contains('active') && typeof showNever === 'function') {
      showNever();
    }
  }
  return true; // Keep the message channel open for async response if needed
});

// DOMContentLoaded event listener closing
}); // End of DOMContentLoaded
