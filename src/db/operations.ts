import { db } from './schema';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, DailyData, Product, Customer, Expense } from '../types';

// Queue an operation for syncing
async function queueSync(action: 'create' | 'update' | 'delete', table: string, data: any) {
  await db.syncQueue.add({
    id: uuidv4(),
    action,
    table,
    data,
    timestamp: new Date().toISOString(),
    synced: 0,
    syncAttempts: 0
  });
}

// Transactions
export async function saveTransaction(transaction: Transaction) {
  const id = await db.transactions.add(transaction);
  await queueSync('create', 'transactions', transaction);
  return id;
}

export async function getTransactions(startDate: string, endDate: string) {
  return await db.transactions
    .where('timestamp')
    .between(startDate, endDate)
    .toArray();
}

// Daily Data
export async function saveDailyData(data: DailyData) {
  await db.dailyData.put(data);
  await queueSync('update', 'dailyData', data);
}

export async function getDailyData(date: string) {
  return await db.dailyData.get(date);
}

// Products
export async function saveProduct(product: Product) {
  const id = await db.products.add(product);
  await queueSync('create', 'products', product);
  return id;
}

export async function updateProduct(id: string, product: Product) {
  await db.products.update(id, product);
  await queueSync('update', 'products', product);
}

export async function deleteProduct(id: string) {
  await db.products.delete(id);
  await queueSync('delete', 'products', { id });
}

// Customers
export async function saveCustomer(customer: Customer) {
  const id = await db.customers.add(customer);
  await queueSync('create', 'customers', customer);
  return id;
}

export async function updateCustomer(id: string, customer: Customer) {
  await db.customers.update(id, customer);
  await queueSync('update', 'customers', customer);
}

// Expenses
export async function saveExpense(expense: Expense) {
  const id = await db.expenses.add(expense);
  await queueSync('create', 'expenses', expense);
  return id;
}

export async function updateExpense(id: string, expense: Expense) {
  await db.expenses.update(id, expense);
  await queueSync('update', 'expenses', expense);
}