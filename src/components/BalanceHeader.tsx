import React from 'react';
import { Wallet, DollarSign, Banknote, History } from 'lucide-react';
import { formatRupiah } from '../utils/format';

interface BalanceHeaderProps {
  initialBalance: number;
  currentBalance: number;
  cashBalance: number;
  onViewLog: () => void;
}

export default function BalanceHeader({
  initialBalance,
  currentBalance,
  cashBalance,
  onViewLog
}: BalanceHeaderProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-mobile-lg md:text-lg font-medium">Balance Overview</h2>
        <button
          onClick={onViewLog}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-mobile md:text-sm"
        >
          <History className="w-3.5 h-3.5 md:w-4 md:h-4" />
          View History
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-indigo-50 p-3 md:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 md:gap-2 text-indigo-600 mb-1">
            <Wallet className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-mobile md:text-base font-medium">Initial Balance</span>
          </div>
          <div className="text-mobile-lg md:text-2xl font-bold">{formatRupiah(initialBalance)}</div>
        </div>

        <div className="bg-emerald-50 p-3 md:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 md:gap-2 text-emerald-600 mb-1">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-mobile md:text-base font-medium">Current Balance</span>
          </div>
          <div className="text-mobile-lg md:text-2xl font-bold">{formatRupiah(currentBalance)}</div>
        </div>

        <div className="bg-amber-50 p-3 md:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 md:gap-2 text-amber-600 mb-1">
            <Banknote className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-mobile md:text-base font-medium">Cash Balance</span>
          </div>
          <div className="text-mobile-lg md:text-2xl font-bold">{formatRupiah(cashBalance)}</div>
        </div>
      </div>
    </div>
  );
}