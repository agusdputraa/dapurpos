import React from 'react';
import { X, TrendingDown, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';

interface ExpenseStats {
  description: string;
  totalAmount: number;
  totalTransactions: number;
  averageAmount: number;
  lastTransaction: string;
  firstTransaction: string;
}

interface ExpenseDetailsPopupProps {
  expense: ExpenseStats;
  transactions: Transaction[];
  onClose: () => void;
}

export default function ExpenseDetailsPopup({
  expense,
  transactions,
  onClose
}: ExpenseDetailsPopupProps) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{expense.description}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-600 font-medium">Total Spent</div>
            <div className="text-xl font-bold">{formatRupiah(expense.totalAmount)}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-orange-600 font-medium">Transactions</div>
            <div className="text-xl font-bold">{expense.totalTransactions}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-600 font-medium">Avg. Transaction</div>
            <div className="text-xl font-bold">{formatRupiah(expense.averageAmount)}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-medium">First Entry</div>
            <div className="text-sm font-bold">{formatDateTime(expense.firstTransaction)}</div>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-semibold">Transaction History</h4>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      Expense
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(transaction.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {formatRupiah(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.paymentMethod}
                    </div>
                  </div>
                </div>
                {transaction.paymentMethod === 'cash' && transaction.change > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Initial payment: {formatRupiah(transaction.paymentAmount)}<br />
                    Change received: {formatRupiah(transaction.change)}
                  </div>
                )}
              </div>
            ))}
            {sortedTransactions.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}