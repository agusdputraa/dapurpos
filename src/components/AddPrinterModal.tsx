import React, { useState, useEffect } from 'react';
import { X, Printer, Globe, Bluetooth, Usb, Loader2 } from 'lucide-react';
import { PrinterDevice, isBluetoothSupported, isUSBSupported, isAndroid } from '../utils/platformUtils';

interface AddPrinterModalProps {
  onClose: () => void;
  onAdd: (printer: PrinterDevice) => void;
}

type PrinterType = 'web' | 'bluetooth' | 'usb' | 'android';

export default function AddPrinterModal({ onClose, onAdd }: AddPrinterModalProps) {
  const [printerType, setPrinterType] = useState<PrinterType>('web');
  const [scanning, setScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<PrinterDevice[]>([]);
  const [webPrinterData, setWebPrinterData] = useState({
    name: '',
    address: ''
  });

  const scanForDevices = async () => {
    setScanning(true);
    setFoundDevices([]);

    try {
      if (printerType === 'bluetooth' && isBluetoothSupported()) {
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
            { namePrefix: 'Printer' }
          ],
          optionalServices: ['battery_service']
        });

        if (device) {
          setFoundDevices([{
            id: crypto.randomUUID(),
            name: device.name || 'Bluetooth Printer',
            address: device.id,
            type: 'bluetooth',
            status: 'available'
          }]);
        }
      } else if (printerType === 'usb' && isUSBSupported()) {
        const device = await navigator.usb.requestDevice({
          filters: [{ classCode: 7 }] // Printer class
        });

        if (device) {
          setFoundDevices([{
            id: crypto.randomUUID(),
            name: device.productName || 'USB Printer',
            address: `${device.vendorId}:${device.productId}`,
            type: 'usb',
            status: 'available',
            details: {
              manufacturer: device.manufacturerName,
              vendorId: device.vendorId,
              productId: device.productId
            }
          }]);
        }
      } else if (printerType === 'android' && isAndroid() && window.Android?.getPrinterList) {
        const printers = await window.Android.getPrinterList();
        setFoundDevices(printers);
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleAddWebPrinter = () => {
    if (!webPrinterData.name || !webPrinterData.address) return;

    onAdd({
      id: crypto.randomUUID(),
      name: webPrinterData.name,
      address: webPrinterData.address,
      type: 'web',
      status: 'available'
    });
    onClose();
  };

  const handleSelectDevice = (device: PrinterDevice) => {
    onAdd(device);
    onClose();
  };

  const renderContent = () => {
    if (printerType === 'web') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Printer Name
            </label>
            <input
              type="text"
              value={webPrinterData.name}
              onChange={(e) => setWebPrinterData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Office Printer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={webPrinterData.address}
              onChange={(e) => setWebPrinterData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="e.g., 192.168.1.100"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Enter the printer's IP address</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWebPrinter}
              disabled={!webPrinterData.name || !webPrinterData.address}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add Printer
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Available Devices</h4>
          <button
            onClick={scanForDevices}
            disabled={scanning}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center gap-2"
          >
            {scanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            {scanning ? 'Scanning...' : 'Scan for Devices'}
          </button>
        </div>

        <div className="space-y-2">
          {foundDevices.map((device) => (
            <button
              key={device.id}
              onClick={() => handleSelectDevice(device)}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center gap-3">
                {device.type === 'bluetooth' && <Bluetooth className="w-5 h-5 text-blue-600" />}
                {device.type === 'usb' && <Usb className="w-5 h-5 text-green-600" />}
                {device.type === 'android' && <Printer className="w-5 h-5 text-purple-600" />}
                <div>
                  <div className="font-medium">{device.name}</div>
                  {device.details?.manufacturer && (
                    <div className="text-sm text-gray-500">{device.details.manufacturer}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
          {!scanning && foundDevices.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No devices found. Click "Scan for Devices" to search for printers.
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold">Add Printer</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPrinterType('web')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                printerType === 'web'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              Network
            </button>
            {isBluetoothSupported() && (
              <button
                onClick={() => setPrinterType('bluetooth')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  printerType === 'bluetooth'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bluetooth className="w-4 h-4" />
                Bluetooth
              </button>
            )}
            {isUSBSupported() && (
              <button
                onClick={() => setPrinterType('usb')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  printerType === 'usb'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Usb className="w-4 h-4" />
                USB
              </button>
            )}
            {isAndroid() && (
              <button
                onClick={() => setPrinterType('android')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  printerType === 'android'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Printer className="w-4 h-4" />
                Android
              </button>
            )}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}