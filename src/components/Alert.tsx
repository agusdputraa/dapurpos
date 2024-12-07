import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AlertProps {
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    error: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700'
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-transform duration-300 ease-in-out animate-slide-in ${bgColor} border px-4 py-3 rounded-lg shadow-lg max-w-md`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span className="block sm:inline">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Alert;