import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { playBeep, playSuccessSound } from '../utils/sound';

const POSContext = createContext();

export function POSProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });
  const [settings, setSettings] = useState({
    storeName: "AL-MADINA SUPER MART",
    storeTagline: "Quality & Value Every Day",
    address: "Shop #14-B, Commercial Market, Main Boulevard",
    city: "Lahore, Pakistan",
    phone: "+92 300 9876543",
    ntn: "TRN-9843210-9",
    currency: "Rs.",
    taxRate: 5,
    paperWidth: "80mm",
    receiptFooter: "Goods once sold can be exchanged within 3 days with receipt.\nThank you for shopping with us!",
    enableBeep: true,
    autoPrintReceipt: true
  });

  // Modals & Active Receipt
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Load Settings
  const loadSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.warn("Could not load settings:", err);
    }
  }, []);

  // Load Products
  const loadProducts = useCallback(async (params = {}) => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts(params);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Could not fetch products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadProducts();
  }, [loadSettings, loadProducts]);

  // Cart Operations
  const addToCart = (product, qty = 1) => {
    if (!product || product.stock <= 0) {
      alert(`"${product?.name}" is out of stock!`);
      return;
    }

    playBeep(settings.enableBeep);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.productId === (product._id || product.id));
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].qty + qty;
        if (newQty > product.stock) {
          alert(`Cannot add more than available stock (${product.stock})!`);
          return prevCart;
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          total: newQty * updated[existingIndex].price
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            productId: product._id || product.id,
            barcode: product.barcode,
            name: product.name,
            category: product.category,
            price: Number(product.price),
            costPrice: Number(product.costPrice || 0),
            qty: qty,
            total: qty * Number(product.price),
            stock: product.stock,
            image: product.image
          }
        ];
      }
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          if (item.stock && newQty > item.stock) {
            alert(`Stock limit reached! Only ${item.stock} available.`);
            return item;
          }
          return { ...item, qty: newQty, total: newQty * item.price };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomer({ name: 'Walk-in Customer', phone: '' });
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = applyTax ? Math.round((subtotal * (settings.taxRate || 0)) / 100) : 0;
  const netTotal = Math.max(0, subtotal + taxAmount - Number(discount || 0));

  // Trigger Universal Thermal Printing
  const triggerPrintReceipt = (orderData) => {
    setActiveReceipt(orderData);
    setIsReceiptModalOpen(true);
    if (settings.autoPrintReceipt) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  return (
    <POSContext.Provider
      value={{
        products,
        loadingProducts,
        loadProducts,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        discount,
        setDiscount,
        applyTax,
        setApplyTax,
        customer,
        setCustomer,
        subtotal,
        taxAmount,
        netTotal,
        settings,
        setSettings,
        loadSettings,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        activeReceipt,
        setActiveReceipt,
        triggerPrintReceipt,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) throw new Error("usePOS must be used within a POSProvider");
  return context;
}
