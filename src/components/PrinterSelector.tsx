import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Bluetooth, Wifi, Usb, Globe, Plus, X, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  PrinterDevice, 
  getPrinterList, 
  connectPrinter, 
  disconnectPrinter, 
  checkPrinterConnection,
  printReceipt,
  isAndroid
} from '../utils/platformUtils';
import AddPrinterModal from './AddPrinterModal';

interface PrinterSelectorProps {
  onSelect: (device: PrinterDevice) => void;
}

export default function PrinterSelector({ onSelect }: PrinterSelectorProps) {
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useLocalStorage<PrinterDevice | null>('selected_printer', null);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle');

  const loadPrinters = async () => {
    try {
      setLoading(true);
      setError(null);
      const devices = await getPrinterList();
      setPrinters(devices);

      if (selectedPrinter) {
        const isConnected = await checkPrinterConnection(selectedPrinter);
        if (!isConnected) {
          setSelectedPrinter(null);
        }
      }
    } catch (err) {
      setError('Failed to load printers');
      console.error('Error loading printers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleSelect = async (device: PrinterDevice) => {
    try {
      setError(null);
      
      if (selectedPrinter) {
        await disconnectPrinter(selectedPrinter);
      }

      const connected = await connectPrinter(device);
      if (connected) {
        setSelectedPrinter(device);
        onSelect(device);
      } else {
        setError('Failed to connect to printer');
      }
    } catch (err) {
      setError('Connection error');
      console.error('Error connecting to printer:', err);
    }
  };

  const handleDisconnect = async (device: PrinterDevice) => {
    try {
      await disconnectPrinter(device);
      setSelectedPrinter(null);
    } catch (err) {
      setError('Failed to disconnect printer');
      console.error('Error disconnecting printer:', err);
    }
  };

  const handleTestPrint = async (device: PrinterDevice) => {
    try {
      setTestPrintStatus('printing');
      
      // Create a test receipt canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = 400;
      canvas.height = 200;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'black';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Test Print', canvas.width / 2, 40);
      
      ctx.font = '16px Arial';
      ctx.fillText('If you can read this,', canvas.width / 2, 80);
      ctx.fillText('your printer is working correctly!', canvas.width / 2, 110);
      
      const timestamp = new Date().toLocaleString();
      ctx.font = '14px Arial';
      ctx.fillText(timestamp, canvas.width / 2, 150);

      const success = await printReceipt(canvas.toDataURL(), {
        copies: 1,
        paperSize: '80mm',
        cutPaper: true
      }, device);

      setTestPrintStatus(success ? 'success' : 'error');
      setTimeout(() => setTestPrintStatus('idle'), 3000);
    } catch (err) {
      console.error('Test print failed:', err);
      setTestPrintStatus('error');
      setTimeout(() => setTestPrintStatus('idle'), 3000);
    }
  };

  const handleAddPrinter = (printerData: { name: string; address: string; type: 'web' }) => {
    const newPrinter: PrinterDevice = {
      id: crypto.randomUUID(),
      name: printerData.name,
      address: printerData.address,
      type: 'web',
      status: 'available'
    };
    setPrinters(prev => [...prev, newPrinter]);
  };

  const getDeviceIcon = (type: PrinterDevice['type']) => {
    switch (type) {
      case 'bluetooth':
        return <Bluetooth className="w-4 h-4" />;
      case 'web':
        return <Globe className="w-4 h-4" />;
      case 'usb':
        return <Usb className="w-4 h-4" />;
      case 'android':
        return <Printer className="w-4 h-4" />;
      default:
        return <Printer className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Available Printers</h3>
          <button
            onClick={loadPrinters}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {!isAndroid() && (
          <button
            onClick={() => setShowAddPrinter(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Plus className="w-4 h-4" />
            Add Printer
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {printers.map((device) => (
          <div
            key={device.id}
            className={`p-4 border rounded-lg ${
              selectedPrinter?.id === device.id
                ? 'border-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device.type)}
                <div>
                  <div className="font-medium">{device.name}</div>
                  <div className="text-sm text-gray-500">
                    {device.details?.manufacturer && `${device.details.manufacturer} • `}
                    {device.type.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedPrinter?.id === device.id ? (
                  <>
                    <button
                      onClick={() => handleTestPrint(device)}
                      disabled={testPrintStatus === 'printing'}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        testPrintStatus === 'printing'
                          ? 'bg-gray-100 text-gray-500'
                          : testPrintStatus === 'success'
                          ? 'bg-green-100 text-green-700'
                          : testPrintStatus === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {testPrintStatus === 'printing' ? 'Printing...' :
                       testPrintStatus === 'success' ? 'Print Success' :
                       testPrintStatus === 'error' ? 'Print Failed' : 'Test Print'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(device)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSelect(device)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {printers.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            No printers found
          </div>
        )}
      </div>

      {showAddPrinter && (
        <AddPrinterModal
          onClose={() => setShowAddPrinter(false)}
          onAdd={handleAddPrinter}
        />
      )}
    </div>
  );
}