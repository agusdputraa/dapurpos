import React, { useState, useRef } from 'react';
import { Image, Type, Layout, Grid, Upload, Save, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ReceiptSettings as ReceiptSettingsType, DEFAULT_RECEIPT_SETTINGS } from '../types';
import ReceiptPreviewLive from './ReceiptPreviewLive';

interface ReceiptSettingsProps {
  onClose: () => void;
}

export default function ReceiptSettings({ onClose }: ReceiptSettingsProps) {
  const [settings, setSettings] = useLocalStorage<ReceiptSettingsType>('receipt_settings', DEFAULT_RECEIPT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'logo' | 'fonts' | 'layout' | 'content'>('logo');
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(settings.logo);
  const [previewQR, setPreviewQR] = useState<string | undefined>(settings.qrImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'logo', icon: Image },
    { id: 'fonts', icon: Type },
    { id: 'layout', icon: Layout },
    { id: 'content', icon: Grid }
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewLogo(result);
        setSettings({ ...settings, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewQR(result);
        setSettings({ ...settings, qrImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'logo':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showLogo"
                    checked={settings.showLogo}
                    onChange={(e) => setSettings({ ...settings, showLogo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="showLogo" className="text-sm">Show Logo</label>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              {settings.logo && (
                <div className="relative">
                  <img
                    src={settings.logo}
                    alt="Logo preview"
                    className="max-h-32 object-contain mx-auto"
                  />
                  <button
                    onClick={() => setSettings({ ...settings, logo: undefined })}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo Width</label>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    step="10"
                    value={settings.logoWidth}
                    onChange={(e) => setSettings({ ...settings, logoWidth: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">{settings.logoWidth}px</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Logo Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => setSettings({ ...settings, logoAlignment: align as any })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                          settings.logoAlignment === align
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fonts':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Header Font</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Size</label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fonts.header.size}
                    onChange={(e) => setSettings({
                      ...settings,
                      fonts: {
                        ...settings.fonts,
                        header: {
                          ...settings.fonts.header,
                          size: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-600 mt-1">{settings.fonts.header.size}px</div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Weight</label>
                  <select
                    value={settings.fonts.header.weight}
                    onChange={(e) => setSettings({
                      ...settings,
                      fonts: {
                        ...settings.fonts,
                        header: {
                          ...settings.fonts.header,
                          weight: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => setSettings({
                          ...settings,
                          fonts: {
                            ...settings.fonts,
                            header: {
                              ...settings.fonts.header,
                              align: align as any
                            }
                          }
                        })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                          settings.fonts.header.align === align
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Body Font</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Size</label>
                  <input
                    type="range"
                    min="10"
                    max="16"
                    value={settings.fonts.body.size}
                    onChange={(e) => setSettings({
                      ...settings,
                      fonts: {
                        ...settings.fonts,
                        body: {
                          ...settings.fonts.body,
                          size: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-600 mt-1">{settings.fonts.body.size}px</div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Weight</label>
                  <select
                    value={settings.fonts.body.weight}
                    onChange={(e) => setSettings({
                      ...settings,
                      fonts: {
                        ...settings.fonts,
                        body: {
                          ...settings.fonts.body,
                          weight: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Footer Font</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Size</label>
                  <input
                    type="range"
                    min="8"
                    max="14"
                    value={settings.fonts.footer.size}
                    onChange={(e) => setSettings({
                      ...settings,
                      fonts: {
                        ...settings.fonts,
                        footer: {
                          ...settings.fonts.footer,
                          size: Number(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-600 mt-1">{settings.fonts.footer.size}px</div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Weight</label>
                  <select
                    value={settings.fonts.footer.weight}
                    onChange={(e) => setSettings({
                      ...settings,
                      fonts: {
                        ...settings.fonts,
                        footer: {
                          ...settings.fonts.footer,
                          weight: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => setSettings({
                          ...settings,
                          fonts: {
                            ...settings.fonts,
                            footer: {
                              ...settings.fonts.footer,
                              align: align as any
                            }
                          }
                        })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                          settings.fonts.footer.align === align
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Paper Width</label>
              <input
                type="range"
                min="200"
                max="400"
                step="10"
                value={settings.paperWidth}
                onChange={(e) => setSettings({ ...settings, paperWidth: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{settings.paperWidth}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Line Height</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => setSettings({ ...settings, lineHeight: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{settings.lineHeight}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Item Spacing</label>
              <input
                type="range"
                min="4"
                max="16"
                step="2"
                value={settings.itemSpacing}
                onChange={(e) => setSettings({ ...settings, itemSpacing: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{settings.itemSpacing}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Section Spacing</label>
              <input
                type="range"
                min="8"
                max="32"
                step="4"
                value={settings.sectionSpacing}
                onChange={(e) => setSettings({ ...settings, sectionSpacing: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{settings.sectionSpacing}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Margins</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Top</label>
                  <input
                    type="number"
                    value={settings.margins.top}
                    onChange={(e) => setSettings({
                      ...settings,
                      margins: {
                        ...settings.margins,
                        top: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Right</label>
                  <input
                    type="number"
                    value={settings.margins.right}
                    onChange={(e) => setSettings({
                      ...settings,
                      margins: {
                        ...settings.margins,
                        right: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bottom</label>
                  <input
                    type="number"
                    value={settings.margins.bottom}
                    onChange={(e) => setSettings({
                      ...settings,
                      margins: {
                        ...settings.margins,
                        bottom: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Left</label>
                  <input
                    type="number"
                    value={settings.margins.left}
                    onChange={(e) => setSettings({
                      ...settings,
                      margins: {
                        ...settings.margins,
                        left: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business Info</label>
              <textarea
                value={settings.businessInfo}
                onChange={(e) => setSettings({ ...settings, businessInfo: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Enter business information (address, contact, etc.)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Footer Text</label>
              <textarea
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Enter footer text"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showQRCode"
                    checked={settings.showQRCode}
                    onChange={(e) => setSettings({ ...settings, showQRCode: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="showQRCode" className="text-sm">Show QR Code</label>
                </div>
                {settings.showQRCode && (
                  <button
                    onClick={() => qrInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload QR
                  </button>
                )}
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />
              </div>

              {settings.showQRCode && settings.qrImage && (
                <div className="relative">
                  <img
                    src={settings.qrImage}
                    alt="QR Code preview"
                    className="max-h-32 object-contain mx-auto"
                  />
                  <button
                    onClick={() => setSettings({ ...settings, qrImage: undefined })}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showReceiptNumber"
                  checked={settings.showReceiptNumber}
                  onChange={(e) => setSettings({ ...settings, showReceiptNumber: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showReceiptNumber" className="text-sm">Show Receipt Number</label>
              </div>

              {settings.showReceiptNumber && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Receipt Number Prefix</label>
                  <input
                    type="text"
                    value={settings.receiptNumberPrefix}
                    onChange={(e) => setSettings({ ...settings, receiptNumberPrefix: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter prefix (e.g., INV-)"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showDateTime"
                checked={settings.showDateTime}
                onChange={(e) => setSettings({ ...settings, showDateTime: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="showDateTime" className="text-sm">Show Date/Time</label>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderContent()}
        </div>

        <div className="lg:sticky lg:top-6">
          <ReceiptPreviewLive settings={settings} />
        </div>
      </div>
    </div>
  );
}