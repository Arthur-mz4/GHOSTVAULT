// --- Global Variables ---
let tabLogins, tabScans, tabNever, tabExport, tabContent;

// Global error handler for debugging blank popup issues
window.addEventListener('error', function(event) {
  console.error('GhostVault Popup Uncaught Error:', event.error || event.message, event);
});

// Focus or open the popup when requested
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === 'ghostvaultFocusPopup') {
    window.focus();
  }
  return true; // Keep the message channel open for async responses
});
// Listen for scan requests from content script and show in T&C analyzer UI
// Removed auto-scan display in main popup; dedicated window handles it
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tab elements
  tabLogins = document.getElementById('tabLogins');
  tabScans = document.getElementById('tabScans');
  tabNever = document.getElementById('tabNever');
  tabExport = document.getElementById('tabExport');
  tabContent = document.getElementById('tabContent');
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
  

  // Load and display a random tip
  loadRandomTip();

  // Removed: Do not auto-render analyzer in main popup for auto-detected scans

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
      // Show analyzer immediately with loading state
      const tcAnalyzer = document.getElementById('tcAnalyzer');
      const result = document.getElementById('tcResult');
      const actions = document.getElementById('tcActions');
      if (tcAnalyzer && result && actions) {
        tcAnalyzer.style.display = 'block';
        result.style.color = '#1976d2';
        result.textContent = 'Analyzing Terms & Conditions and cookies...';
        actions.style.display = 'none';
      }
      // Send message to content script to analyze current page
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs && tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeCurrentPage' }, response => {
            if (chrome.runtime.lastError) {
              // Fallback: show manual input
              // Fallback: show manual input
              const tcAnalyzer = document.getElementById('tcAnalyzer');
              if (tcAnalyzer) {
                tcAnalyzer.style.display = 'block';
              }
            }
          });
        } else {
          // Show manual input if no active tab
          // Show manual input if no active tab
          const tcAnalyzer = document.getElementById('tcAnalyzer');
          if (tcAnalyzer) {
            tcAnalyzer.style.display = 'block';
          }
        }
      });
    });
  }



  const analyzeTcBtn = document.getElementById('analyzeTcBtn');
  if (analyzeTcBtn) {
    analyzeTcBtn.addEventListener('click', () => {
      // Use text from textarea for manual analysis through background (consistent results)
      const text = (document.getElementById('tcInput')?.value || '').trim();
      const result = document.getElementById('tcResult');
      if (!result) return;
      
      if (!text) {
        result.style.color = '#d32f2f';
        result.textContent = 'Please paste Terms & Conditions to analyze.';
        return;
      }
      result.style.color = '#1976d2';
      result.textContent = 'Analyzing Terms & Conditions and cookies...';
      const actions = document.getElementById('tcActions');
      if (actions) actions.style.display = 'none';
      chrome.runtime.sendMessage({ action: 'scanTandCAndCookies', tcText: text, cookies: document.cookie || '' }, response => {
        if (chrome.runtime.lastError) {
          result.style.color = '#f57c00';
          result.textContent = 'Analysis unavailable. Try again or open on the site page.';
          return;
        }
        const out = response && response.result ? response.result : 'No result from analysis.';
        result.style.color = out.includes('No major red flags') ? 'green' : 'orange';
        result.textContent = out;
        if (actions) actions.style.display = 'block';
      });
    });
  }

  const loginForm = document.getElementById('loginForm');
  const savedLoginsUl = document.getElementById('savedLogins');

  async function handleSaveLogin(url, user, pass) {
      const meta = { url, user, savedAt: Date.now(), updatedAt: Date.now() };
      await GhostVaultDB.saveLogin({ ...meta, pass: pass });
      if (typeof loadSavedLogins === 'function') loadSavedLogins();
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

  // --- Load saved logins ---
  async function loadSavedLogins() {
    
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
      console.error('[GhostVault Popup] Failed to load saved logins from IndexedDB:', e);
      savedLoginsUl.textContent = 'Error loading logins.';
    }
  }

  // Initial load after loadSavedLogins is defined and savedLoginsUl is assigned
  try { if (typeof loadSavedLogins === 'function') loadSavedLogins(); } catch {}

  // Initialize the active tab when popup opens
  if (tabLogins) tabLogins.click();

  // Tab click handlers
  if (tabLogins) {
    tabLogins.addEventListener('click', () => {
      setActiveTab(tabLogins);
      showLogins();
    });
  }

  if (tabScans) {
    tabScans.addEventListener('click', () => {
      setActiveTab(tabScans);
      showScans();
    });
  }

  if (tabNever) {
    tabNever.addEventListener('click', () => {
      setActiveTab(tabNever);
      showNever();
    });
  }

  if (tabExport) {
    tabExport.addEventListener('click', () => {
      setActiveTab(tabExport);
      showExport();
    });
  }
  
  // Listen for refresh messages from content script or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'refreshUI') {
      // Always refresh the Saved Logins list to keep edit/delete available
      if (typeof loadSavedLogins === 'function') {
        try { loadSavedLogins(); } catch {}
      }
      // Refresh the current tab view as well
      if (tabLogins?.classList.contains('active') && typeof showLogins === 'function') {
        try { showLogins(); } catch {}
      }
      if (tabNever?.classList.contains('active') && typeof showNever === 'function') {
        try { showNever(); } catch {}
      }
      if (tabScans?.classList.contains('active') && typeof showScans === 'function') {
        try { showScans(); } catch {}
      }
      if (tabExport?.classList.contains('active') && typeof showExport === 'function') {
        try { showExport(); } catch {}
      }
    }
  });
  
  // --- Settings button ---
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // --- Master Password Modal + Responder ---
  (function setupMasterPasswordResponder() {
    // Removed master password flow
  })();

  // --- SHA-1 for Pwned Passwords ---
  async function sha1(str) {
    const buf = await window.crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // --- Data Manager UI --- 
  // Tab variables are now declared at the top
  
  // Listen for storage changes to update UI
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      if (changes.logins) {
        
        if (typeof loadSavedLogins === 'function') {
          loadSavedLogins();
        }
      }
      if (changes.neverSaveSites) {
        
        if (typeof showNever === 'function' && tabNever?.classList.contains('active')) {
          showNever();
        }
      }
    }
  });
  // Tab elements are now initialized at the start of DOMContentLoaded

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

      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '8px';

      scans.slice().reverse().forEach(scan => {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid #444; padding:12px; border-radius:8px; background:rgba(255,255,255,0.03);';
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
          <div>
            <div style="font-weight:600;">${escapeHTML(scan.site || 'Unknown site')}</div>
            <div style="color:#aaa; font-size:0.9em;">${new Date(scan.timestamp).toLocaleString()}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600; color:${scan.count > 0 ? '#f59e0b' : '#22c55e'};">${scan.count || 0} risk${(scan.count||0)===1?'':'s'}</div>
            <div style="font-size:0.85em; color:${scan.accepted===true?'#22c55e':scan.accepted===false?'#ef4444':'#94a3b8'};">${scan.accepted===true?'Accepted':scan.accepted===false?'Rejected':'Pending'}</div>
          </div>
        `;
        const actions = document.createElement('div');
        actions.style.marginTop = '8px';
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.textContent = 'See more';
        btn.onclick = () => {
          try {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
            const modal = document.createElement('div');
            modal.style.cssText = 'width:90%;max-width:520px;background:#0f172a;color:#e6eef3;border:1px solid #334155;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,.5);';
            modal.innerHTML = `
              <div style="padding:12px 16px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center;">
                <div style="font-weight:600;">${escapeHTML(scan.site || 'Scan details')}</div>
                <button id="gvCloseModal" style="background:none;border:1px solid #444;color:#e6eef3;border-radius:6px;padding:4px 8px;cursor:pointer;">Close</button>
              </div>
              <div style="padding:12px 16px;max-height:60vh;overflow:auto;">
                <div style="font-size:0.85rem;color:#94a3b8;margin-bottom:8px;">${new Date(scan.timestamp).toLocaleString()}</div>
                <div style="margin-bottom:8px;"><strong>Risks:</strong> ${scan.count || 0}</div>
                <div style="margin-bottom:12px;"><strong>Decision:</strong> ${scan.accepted===true?'Accepted':scan.accepted===false?'Rejected':'Pending'}</div>
                <pre style="white-space:pre-wrap;word-break:break-word;background:#0b1220;border:1px solid #334155;border-radius:6px;padding:10px;">${escapeHTML(scan.result || 'No detailed result stored.')}</pre>
              </div>
            `;
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            modal.querySelector('#gvCloseModal').addEventListener('click', () => overlay.remove());
          } catch (e) {
            alert(scan.result || 'No details available.');
          }
        };
        const del = document.createElement('button');
        del.className = 'btn-danger';
        del.textContent = 'Delete';
        del.style.marginLeft = '8px';
        del.onclick = async () => {
          try {
            if (typeof scan.id !== 'undefined') await GhostVaultDB.deleteTCScan(scan.id);
            showScans();
          } catch (e) {
            alert('Failed to delete scan.');
          }
        };
        actions.appendChild(btn);
        actions.appendChild(del);
        card.appendChild(header);
        card.appendChild(actions);
        list.appendChild(card);
      });
      tabContent.appendChild(list);
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
        <p>Export all your GhostVault data (logins, scans, never-save list) as a PDF report.</p>
        <p><strong>Note:</strong> Report content is generated locally on your device.</p>
        <button id="exportBtn" class="btn-primary">Export PDF Report</button>
      </div>
    `;
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.onclick = async () => {
        try {
          const logins = await GhostVaultDB.getLogins();
          const scans = await GhostVaultDB.getTCScans();
          const neverSites = await GhostVaultDB.getNeverSaveSites();
          // Build printable HTML report and trigger native Print to PDF
          const now = new Date().toLocaleString();
          const section = (title, body) => `
            <section style="margin:16px 0;">
              <h2 style="font-size:16px;margin:0 0 8px 0;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">${title}</h2>
              ${body}
            </section>
          `;
          const tbl = (headers, rows) => `
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr>${headers.map(h=>`<th style=\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\">${escapeHTML(h)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map(r=>`<tr>${r.map(c=>`<td style=\"border-bottom:1px solid #f1f5f9;padding:6px;vertical-align:top;\">${escapeHTML(String(c))}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          `;
          const loginRows = (logins||[]).map(l => [l.url||'', l.user||'', new Date(l.savedAt||0).toLocaleString()]);
          const scansRows = (scans||[]).map(s => [s.site||'', new Date(s.timestamp||0).toLocaleString(), String(s.count||0), (s.accepted===true?'Accepted':s.accepted===false?'Rejected':'Pending')]);
          const neverRows = (neverSites||[]).map(s => [s]);
          const reportHTML = `
            <!doctype html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>GhostVault Report</title>
                <style>
                  @media print { button#printBtn { display: none; } }
                  body{ font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Cantarell,sans-serif; color:#0f172a; margin:24px; }
                </style>
              </head>
              <body>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                  <img src="${chrome.runtime.getURL('icons/icon.png')}" width="24" height="24"/>
                  <h1 style="margin:0;font-size:20px;">GhostVault Export Report</h1>
                </div>
                <div style="font-size:12px;color:#475569;">Generated: ${escapeHTML(now)}</div>
                ${section('Saved Logins', loginRows.length ? tbl(['Website','Username','Saved On'], loginRows) : '<div>No saved logins.</div>')}
                ${section('T&C / Cookie Scans', scansRows.length ? tbl(['Site','Date','Risks','Decision'], scansRows) : '<div>No scans.</div>')}
                ${section('Never Save Sites', neverRows.length ? tbl(['Site'], neverRows) : '<div>No sites in never-save list.</div>')}
                <div style="margin-top:16px;">
                  <button id="printBtn" onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-size:14px;cursor:pointer;">Download / Print PDF</button>
                </div>
                <script>setTimeout(function(){ try{ window.print(); }catch(e){} }, 500);</script>
              </body>
            </html>
          `;
          const w = window.open('','_blank');
          if (w && w.document) {
            w.document.open();
            w.document.write(reportHTML);
            w.document.close();
          } else {
            // Fallback: open as data URL
            const blob = new Blob([reportHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }
        } catch (error) {
          console.error('Export failed:', error);
          tabContent.innerHTML = '<p style="color:red;">Export failed.</p>';
        }
      };
    }
  }

  // Initialize the active tab when popup opens
  if (tabLogins) tabLogins.click();
});

