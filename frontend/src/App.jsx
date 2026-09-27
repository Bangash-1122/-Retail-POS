import React, { useState } from 'react';
import { POSProvider } from './context/POSContext';
import Navbar from './components/Navbar';
import POSRegister from './pages/POSRegister';
import Inventory from './pages/Inventory';
import SalesHistory from './pages/SalesHistory';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PaymentModal from './components/pos/PaymentModal';
import ReceiptModal from './components/pos/ReceiptModal';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="flex flex-col h-screen bg-[#0B0F19] text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Tab Content */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'register' && <POSRegister />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'sales' && <SalesHistory />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Modals for Payment and Thermal Receipt */}
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
