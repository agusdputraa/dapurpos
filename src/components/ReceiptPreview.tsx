import React, { useRef, useEffect } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/format';
import { formatDateTime } from '../utils/dateUtils';
import { DEFAULT_RECEIPT_SETTINGS } from '../types';

interface ReceiptPreviewProps {
  transaction: Transaction;
  settings?: typeof DEFAULT_RECEIPT_SETTINGS;
}

export default function ReceiptPreview({ 
  transaction, 
  settings = DEFAULT_RECEIPT_SETTINGS 
}: ReceiptPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mergedSettings = {
      ...DEFAULT_RECEIPT_SETTINGS,
      ...settings,
      margins: {
        ...DEFAULT_RECEIPT_SETTINGS.margins,
        ...(settings?.margins || {})
      },
      fonts: {
        ...DEFAULT_RECEIPT_SETTINGS.fonts,
        ...(settings?.fonts || {})
      }
    };

    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, align: 'left' | 'center' | 'right' = 'left', isItalic = false): number => {
      const lines = wrapText(text, maxWidth);
      const lineHeight = ctx.measureText('M').actualBoundingBoxAscent + ctx.measureText('M').actualBoundingBoxDescent;
      
      const originalFont = ctx.font;
      if (isItalic) {
        ctx.font = ctx.font.replace(/normal|italic|oblique/, 'italic');
      }

      lines.forEach((line, i) => {
        ctx.textAlign = align;
        let xPos = x;
        if (align === 'center') {
          xPos = canvas.width / 2;
        } else if (align === 'right') {
          xPos = canvas.width - mergedSettings.margins.right;
        }
        ctx.fillText(line, xPos, y + (i * lineHeight * mergedSettings.lineHeight));
      });

      if (isItalic) {
        ctx.font = originalFont;
      }

      return y + (lines.length * lineHeight * mergedSettings.lineHeight);
    };

    let totalHeight = mergedSettings.margins.top;
    const lineHeight = mergedSettings.fonts.body.size * mergedSettings.lineHeight;

    totalHeight += mergedSettings.fonts.header.size * mergedSettings.lineHeight * 2;
    totalHeight += lineHeight * 6;

    if (transaction.orderDetails?.items) {
      transaction.orderDetails.items.forEach(item => {
        totalHeight += lineHeight * 2;
        if (item.selectedToppings?.length) {
          totalHeight += lineHeight * item.selectedToppings.length;
        }
        if (item.notes) {
          totalHeight += lineHeight * 1.5;
        }
      });
    }

    totalHeight += lineHeight * 6;
    totalHeight += mergedSettings.margins.bottom;

    if (settings.showQRCode && settings.qrImage) {
      totalHeight += 120 + mergedSettings.sectionSpacing;
    }

    canvas.width = mergedSettings.paperWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentY = mergedSettings.margins.top;

    const drawReceipt = () => {
      ctx.font = `${mergedSettings.fonts.header.weight} ${mergedSettings.fonts.header.size}px Inter`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      currentY = drawWrappedText(
        mergedSettings.businessName,
        canvas.width / 2,
        currentY,
        canvas.width - (mergedSettings.margins.left + mergedSettings.margins.right),
        'center'
      );
      currentY += lineHeight;

      ctx.font = `${mergedSettings.fonts.body.weight} ${mergedSettings.fonts.body.size}px Inter`;
      
      if (mergedSettings.showReceiptNumber) {
        ctx.textAlign = 'left';
        currentY = drawWrappedText(
          `Receipt: #${transaction.id.slice(0, 8)}`,
          mergedSettings.margins.left,
          currentY,
          canvas.width - (mergedSettings.margins.left + mergedSettings.margins.right)
        );
      }

      if (mergedSettings.showDateTime) {
        currentY = drawWrappedText(
          `Date: ${formatDateTime(transaction.timestamp)}`,
          mergedSettings.margins.left,
          currentY + lineHeight/2,
          canvas.width - (mergedSettings.margins.left + mergedSettings.margins.right)
        );
      }

      currentY = drawWrappedText(
        `Customer: ${transaction.customer}`,
        mergedSettings.margins.left,
        currentY + lineHeight/2,
        canvas.width - (mergedSettings.margins.left + mergedSettings.margins.right)
      );

      currentY = drawWrappedText(
        `Payment: ${transaction.paymentMethod.toUpperCase()}`,
        mergedSettings.margins.left,
        currentY + lineHeight/2,
        canvas.width - (mergedSettings.margins.left + mergedSettings.margins.right)
      );
      currentY += lineHeight;

      if (transaction.orderDetails?.items) {
        transaction.orderDetails.items.forEach(item => {
          const itemText = `${item.quantity}x ${item.name}`;
          const priceText = formatRupiah(item.price * item.quantity);
          const itemWidth = ctx.measureText(itemText).width;
          const priceWidth = ctx.measureText(priceText).width;
          const availableWidth = canvas.width - mergedSettings.margins.left - mergedSettings.margins.right - priceWidth - 20;

          if (itemWidth > availableWidth) {
            const lines = wrapText(itemText, availableWidth);
            lines.forEach((line, i) => {
              ctx.textAlign = 'left';
              ctx.fillText(line, mergedSettings.margins.left, currentY + (i * lineHeight));
              if (i === lines.length - 1) {
                ctx.textAlign = 'right';
                ctx.fillText(priceText, canvas.width - mergedSettings.margins.right, currentY + (i * lineHeight));
              }
            });
            currentY += lines.length * lineHeight;
          } else {
            ctx.textAlign = 'left';
            ctx.fillText(itemText, mergedSettings.margins.left, currentY);
            ctx.textAlign = 'right';
            ctx.fillText(priceText, canvas.width - mergedSettings.margins.right, currentY);
            currentY += lineHeight;
          }

          if (item.selectedToppings?.length) {
            item.selectedToppings.forEach(topping => {
              const toppingText = `  + ${topping.name}`;
              const toppingPrice = formatRupiah(topping.price);
              ctx.textAlign = 'left';
              ctx.fillText(toppingText, mergedSettings.margins.left + 20, currentY);
              ctx.textAlign = 'right';
              ctx.fillText(toppingPrice, canvas.width - mergedSettings.margins.right, currentY);
              currentY += lineHeight;
            });
          }

          if (item.notes) {
            currentY += lineHeight * 0.25;
            ctx.textAlign = 'left';
            currentY = drawWrappedText(
              `Note: ${item.notes}`,
              mergedSettings.margins.left + 20,
              currentY,
              canvas.width - (mergedSettings.margins.left + mergedSettings.margins.right + 40),
              'left',
              true
            );
            currentY += lineHeight * 0.25;
          }
        });
      }

      currentY += lineHeight;
      
      ctx.textAlign = 'left';
      ctx.fillText('Total:', mergedSettings.margins.left, currentY);
      ctx.textAlign = 'right';
      ctx.fillText(formatRupiah(transaction.amount), canvas.width - mergedSettings.margins.right, currentY);
      currentY += lineHeight;

      if (transaction.paymentMethod === 'cash') {
        ctx.textAlign = 'left';
        ctx.fillText('Payment:', mergedSettings.margins.left, currentY);
        ctx.textAlign = 'right';
        ctx.fillText(formatRupiah(transaction.paymentAmount), canvas.width - mergedSettings.margins.right, currentY);
        currentY += lineHeight;

        ctx.textAlign = 'left';
        ctx.fillText('Change:', mergedSettings.margins.left, currentY);
        ctx.textAlign = 'right';
        ctx.fillText(formatRupiah(transaction.change), canvas.width - mergedSettings.margins.right, currentY);
        currentY += lineHeight;
      }

      if (settings.showQRCode && settings.qrImage) {
        currentY += mergedSettings.sectionSpacing;
        const qrImage = new Image();
        qrImage.onload = () => {
          const qrSize = 100;
          const qrX = (canvas.width - qrSize) / 2;
          ctx.drawImage(qrImage, qrX, currentY, qrSize, qrSize);
        };
        qrImage.src = settings.qrImage;
        currentY += 120;
      }

      currentY += mergedSettings.sectionSpacing;
      ctx.font = `${mergedSettings.fonts.footer.weight} ${mergedSettings.fonts.footer.size}px Inter`;
      const footerLines = mergedSettings.footerText.split('\n');
      footerLines.forEach(line => {
        ctx.textAlign = 'center';
        ctx.fillText(line, canvas.width / 2, currentY);
        currentY += mergedSettings.fonts.footer.size * mergedSettings.lineHeight;
      });
    };

    drawReceipt();
  }, [transaction, settings]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <canvas
        ref={canvasRef}
        className="w-full h-auto bg-white"
        style={{ 
          maxWidth: `${settings?.paperWidth || DEFAULT_RECEIPT_SETTINGS.paperWidth}px`,
          margin: '0 auto'
        }}
      />
    </div>
  );
}