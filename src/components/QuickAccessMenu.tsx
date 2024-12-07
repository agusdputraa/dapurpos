import React from 'react';
import { useLocation } from 'react-router-dom';

interface QuickAccessMenuProps {
  onViewReport: () => void;
  onReceiptSettings: () => void;
}

export default function QuickAccessMenu({
  onViewReport,
  onReceiptSettings,
}: QuickAccessMenuProps) {
  const location = useLocation();

  // Don't show the menu if we're not on the main register page
  if (location.pathname !== '/') {
    return null;
  }

  return null;
}