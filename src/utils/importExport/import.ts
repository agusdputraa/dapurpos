import { DataExport, ImportResult, ValidationError } from './types';
import { validateImportData } from './validation';

export async function importDataFromFile(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as DataExport;
    
    // Validate the imported data structure and types
    const errors = validateImportData(data);
    
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    // Store the imported data
    localStorage.setItem('register_transactions', JSON.stringify(data.data.transactions));
    localStorage.setItem('products', JSON.stringify(data.data.products));
    localStorage.setItem('register_customers', JSON.stringify(data.data.customers));
    localStorage.setItem('register_expenses', JSON.stringify(data.data.expenses));
    localStorage.setItem('register_denominations', JSON.stringify(data.data.denominations));
    localStorage.setItem('register_daily_data', JSON.stringify(data.data.dailyData));

    return {
      success: true,
      errors: [],
      data
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        field: 'file',
        message: error instanceof Error ? error.message : 'Failed to parse import file'
      }]
    };
  }
}

export function mergeImportedData(importedData: DataExport): ImportResult {
  try {
    // Get existing data
    const existingTransactions = JSON.parse(localStorage.getItem('register_transactions') || '[]');
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const existingCustomers = JSON.parse(localStorage.getItem('register_customers') || '[]');
    const existingExpenses = JSON.parse(localStorage.getItem('register_expenses') || '[]');
    const existingDailyData = JSON.parse(localStorage.getItem('register_daily_data') || '{}');

    // Create maps for efficient lookups
    const transactionIds = new Set(existingTransactions.map((t: any) => t.id));
    const productMap = new Map(existingProducts.map((p: any) => [p.id, p]));
    const customerMap = new Map(existingCustomers.map((c: any) => [c.id, c]));

    // Merge transactions (avoid duplicates by ID)
    const newTransactions = [
      ...existingTransactions,
      ...importedData.data.transactions.filter(t => !transactionIds.has(t.id))
    ];

    // Merge products (update existing, add new)
    importedData.data.products.forEach(product => {
      productMap.set(product.id, { ...productMap.get(product.id), ...product });
    });

    // Merge customers (update existing, add new)
    importedData.data.customers.forEach(customer => {
      customerMap.set(customer.id, { ...customerMap.get(customer.id), ...customer });
    });

    // Merge daily data (combine by date)
    const mergedDailyData = {
      ...existingDailyData,
      ...importedData.data.dailyData
    };

    // Save merged data
    localStorage.setItem('register_transactions', JSON.stringify(newTransactions));
    localStorage.setItem('products', JSON.stringify(Array.from(productMap.values())));
    localStorage.setItem('register_customers', JSON.stringify(Array.from(customerMap.values())));
    localStorage.setItem('register_expenses', JSON.stringify([...existingExpenses, ...importedData.data.expenses]));
    localStorage.setItem('register_daily_data', JSON.stringify(mergedDailyData));

    return {
      success: true,
      errors: [],
      data: {
        metadata: importedData.metadata,
        data: {
          transactions: newTransactions,
          products: Array.from(productMap.values()),
          customers: Array.from(customerMap.values()),
          expenses: [...existingExpenses, ...importedData.data.expenses],
          denominations: importedData.data.denominations,
          dailyData: mergedDailyData
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        field: 'merge',
        message: error instanceof Error ? error.message : 'Failed to merge data'
      }]
    };
  }
}