// Welcome page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('GhostVault Welcome page loaded');

    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            // Close the welcome tab and open the popup
            chrome.tabs.getCurrent(function(tab) {
                if (tab) {
                    chrome.tabs.remove(tab.id);
                }
            });
            
            // Open the extension popup
            chrome.action.openPopup();
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            // Open the settings page
            chrome.runtime.openOptionsPage();
        });
    }

    // Set default settings for new users
    chrome.storage.sync.get(['showTips', 'blockTrackers', 'autoFillLogins', 'notifyBreaches', 'syncCredentials'], function(data) {
        const defaults = {
            showTips: data.showTips !== undefined ? data.showTips : true,
            blockTrackers: data.blockTrackers !== undefined ? data.blockTrackers : true,
            autoFillLogins: data.autoFillLogins !== undefined ? data.autoFillLogins : true,
            notifyBreaches: data.notifyBreaches !== undefined ? data.notifyBreaches : true,
            syncCredentials: data.syncCredentials !== undefined ? data.syncCredentials : false
        };
        
        chrome.storage.sync.set(defaults, function() {
            console.log('Default settings set for new user');
        });
    });
}); 