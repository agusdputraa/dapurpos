import React, { useState, useEffect } from 'react';
import { Plus, PencilRuler } from 'lucide-react';
import { Transaction, Denomination, DailyData } from '../types';
import { RUPIAH_DENOMINATIONS } from '../types';
import { useDailyData } from '../hooks/useDailyData';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import MoneyBreakdown from './MoneyBreakdown';
import DailyReport from './DailyReport';
import InitializeRegister from './InitializeRegister';
import Alert from './Alert';
import QuickAccessMenu from './QuickAccessMenu';
import ReceiptSettings from './ReceiptSettings';
import AddToBalanceModal from './AddToBalanceModal';
import EditInitialBalanceModal from './EditInitialBalanceModal';
import BalanceModificationLog from './BalanceModificationLog';
import Header from './Header';
import BalanceHeader from './BalanceHeader';

export default function CashRegister() {
  const [initialized, setInitialized] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialDenominations, setInitialDenominations] = useState<Denomination[]>(
    RUPIAH_DENOMINATIONS.map(d => ({ ...d, count: 0 }))
  );
  const [denominations, setDenominations] = useState<Denomination[]>(
    RUPIAH_DENOMINATIONS.map(d => ({ ...d, count: 0 }))
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showReport, setShowReport] = useState(false);
  const [showReceiptSettings, setShowReceiptSettings] = useState(false);
  const [showAddToBalance, setShowAddToBalance] = useState(false);
  const [showEditInitialBalance, setShowEditInitialBalance] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModificationLog, setShowModificationLog] = useState(false);

  const { getDailyData, updateDailyData, getAvailableDates, deleteDailyData } = useDailyData();
  const { 
    pendingTransactions, 
    removePendingTransaction, 
    clearPendingTransactions 
  } = usePendingTransactions();

  const currentBalance = transactions.reduce((sum, t) => {
    if (t.type === 'sale') {
      return sum + t.amount;
    } else {
      return sum - t.amount;
    }
  }, initialBalance);

  const handleInitialize = (initialDenoms: Denomination[]) => {
    const total = initialDenoms.reduce((sum, d) => sum + (d.value * d.count), 0);
    setInitialBalance(total);
    setInitialDenominations(initialDenoms);
    setDenominations(initialDenoms);
    setInitialized(true);
  };

  const handleAddToBalance = (additionalAmount: number, newDenominations: Denomination[]) => {
    const previousBalance = initialBalance;
    const newBalance = previousBalance + additionalAmount;
    
    setInitialBalance(newBalance);
    
    const updatedInitialDenominations = initialDenominations.map(denom => {
      const additionalDenom = newDenominations.find(d => d.value === denom.value);
      return {
        ...denom,
        count: denom.count + (additionalDenom?.count || 0)
      };
    });
    setInitialDenominations(updatedInitialDenominations);
    
    const updatedDenominations = denominations.map(denom => {
      const additionalDenom = newDenominations.find(d => d.value === denom.value);
      return {
        ...denom,
        count: denom.count + (additionalDenom?.count || 0)
      };
    });
    setDenominations(updatedDenominations);

    const modification = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'add',
      previousBalance,
      newBalance,
      difference: additionalAmount
    };

    const existingModifications = JSON.parse(localStorage.getItem('balance_modifications') || '[]');
    localStorage.setItem('balance_modifications', JSON.stringify([modification, ...existingModifications]));
    
    setShowAddToBalance(false);
    setAlert({
      message: 'Balance updated successfully',
      type: 'success'
    });
  };

  const handleEditInitialBalance = (newTotal: number, newDenominations: Denomination[]) => {
    const previousBalance = initialBalance;
    const difference = newTotal - previousBalance;
    
    setInitialBalance(newTotal);
    setInitialDenominations(newDenominations);
    
    const updatedDenominations = denominations.map(denom => {
      const newDenom = newDenominations.find(d => d.value === denom.value);
      const initialDenom = initialDenominations.find(d => d.value === denom.value);
      const difference = (newDenom?.count || 0) - (initialDenom?.count || 0);
      return {
        ...denom,
        count: denom.count + difference
      };
    });
    setDenominations(updatedDenominations);

    const modification = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'edit',
      previousBalance,
      newBalance: newTotal,
      difference
    };

    const existingModifications = JSON.parse(localStorage.getItem('balance_modifications') || '[]');
    localStorage.setItem('balance_modifications', JSON.stringify([modification, ...existingModifications]));
    
    setShowEditInitialBalance(false);
    setAlert({
      message: 'Initial balance updated successfully',
      type: 'success'
    });
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      
      if (transaction.paymentMethod === 'cash') {
        let updatedDenominations = [...denominations];
        
        if (transaction.type === 'sale') {
          transaction.paymentBreakdown?.forEach(payment => {
            const denomIndex = updatedDenominations.findIndex(d => d.value === payment.value);
            if (denomIndex !== -1) {
              updatedDenominations[denomIndex] = {
                ...updatedDenominations[denomIndex],
                count: updatedDenominations[denomIndex].count - payment.count
              };
            }
          });
          
          transaction.changeBreakdown?.forEach(change => {
            const denomIndex = updatedDenominations.findIndex(d => d.value === change.value);
            if (denomIndex !== -1) {
              updatedDenominations[denomIndex] = {
                ...updatedDenominations[denomIndex],
                count: updatedDenominations[denomIndex].count + change.count
              };
            }
          });
        } else {
          transaction.paymentBreakdown?.forEach(payment => {
            const denomIndex = updatedDenominations.findIndex(d => d.value === payment.value);
            if (denomIndex !== -1) {
              updatedDenominations[denomIndex] = {
                ...updatedDenominations[denomIndex],
                count: updatedDenominations[denomIndex].count + payment.count
              };
            }
          });
          
          transaction.changeBreakdown?.forEach(change => {
            const denomIndex = updatedDenominations.findIndex(d => d.value === change.value);
            if (denomIndex !== -1) {
              updatedDenominations[denomIndex] = {
                ...updatedDenominations[denomIndex],
                count: updatedDenominations[denomIndex].count - change.count
              };
            }
          });
        }
        
        setDenominations(updatedDenominations);
      }
      
      setAlert({
        message: 'Transaction deleted successfully',
        type: 'success'
      });
    }
  };

  const handleDeleteDayTransactions = (date: string) => {
    if (window.confirm('Are you sure you want to delete all transactions for this day?')) {
      deleteDailyData(date);
      setTransactions([]);
      setDenominations(RUPIAH_DENOMINATIONS.map(d => ({ ...d, count: 0 })));
      setInitialDenominations(RUPIAH_DENOMINATIONS.map(d => ({ ...d, count: 0 })));
      setInitialBalance(0);
      setInitialized(false);
      clearPendingTransactions();
      setAlert({
        message: 'All data deleted successfully',
        type: 'success'
      });
    }
  };

  const handleContinueDay = (data: DailyData) => {
    setInitialBalance(data.initialBalance);
    setInitialDenominations(data.denominations);
    setDenominations(data.denominations);
    setTransactions(data.transactions);
    setInitialized(true);
  };

  useEffect(() => {
    if (initialized) {
      updateDailyData(
        startDate,
        transactions,
        initialBalance,
        currentBalance,
        denominations,
        pendingTransactions
      );
    }
  }, [initialized, transactions, initialBalance, currentBalance, denominations, pendingTransactions, startDate]);

  if (!initialized) {
    return (
      <InitializeRegister
        startDate={startDate}
        onStartDateChange={setStartDate}
        denominations={denominations}
        onDenominationChange={(value, count) => {
          setDenominations(prev =>
            prev.map(d =>
              d.value === value ? { ...d, count: parseInt(count) || 0 } : d
            )
          );
        }}
        initialBalance={initialBalance}
        onStart={() => handleInitialize(denominations)}
        availableDates={getAvailableDates()}
        existingData={getDailyData(startDate)}
        onContinueDay={handleContinueDay}
        onDeleteDayTransactions={handleDeleteDayTransactions}
      />
    );
  }

  if (showReport) {
    return (
      <DailyReport
        transactions={transactions}
        initialBalance={initialBalance}
        currentBalance={currentBalance}
        onClose={() => setShowReport(false)}
        startDate={startDate}
        onDeleteTransaction={handleDeleteTransaction}
        onDeleteDayTransactions={handleDeleteDayTransactions}
        availableDates={getAvailableDates()}
        cashBalance={denominations.reduce((sum, d) => sum + (d.value * d.count), 0)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-mobile-lg md:text-2xl font-bold truncate">Dapur El Noor</h1>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowEditInitialBalance(true)}
                className="group relative px-2 md:px-4 py-1.5 md:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 md:gap-2 text-mobile md:text-base"
                title="Modify the complete initial balance through denomination management"
              >
                <PencilRuler className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Edit Initial Balance</span>
              </button>
              <button
                onClick={() => setShowAddToBalance(true)}
                className="group relative px-2 md:px-4 py-1.5 md:py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1 md:gap-2 text-mobile md:text-base"
                title="Add incremental amounts to the existing balance"
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Add to Balance</span>
              </button>
            </div>
          </div>

          <Header onBack={() => setInitialized(false)} onReset={() => setTransactions([])} />
          <BalanceHeader
            initialBalance={initialBalance}
            currentBalance={currentBalance}
            cashBalance={denominations.reduce((sum, d) => sum + (d.value * d.count), 0)}
            onViewLog={() => setShowModificationLog(true)}
          />

          <TransactionForm
            denominations={denominations}
            setDenominations={setDenominations}
            currentBalance={currentBalance}
            transactions={transactions}
            setTransactions={setTransactions}
            setIsAnimating={setIsAnimating}
            showOrderModal={() => {}}
            setAlert={setAlert}
            startDate={startDate}
          />

          <MoneyBreakdown denominations={denominations} />

          <TransactionList
            transactions={transactions}
            onEdit={() => {}}
            onDelete={handleDeleteTransaction}
            pendingTransactions={pendingTransactions}
            onDeletePending={removePendingTransaction}
            onContinuePending={(transaction) => {
              localStorage.setItem('continue_pending_transaction', JSON.stringify(transaction));
              removePendingTransaction(transaction.id);
            }}
          />
        </div>
      </div>

      <QuickAccessMenu
        onViewReport={() => setShowReport(true)}
        onReceiptSettings={() => setShowReceiptSettings(true)}
      />

      {showReceiptSettings && (
        <ReceiptSettings onClose={() => setShowReceiptSettings(false)} />
      )}

      {showAddToBalance && (
        <AddToBalanceModal
          currentDenominations={denominations}
          onClose={() => setShowAddToBalance(false)}
          onSave={handleAddToBalance}
        />
      )}

      {showEditInitialBalance && (
        <EditInitialBalanceModal
          initialDenominations={initialDenominations}
          onClose={() => setShowEditInitialBalance(false)}
          onSave={handleEditInitialBalance}
        />
      )}

      {showModificationLog && (
        <BalanceModificationLog
          onClose={() => setShowModificationLog(false)}
        />
      )}

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none animate-money-rain opacity-20" />
      )}
    </div>
  );
}