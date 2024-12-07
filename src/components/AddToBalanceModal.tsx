import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Denomination } from '../types';
import { RUPIAH_DENOMINATIONS } from '../types';
import { formatRupiah } from '../utils/format';

interface AddToBalanceModalProps {
  currentDenominations: Denomination[];
  onClose: () => void;
  onSave: (amount: number, denominations: Denomination[]) => void;
}

export default function AddToBalanceModal({
  currentDenominations,
  onClose,
  onSave,
}: AddToBalanceModalProps) {
  const [additionalDenominations, setAdditionalDenominations] = useState<Denomination[]>(
    RUPIAH_DENOMINATIONS.map((d) => ({ ...d, count: 0 }))
  );

  const handleDenominationClick = (value: number) => {
    setAdditionalDenominations(prev =>
      prev.map(d => d.value === value ? { ...d, count: d.count + 1 } : d)
    );
  };

  const handleDenominationReset = (value: number) => {
    setAdditionalDenominations(prev =>
      prev.map(d => d.value === value ? { ...d, count: 0 } : d)
    );
  };

  const calculateTotal = () =>
    additionalDenominations.reduce((sum, d) => sum + d.value * d.count, 0);

  const handleSave = () => {
    const additionalAmount = calculateTotal();
    onSave(additionalAmount, additionalDenominations);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add to Balance</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {additionalDenominations.map(({ value, label, count }) => (
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
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="text-xl font-bold text-center mb-6">
          Additional Amount: {formatRupiah(calculateTotal())}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add to Balance
          </button>
        </div>
      </div>
    </div>
  );
}