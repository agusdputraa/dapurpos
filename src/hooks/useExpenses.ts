import { useLocalStorage } from './useLocalStorage';
import { useState, useCallback } from 'react';

export interface Expense {
  id: string;
  description: string;
  lastTransaction: string;
  totalTransactions: number;
}

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('register_expenses', []);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  const addExpense = useCallback((description: string, transactionDate: string) => {
    const existingExpense = expenses.find(
      e => e.description.toLowerCase() === description.toLowerCase()
    );

    if (existingExpense) {
      const updatedExpense = {
        ...existingExpense,
        lastTransaction: transactionDate,
        totalTransactions: existingExpense.totalTransactions + 1
      };

      setExpenses(prev =>
        prev.map(e =>
          e.id === existingExpense.id ? updatedExpense : e
        )
      );

      setRecentExpenses(prev => {
        const filtered = prev.filter(e => e.id !== updatedExpense.id);
        return [updatedExpense, ...filtered].slice(0, 5);
      });

      return updatedExpense;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      lastTransaction: transactionDate,
      totalTransactions: 1
    };

    setExpenses(prev => [...prev, newExpense]);
    setRecentExpenses(prev => [newExpense, ...prev].slice(0, 5));
    return newExpense;
  }, [expenses]);

  const searchExpenses = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase();
    if (!normalizedQuery) {
      return recentExpenses;
    }

    return expenses
      .filter(expense => 
        expense.description.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        return new Date(b.lastTransaction).getTime() - new Date(a.lastTransaction).getTime();
      })
      .slice(0, 5);
  }, [expenses, recentExpenses]);

  return {
    expenses,
    addExpense,
    searchExpenses,
    recentExpenses
  };
}