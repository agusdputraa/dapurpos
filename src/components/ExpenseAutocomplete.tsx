import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, History } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useExpenses, Expense } from '../hooks/useExpenses';

interface ExpenseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ExpenseAutocomplete({ value, onChange, placeholder = 'Enter expense description' }: ExpenseAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Expense[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchExpenses, recentExpenses } = useExpenses();

  const updateSuggestions = useCallback((searchValue: string) => {
    const results = searchExpenses(searchValue);
    setSuggestions(results);
  }, [searchExpenses]);

  useEffect(() => {
    updateSuggestions(value);
  }, [value, updateSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!value) {
      setSuggestions(recentExpenses);
    } else {
      updateSuggestions(value);
    }
    setIsOpen(true);
  };

  const handleSelectExpense = (expense: Expense) => {
    onChange(expense.description);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isOpen && (suggestions.length > 0 || !value) && (
        <div className="absolute z-dropdown w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {value === '' && (
            <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Recent Expenses</span>
            </div>
          )}
          
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((expense) => (
              <button
                key={expense.id}
                onClick={() => handleSelectExpense(expense)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium group-hover:text-blue-600">{expense.description}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last used: {formatDateTime(expense.lastTransaction)}
                  </div>
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {expense.totalTransactions} times
                </div>
              </button>
            ))}
          </div>
          
          {suggestions.length === 0 && value && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No matching expenses found
            </div>
          )}
        </div>
      )}
    </div>
  );
}