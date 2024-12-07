import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { RUPIAH_DENOMINATIONS } from '../types';
import { formatRupiah } from '../utils/format';

interface EditInitialBalanceModalProps {
  initialDenominations: { value: number; count: number; label: string }[];
  onClose: () => void;
  onSave: (amount: number, denominations: { value: number; count: number; label: string }[]) => void;
}

export default function EditInitialBalanceModal({
  initialDenominations,
  onClose,
  onSave,
}: EditInitialBalanceModalProps) {
  const [denominations, setDenominations] = useState(
    RUPIAH_DENOMINATIONS.map(denom => {
      const existing = initialDenominations.find(d => d.value === denom.value);
      return {
        ...denom,
        count: existing?.count || 0
      };
    })
  );

  const handleCountChange = (value: number, count: string) => {
    const newCount = parseInt(count) || 0;
    setDenominations(prev =>
      prev.map(d => (d.value === value ? { ...d, count: newCount } : d))
    );
  };

  const calculateTotal = () =>
    denominations.reduce((sum, d) => sum + d.value * d.count, 0);

  const currentTotal = calculateTotal();
  const previousTotal = initialDenominations.reduce(
    (sum, d) => sum + d.value * d.count,
    0
  );
  const difference = currentTotal - previousTotal;

  const handleSave = () => {
    onSave(currentTotal, denominations);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Initial Balance</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {denominations.map((denom) => (
              <div key={denom.value} className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  {denom.label}
                </label>
                <input
                  type="number"
                  min="0"
                  value={denom.count}
                  onChange={(e) => handleCountChange(denom.value, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Previous Balance:</span>
              <span>{formatRupiah(previousTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">New Balance:</span>
              <span>{formatRupiah(currentTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
              <span>Difference:</span>
              <span className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                {difference >= 0 ? '+' : ''}{formatRupiah(difference)}
              </span>
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}