import React from 'react';
import { X, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';

interface CustomerStats {
  name: string;
  totalSpent: number;
  totalTransactions: number;
  averageTransaction: number;
  lastTransaction: string;
  firstTransaction: string;
}

interface CustomerDetailsPopupProps {
  customer: CustomerStats;
  transactions: Transaction[];
  onClose: () => void;
}

export default function CustomerDetailsPopup({
  customer,
  transactions,
  onClose
}: CustomerDetailsPopupProps) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{customer.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 font-medium">Total Spent</div>
            <div className="text-xl font-bold">{formatRupiah(customer.totalSpent)}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-medium">Transactions</div>
            <div className="text-xl font-bold">{customer.totalTransactions}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-medium">Avg. Transaction</div>
            <div className="text-xl font-bold">{formatRupiah(customer.averageTransaction)}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-600 font-medium">First Visit</div>
            <div className="text-sm font-bold">{formatDateTime(customer.firstTransaction)}</div>
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
                      {transaction.type === 'sale' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      {transaction.type === 'sale' ? 'Purchase' : 'Refund'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(transaction.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatRupiah(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.paymentMethod}
                    </div>
                  </div>
                </div>
                {transaction.orderDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    {transaction.orderDetails.items.map((item, index) => (
                      <span key={index}>
                        {index > 0 && ', '}
                        {item.quantity}x {item.name}
                      </span>
                    ))}
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