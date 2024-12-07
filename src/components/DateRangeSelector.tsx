import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRange } from '../types';
import { formatYYYYMMDD } from '../utils/dateUtils';

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  availableDates: string[];
  datesInRange: string[];
}

export default function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  availableDates,
  datesInRange,
}: DateRangeSelectorProps) {
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromDate = e.target.value;
    const currentToDate = new Date(dateRange.to);
    const newFromDateObj = new Date(newFromDate);

    // If new "from" date is after current "to" date, update "to" date
    if (newFromDateObj > currentToDate) {
      onDateRangeChange({
        from: newFromDate,
        to: newFromDate
      });
    } else {
      onDateRangeChange({
        ...dateRange,
        from: newFromDate
      });
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToDate = e.target.value;
    const currentFromDate = new Date(dateRange.from);
    const newToDateObj = new Date(newToDate);

    // If new "to" date is before current "from" date, update "from" date
    if (newToDateObj < currentFromDate) {
      onDateRangeChange({
        from: newToDate,
        to: newToDate
      });
    } else {
      onDateRangeChange({
        ...dateRange,
        to: newToDate
      });
    }
  };

  // Get max date as 10 years from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  const maxDateStr = formatYYYYMMDD(maxDate);

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow px-4 py-2">
      <Calendar className="w-5 h-5 text-gray-500" />
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateRange.from}
          onChange={handleFromDateChange}
          max={maxDateStr}
          className="border-none focus:ring-0 text-sm"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={handleToDateChange}
          max={maxDateStr}
          className="border-none focus:ring-0 text-sm"
        />
      </div>
      {datesInRange.length > 0 && (
        <div className="text-sm text-gray-500">
          ({datesInRange.length} {datesInRange.length === 1 ? 'day' : 'days'} with data)
        </div>
      )}
    </div>
  );
}