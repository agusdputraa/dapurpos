import React from 'react';
import { Clock, ArrowRightCircle } from 'lucide-react';
import { DebtTransaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';

interface DebtTransactionsProps {
  debtTransactions: DebtTransaction[];
  onDelete: (transaction: DebtTransaction) => Promise<boolean>;
  onContinue: (transaction: DebtTransaction) => void;
}

export default function DebtTransactions({
  debtTransactions,
  onContinue
}: DebtTransactionsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Debt Transactions</h3>
        <div className="px-2 py-1 bg-red-100 text-red-800 rounded-lg text-sm">
          {debtTransactions.length} unpaid
        </div>
      </div>

      <div className="space-y-3">
        {debtTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="border border-red-200 rounded-lg p-3 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-semibold">
                  {formatRupiah(transaction.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onContinue(transaction)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Continue transaction"
                >
                  <ArrowRightCircle className="w-4 h-4 text-red-500" />
                </button>
                <span className="text-sm text-gray-500">
                  {formatDateTime(transaction.timestamp)}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Description: {transaction.customer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}