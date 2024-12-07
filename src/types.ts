export type ProductCategory = 'Food' | 'Beverage' | 'Snack' | 'Other';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Food', 'Beverage', 'Snack', 'Other'];

export interface Denomination {
  value: number;
  label: string;
  count: number;
}

export const RUPIAH_DENOMINATIONS: Denomination[] = [
  { value: 100000, label: 'Rp100.000', count: 0 },
  { value: 50000, label: 'Rp50.000', count: 0 },
  { value: 20000, label: 'Rp20.000', count: 0 },
  { value: 10000, label: 'Rp10.000', count: 0 },
  { value: 5000, label: 'Rp5.000', count: 0 },
  { value: 2000, label: 'Rp2.000', count: 0 },
  { value: 1000, label: 'Rp1.000', count: 0 },
  { value: 500, label: 'Rp500', count: 0 },
  { value: 200, label: 'Rp200', count: 0 },
  { value: 100, label: 'Rp100', count: 0 }
];

export interface CartItem extends Product {
  orderQuantity: number;
  selectedToppings?: { name: string; price: number }[];
  notes?: string;
  instanceId: string;
}

export interface OrderDetails {
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedToppings?: { name: string; price: number }[];
    notes?: string;
  }[];
  shippingAddress?: string;
  shippingAmount?: number;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'expense';
  amount: number;
  paymentAmount: number;
  change: number;
  timestamp: string;
  customer: string;
  paymentMethod: 'cash' | 'online';
  changeBreakdown?: { value: number; count: number; label: string }[];
  paymentBreakdown?: { value: number; count: number; label: string }[];
  orderDetails?: OrderDetails;
}

export interface PendingTransaction {
  id: string;
  timestamp: string;
  customer: string;
  amount: number;
  orderDetails?: OrderDetails;
}

export interface DebtTransaction {
  id: string;
  timestamp: string;
  customer: string;
  amount: number;
}

export interface DailyData {
  date: string;
  initialBalance: number;
  finalBalance: number;
  denominations: Denomination[];
  transactions: Transaction[];
  pendingTransactions?: PendingTransaction[];
  debtTransactions?: DebtTransaction[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  toppings?: { name: string; price: number }[];
}

export interface DateRange {
  from: string;
  to: string;
}

export interface ReceiptSettings {
  businessName: string;
  businessInfo?: string;
  footerText: string;
  showLogo: boolean;
  logo?: string;
  logoWidth: number;
  logoAlignment: 'left' | 'center' | 'right';
  showQRCode: boolean;
  qrImage?: string;
  showBarcode: boolean;
  showReceiptNumber: boolean;
  receiptNumberPrefix: string;
  showDateTime: boolean;
  paperWidth: number;
  lineHeight: number;
  itemSpacing: number;
  sectionSpacing: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fonts: {
    header: {
      size: number;
      weight: string;
      align: 'left' | 'center' | 'right';
    };
    body: {
      size: number;
      weight: string;
    };
    footer: {
      size: number;
      weight: string;
      align: 'left' | 'center' | 'right';
    };
  };
  borders: {
    show: boolean;
    style: 'solid' | 'dashed' | 'dotted';
    width: number;
    color: string;
  };
}

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  businessName: 'Dapur El Noor',
  footerText: 'Thank you for choosing us!\nPlease come again!',
  showLogo: true,
  logoWidth: 200,
  logoAlignment: 'center',
  showQRCode: false,
  showBarcode: false,
  showReceiptNumber: true,
  receiptNumberPrefix: 'INV-',
  showDateTime: true,
  paperWidth: 300,
  lineHeight: 1.5,
  itemSpacing: 8,
  sectionSpacing: 16,
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  fonts: {
    header: {
      size: 16,
      weight: 'bold',
      align: 'center'
    },
    body: {
      size: 12,
      weight: 'normal'
    },
    footer: {
      size: 10,
      weight: 'normal',
      align: 'center'
    }
  },
  borders: {
    show: false,
    style: 'solid',
    width: 1,
    color: '#000000'
  }
};