import React, { useState } from 'react';
import { X, Download, Printer, Share2 } from 'lucide-react';
import { Transaction } from '../types';
import ReceiptPreview from './ReceiptPreview';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { downloadReceipt, printReceipt, shareReceiptViaWhatsApp } from '../utils/platformUtils';

interface ReceiptGeneratorProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function ReceiptGenerator({ transaction, onClose }: ReceiptGeneratorProps) {
  const [settings] = useLocalStorage('receipt_settings', {
    businessName: 'Dapur El Noor',
    footerText: 'Thank you for choosing us!\nPlease come again!',
    showLogo: true,
    fontSize: 12,
    paperWidth: 300
  });
  const [selectedPrinter] = useLocalStorage('selected_printer', null);
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const filename = `receipt-${transaction.id.slice(0, 8)}.png`;
    const success = await downloadReceipt(canvas, filename);

    if (!success) {
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handlePrint = async () => {
    if (!selectedPrinter) {
      alert('Please select a printer in Settings first');
      return;
    }

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      setPrinting(true);
      const success = await printReceipt(canvas.toDataURL(), {
        copies: 1,
        paperSize: '80mm',
        cutPaper: true
      }, selectedPrinter);

      if (!success) {
        alert('Failed to print receipt. Please check your printer connection.');
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('An error occurred while printing. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  const handleShare = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      setSharing(true);
      const message = `Receipt from ${settings.businessName}\nAmount: ${transaction.amount}\nDate: ${new Date(transaction.timestamp).toLocaleDateString()}`;
      const success = await shareReceiptViaWhatsApp(canvas, message);

      if (!success) {
        alert('Failed to share receipt. Please try again.');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('An error occurred while sharing. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Receipt Preview</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <ReceiptPreview transaction={transaction} settings={settings} />

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          
          <button
            onClick={handlePrint}
            disabled={printing || !selectedPrinter}
            className={`px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm ${
              (printing || !selectedPrinter) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={!selectedPrinter ? 'Please select a printer in Settings first' : ''}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{printing ? 'Printing...' : 'Print'}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className={`px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm ${
              sharing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{sharing ? 'Sharing...' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}