import React, { useRef, useEffect } from 'react';
import { Transaction, ReceiptSettings } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';

interface ReceiptPreviewLiveProps {
  settings: ReceiptSettings;
}

export default function ReceiptPreviewLive({ settings }: ReceiptPreviewLiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sample transaction data for preview
  const sampleTransaction: Transaction = {
    id: 'PREVIEW123',
    type: 'sale',
    amount: 150000,
    paymentAmount: 200000,
    change: 50000,
    timestamp: new Date().toISOString(),
    customer: 'Sample Customer',
    paymentMethod: 'cash',
    orderDetails: {
      items: [
        { productId: '1', name: 'Sample Product 1', price: 100000, quantity: 1 },
        { productId: '2', name: 'Sample Product 2', price: 25000, quantity: 2 },
      ],
      shippingAmount: 15000,
      shippingAddress: 'Sample Address\nCity, Country'
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate initial height
    let totalHeight = settings.margins.top;
    const lineHeight = settings.fonts.body.size * settings.lineHeight;

    // Logo space
    if (settings.showLogo && settings.logo) {
      totalHeight += 60 + settings.sectionSpacing;
    }

    // Business name
    totalHeight += settings.fonts.header.size * settings.lineHeight + settings.itemSpacing;

    // Business info
    if (settings.businessInfo) {
      const businessInfoLines = settings.businessInfo.split('\n').length;
      totalHeight += lineHeight * businessInfoLines + settings.itemSpacing;
    }

    // Receipt number & date - maintain spacing even when hidden
    totalHeight += lineHeight * 2 + settings.itemSpacing;

    // Customer info
    totalHeight += lineHeight * 2 + settings.sectionSpacing;

    // Items section
    totalHeight += lineHeight; // "Items:" header
    totalHeight += lineHeight * sampleTransaction.orderDetails!.items.length;
    totalHeight += settings.itemSpacing;

    // Shipping info
    if (sampleTransaction.orderDetails?.shippingAmount) {
      totalHeight += lineHeight;
      if (sampleTransaction.orderDetails?.shippingAddress) {
        totalHeight += lineHeight * 2;
      }
    }

    // Totals section
    totalHeight += settings.sectionSpacing;
    totalHeight += lineHeight * 3;

    // Footer
    totalHeight += settings.sectionSpacing;
    const footerLines = settings.footerText.split('\n').length;
    totalHeight += settings.fonts.footer.size * settings.lineHeight * footerLines;

    // QR Code space
    if (settings.showQRCode || settings.showBarcode) {
      totalHeight += settings.sectionSpacing + 100;
    }

    totalHeight += settings.margins.bottom;

    // Set canvas size
    canvas.width = settings.paperWidth;
    canvas.height = totalHeight;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentY = settings.margins.top;

    const setDefaultFont = () => {
      ctx.font = `${settings.fonts.body.weight} ${settings.fonts.body.size}px Inter`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
    };

    // Business name
    ctx.font = `${settings.fonts.header.weight} ${settings.fonts.header.size}px Inter`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = settings.fonts.header.align;
    const businessNameX = settings.fonts.header.align === 'center' 
      ? canvas.width / 2 
      : settings.fonts.header.align === 'right'
        ? canvas.width - settings.margins.right
        : settings.margins.left;
    ctx.fillText(settings.businessName, businessNameX, currentY);
    currentY += settings.fonts.header.size * settings.lineHeight + settings.itemSpacing;

    // Reset to default font for body content
    setDefaultFont();

    // Receipt number (maintain consistent spacing)
    if (settings.showReceiptNumber) {
      ctx.fillText(
        `${settings.receiptNumberPrefix}PREVIEW123`,
        settings.margins.left,
        currentY
      );
    }
    currentY += lineHeight;

    // Date/time (maintain consistent spacing)
    if (settings.showDateTime) {
      ctx.fillText(
        formatDateTime(sampleTransaction.timestamp),
        settings.margins.left,
        currentY
      );
    }
    currentY += lineHeight + settings.itemSpacing;

    // Customer info - ensure default font
    setDefaultFont();
    ctx.fillText(`Customer: ${sampleTransaction.customer}`, settings.margins.left, currentY);
    currentY += lineHeight;
    ctx.fillText(
      `Payment Method: ${sampleTransaction.paymentMethod.toUpperCase()}`,
      settings.margins.left,
      currentY
    );
    currentY += lineHeight + settings.sectionSpacing;

    // Items
    setDefaultFont();
    ctx.fillText('Items:', settings.margins.left, currentY);
    currentY += lineHeight;

    sampleTransaction.orderDetails!.items.forEach(item => {
      setDefaultFont();
      const itemText = `${item.quantity}x ${item.name}`;
      ctx.textAlign = 'left';
      ctx.fillText(itemText, settings.margins.left, currentY);
      
      ctx.textAlign = 'right';
      ctx.fillText(
        formatRupiah(item.price * item.quantity),
        canvas.width - settings.margins.right,
        currentY
      );
      currentY += lineHeight;
    });

    // Shipping
    if (sampleTransaction.orderDetails?.shippingAmount) {
      currentY += settings.itemSpacing;
      setDefaultFont();
      ctx.textAlign = 'left';
      ctx.fillText('Shipping:', settings.margins.left, currentY);
      ctx.textAlign = 'right';
      ctx.fillText(
        formatRupiah(sampleTransaction.orderDetails.shippingAmount),
        canvas.width - settings.margins.right,
        currentY
      );
      currentY += lineHeight;

      if (sampleTransaction.orderDetails.shippingAddress) {
        currentY += settings.itemSpacing;
        ctx.textAlign = 'left';
        ctx.fillText('Shipping Address:', settings.margins.left, currentY);
        currentY += lineHeight;
        const addressLines = sampleTransaction.orderDetails.shippingAddress.split('\n');
        addressLines.forEach(line => {
          ctx.fillText(line, settings.margins.left + 10, currentY);
          currentY += lineHeight;
        });
      }
    }

    // Totals
    currentY += settings.sectionSpacing;
    setDefaultFont();
    const subtotal = sampleTransaction.orderDetails!.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    
    ctx.textAlign = 'left';
    ctx.fillText('Subtotal:', settings.margins.left, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(
      formatRupiah(subtotal),
      canvas.width - settings.margins.right,
      currentY
    );
    currentY += lineHeight;

    const shipping = sampleTransaction.orderDetails?.shippingAmount || 0;
    if (shipping > 0) {
      ctx.textAlign = 'left';
      ctx.fillText('Shipping:', settings.margins.left, currentY);
      ctx.textAlign = 'right';
      ctx.fillText(
        formatRupiah(shipping),
        canvas.width - settings.margins.right,
        currentY
      );
      currentY += lineHeight;
    }

    const total = subtotal + shipping;
    ctx.font = `bold ${settings.fonts.body.size}px Inter`;
    ctx.textAlign = 'left';
    ctx.fillText('Total:', settings.margins.left, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(
      formatRupiah(total),
      canvas.width - settings.margins.right,
      currentY
    );
    currentY += lineHeight + settings.sectionSpacing;

    // Footer
    ctx.font = `${settings.fonts.footer.weight} ${settings.fonts.footer.size}px Inter`;
    ctx.textAlign = settings.fonts.footer.align;
    const footerX = settings.fonts.footer.align === 'center'
      ? canvas.width / 2
      : settings.fonts.footer.align === 'right'
        ? canvas.width - settings.margins.right
        : settings.margins.left;
    
    settings.footerText.split('\n').forEach(line => {
      ctx.fillText(line, footerX, currentY);
      currentY += settings.fonts.footer.size * settings.lineHeight;
    });

  }, [settings]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ maxWidth: `${settings.paperWidth}px`, margin: '0 auto' }}
      />
    </div>
  );
}