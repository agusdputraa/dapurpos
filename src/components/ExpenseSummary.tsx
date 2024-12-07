import React, { useState } from 'react';
import { ChevronDown, ChevronRight, DollarSign, Calendar, Search, TrendingDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDate, isDateInRange } from '../utils/dateUtils';
import ExpenseDetailsPopup from './ExpenseDetailsPopup';

interface ExpenseStats {
  description: string;
  totalAmount: number;
  totalTransactions: number;
  averageAmount: number;
  lastTransaction: string;
  firstTransaction: string;
}

interface ExpenseSummaryProps {
  transactions: Transaction[];
  availableDates: string[];
}

export default function ExpenseSummary({ transactions, availableDates }: ExpenseSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: availableDates[availableDates.length - 1] || '',
    to: availableDates[0] || ''
  });
  const [selectedExpense, setSelectedExpense] = useState<ExpenseStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.type === 'expense' && isDateInRange(t.timestamp, dateRange.from, dateRange.to)
  );

  const expenseStats = filteredTransactions.reduce((acc: Record<string, ExpenseStats>, transaction) => {
    const { customer: description, amount, timestamp } = transaction;
    
    if (!acc[description]) {
      acc[description] = {
        description,
        totalAmount: 0,
        totalTransactions: 0,
        averageAmount: 0,
        lastTransaction: timestamp,
        firstTransaction: timestamp
      };
    }

    const stats = acc[description];
    stats.totalTransactions += 1;
    stats.totalAmount += amount;
    stats.lastTransaction = new Date(timestamp) > new Date(stats.lastTransaction) 
      ? timestamp 
      : stats.lastTransaction;
    stats.firstTransaction = new Date(timestamp) < new Date(stats.firstTransaction)
      ? timestamp
      : stats.firstTransaction;
    stats.averageAmount = stats.totalAmount / stats.totalTransactions;

    return acc;
  }, {});

  const expenseList = Object.values(expenseStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .filter(expense => 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalExpenses = expenseList.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const averageExpensePerCategory = totalExpenses / (expenseList.length || 1);

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      const newFromDate = new Date(value);
      const currentToDate = new Date(dateRange.to);
      
      if (newFromDate > currentToDate) {
        setDateRange({
          from: value,
          to: value
        });
      } else {
        setDateRange(prev => ({
          ...prev,
          from: value
        }));
      }
    } else {
      const currentFromDate = new Date(dateRange.from);
      const newToDate = new Date(value);
      
      if (newToDate < currentFromDate) {
        setDateRange({
          from: value,
          to: value
        });
      } else {
        setDateRange(prev => ({
          ...prev,
          to: value
        }));
      }
    }
  };

  if (expenseList.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold">Expense Summary</h3>
            <span className="text-sm text-gray-500">
              ({expenseList.length} categories)
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg flex-1">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                    max={dateRange.to}
                    className="px-2 py-1 border rounded-lg text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    min={dateRange.from}
                    className="px-2 py-1 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-600 font-medium">Total Expenses</div>
                <div className="text-2xl font-bold">{formatRupiah(totalExpenses)}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-orange-600 font-medium">Avg. per Category</div>
                <div className="text-2xl font-bold">{formatRupiah(averageExpensePerCategory)}</div>
              </div>
            </div>

            <div className="border rounded-lg divide-y">
              {expenseList.map((expense) => (
                <button
                  key={expense.description}
                  onClick={() => setSelectedExpense(expense)}
                  className="w-full p-4 hover:bg-gray-50 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-gray-600">
                        {expense.totalTransactions} transactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        {formatRupiah(expense.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg. {formatRupiah(expense.averageAmount)} / transaction
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {expenseList.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No expenses found matching your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedExpense && (
        <ExpenseDetailsPopup
          expense={selectedExpense}
          transactions={filteredTransactions.filter(t => t.customer === selectedExpense.description)}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </>
  );
}