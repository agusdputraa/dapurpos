import { useLocalStorage } from './useLocalStorage';
import { useState, useCallback } from 'react';

export interface Customer {
  id: string;
  name: string;
  lastTransaction: string;
  totalTransactions: number;
}

export function useCustomers() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('register_customers', []);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);

  const addCustomer = useCallback((name: string, transactionDate: string) => {
    const existingCustomer = customers.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCustomer) {
      const updatedCustomer = {
        ...existingCustomer,
        lastTransaction: transactionDate,
        totalTransactions: existingCustomer.totalTransactions + 1
      };

      setCustomers(prev =>
        prev.map(c =>
          c.id === existingCustomer.id ? updatedCustomer : c
        )
      );

      setRecentCustomers(prev => {
        const filtered = prev.filter(c => c.id !== updatedCustomer.id);
        return [updatedCustomer, ...filtered].slice(0, 5);
      });

      return updatedCustomer;
    }

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      lastTransaction: transactionDate,
      totalTransactions: 1
    };

    setCustomers(prev => [...prev, newCustomer]);
    setRecentCustomers(prev => [newCustomer, ...prev].slice(0, 5));
    return newCustomer;
  }, [customers]);

  const searchCustomers = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase();
    if (!normalizedQuery) {
      return recentCustomers;
    }

    return customers
      .filter(customer => 
        customer.name.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // Sort by most recent transaction first
        return new Date(b.lastTransaction).getTime() - new Date(a.lastTransaction).getTime();
      })
      .slice(0, 5); // Limit to 5 suggestions
  }, [customers, recentCustomers]);

  return {
    customers,
    addCustomer,
    searchCustomers,
    recentCustomers
  };
}