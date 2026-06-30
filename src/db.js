const DB_NAME = 'UangKemanaDB';
const DB_VERSION = 1;
const LS_BACKUP_KEY = 'duitku_data_backup';
const LS_BACKUP_TIMESTAMP_KEY = 'duitku_backup_timestamp';

export const stores = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  SAVING_GOALS: 'saving_goals',
  SETTINGS: 'settings'
};

let dbInstance = null;

// ──────────────────────────────────────────────
// LocalStorage Backup Layer
// Mirrors all IndexedDB data to localStorage as a safety net.
// If IndexedDB gets wiped (browser cleanup, private mode, etc.),
// data can be restored from localStorage on next app launch.
// ──────────────────────────────────────────────

const backupToLocalStorage = async () => {
  try {
    if (!dbInstance) return;
    
    const data = {};
    const storeNames = [stores.USERS, stores.TRANSACTIONS, stores.SAVING_GOALS, stores.SETTINGS];
    
    for (const storeName of storeNames) {
      data[storeName] = await getAllFromStore(storeName);
    }
    
    localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(data));
    localStorage.setItem(LS_BACKUP_TIMESTAMP_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('[DB] localStorage backup failed:', err);
  }
};

const restoreFromLocalStorage = async () => {
  try {
    const backupStr = localStorage.getItem(LS_BACKUP_KEY);
    if (!backupStr) return false;
    
    const data = JSON.parse(backupStr);
    if (!data || typeof data !== 'object') return false;
    
    let restoredAny = false;
    
    for (const storeName of Object.keys(data)) {
      if (!data[storeName] || !Array.isArray(data[storeName])) continue;
      
      // Only restore if the store is empty (IndexedDB was wiped)
      const existing = await getAllFromStore(storeName);
      if (existing.length === 0 && data[storeName].length > 0) {
        for (const item of data[storeName]) {
          await putToStore(storeName, item);
        }
        restoredAny = true;
      }
    }
    
    if (restoredAny) {
      console.log('[DB] Data restored from localStorage backup');
    }
    
    return restoredAny;
  } catch (err) {
    console.warn('[DB] localStorage restore failed:', err);
    return false;
  }
};

// Debounce backup so rapid writes don't hammer localStorage
let backupTimer = null;
const scheduleBackup = () => {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupToLocalStorage();
  }, 1000);
};

// ──────────────────────────────────────────────
// Core IndexedDB Operations
// ──────────────────────────────────────────────

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (e) => reject('IndexedDB error: ' + e.target.error);

    request.onsuccess = async (e) => {
      dbInstance = e.target.result;
      
      // If IndexedDB was cleared (e.g. browser cleanup), restore from localStorage
      await restoreFromLocalStorage();
      
      resolve(dbInstance);
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      if (!db.objectStoreNames.contains(stores.USERS)) {
        db.createObjectStore(stores.USERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(stores.TRANSACTIONS)) {
        const txStore = db.createObjectStore(stores.TRANSACTIONS, { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
      }
      if (!db.objectStoreNames.contains(stores.SAVING_GOALS)) {
        db.createObjectStore(stores.SAVING_GOALS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(stores.SETTINGS)) {
        db.createObjectStore(stores.SETTINGS, { keyPath: 'key' });
      }
    };
  });
};

export const getStore = (storeName, mode = 'readonly') => {
  if (!dbInstance) throw new Error('DB not initialized');
  const tx = dbInstance.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

// Internal helper (no backup trigger) for use in restore flow
const getAllFromStore = (storeName) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const putToStore = (storeName, item) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, 'readwrite').put(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ──────────────────────────────────────────────
// Public API (with automatic localStorage backup)
// ──────────────────────────────────────────────

export const get = (storeName, key) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAll = (storeName) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const put = (storeName, item) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, 'readwrite').put(item);
    request.onsuccess = () => {
      scheduleBackup(); // Auto-backup to localStorage
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
};

export const remove = (storeName, key) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, 'readwrite').delete(key);
    request.onsuccess = () => {
      scheduleBackup(); // Auto-backup to localStorage
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

export const clear = (storeName) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, 'readwrite').clear();
    request.onsuccess = () => {
      scheduleBackup(); // Auto-backup to localStorage
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

// Force a full backup now (call after bulk operations)
export const forceBackup = () => backupToLocalStorage();

// Clear the localStorage backup (when user explicitly resets all data)
export const clearBackup = () => {
  try {
    localStorage.removeItem(LS_BACKUP_KEY);
    localStorage.removeItem(LS_BACKUP_TIMESTAMP_KEY);
  } catch (err) {
    console.warn('[DB] Failed to clear localStorage backup:', err);
  }
};
