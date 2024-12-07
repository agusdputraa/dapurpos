import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, History } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useCustomers, Customer } from '../hooks/useCustomers';

interface CustomerAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomerAutocomplete({ value, onChange, placeholder = 'Enter customer name' }: CustomerAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchCustomers, recentCustomers } = useCustomers();

  const updateSuggestions = useCallback((searchValue: string) => {
    const results = searchCustomers(searchValue);
    setSuggestions(results);
  }, [searchCustomers]);

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
      setSuggestions(recentCustomers);
    } else {
      updateSuggestions(value);
    }
    setIsOpen(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    onChange(customer.name);
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
              <span className="text-sm text-gray-600">Recent Customers</span>
            </div>
          )}
          
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium group-hover:text-blue-600">{customer.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last transaction: {formatDateTime(customer.lastTransaction)}
                  </div>
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {customer.totalTransactions} transactions
                </div>
              </button>
            ))}
          </div>
          
          {suggestions.length === 0 && value && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No matching customers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}