import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PendingTransactionNoticeProps {
  count: number;
}

export default function PendingTransactionNotice({ count }: PendingTransactionNoticeProps) {
  if (count === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 text-red-800">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">
          You have {count} pending {count === 1 ? 'transaction' : 'transactions'} waiting for payment
        </span>
      </div>
    </div>
  );
}