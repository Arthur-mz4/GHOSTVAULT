// db.js - IndexedDB wrapper for GhostVault
const DB_NAME = 'ghostvault';
const DB_VERSION = 1;
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('logins')) {
        db.createObjectStore('logins', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('tcScans')) {
        db.createObjectStore('tcScans', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('neverSaveSites')) {
        db.createObjectStore('neverSaveSites', { keyPath: 'site' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

// Logins
async function saveLogin(login) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logins', 'readwrite');
    tx.objectStore('logins').put(login);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function updateLogin(id, updates) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logins', 'readwrite');
    const store = tx.objectStore('logins');
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const existingData = getRequest.result;
      if (!existingData) {
        reject(new Error('Login not found'));
        return;
      }
      
      // Update the existing data with new values
      const updatedData = { ...existingData, ...updates };
      
      // Make sure the ID stays the same
      updatedData.id = id;
      
      const putRequest = store.put(updatedData);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}

async function deleteLogin(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logins', 'readwrite');
    const request = tx.objectStore('logins').delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getLogins() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logins', 'readonly');
    const req = tx.objectStore('logins').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
// T&C/Cookie Scans
async function saveTCScan(scan) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tcScans', 'readwrite');
    tx.objectStore('tcScans').put(scan);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function getTCScans() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tcScans', 'readonly');
    const req = tx.objectStore('tcScans').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function deleteTCScan(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tcScans', 'readwrite');
    const req = tx.objectStore('tcScans').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
// Never Save Sites
async function addNeverSaveSite(site) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('neverSaveSites', 'readwrite');
    tx.objectStore('neverSaveSites').put({ site });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function getNeverSaveSites() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('neverSaveSites', 'readonly');
    const req = tx.objectStore('neverSaveSites').getAll();
    req.onsuccess = () => resolve(req.result.map(r => r.site));
    req.onerror = () => reject(req.error);
  });
}
// Export functions
const GhostVaultDB = { 
  saveLogin, 
  getLogins, 
  updateLogin, 
  deleteLogin, 
  saveTCScan, 
  getTCScans, 
  deleteTCScan,
  addNeverSaveSite, 
  getNeverSaveSites 
};

// For service worker context
if (typeof self !== 'undefined') self.GhostVaultDB = GhostVaultDB;

// For window context
try { 
  if (typeof window !== 'undefined') window.GhostVaultDB = GhostVaultDB; 
} catch (e) {}

// ES module export (only for ES modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GhostVaultDB;
} 