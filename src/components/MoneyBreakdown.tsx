import React from 'react';
import { Denomination } from '../types';
import { formatRupiah } from '../utils/format';

interface MoneyBreakdownProps {
  denominations: Denomination[];
}

export default function MoneyBreakdown({ denominations }: MoneyBreakdownProps) {
  const totalCash = denominations.reduce((sum, d) => sum + (d.value * d.count), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="text-xl font-bold mb-4">Money Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {denominations.map((denom) => (
          <div key={denom.value} className="flex justify-between items-center p-2 border-b">
            <span className="font-medium">{denom.label}</span>
            <div className="text-right">
              <span className="font-semibold">{denom.count}x</span>
              <span className="text-gray-500 ml-2">
                ({formatRupiah(denom.value * denom.count)})
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total Cash Available:</span>
          <span className="text-lg font-bold text-green-600">{formatRupiah(totalCash)}</span>
        </div>
      </div>
    </div>
  );
}