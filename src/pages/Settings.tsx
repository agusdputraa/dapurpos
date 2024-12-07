import React, { useState } from 'react';
import { Printer, Receipt } from 'lucide-react';
import ReceiptSettings from '../components/ReceiptSettings';
import PrinterSelector from '../components/PrinterSelector';
import { PrinterDevice } from '../utils/platformUtils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'receipt' | 'printer'>('receipt');

  const handlePrinterSelect = (device: PrinterDevice) => {
    console.log('Selected printer:', device);
  };

  const tabs = [
    { id: 'receipt', icon: Receipt, label: 'Receipt Settings' },
    { id: 'printer', icon: Printer, label: 'Printer Setup' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {tabs.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center justify-center p-4 min-w-[64px] ${
                activeTab === id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'receipt' && (
            <ReceiptSettings onClose={() => {}} />
          )}

          {activeTab === 'printer' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Printer Setup</h3>
                <p className="text-sm text-blue-600">
                  Connect and configure your receipt printer for seamless printing.
                </p>
              </div>
              <PrinterSelector onSelect={handlePrinterSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}