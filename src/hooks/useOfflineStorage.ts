import { useState, useEffect } from 'react';
import { db } from '../db/schema';

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncData();
    }
  }, [isOnline]);

  const syncData = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      
      // Get all unsynced records without using IDBKeyRange
      const unsynced = await db.syncQueue
        .where('synced')
        .equals(0)
        .toArray();

      if (unsynced.length === 0) return;

      // Process each unsynced record
      for (const record of unsynced) {
        try {
          // Here you would implement the actual sync with your backend
          // For now, we'll just mark it as synced
          await db.syncQueue.update(record.id, { 
            ...record,
            synced: 1,
            lastSyncAttempt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to sync record:', record.id, error);
          // Update sync attempt count
          await db.syncQueue.update(record.id, {
            ...record,
            syncAttempts: (record.syncAttempts || 0) + 1,
            lastSyncAttempt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearOfflineData = async () => {
    if (window.confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        // Clear all object stores except system settings
        await Promise.all([
          db.transactions.clear(),
          db.dailyData.clear(),
          db.syncQueue.clear(),
          db.customers.clear(),
          db.expenses.clear()
        ]);
        
        // Reload the page to ensure clean state
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear offline data:', error);
        alert('Failed to clear offline data. Please try again.');
      }
    }
  };

  return {
    isOnline,
    isSyncing,
    syncData,
    clearOfflineData
  };
}