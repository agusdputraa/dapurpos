import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Calendar, Search } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDate, isDateInRange } from '../utils/dateUtils';
import ProductDetailsPopup from './ProductDetailsPopup';

interface ProductSales {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface ProductSalesSummaryProps {
  transactions: Transaction[];
  availableDates: string[];
}

export default function ProductSalesSummary({ transactions, availableDates }: ProductSalesSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: availableDates[availableDates.length - 1] || '',
    to: availableDates[0] || ''
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductSales | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(t => 
    isDateInRange(t.timestamp, dateRange.from, dateRange.to)
  );

  const productSales = filteredTransactions
    .filter(t => t.type === 'sale' && t.orderDetails)
    .reduce((acc: ProductSales[], transaction) => {
      transaction.orderDetails?.items.forEach(item => {
        const existingProduct = acc.find(p => p.productId === item.productId);
        if (existingProduct) {
          existingProduct.totalQuantity += item.quantity;
          existingProduct.totalRevenue += item.price * item.quantity;
        } else {
          acc.push({
            productId: item.productId,
            name: item.name,
            totalQuantity: item.quantity,
            totalRevenue: item.price * item.quantity
          });
        }
      });
      return acc;
    }, [])
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const filteredProducts = productSales.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = filteredProducts.reduce((sum, product) => sum + product.totalRevenue, 0);
  const totalItems = filteredProducts.reduce((sum, product) => sum + product.totalQuantity, 0);

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

  if (productSales.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold">Product Sales Summary</h3>
            <span className="text-sm text-gray-500">
              ({filteredProducts.length} products)
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
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 font-medium">Total Items Sold</div>
                <div className="text-2xl font-bold">{totalItems}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 font-medium">Total Revenue</div>
                <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
              </div>
            </div>

            <div className="border rounded-lg divide-y">
              {filteredProducts.map((product) => (
                <button
                  key={`product-${product.productId}`}
                  onClick={() => setSelectedProduct(product)}
                  className="w-full p-4 hover:bg-gray-50 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.totalQuantity} units sold
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatRupiah(product.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg. {formatRupiah(product.totalRevenue / product.totalQuantity)} / unit
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No products found matching your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailsPopup
          product={selectedProduct}
          transactions={filteredTransactions}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}