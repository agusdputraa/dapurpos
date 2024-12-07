import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DebtTransaction } from '../types';
import { create } from 'zustand';

interface DebtTransactionsStore {
  debtTransactions: DebtTransaction[];
  setDebtTransactions: (transactions: DebtTransaction[]) => void;
}

const useDebtTransactionsStore = create<DebtTransactionsStore>((set) => ({
  debtTransactions: [],
  setDebtTransactions: (transactions) => set({ debtTransactions: transactions }),
}));

export function useDebtTransactions() {
  const [storedTransactions, setStoredTransactions] = useLocalStorage<DebtTransaction[]>('debt_transactions', []);
  const { setDebtTransactions } = useDebtTransactionsStore();

  useEffect(() => {
    setDebtTransactions(storedTransactions);
  }, [storedTransactions, setDebtTransactions]);

  const updateTransactions = (transactions: DebtTransaction[]) => {
    setStoredTransactions(transactions);
    setDebtTransactions(transactions);
  };

  const addDebtTransaction = (transaction: DebtTransaction) => {
    updateTransactions([...storedTransactions, transaction]);
  };

  const removeDebtTransaction = async (transactionId: string) => {
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

  const getDebtTransactionsForDate = (date: string) => {
    return storedTransactions.filter(t => t.timestamp.startsWith(date));
  };

  const clearDebtTransactions = () => {
    updateTransactions([]);
  };

  return {
    debtTransactions: storedTransactions,
    addDebtTransaction,
    removeDebtTransaction,
    getDebtTransactionsForDate,
    clearDebtTransactions
  };
}

export const useDebtTransactionsSync = () => {
  const { debtTransactions } = useDebtTransactionsStore();
  return { debtTransactions };
};