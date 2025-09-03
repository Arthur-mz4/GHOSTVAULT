// List of setting IDs to manage
const settingIds = [
  "blockTrackers",
  "showTips",
  "autoFillLogins",
  "notifyBreaches",
  "syncCredentials"
];

// Toggle switch functionality
function toggleSwitch(checkboxId) {
  const checkbox = document.getElementById(checkboxId);
  const switchElement = checkbox.parentElement.querySelector('.switch');
  
  checkbox.checked = !checkbox.checked;
  updateSwitchAppearance(checkbox);
  
  // Trigger change event for settings functionality
  checkbox.dispatchEvent(new Event('change'));
}

// Update switch appearance based on checked state
function updateSwitchAppearance(checkbox) {
  const switchElement = checkbox.parentElement.querySelector('.switch');
  if (checkbox.checked) {
    switchElement.classList.add('on');
  } else {
    switchElement.classList.remove('on');
  }
}

// Initialize switch states and event listeners
function initializeSwitches() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    // Set initial appearance
    updateSwitchAppearance(checkbox);
    
    // Add click handlers to the switch container
    const container = checkbox.parentElement;
    if (container.classList.contains('switch-container')) {
      container.addEventListener('click', (e) => {
        if (e.target !== checkbox) {  // Prevent double-trigger
          toggleSwitch(checkbox.id);
        }
      });
    }
  });
}

// Additional settings that need special handling
const additionalSettings = [];

// Load saved settings and update UI on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize switch components
  initializeSwitches();
  chrome.storage.sync.get([...settingIds, ...additionalSettings], (data) => {
    // Handle checkbox settings
    settingIds.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox && checkbox.type === 'checkbox') {
        // Default: first two true, others false
        if (data[id] === undefined) {
          checkbox.checked = (id === "blockTrackers" || id === "showTips");
        } else {
          checkbox.checked = data[id];
        }
      }
    });
    
    // Handle additional settings
    additionalSettings.forEach(id => {
      const input = document.getElementById(id);
      if (input && input.type === 'text' || input.type === 'password') {
        input.value = data[id] || '';
      }
    });
  });

  // Add event listeners for changes
  settingIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("change", () => {
      const setting = {};
      setting[id] = el.checked;

      // Save setting
      chrome.storage.sync.set(setting, () => {
        showStatus("Settings saved!");

        // Send updated setting to background script or popup
        chrome.runtime.sendMessage({ 
          action: "updateSetting", 
          settingId: id, 
          value: setting[id]
        });
      });
    });
  });
  
  // Add event listeners for additional settings
  additionalSettings.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
      const setting = {};
      setting[id] = el.value;

      // Save setting
      chrome.storage.sync.set(setting, () => {
        showStatus("Setting saved!");
      });
    });
  });
  // Fallback: if settings cannot be loaded, show error
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  chrome.runtime.lastError && (statusEl.textContent = 'Could not load settings.');
});

// Helper function to show a temporary status message
function showStatus(message) {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;
  statusEl.textContent = message;
  setTimeout(() => { statusEl.textContent = ""; }, 2000);
}
