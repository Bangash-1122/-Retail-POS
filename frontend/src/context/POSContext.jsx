import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { playBeep, playSuccessSound } from '../utils/sound';

const POSContext = createContext();

export function POSProvider({ children }) {
  // Current logged in user (Admin by default or from localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('retail_pos_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      _id: "user_admin_01",
      name: "Muhammad Ubaid",
      email: "admin@retailpos.com",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
  });

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
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

  // Auth operations
  const login = async (email, password) => {
    const res = await api.login({ email, password });
    setCurrentUser(res.data);
    localStorage.setItem('retail_pos_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('retail_pos_user');
  };

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

  // Load Purchases
  const loadPurchases = useCallback(async () => {
    try {
      const res = await api.getPurchases();
      setPurchases(res.data || []);
    } catch (err) {
      console.warn("Could not fetch purchases:", err);
    }
  }, []);

  // Load Expenses
  const loadExpenses = useCallback(async (params = {}) => {
    try {
      const res = await api.getExpenses(params);
      setExpenses(res.data || []);
    } catch (err) {
      console.warn("Could not fetch expenses:", err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadProducts();
    loadPurchases();
    loadExpenses();
  }, [loadSettings, loadProducts, loadPurchases, loadExpenses]);

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

  // Quick Cash Sale [F8 Shortcut]
  const quickCashSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty! Add products first before checking out.");
      return null;
    }
    try {
      const orderPayload = {
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone || '',
        items: cart.map(i => ({
          productId: i.productId,
          barcode: i.barcode,
          name: i.name,
          price: i.price,
          qty: i.qty,
          total: i.total
        })),
        subtotal,
        discount: Number(discount || 0),
        taxRate: applyTax ? (settings.taxRate || 0) : 0,
        taxAmount,
        total: netTotal,
        paymentMethod: 'cash',
        amountPaid: netTotal,
        changeDue: 0,
        status: 'completed',
        cashier: currentUser?.name || 'Cashier',
        notes: 'Instant Cash Checkout [F8]'
      };

      const res = await api.createOrder(orderPayload);
      playSuccessSound(settings.enableBeep);
      clearCart();
      loadProducts();
      triggerPrintReceipt(res.data);
      return res.data;
    } catch (err) {
      alert("Quick checkout failed: " + err.message);
      return null;
    }
  };

  // Category & Payment Dynamic Operations
  const addCategory = async (type, name) => {
    try {
      const res = await api.addCategory(type, name);
      if (res.data) setSettings(res.data);
      return res.data;
    } catch (err) {
      console.error("Error adding category:", err);
      throw err;
    }
  };

  const deleteCategory = async (type, name) => {
    try {
      const res = await api.deleteCategory(type, name);
      if (res.data) setSettings(res.data);
      return res.data;
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  };

  const addPaymentMethod = async (name) => {
    try {
      const res = await api.addPaymentMethod(name);
      if (res.data) setSettings(res.data);
      return res.data;
    } catch (err) {
      console.error("Error adding payment method:", err);
      throw err;
    }
  };

  const deletePaymentMethod = async (name) => {
    try {
      const res = await api.deletePaymentMethod(name);
      if (res.data) setSettings(res.data);
      return res.data;
    } catch (err) {
      console.error("Error deleting payment method:", err);
      throw err;
    }
  };

  return (
    <POSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        products,
        loadingProducts,
        loadProducts,
        purchases,
        loadPurchases,
        expenses,
        loadExpenses,
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
        quickCashSale,
        addCategory,
        deleteCategory,
        addPaymentMethod,
        deletePaymentMethod,
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
