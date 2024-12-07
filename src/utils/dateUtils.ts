import { format, parse, isValid, startOfDay, endOfDay } from 'date-fns';

// Format constants
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM d, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM d, yyyy HH:mm';

// Convert any date input to start of day ISO string
export function normalizeDate(date: string | Date): string {
  const normalized = typeof date === 'string' ? new Date(date) : date;
  return startOfDay(normalized).toISOString();
}

// Format date for display
export function formatDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, DISPLAY_DATE_FORMAT);
}

// Format datetime for display
export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, DISPLAY_DATETIME_FORMAT);
}

// Parse display format back to ISO date string
export function parseDisplayDate(displayDate: string): string {
  const parsed = parse(displayDate, DISPLAY_DATE_FORMAT, new Date());
  return format(parsed, DATE_FORMAT);
}

// Check if a date is within a range (inclusive)
export function isDateInRange(testDate: string | Date, startDate: string, endDate: string): boolean {
  const testTimestamp = new Date(testDate).getTime();
  const startTimestamp = startOfDay(new Date(startDate)).getTime();
  const endTimestamp = endOfDay(new Date(endDate)).getTime();
  
  // Normalize all dates to 1970 for comparison
  const normalizedTest = new Date(testTimestamp);
  const normalizedStart = new Date(startTimestamp);
  const normalizedEnd = new Date(endTimestamp);
  
  normalizedTest.setFullYear(1970);
  normalizedStart.setFullYear(1970);
  normalizedEnd.setFullYear(1970);
  
  return normalizedTest.getTime() >= normalizedStart.getTime() && 
         normalizedTest.getTime() <= normalizedEnd.getTime();
}

// Get today's date in ISO format
export function getTodayISO(): string {
  return normalizeDate(new Date());
}

// Validate date string
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return isValid(date);
}

// Get start of day
export function getStartOfDay(date: string | Date): Date {
  return startOfDay(new Date(date));
}

// Get end of day
export function getEndOfDay(date: string | Date): Date {
  return endOfDay(new Date(date));
}

// Format date to YYYY-MM-DD
export function formatYYYYMMDD(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}