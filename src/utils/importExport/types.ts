import { Transaction, Product, Customer, Expense, Denomination, DailyData } from '../../types';

export const DATA_VERSION = '1.0.0';

export interface ExportMetadata {
  version: string;
  timestamp: string;
  deviceInfo: {
    platform: string;
    userAgent: string;
    screenSize: string;
  };
}

export interface ExportedData {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  expenses: Expense[];
  denominations: Denomination[];
  dailyData: Record<string, DailyData>;
}

export interface DataExport {
  metadata: ExportMetadata;
  data: ExportedData;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ImportResult {
  success: boolean;
  errors: ValidationError[];
  data?: DataExport;
}

export const SCHEMA_DEFINITIONS = {
  transaction: {
    required: ['id', 'type', 'amount', 'timestamp', 'customer', 'paymentMethod'],
    types: {
      id: 'string',
      type: ['sale', 'expense'],
      amount: 'number',
      timestamp: 'string',
      customer: 'string',
      paymentMethod: ['cash', 'online']
    }
  },
  product: {
    required: ['id', 'name', 'category', 'price'],
    types: {
      id: 'string',
      name: 'string',
      category: ['Food', 'Beverage', 'Snack', 'Other'],
      price: 'number',
      quantity: 'number'
    }
  },
  customer: {
    required: ['id', 'name', 'lastTransaction'],
    types: {
      id: 'string',
      name: 'string',
      lastTransaction: 'string',
      totalTransactions: 'number'
    }
  }
};