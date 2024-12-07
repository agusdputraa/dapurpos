import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Denomination } from '../types';
import { RUPIAH_DENOMINATIONS } from '../types';
import { formatRupiah } from '../utils/format';

interface AmountButtonsProps {
  onAmountChange: (value: number, denom: Denomination) => void;
  onReset: () => void;
  transactionType: 'sale' | 'expense' | 'change';
  denominations: Denomination[];
  selectedAmounts?: { value: number; count: number; label: string }[];
}

export default function AmountButtons({ 
  onAmountChange, 
  onReset, 
  transactionType,
  denominations,
  selectedAmounts = []
}: AmountButtonsProps) {
  const sortedDenominations = [...RUPIAH_DENOMINATIONS].sort((a, b) => b.value - a.value);

  const getButtonCount = (value: number): number => {
    const denom = denominations.find(d => d.value === value);
    const selected = selectedAmounts.find(s => s.value === value);
    return (denom?.count || 0) - (selected?.count || 0);
  };

  const isButtonDisabled = (value: number) => {
    if (transactionType === 'expense') {
      return getButtonCount(value) <= 0;
    }
    return false;
  };

  const getTotalSelected = () => {
    return selectedAmounts.reduce((sum, item) => sum + (item.value * item.count), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Quick Amount Selection</h4>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {selectedAmounts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Selected Amounts:</span>
            <span className="text-sm font-bold text-green-600">{formatRupiah(getTotalSelected())}</span>
          </div>
          <div className="text-sm text-gray-600">
            {selectedAmounts.map((item, index) => (
              <span key={item.value}>
                {index > 0 && ' + '}
                {item.count}x {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sortedDenominations.map((denom) => {
          const count = getButtonCount(denom.value);
          const disabled = isButtonDisabled(denom.value);
          
          return (
            <button
              key={denom.value}
              onClick={() => !disabled && onAmountChange(denom.value, denom)}
              disabled={disabled}
              className={`relative px-4 py-2 text-sm rounded-lg transition-all ${
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                  : transactionType === 'change'
                    ? 'bg-green-100 hover:bg-green-200 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{denom.label}</span>
              {transactionType === 'expense' && (
                <span className={`absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs rounded-full ${
                  count > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {count}x
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}