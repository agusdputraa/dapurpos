import { useLocalStorage } from './useLocalStorage';
import { DailyData, Transaction, Denomination } from '../types';

export function useDailyData() {
  const [dailyData, setDailyData] = useLocalStorage<Record<string, DailyData>>('register_daily_data', {});

  const saveDailyData = (date: string, data: DailyData) => {
    setDailyData(prev => ({
      ...prev,
      [date]: data
    }));
  };

  const updateDailyData = (
    date: string,
    transactions: Transaction[],
    initialBalance: number,
    currentBalance: number,
    denominations: Denomination[]
  ) => {
    saveDailyData(date, {
      date,
      initialBalance,
      finalBalance: currentBalance,
      denominations,
      transactions
    });
  };

  const deleteDailyData = (date: string) => {
    setDailyData(prev => {
      const newData = { ...prev };
      delete newData[date];
      return newData;
    });
  };

  const getDailyData = (date: string): DailyData | null => {
    return dailyData[date] || null;
  };

  const getAvailableDates = (): string[] => {
    return Object.keys(dailyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const normalizeDate = (date: string): string => {
    return new Date(date).toISOString().split('T')[0];
  };

  const getTransactionsInRange = (from: string, to: string): Transaction[] => {
    const normalizedFrom = normalizeDate(from);
    const normalizedTo = normalizeDate(to);
    
    const transactions: Transaction[] = [];
    const processedIds = new Set<string>(); // To prevent duplicates

    Object.entries(dailyData).forEach(([date, data]) => {
      const normalizedDate = normalizeDate(date);
      
      if (normalizedDate >= normalizedFrom && normalizedDate <= normalizedTo) {
        data.transactions.forEach(transaction => {
          if (!processedIds.has(transaction.id)) {
            const transactionDate = normalizeDate(transaction.timestamp);
            if (transactionDate >= normalizedFrom && transactionDate <= normalizedTo) {
              transactions.push(transaction);
              processedIds.add(transaction.id);
            }
          }
        });
      }
    });

    return transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  return {
    dailyData,
    saveDailyData,
    updateDailyData,
    deleteDailyData,
    getDailyData,
    getAvailableDates,
    getTransactionsInRange
  };
}