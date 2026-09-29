import React, { useState, useEffect } from 'react';
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

const VALID_ROUTES = [
  'landing',
  'login',
  'register',
  'inventory',
  'purchases',
  'expenses',
  'sales',
  'dashboard',
  'staff',
  'settings'
];

function getInitialRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase().trim();
  if (VALID_ROUTES.includes(hash)) {
    return hash;
  }
  // Also check pathname (e.g. /register)
  const path = window.location.pathname.replace(/^\//, '').toLowerCase().trim();
  if (VALID_ROUTES.includes(path)) {
    return path;
  }
  return 'landing';
}

function MainLayout() {
  const [activeTab, setActiveTabState] = useState(getInitialRoute);
  const { currentUser } = usePOS();

  // Synchronize activeTab with URL hash
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (window.location.hash !== `#/${tab}`) {
      window.history.pushState(null, '', `#/${tab}`);
    }
  };

  // Listen to browser Back/Forward (popstate & hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      const currentRoute = getInitialRoute();
      setActiveTabState(currentRoute);
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Global Keyboard Shortcuts (F9 Fullscreen, Alt+1-8 Navigation, F2 Quick Register)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // F9: Fullscreen toggle
      if (e.key === 'F9') {
        e.preventDefault();
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        return;
      }

      // Alt + Number: Tab Switcher
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const tabMap = {
          '1': 'register',
          '2': 'inventory',
          '3': 'purchases',
          '4': 'expenses',
          '5': 'sales',
          '6': 'dashboard',
          '7': 'staff',
          '8': 'settings'
        };
        if (tabMap[e.key]) {
          e.preventDefault();
          setActiveTab(tabMap[e.key]);
          return;
        }
      }

      // If F2 is pressed and not currently in register, jump to register
      if (e.key === 'F2' && activeTab !== 'register') {
        e.preventDefault();
        setActiveTab('register');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab]);

  return (
    <div className="flex flex-col h-screen bg-[#080C15] text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenLogin={() => setActiveTab('login')} 
      />

      {/* Main Tab / Page Routing Content */}
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