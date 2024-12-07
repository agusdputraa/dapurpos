import React, { useState } from 'react';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime, normalizeDate, isDateInRange } from '../utils/dateUtils';

interface ProductSales {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface ProductDetailsPopupProps {
  product: ProductSales;
  transactions: Transaction[];
  onClose: () => void;
}

interface SaleRecord {
  date: string;
  customer: string;
  quantity: number;
  revenue: number;
}

export default function ProductDetailsPopup({
  product,
  transactions,
  onClose
}: ProductDetailsPopupProps) {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  const salesHistory: SaleRecord[] = transactions
    .filter(t => t.type === 'sale' && t.orderDetails)
    .flatMap(transaction => {
      const productSale = transaction.orderDetails?.items.find(
        item => item.productId === product.productId
      );
      if (!productSale) return [];

      return [{
        date: transaction.timestamp,
        customer: transaction.customer,
        quantity: productSale.quantity,
        revenue: productSale.price * productSale.quantity
      }];
    })
    .filter(sale => {
      if (!dateRange.from && !dateRange.to) return true;
      return isDateInRange(
        sale.date,
        dateRange.from || '1970-01-01',
        dateRange.to || '2100-12-31'
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTotalRevenue = salesHistory.reduce((sum, sale) => sum + sale.revenue, 0);
  const filteredTotalUnits = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg mb-6">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              max={dateRange.to || undefined}
              className="px-2 py-1 border rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              min={dateRange.from || undefined}
              className="px-2 py-1 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-medium">Units Sold</div>
            <div className="text-2xl font-bold">{filteredTotalUnits}</div>
            {(dateRange.from || dateRange.to) && (
              <div className="text-sm text-gray-600 mt-1">
                of {product.totalQuantity} total
              </div>
            )}
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-medium">Revenue</div>
            <div className="text-2xl font-bold">{formatRupiah(filteredTotalRevenue)}</div>
            {(dateRange.from || dateRange.to) && (
              <div className="text-sm text-gray-600 mt-1">
                of {formatRupiah(product.totalRevenue)} total
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-semibold">Sales History</h4>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {salesHistory.map((sale, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {sale.customer}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(sale.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatRupiah(sale.revenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {sale.quantity} units
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {salesHistory.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No sales data found for the selected period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}