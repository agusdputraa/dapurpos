import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { PendingTransaction } from '../types';
import { create } from 'zustand';

interface PendingTransactionsStore {
  pendingTransactions: PendingTransaction[];
  setPendingTransactions: (transactions: PendingTransaction[]) => void;
}

const usePendingTransactionsStore = create<PendingTransactionsStore>((set) => ({
  pendingTransactions: [],
  setPendingTransactions: (transactions) => set({ pendingTransactions: transactions }),
}));

export function usePendingTransactions() {
  const [storedTransactions, setStoredTransactions] = useLocalStorage<PendingTransaction[]>('pending_transactions', []);
  const { setPendingTransactions } = usePendingTransactionsStore();

  useEffect(() => {
    setPendingTransactions(storedTransactions);
  }, [storedTransactions, setPendingTransactions]);

  const updateTransactions = (transactions: PendingTransaction[]) => {
    setStoredTransactions(transactions);
    setPendingTransactions(transactions);
  };

  const addPendingTransaction = (transaction: PendingTransaction) => {
    updateTransactions([...storedTransactions, transaction]);
  };

  const removePendingTransaction = async (transactionId: string) => {
    return new Promise<boolean>((resolve) => {
      if (window.confirm('Are you sure you want to continue this transaction?')) {
        const updatedTransactions = storedTransactions.filter(t => t.id !== transactionId);
        updateTransactions(updatedTransactions);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  const getPendingTransactionsForDate = (date: string) => {
    return storedTransactions.filter(t => t.timestamp.startsWith(date));
  };

  const clearPendingTransactions = () => {
    updateTransactions([]);
  };

  return {
    pendingTransactions: storedTransactions,
    addPendingTransaction,
    removePendingTransaction,
    getPendingTransactionsForDate,
    clearPendingTransactions
  };
}

export const usePendingTransactionsSync = () => {
  const { pendingTransactions } = usePendingTransactionsStore();
  return { pendingTransactions };
};