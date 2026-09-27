import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import POSRegister from './pages/POSRegister';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import SalesHistory from './pages/SalesHistory';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import PaymentModal from './components/pos/PaymentModal';
import ReceiptModal from './components/pos/ReceiptModal';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('landing');
  const { currentUser } = usePOS();

  return (
    <div className="flex flex-col h-screen bg-[#080C15] text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenLogin={() => setActiveTab('login')} 
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'landing' && (
          <LandingPage 
            onLaunchPOS={() => setActiveTab('register')} 
            onOpenLogin={() => setActiveTab('login')} 
          />
        )}
        {activeTab === 'login' && (
          <Login 
            onSuccess={() => setActiveTab('register')} 
            onBackToLanding={() => setActiveTab('landing')} 
          />
        )}
        {activeTab === 'register' && <POSRegister />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'purchases' && <Purchases />}
        {activeTab === 'expenses' && <Expenses />}
        {activeTab === 'sales' && <SalesHistory />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'staff' && <Staff />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Global Modals for Checkout Payment & Thermal Receipt */}
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
