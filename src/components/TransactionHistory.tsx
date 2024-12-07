import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Receipt, ArrowUpDown, Clock } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';
import ReceiptGenerator from './ReceiptGenerator';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (transaction: Transaction) => void;
}

export default function TransactionHistory({ 
  transactions,
  onDeleteTransaction
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'sale' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = transactionType === 'all' || transaction.type === transactionType;
    const matchesSearch = transaction.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else {
      return sortOrder === 'desc'
        ? b.amount - a.amount
        : a.amount - b.amount;
    }
  });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6">Transaction History</h3>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTransactionType('all')}
              className={`px-3 py-2 rounded-lg text-sm ${
                transactionType === 'all'
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTransactionType('sale')}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${
                transactionType === 'sale'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Sales
            </button>
            <button
              onClick={() => setTransactionType('expense')}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${
                transactionType === 'expense'
                  ? 'bg-red-100 text-red-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Expenses
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <Clock className="w-4 h-4" />
                    Date/Time
                    {sortBy === 'date' && (
                      <ArrowUpDown className={`w-3 h-3 ${
                        sortOrder === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => toggleSort('amount')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Amount
                    {sortBy === 'amount' && (
                      <ArrowUpDown className={`w-3 h-3 ${
                        sortOrder === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Payment</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <td className="py-3 px-4 text-sm">
                    {formatDateTime(transaction.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'sale'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'sale' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {transaction.type === 'sale' ? 'Sale' : 'Expense'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{transaction.customer}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatRupiah(transaction.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs ${
                      transaction.paymentMethod === 'cash'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {transaction.type === 'sale' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sortedTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransaction && (
        <ReceiptGenerator
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}