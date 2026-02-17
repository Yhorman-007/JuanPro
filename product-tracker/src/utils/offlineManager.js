// Offline Manager using IndexedDB
// Handles offline queue and syncing when connection is restored

import { openDB } from 'idb';

const DB_NAME = 'ProductTrackerDB';
const DB_VERSION = 1;

// Initialize IndexedDB
export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store for pending operations when offline
            if (!db.objectStoreNames.contains('offlineQueue')) {
                db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
            }
            // Cache for data
            if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache', { keyPath: 'key' });
            }
        },
    });
};

// Add operation to offline queue
export const queueOperation = async (operation) => {
    const db = await initDB();
    await db.add('offlineQueue', {
        ...operation,
        timestamp: Date.now()
    });
};

// Get all queued operations
export const getQueuedOperations = async () => {
    const db = await initDB();
    return db.getAll('offlineQueue');
};

// Clear queue after successful sync
export const clearQueue = async () => {
    const db = await initDB();
    const tx = db.transaction('offlineQueue', 'readwrite');
    await tx.objectStore('offlineQueue').clear();
};

// Cache data
export const cacheData = async (key, data) => {
    const db = await initDB();
    await db.put('cache', { key, data, timestamp: Date.now() });
};

// Get cached data
export const getCachedData = async (key) => {
    const db = await initDB();
    const cached = await db.get('cache', key);
    return cached?.data;
};

// Check if online
export const isOnline = () => {
    return navigator.onLine;
};

// Listen for online/offline events
export const setupConnectionListeners = (onOnline, onOffline) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
};
