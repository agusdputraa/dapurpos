import { formatYYYYMMDD } from './dateUtils';

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
  transactions: any[];
  products: any[];
  customers: any[];
  expenses: any[];
  denominations: any[];
  dailyData: Record<string, any>;
}

export interface DataExport {
  metadata: ExportMetadata;
  data: ExportedData;
}

const DATA_VERSION = '1.0.0';

function generateExportMetadata(): ExportMetadata {
  return {
    version: DATA_VERSION,
    timestamp: new Date().toISOString(),
    deviceInfo: {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`
    }
  };
}

export function exportData(): DataExport {
  const transactions = JSON.parse(localStorage.getItem('register_transactions') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const customers = JSON.parse(localStorage.getItem('register_customers') || '[]');
  const expenses = JSON.parse(localStorage.getItem('register_expenses') || '[]');
  const denominations = JSON.parse(localStorage.getItem('register_denominations') || '[]');
  const dailyData = JSON.parse(localStorage.getItem('register_daily_data') || '{}');

  const exportedData: ExportedData = {
    transactions,
    products,
    customers,
    expenses,
    denominations,
    dailyData
  };

  return {
    metadata: generateExportMetadata(),
    data: exportedData
  };
}

export function downloadExportFile(data: DataExport) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = formatYYYYMMDD(new Date());
  
  link.href = url;
  link.download = `dapur-cashier-export-${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateTemplateFile() {
  const template: DataExport = {
    metadata: {
      version: DATA_VERSION,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        platform: 'Template',
        userAgent: 'Template',
        screenSize: 'Template'
      }
    },
    data: {
      transactions: [{
        id: 'example-id',
        type: 'sale',
        amount: 50000,
        paymentAmount: 50000,
        change: 0,
        timestamp: new Date().toISOString(),
        customer: 'Example Customer',
        paymentMethod: 'cash'
      }],
      products: [{
        id: 'example-product',
        name: 'Example Product',
        category: 'Food',
        price: 25000,
        quantity: 100
      }],
      customers: [{
        id: 'example-customer',
        name: 'Example Customer',
        lastTransaction: new Date().toISOString(),
        totalTransactions: 1
      }],
      expenses: [],
      denominations: [],
      dailyData: {}
    }
  };

  downloadExportFile(template);
}