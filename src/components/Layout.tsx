import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import BottomNavigation from './BottomNavigation';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-14 md:pb-0">
      <Navigation />
      <main className="max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}