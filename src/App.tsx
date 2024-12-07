import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CashRegister from './pages/CashRegister';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CashRegister />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="products" element={<Products />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;