import Dexie, { Table } from 'dexie';
import { Transaction, DailyData, Product, Customer, Expense } from '../types';

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  synced: number; // 0 = unsynced, 1 = synced
  syncAttempts: number;
  lastSyncAttempt?: string;
}

export class AppDatabase extends Dexie {
  transactions!: Table<Transaction>;
  dailyData!: Table<DailyData>;
  products!: Table<Product>;
  customers!: Table<Customer>;
  expenses!: Table<Expense>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('DapurCashierDB');
    
    this.version(1).stores({
      transactions: '++id, type, timestamp, customer',
      dailyData: 'date, initialBalance, finalBalance',
      products: '++id, name',
      customers: '++id, name, lastTransaction',
      expenses: '++id, description, lastTransaction',
      syncQueue: '++id, action, table, timestamp, synced'
    });
  }
}

export const db = new AppDatabase();