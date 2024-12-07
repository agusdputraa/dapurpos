import React, { useState, useEffect } from 'react';
import { useDailyData } from '../hooks/useDailyData';
import DailyReport from '../components/DailyReport';

export default function Reports() {
  const { getDailyData, getAvailableDates, getTransactionsInRange } = useDailyData();
  const availableDates = getAvailableDates();
  const latestDate = availableDates[0];
  const [dateRange, setDateRange] = useState({
    from: latestDate || '',
    to: latestDate || ''
  });

  const [filteredData, setFilteredData] = useState({
    initialBalance: 0,
    currentBalance: 0,
    cashBalance: 0,
    transactions: []
  });

  useEffect(() => {
    if (!dateRange.from || !dateRange.to) return;

    const transactions = getTransactionsInRange(dateRange.from, dateRange.to);
    const dailyData = getDailyData(dateRange.from);

    if (!dailyData) return;

    const initialBalance = dailyData.initialBalance;
    const currentBalance = transactions.reduce((sum, t) => {
      if (t.type === 'sale') {
        return sum + t.amount;
      } else {
        return sum - t.amount;
      }
    }, initialBalance);

    const cashBalance = dailyData.denominations.reduce((sum, d) => sum + (d.value * d.count), 0);

    setFilteredData({
      initialBalance,
      currentBalance,
      cashBalance,
      transactions
    });
  }, [dateRange]);

  if (!latestDate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Data Available</h2>
          <p className="text-gray-600">Start by creating transactions in the register.</p>
        </div>
      </div>
    );
  }

  return (
    <DailyReport
      transactions={filteredData.transactions}
      initialBalance={filteredData.initialBalance}
      currentBalance={filteredData.currentBalance}
      onClose={() => {}}
      startDate={dateRange.from}
      onDeleteTransaction={() => {}}
      onDeleteDayTransactions={() => {}}
      availableDates={availableDates}
      cashBalance={filteredData.cashBalance}
      onDateRangeChange={setDateRange}
    />
  );
}