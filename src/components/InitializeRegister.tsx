import React from 'react';
import { Clock, Calendar, ChevronLeft, ChevronRight, AlertCircle, Trash2, Wallet } from 'lucide-react';
import { Denomination, DailyData } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import { useDebtTransactions } from '../hooks/useDebtTransactions';

interface InitializeRegisterProps {
  startDate: string;
  onStartDateChange: (date: string) => void;
  denominations: Denomination[];
  onDenominationChange: (value: number, count: string) => void;
  initialBalance: number;
  onStart: () => void;
  availableDates: string[];
  existingData: DailyData | null;
  onContinueDay: (data: DailyData) => void;
  onDeleteDayTransactions: (date: string) => void;
}

export default function InitializeRegister({
  startDate,
  onStartDateChange,
  denominations,
  onDenominationChange,
  initialBalance,
  onStart,
  availableDates,
  existingData,
  onContinueDay,
  onDeleteDayTransactions,
}: InitializeRegisterProps) {
  const { getPendingTransactionsForDate } = usePendingTransactions();
  const { getDebtTransactionsForDate } = useDebtTransactions();
  const todaysPendingTransactions = getPendingTransactionsForDate(startDate);
  const todaysDebtTransactions = getDebtTransactionsForDate(startDate);

  const calculateTotal = () => {
    return denominations.reduce((sum, d) => sum + (d.value * d.count), 0);
  };

  const handleDenominationClick = (value: number) => {
    const denom = denominations.find(d => d.value === value);
    if (denom) {
      onDenominationChange(value, (denom.count + 1).toString());
    }
  };

  const handleDenominationReset = (value: number) => {
    onDenominationChange(value, '0');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <div className="flex items-center justify-center mb-6">
          <Wallet className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Dapur El Noor</h2>
        
        <div className="flex items-center justify-between gap-2 mb-6">
          <button
            onClick={() => {
              const currentIndex = availableDates.indexOf(startDate);
              if (currentIndex < availableDates.length - 1) {
                onStartDateChange(availableDates[currentIndex + 1]);
              }
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
            disabled={availableDates.indexOf(startDate) === availableDates.length - 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Calendar className="w-5 h-5 text-gray-500 hidden sm:block" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-auto text-sm sm:text-base"
            />
          </div>
          
          <button
            onClick={() => {
              const currentIndex = availableDates.indexOf(startDate);
              if (currentIndex > 0) {
                onStartDateChange(availableDates[currentIndex - 1]);
              }
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
            disabled={availableDates.indexOf(startDate) === 0}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {existingData ? (
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Existing Data Found</h3>
              <p className="text-sm text-gray-600 mb-2">
                This date has existing transaction data:
              </p>
              <ul className="text-sm space-y-1">
                <li>Initial Balance: {formatRupiah(existingData.initialBalance)}</li>
                <li>Final Balance: {formatRupiah(existingData.finalBalance)}</li>
                <li>Transactions: {existingData.transactions.length}</li>
                {todaysPendingTransactions.length > 0 && (
                  <li className="text-red-600">Pending Transactions: {todaysPendingTransactions.length}</li>
                )}
                {todaysDebtTransactions.length > 0 && (
                  <li className="text-amber-600">Unpaid Debts: {todaysDebtTransactions.length}</li>
                )}
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const dataWithPending = {
                    ...existingData,
                    pendingTransactions: todaysPendingTransactions
                  };
                  onContinueDay(dataWithPending);
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <span className="md:hidden">Continue</span>
                <span className="hidden md:inline">Continue This Day</span>
              </button>
              <button
                onClick={() => onDeleteDayTransactions(startDate)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {denominations.map(({ value, label, count }) => (
                <div key={value} className="relative">
                  <button
                    onClick={() => handleDenominationClick(value)}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {count}x
                    </span>
                  </button>
                  <button
                    onClick={() => handleDenominationReset(value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                    title="Reset count"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="text-xl font-bold text-center mb-6">
              Total: {formatRupiah(calculateTotal())}
            </div>

            <button
              onClick={onStart}
              disabled={calculateTotal() <= 0}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                calculateTotal() > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start New Day
            </button>
          </>
        )}
      </div>
    </div>
  );
}