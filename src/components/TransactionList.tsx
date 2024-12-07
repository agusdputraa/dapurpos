import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Edit2, Trash2, Receipt, ShoppingCart, Truck, Plus, MessageCircle } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';
import ReceiptGenerator from './ReceiptGenerator';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionList({ 
  transactions, 
  onEdit, 
  onDelete
}: TransactionListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions found</p>
        ) : (
          transactions.slice().reverse().map((transaction, index) => (
            <div
              key={`${transaction.id}-${index}`}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {transaction.type === 'sale' ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {formatRupiah(transaction.amount)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      transaction.paymentMethod === 'cash'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {transaction.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {transaction.type === 'sale' && (
                    <button
                      onClick={() => setSelectedReceipt(transaction)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Generate receipt"
                    >
                      <Receipt className="w-4 h-4 text-blue-500" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Edit transaction"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(transaction.timestamp)}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Receipt className="w-4 h-4" />
                  <span>{transaction.type === 'sale' ? 'Customer' : 'Expense'}: {transaction.customer}</span>
                </div>
              </div>

              {transaction.type === 'expense' && transaction.change > 0 && (
                <div className="mb-2 bg-gray-50 rounded-lg p-2">
                  <div className="text-sm text-gray-600">
                    <div>Initial Payment: {formatRupiah(transaction.paymentAmount)}</div>
                    <div>Change Received: {formatRupiah(transaction.change)}</div>
                    <div className="font-medium">Final Expense: {formatRupiah(transaction.amount)}</div>
                  </div>
                </div>
              )}
              
              {transaction.orderDetails && (
                <div className="mb-2 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-medium">Order Details:</span>
                  </div>
                  <div className="space-y-2">
                    {transaction.orderDetails.items.map((item, itemIndex) => (
                      <div key={`${transaction.id}-item-${itemIndex}`} className="text-sm text-gray-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="ml-2">{item.name}</span>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                              <div className="ml-6 text-gray-500">
                                {item.selectedToppings.map((topping, toppingIndex) => (
                                  <div key={toppingIndex} className="flex items-center">
                                    <Plus className="w-3 h-3 mr-1" />
                                    {topping.name} ({formatRupiah(topping.price)})
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.notes && (
                              <div className="ml-6 mt-1 text-gray-500 italic flex items-start gap-1">
                                <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{item.notes}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div>{formatRupiah(item.price * item.quantity)}</div>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                              <div className="text-gray-500">
                                + {formatRupiah(item.selectedToppings.reduce((sum, t) => sum + t.price, 0))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {transaction.orderDetails.shippingAmount && (
                      <div className="text-sm text-gray-600 flex justify-between items-center pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          <span>Shipping</span>
                        </div>
                        <span>{formatRupiah(transaction.orderDetails.shippingAmount)}</span>
                      </div>
                    )}
                  </div>
                  {transaction.orderDetails.shippingAddress && (
                    <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        <span className="font-medium">Shipping Address:</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{transaction.orderDetails.shippingAddress}</p>
                    </div>
                  )}
                </div>
              )}

              {transaction.type === 'sale' && transaction.paymentMethod === 'cash' && (
                <div className="text-sm space-y-1">
                  {transaction.paymentBreakdown && (
                    <div className="text-gray-600">
                      Payment Breakdown:{' '}
                      {transaction.paymentBreakdown.map((item, breakdownIndex) => (
                        <span key={`${transaction.id}-payment-${breakdownIndex}`}>
                          {breakdownIndex > 0 && ' + '}
                          {item.count}x {item.label}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {transaction.change > 0 && (
                    <>
                      <div className="text-gray-600">
                        Payment: {formatRupiah(transaction.paymentAmount)}
                      </div>
                      <div className="text-gray-600">
                        Change: {formatRupiah(transaction.change)}
                      </div>
                      {transaction.changeBreakdown && (
                        <div className="text-gray-600">
                          Change Breakdown:{' '}
                          {transaction.changeBreakdown.map((item, changeIndex) => (
                            <span key={`${transaction.id}-change-${changeIndex}`}>
                              {changeIndex > 0 && ' + '}
                              {item.count}x {item.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedReceipt && (
        <ReceiptGenerator
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}