const DB_NAME = 'UangKemanaDB';
const DB_VERSION = 1;

export const stores = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  SAVING_GOALS: 'saving_goals',
  SETTINGS: 'settings'
};

let dbInstance = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (e) => reject('IndexedDB error: ' + e.target.error);

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
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
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const remove = (storeName, key) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, 'readwrite').delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clear = (storeName) => {
  return new Promise((resolve, reject) => {
    const request = getStore(storeName, 'readwrite').clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
