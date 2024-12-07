import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowRightLeft, ShoppingCart, Truck, Plus, Clock, Edit2, RotateCcw, MessageCircle } from 'lucide-react';
import { Transaction, Denomination, OrderDetails, CartItem, PendingTransaction, DebtTransaction } from '../types';
import { formatRupiah } from '../utils/format';
import { calculateChange } from '../utils/moneyUtils';
import AmountButtons from './AmountButtons';
import CustomerAutocomplete from './CustomerAutocomplete';
import ExpenseAutocomplete from './ExpenseAutocomplete';
import OrderModal from './OrderModal';
import { useCustomers } from '../hooks/useCustomers';
import { useExpenses } from '../hooks/useExpenses';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import { useDebtTransactions } from '../hooks/useDebtTransactions';
import PendingTransactions from './PendingTransactions';
import DebtTransactions from './DebtTransactions';

interface TransactionFormProps {
  denominations: Denomination[];
  setDenominations: (denominations: Denomination[]) => void;
  currentBalance: number;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  showOrderModal: () => void;
  setAlert: (alert: { message: string; type: 'success' | 'error' | 'warning' } | null) => void;
  startDate: string;
}

export default function TransactionForm({
  denominations,
  setDenominations,
  currentBalance,
  transactions,
  setTransactions,
  setIsAnimating,
  showOrderModal: propShowOrderModal,
  setAlert,
  startDate
}: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<'sale' | 'expense'>('sale');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState('');
  const [customer, setCustomer] = useState('');
  const [amountBreakdown, setAmountBreakdown] = useState<{ value: number; count: number; label: string }[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<{ value: number; count: number; label: string }[]>([]);
  const [changeBreakdown, setChangeBreakdown] = useState<{ value: number; count: number; label: string }[]>([]);
  const [expenseChange, setExpenseChange] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | undefined>();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);

  const { addCustomer } = useCustomers();
  const { addExpense } = useExpenses();
  const { 
    addPendingTransaction, 
    removePendingTransaction, 
    getPendingTransactionsForDate 
  } = usePendingTransactions();
  const {
    addDebtTransaction,
    removeDebtTransaction,
    getDebtTransactionsForDate
  } = useDebtTransactions();

  const pendingTransactions = getPendingTransactionsForDate(startDate);
  const debtTransactions = getDebtTransactionsForDate(startDate);

  useEffect(() => {
    const pendingTransactionData = localStorage.getItem('continue_pending_transaction');
    const debtTransactionData = localStorage.getItem('continue_debt_transaction');
    
    if (pendingTransactionData) {
      try {
        const transaction = JSON.parse(pendingTransactionData);
        setTransactionType('sale');
        setCustomer(transaction.customer);
        setAmount(transaction.amount.toString());
        setOrderDetails(transaction.orderDetails);
        localStorage.removeItem('continue_pending_transaction');
      } catch (error) {
        console.error('Error parsing pending transaction:', error);
      }
    } else if (debtTransactionData) {
      try {
        const transaction = JSON.parse(debtTransactionData);
        setTransactionType('expense');
        setCustomer(transaction.customer);
        setAmount(transaction.amount.toString());
        localStorage.removeItem('continue_debt_transaction');
      } catch (error) {
        console.error('Error parsing debt transaction:', error);
      }
    }
  }, []);

  const resetForm = () => {
    setAmount('');
    setPayment('');
    setCustomer('');
    setAmountBreakdown([]);
    setExpenseBreakdown([]);
    setChangeBreakdown([]);
    setExpenseChange('');
    setOrderDetails(undefined);
  };

  const handleAmountChange = (value: number, denom: Denomination) => {
    if (transactionType === 'sale') {
      const newPayment = (parseInt(payment) || 0) + value;
      setPayment(newPayment.toString());
      setAmountBreakdown(prev => {
        const existing = prev.find(b => b.value === denom.value);
        if (existing) {
          return prev.map(b =>
            b.value === denom.value
              ? { ...b, count: b.count + 1 }
              : b
          );
        }
        return [...prev, { value: denom.value, count: 1, label: denom.label }];
      });
    } else {
      const newAmount = (parseInt(amount) || 0) + value;
      setAmount(newAmount.toString());
      setExpenseBreakdown(prev => {
        const existing = prev.find(b => b.value === denom.value);
        if (existing) {
          return prev.map(b =>
            b.value === denom.value
              ? { ...b, count: b.count + 1 }
              : b
          );
        }
        return [...prev, { value: denom.value, count: 1, label: denom.label }];
      });
    }
  };

  const handleChangeAmount = (value: number, denom: Denomination) => {
    const newChange = (parseInt(expenseChange) || 0) + value;
    setExpenseChange(newChange.toString());
    setChangeBreakdown(prev => {
      const existing = prev.find(b => b.value === denom.value);
      if (existing) {
        return prev.map(b =>
          b.value === denom.value
            ? { ...b, count: b.count + 1 }
            : b
        );
      }
      return [...prev, { value: denom.value, count: 1, label: denom.label }];
    });
  };

  const handleAddToPending = () => {
    if (!customer || !amount) {
      setAlert({ message: 'Please fill in customer name and amount', type: 'error' });
      return;
    }

    const pendingTransaction: PendingTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      customer,
      amount: parseInt(amount),
      orderDetails
    };

    addPendingTransaction(pendingTransaction);
    setAlert({
      message: 'Transaction added to pending list',
      type: 'success'
    });
    resetForm();
  };

  const handleAddToDebt = () => {
    if (!customer || !amount) {
      setAlert({ message: 'Please fill in description and amount', type: 'error' });
      return;
    }

    const debtTransaction: DebtTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      customer,
      amount: parseInt(amount)
    };

    addDebtTransaction(debtTransaction);
    setAlert({
      message: 'Transaction added to debt list',
      type: 'success'
    });
    resetForm();
  };

  const handleEditOrder = () => {
    setEditingOrder(true);
    setShowOrderModal(true);
  };

  const handleResetOrder = () => {
    if (window.confirm('Are you sure you want to reset the order?')) {
      setAmount('');
      setOrderDetails(undefined);
    }
  };

  const handleOrderComplete = (total: number, items: CartItem[], shippingAddress?: string, shippingAmount?: number) => {
    setAmount(total.toString());
    setOrderDetails({
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.orderQuantity,
        selectedToppings: item.selectedToppings,
        notes: item.notes
      })),
      shippingAddress,
      shippingAmount
    });
    setShowOrderModal(false);
    setEditingOrder(false);
  };

  const handleSubmit = () => {
    const amountValue = parseInt(amount);
    const paymentValue = parseInt(payment);
    const expenseChangeValue = parseInt(expenseChange) || 0;

    if (!customer) {
      setAlert({ message: 'Please enter customer name', type: 'error' });
      return;
    }

    if (amountValue <= 0) {
      setAlert({ message: 'Amount must be greater than 0', type: 'error' });
      return;
    }

    if (transactionType === 'sale' && paymentMethod === 'cash') {
      if (paymentValue < amountValue) {
        setAlert({ message: 'Payment amount must be greater than or equal to sale amount', type: 'error' });
        return;
      }

      const changeAmount = paymentValue - amountValue;
      if (changeAmount > 0) {
        const changeBreakdown = calculateChange(changeAmount, denominations);
        if (!changeBreakdown.length) {
          setAlert({ message: 'Cannot make exact change with available denominations', type: 'error' });
          return;
        }
      }
    }

    const timestamp = new Date(startDate);

    const finalAmount = transactionType === 'expense' ? amountValue - expenseChangeValue : amountValue;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: transactionType,
      amount: finalAmount,
      paymentAmount: amountValue,
      change: transactionType === 'sale' ? paymentValue - amountValue : expenseChangeValue,
      timestamp: timestamp.toISOString(),
      customer,
      paymentMethod,
      changeBreakdown: transactionType === 'sale' ? calculateChange(paymentValue - amountValue, denominations) : changeBreakdown,
      paymentBreakdown: transactionType === 'sale' ? amountBreakdown : expenseBreakdown,
      orderDetails
    };

    let updatedDenominations = [...denominations];
    if (transactionType === 'sale' && paymentMethod === 'cash') {
      amountBreakdown.forEach(payment => {
        const denomIndex = updatedDenominations.findIndex(d => d.value === payment.value);
        if (denomIndex !== -1) {
          updatedDenominations[denomIndex] = {
            ...updatedDenominations[denomIndex],
            count: updatedDenominations[denomIndex].count + payment.count
          };
        }
      });

      const changeBreakdown = calculateChange(paymentValue - amountValue, denominations);
      changeBreakdown.forEach(change => {
        const denomIndex = updatedDenominations.findIndex(d => d.value === change.value);
        if (denomIndex !== -1) {
          updatedDenominations[denomIndex] = {
            ...updatedDenominations[denomIndex],
            count: updatedDenominations[denomIndex].count - change.count
          };
        }
      });
    } else if (transactionType === 'expense' && paymentMethod === 'cash') {
      expenseBreakdown.forEach(expense => {
        const denomIndex = updatedDenominations.findIndex(d => d.value === expense.value);
        if (denomIndex !== -1) {
          updatedDenominations[denomIndex] = {
            ...updatedDenominations[denomIndex],
            count: updatedDenominations[denomIndex].count - expense.count
          };
        }
      });

      changeBreakdown.forEach(change => {
        const denomIndex = updatedDenominations.findIndex(d => d.value === change.value);
        if (denomIndex !== -1) {
          updatedDenominations[denomIndex] = {
            ...updatedDenominations[denomIndex],
            count: updatedDenominations[denomIndex].count + change.count
          };
        }
      });
    }

    setDenominations(updatedDenominations);
    setTransactions(prev => [...prev, newTransaction]);
    
    if (transactionType === 'sale') {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }

    if (transactionType === 'sale') {
      addCustomer(customer, timestamp.toISOString());
    } else {
      addExpense(customer, timestamp.toISOString());
    }

    setAlert({
      message: `${transactionType === 'sale' ? 'Sale' : 'Expense'} recorded successfully`,
      type: 'success'
    });

    resetForm();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTransactionType('sale');
                resetForm();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                transactionType === 'sale'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sale
            </button>
            <button
              onClick={() => {
                setTransactionType('expense');
                resetForm();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                transactionType === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Expense
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {transactionType === 'sale' ? 'Customer Name' : 'Expense Description'}
              </label>
              {transactionType === 'sale' ? (
                <CustomerAutocomplete
                  value={customer}
                  onChange={setCustomer}
                  placeholder="Enter customer name"
                />
              ) : (
                <ExpenseAutocomplete
                  value={customer}
                  onChange={setCustomer}
                  placeholder="Enter expense description"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    paymentMethod === 'cash'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    paymentMethod === 'online'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Online
                </button>
              </div>
            </div>

            {transactionType === 'sale' && (
              <button
                onClick={() => {
                  setEditingOrder(false);
                  setShowOrderModal(true);
                }}
                className="w-full py-2 px-4 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200"
              >
                Add Items
              </button>
            )}

            {orderDetails && transactionType === 'sale' && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Order Summary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetOrder}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Reset order"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditOrder}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit order"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.quantity}x {item.name}</div>
                          <div className="text-gray-500">{formatRupiah(item.price)} each</div>
                        </div>
                        <div className="text-right">
                          <div>{formatRupiah(item.price * item.quantity)}</div>
                        </div>
                      </div>
                      {item.selectedToppings && item.selectedToppings.length > 0 && (
                        <div className="pl-4 space-y-1">
                          {item.selectedToppings.map((topping, toppingIndex) => (
                            <div key={toppingIndex} className="flex justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Plus className="w-3 h-3" />
                                <span>{topping.name}</span>
                              </div>
                              <span>{formatRupiah(topping.price)}</span>
                            </div>
                          ))}
                          <div className="text-sm font-medium text-gray-700">
                            Toppings Subtotal: {formatRupiah(item.selectedToppings.reduce((sum, t) => sum + t.price, 0))}
                          </div>
                          <div className="text-sm font-medium text-gray-700 border-t pt-1">
                            Item Total: {formatRupiah(
                              (item.price * item.quantity) +
                              (item.selectedToppings.reduce((sum, t) => sum + t.price, 0) * item.quantity)
                            )}
                          </div>
                        </div>
                      )}
                      {item.notes && (
                        <div className="pl-4 mt-1 text-sm text-gray-600 flex items-start gap-1">
                          <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="italic">{item.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {orderDetails.shippingAmount > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t text-sm">
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        <span>Shipping</span>
                      </div>
                      <span>{formatRupiah(orderDetails.shippingAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>{formatRupiah(parseInt(amount))}</span>
                  </div>
                </div>
                {orderDetails.shippingAddress && (
                  <div className="text-sm text-gray-600 pt-2 border-t mt-2">
                    <div className="flex items-center gap-1 font-medium">
                      <Truck className="w-4 h-4" />
                      <span>Shipping Address:</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{orderDetails.shippingAddress}</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'cash' ? (
              <div className="space-y-4">
                {transactionType === 'sale' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter amount"
                      />
                    </div>

                    <button
                      onClick={handleAddToPending}
                      className="w-full py-2 px-4 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Add to Pending
                    </button>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Amount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={payment}
                          onChange={(e) => setPayment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter payment amount"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          Change: {formatRupiah(Math.max(0, parseInt(payment) - parseInt(amount) || 0))}
                        </div>
                      </div>
                    </div>

                    <AmountButtons
                      onAmountChange={handleAmountChange}
                      onReset={() => {
                        setPayment('');
                        setAmountBreakdown([]);
                      }}
                      transactionType="sale"
                      denominations={denominations}
                      selectedAmounts={amountBreakdown}
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expense Amount
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter expense amount"
                      />
                    </div>

                    <button
                      onClick={handleAddToDebt}
                      className="w-full py-2 px-4 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Add to Debt
                    </button>

                    <AmountButtons
                      onAmountChange={handleAmountChange}
                      onReset={() => {
                        setAmount('');
                        setExpenseBreakdown([]);
                      }}
                      transactionType="expense"
                      denominations={denominations}
                      selectedAmounts={expenseBreakdown}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Change Received
                      </label>
                      <input
                        type="number"
                        value={expenseChange}
                        onChange={(e) => setExpenseChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter change amount"
                      />
                    </div>

                    <AmountButtons
                      onAmountChange={handleChangeAmount}
                      onReset={() => {
                        setExpenseChange('');
                        setChangeBreakdown([]);
                      }}
                      transactionType="change"
                      denominations={denominations}
                      selectedAmounts={changeBreakdown}
                    />
                  </>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!amount || !customer}
              className={`w-full py-3 rounded-lg font-medium ${
                amount && customer
                  ? transactionType === 'sale'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {transactionType === 'sale' ? 'Complete Sale' : 'Record Expense'}
            </button>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <OrderModal
          onClose={() => {
            setShowOrderModal(false);
            setEditingOrder(false);
          }}
          onComplete={handleOrderComplete}
          denominations={denominations}
          existingItems={editingOrder ? orderDetails?.items : undefined}
          existingShippingAddress={editingOrder ? orderDetails?.shippingAddress : undefined}
          existingShippingAmount={editingOrder ? orderDetails?.shippingAmount : undefined}
        />
      )}

      {pendingTransactions.length > 0 && transactionType === 'sale' && (
        <div className="mt-6">
          <PendingTransactions
            pendingTransactions={pendingTransactions}
            onDelete={removePendingTransaction}
            onContinue={(transaction) => {
              localStorage.setItem('continue_pending_transaction', JSON.stringify(transaction));
              removePendingTransaction(transaction.id).then((deleted) => {
                if (deleted) {
                  setCustomer(transaction.customer);
                  setAmount(transaction.amount.toString());
                  setOrderDetails(transaction.orderDetails);
                }
              });
            }}
          />
        </div>
      )}

      {debtTransactions.length > 0 && transactionType === 'expense' && (
        <div className="mt-6">
          <DebtTransactions
            debtTransactions={debtTransactions}
            onDelete={removeDebtTransaction}
            onContinue={(transaction) => {
              localStorage.setItem('continue_debt_transaction', JSON.stringify(transaction));
              removeDebtTransaction(transaction.id).then((deleted) => {
                if (deleted) {
                  setCustomer(transaction.customer);
                  setAmount(transaction.amount.toString());
                }
              });
            }}
          />
        </div>
      )}
    </>
  );
}