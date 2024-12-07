import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
  startDate: string;
}

export default function EditTransactionModal({
  transaction,
  onClose,
  onSave,
  startDate
}: EditTransactionModalProps) {
  const [editedTransaction, setEditedTransaction] = useState<Transaction>({
    ...transaction,
    amount: transaction.amount || 0,
    paymentAmount: transaction.paymentAmount || 0,
    customer: transaction.customer || '',
    paymentMethod: transaction.paymentMethod || 'cash',
    change: transaction.change || 0,
    changeBreakdown: transaction.changeBreakdown || [],
  });

  const handleSave = () => {
    if (!editedTransaction.customer.trim()) {
      alert('Customer name is required');
      return;
    }

    if (editedTransaction.amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (editedTransaction.type === 'sale' && editedTransaction.paymentAmount < editedTransaction.amount) {
      alert('Payment amount must be greater than or equal to the sale amount');
      return;
    }

    const originalTime = new Date(editedTransaction.timestamp);
    const newTimestamp = new Date(startDate);
    newTimestamp.setHours(originalTime.getHours());
    newTimestamp.setMinutes(originalTime.getMinutes());
    newTimestamp.setSeconds(originalTime.getSeconds());

    onSave({
      ...editedTransaction,
      timestamp: newTimestamp.toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Transaction</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={editedTransaction.customer}
              onChange={(e) => setEditedTransaction(prev => ({ ...prev, customer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={editedTransaction.amount}
              onChange={(e) => setEditedTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}