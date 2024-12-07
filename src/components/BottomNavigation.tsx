import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, Package } from 'lucide-react';

export default function BottomNavigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Register' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="grid grid-cols-4 h-14">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center gap-0.5 ${
              isActive(path)
                ? 'text-green-600'
                : 'text-gray-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}