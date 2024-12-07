import React from 'react';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';

interface BalanceModification {
  id: string;
  timestamp: string;
  type: 'add' | 'edit';
  previousBalance: number;
  newBalance: number;
  difference: number;
}

interface BalanceModificationLogProps {
  onClose: () => void;
}

export default function BalanceModificationLog({ onClose }: BalanceModificationLogProps) {
  const modifications = JSON.parse(localStorage.getItem('balance_modifications') || '[]') as BalanceModification[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Balance Modification History</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {modifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No balance modifications found
            </div>
          ) : (
            modifications.map((mod) => (
              <div
                key={mod.id}
                className="bg-white rounded-lg shadow p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {mod.type === 'add' ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-medium">
                        {mod.type === 'add' ? 'Balance Addition' : 'Balance Edit'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(mod.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      mod.difference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mod.difference >= 0 ? '+' : ''}{formatRupiah(mod.difference)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Previous: {formatRupiah(mod.previousBalance)}
                    </div>
                    <div className="text-sm text-gray-600">
                      New: {formatRupiah(mod.newBalance)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}