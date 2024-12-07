import React, { useState } from 'react';
import { Transaction, DailyReport as DailyReportType, DateRange } from '../types';
import { TrendingUp, TrendingDown, FileDown, Trash2, DollarSign, ArrowRightLeft, CreditCard, Banknote, ShoppingCart, Truck, Wallet } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { formatDate, formatDateTime, isDateInRange } from '../utils/dateUtils';
import * as XLSX from 'xlsx';
import DateRangeSelector from './DateRangeSelector';
import { useDailyData } from '../hooks/useDailyData';
import PageContainer from './PageContainer';
import ProductSalesSummary from './ProductSalesSummary';
import CustomerSummary from './CustomerSummary';
import ExpenseSummary from './ExpenseSummary';
import TransactionHistory from './TransactionHistory';

interface DailyReportProps {
  transactions: Transaction[];
  initialBalance: number;
  currentBalance: number;
  onClose: () => void;
  startDate: string;
  onDeleteTransaction: (transaction: Transaction) => void;
  onDeleteDayTransactions: (date: string) => void;
  availableDates: string[];
  cashBalance: number;
  onDateRangeChange?: (range: DateRange) => void;
}

export default function DailyReport({
  transactions,
  initialBalance,
  currentBalance,
  onClose,
  startDate,
  onDeleteTransaction,
  onDeleteDayTransactions,
  availableDates,
  cashBalance,
  onDateRangeChange
}: DailyReportProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startDate,
    to: startDate
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'sales' | 'expenses'>('all');

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    isDateInRange(transaction.timestamp, dateRange.from, dateRange.to) &&
    (activeFilter === 'all' ||
     (activeFilter === 'sales' && transaction.type === 'sale') ||
     (activeFilter === 'expenses' && transaction.type === 'expense'))
  );

  const datesInRange = availableDates.filter(date => 
    isDateInRange(date, dateRange.from, dateRange.to)
  );

  const totalSales = filteredTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashTransactions = filteredTransactions
    .filter(t => t.type === 'sale' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const onlineTransactions = filteredTransactions
    .filter(t => t.type === 'sale' && t.paymentMethod === 'online')
    .reduce((sum, t) => sum + t.amount, 0);

  const exportToExcel = () => {
    // Create worksheets for different aspects of the report
    const workbook = XLSX.utils.book_new();

    // Summary worksheet
    const summaryData = [
      ['Report Period', `${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`],
      [''],
      ['Balance Summary'],
      ['Initial Balance', formatRupiah(initialBalance)],
      ['Current Balance', formatRupiah(currentBalance)],
      ['Cash Balance', formatRupiah(cashBalance)],
      [''],
      ['Transaction Summary'],
      ['Total Sales', formatRupiah(totalSales)],
      ['Total Expenses', formatRupiah(totalExpenses)],
      ['Net Income', formatRupiah(totalSales - totalExpenses)],
      [''],
      ['Payment Methods'],
      ['Cash Transactions', formatRupiah(cashTransactions)],
      ['Online Transactions', formatRupiah(onlineTransactions)]
    ];
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');

    // Transactions worksheet
    const transactionData = filteredTransactions.map(t => ({
      Date: formatDateTime(t.timestamp),
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Customer: t.customer,
      Amount: t.amount,
      'Payment Method': t.paymentMethod.toUpperCase(),
      'Payment Amount': t.paymentAmount,
      Change: t.change,
      Items: t.orderDetails ? t.orderDetails.items.map(item => 
        `${item.quantity}x ${item.name}`
      ).join(', ') : '-',
      'Shipping Amount': t.orderDetails?.shippingAmount || '-',
      'Shipping Address': t.orderDetails?.shippingAddress || '-'
    }));
    const transactionsWS = XLSX.utils.json_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionsWS, 'Transactions');

    // Product Sales worksheet
    const productSales = new Map();
    filteredTransactions
      .filter(t => t.type === 'sale' && t.orderDetails)
      .forEach(transaction => {
        transaction.orderDetails?.items.forEach(item => {
          const existing = productSales.get(item.productId) || {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
          productSales.set(item.productId, existing);
        });
      });
    
    const productSalesData = Array.from(productSales.values()).map(product => ({
      Product: product.name,
      'Units Sold': product.quantity,
      Revenue: product.revenue,
      'Average Price': product.revenue / product.quantity
    }));
    const productSalesWS = XLSX.utils.json_to_sheet(productSalesData);
    XLSX.utils.book_append_sheet(workbook, productSalesWS, 'Product Sales');

    // Save the workbook
    const fileName = `report_${dateRange.from}_to_${dateRange.to}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <PageContainer title="Daily Report" onBack={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Initial Balance</span>
            </div>
            <div className="text-2xl font-bold">{formatRupiah(initialBalance)}</div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Current Balance</span>
            </div>
            <div className="text-2xl font-bold">{formatRupiah(currentBalance)}</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Banknote className="w-5 h-5" />
              <span className="font-medium">Cash Balance</span>
            </div>
            <div className="text-2xl font-bold">{formatRupiah(cashBalance)}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              availableDates={availableDates}
              datesInRange={datesInRange}
            />
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Total Sales</span>
              </div>
              <div className="text-2xl font-bold">{formatRupiah(totalSales)}</div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">Total Expenses</span>
              </div>
              <div className="text-2xl font-bold">{formatRupiah(totalExpenses)}</div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Banknote className="w-5 h-5" />
                <span className="font-medium">Cash Transactions</span>
              </div>
              <div className="text-2xl font-bold">{formatRupiah(cashTransactions)}</div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Online Transactions</span>
              </div>
              <div className="text-2xl font-bold">{formatRupiah(onlineTransactions)}</div>
            </div>
          </div>
        </div>

        <TransactionHistory
          transactions={filteredTransactions}
          onDeleteTransaction={onDeleteTransaction}
        />

        <ProductSalesSummary
          transactions={filteredTransactions}
          availableDates={availableDates}
        />

        <CustomerSummary
          transactions={filteredTransactions}
          availableDates={availableDates}
        />

        <ExpenseSummary
          transactions={filteredTransactions}
          availableDates={availableDates}
        />
      </div>
    </PageContainer>
  );
}