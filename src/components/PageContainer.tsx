import React from 'react';
import BackButton from './BackButton';

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
}

export default function PageContainer({ children, title, onBack }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-header bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-4 h-14 md:h-16">
            <BackButton onClick={onBack} />
            <h1 className="text-mobile-lg md:text-xl font-bold truncate">{title}</h1>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6">
        {children}
      </div>
    </div>
  );
}