import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Users, Calendar, Search, TrendingUp } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDate, isDateInRange } from '../utils/dateUtils';
import CustomerDetailsPopup from './CustomerDetailsPopup';

interface CustomerStats {
  name: string;
  totalSpent: number;
  totalTransactions: number;
  averageTransaction: number;
  lastTransaction: string;
  firstTransaction: string;
}

interface CustomerSummaryProps {
  transactions: Transaction[];
  availableDates: string[];
}

export default function CustomerSummary({ transactions, availableDates }: CustomerSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: availableDates[availableDates.length - 1] || '',
    to: availableDates[0] || ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions to only include sales within the date range
  const filteredTransactions = transactions.filter(t => 
    t.type === 'sale' && isDateInRange(t.timestamp, dateRange.from, dateRange.to)
  );

  const customerStats = filteredTransactions.reduce((acc: Record<string, CustomerStats>, transaction) => {
    const { customer, amount, timestamp } = transaction;
    
    if (!acc[customer]) {
      acc[customer] = {
        name: customer,
        totalSpent: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        lastTransaction: timestamp,
        firstTransaction: timestamp
      };
    }

    const stats = acc[customer];
    stats.totalTransactions += 1;
    stats.totalSpent += amount;
    stats.lastTransaction = new Date(timestamp) > new Date(stats.lastTransaction) 
      ? timestamp 
      : stats.lastTransaction;
    stats.firstTransaction = new Date(timestamp) < new Date(stats.firstTransaction)
      ? timestamp
      : stats.firstTransaction;
    stats.averageTransaction = stats.totalSpent / stats.totalTransactions;

    return acc;
  }, {});

  const customerList = Object.values(customerStats)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalRevenue = customerList.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageSpentPerCustomer = totalRevenue / (customerList.length || 1);

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      const newFromDate = new Date(value);
      const currentToDate = new Date(dateRange.to);
      
      if (newFromDate > currentToDate) {
        setDateRange({
          from: value,
          to: value
        });
      } else {
        setDateRange(prev => ({
          ...prev,
          from: value
        }));
      }
    } else {
      const currentFromDate = new Date(dateRange.from);
      const newToDate = new Date(value);
      
      if (newToDate < currentFromDate) {
        setDateRange({
          from: value,
          to: value
        });
      } else {
        setDateRange(prev => ({
          ...prev,
          to: value
        }));
      }
    }
  };

  if (customerList.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold">Customer Summary</h3>
            <span className="text-sm text-gray-500">
              ({customerList.length} customers)
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg flex-1">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                    max={dateRange.to}
                    className="px-2 py-1 border rounded-lg text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    min={dateRange.from}
                    className="px-2 py-1 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 font-medium">Total Revenue</div>
                <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-medium">Avg. per Customer</div>
                <div className="text-2xl font-bold">{formatRupiah(averageSpentPerCustomer)}</div>
              </div>
            </div>

            <div className="border rounded-lg divide-y">
              {customerList.map((customer) => (
                <button
                  key={customer.name}
                  onClick={() => setSelectedCustomer(customer)}
                  className="w-full p-4 hover:bg-gray-50 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">
                        {customer.totalTransactions} transactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatRupiah(customer.totalSpent)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg. {formatRupiah(customer.averageTransaction)} / transaction
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {customerList.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No customers found matching your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <CustomerDetailsPopup
          customer={selectedCustomer}
          transactions={filteredTransactions.filter(t => t.customer === selectedCustomer.name)}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </>
  );
}