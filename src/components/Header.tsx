import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onBack: () => void;
  onReset: () => void;
}

export default function Header({ onBack, onReset }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Back to initialization"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
          title="Reset form"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}