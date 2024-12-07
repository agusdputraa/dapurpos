import React, { useState, useRef } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ReceiptSettings {
  logo?: string;
  businessName: string;
  footerText: string;
  showLogo: boolean;
  fontSize: number;
  paperWidth: number;
}

interface ReceiptEditorProps {
  onClose: () => void;
}

export default function ReceiptEditor({ onClose }: ReceiptEditorProps) {
  const [settings, setSettings] = useLocalStorage<ReceiptSettings>('receipt_settings', {
    businessName: 'Dapur El Noor',
    footerText: 'Thank you for choosing us!\nPlease come again!',
    showLogo: true,
    fontSize: 12,
    paperWidth: 400
  });

  const [previewLogo, setPreviewLogo] = useState<string | undefined>(settings.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSettings({
      ...settings,
      logo: previewLogo
    });
    onClose();
  };

  const removeLogo = () => {
    setPreviewLogo(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Receipt Settings</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {previewLogo ? (
                        <img
                          src={previewLogo}
                          alt="Logo preview"
                          className="max-h-24 object-contain"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">Click to upload logo</div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                {previewLogo && (
                  <button
                    onClick={removeLogo}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <textarea
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Logo
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showLogo}
                  onChange={(e) => setSettings({ ...settings, showLogo: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">Display logo on receipt</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <input
                type="range"
                min="10"
                max="16"
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{settings.fontSize}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Width
              </label>
              <input
                type="range"
                min="300"
                max="600"
                step="50"
                value={settings.paperWidth}
                onChange={(e) => setSettings({ ...settings, paperWidth: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{settings.paperWidth}px</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}