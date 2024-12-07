import { Denomination } from '../types';

export const calculateChange = (
  changeAmount: number,
  availableDenominations: Denomination[]
): { value: number; count: number; label: string }[] => {
  // Sort denominations from largest to smallest
  const sortedDenoms = [...availableDenominations]
    .sort((a, b) => b.value - a.value)
    .filter(d => d.count > 0);
  
  let remainingChange = changeAmount;
  const breakdown: { value: number; count: number; label: string }[] = [];

  for (const denom of sortedDenoms) {
    if (remainingChange >= denom.value && denom.count > 0) {
      const maxPossibleCount = Math.floor(remainingChange / denom.value);
      const actualCount = Math.min(maxPossibleCount, denom.count);
      
      if (actualCount > 0) {
        breakdown.push({
          value: denom.value,
          count: actualCount,
          label: denom.label
        });
        remainingChange -= denom.value * actualCount;
      }
    }
  }

  // If we can't make exact change, return an empty array
  if (remainingChange > 0) {
    return [];
  }

  return breakdown;
};

export const hasEnoughChange = (
  changeAmount: number,
  availableDenominations: Denomination[]
): boolean => {
  if (changeAmount <= 0) return true;
  
  const changeBreakdown = calculateChange(changeAmount, availableDenominations);
  if (changeBreakdown.length === 0) return false;
  
  const totalChangeAvailable = changeBreakdown.reduce(
    (sum, item) => sum + item.value * item.count,
    0
  );
  
  return totalChangeAvailable === changeAmount;
};