import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { initialProducts, initialSettings, initialUsers, initialPurchases, initialExpenses } from './seedProducts.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Setting } from '../models/Setting.js';
import { User } from '../models/User.js';
import { Purchase } from '../models/Purchase.js';
import { Expense } from '../models/Expense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

let isMongoConnected = false;

// Fallback in-memory store
let localStore = {
  products: [...initialProducts.map((p, idx) => ({ ...p, _id: `prod_${Date.now()}_${idx}`, createdAt: new Date().toISOString() }))],
  orders: [],
  settings: { ...initialSettings },
  users: [...initialUsers],
  purchases: [...initialPurchases],
  expenses: [...initialExpenses]
};

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load local persistent file if exists
function loadLocalStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.products && parsed.products.length > 0) localStore.products = parsed.products;
      if (parsed.orders) localStore.orders = parsed.orders;
      if (parsed.settings) {
        localStore.settings = { ...initialSettings, ...parsed.settings };
        if (!Array.isArray(localStore.settings.productCategories) || localStore.settings.productCategories.length === 0) {
          localStore.settings.productCategories = [...initialSettings.productCategories];
        }
        if (!Array.isArray(localStore.settings.expenseCategories) || localStore.settings.expenseCategories.length === 0) {
          localStore.settings.expenseCategories = [...initialSettings.expenseCategories];
        }
        if (!Array.isArray(localStore.settings.paymentMethods) || localStore.settings.paymentMethods.length === 0) {
          localStore.settings.paymentMethods = [...initialSettings.paymentMethods];
        }
      }
      if (parsed.users && parsed.users.length > 0) {
        // Merge initial users if any are missing
        const userMap = new Map();
        initialUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
        parsed.users.forEach(u => userMap.set(u.email.toLowerCase(), u));
        localStore.users = Array.from(userMap.values());
      } else {
        localStore.users = [...initialUsers];
      }
      if (parsed.purchases) localStore.purchases = parsed.purchases;
      if (parsed.expenses) localStore.expenses = parsed.expenses;

      // Ensure every product has images array
      if (Array.isArray(localStore.products)) {
        localStore.products = localStore.products.map(p => {
          let imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
          return {
            ...p,
            image: imgs[0] || p.image || '',
            images: imgs
          };
        });
      }
    } else {
      saveLocalStore();
    }
  } catch (err) {
    console.error("Warning: Could not read local store.json, using defaults:", err.message);
  }
}

// Atomic file save with backup to prevent data corruption
function saveLocalStore() {
  try {
    const serialized = JSON.stringify(localStore, null, 2);
    const tempFile = `${DATA_FILE}.tmp`;
    const backupFile = `${DATA_FILE}.bak`;

    // Write to temp file first
    fs.writeFileSync(tempFile, serialized, 'utf-8');

    // Create backup of current file if it exists
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.copyFileSync(DATA_FILE, backupFile);
      } catch (e) {}
    }

    // Atomic rename
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error("Critical Error: Could not save store.json:", err.message);
  }
}

loadLocalStore();

export async function initDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_pos';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    console.log("Connected to MongoDB successfully!");

    // Seed initial products if DB is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      console.log("Seeded initial retail products into MongoDB.");
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create(initialSettings);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(initialUsers);
    }
  } catch (err) {
    isMongoConnected = false;
    console.log("Using persistent JSON database storage (data/store.json). Everything works smoothly!");
  }
}

export const db = {
  isUsingMongo: () => isMongoConnected,

  // ── Authentication & Users ──
  async loginUser({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user || user.password !== password) {
        throw new Error("Invalid email or password");
      }
      return { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    } else {
      const user = localStore.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password. Use demo login or credentials.");
      }
      return { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    }
  },

  async getUsers() {
    if (isMongoConnected) {
      return await User.find({}, '-password');
    } else {
      return localStore.users.map(({ password, ...u }) => u);
    }
  },

  async createUser(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    if (!cleanEmail || !userData.name || !userData.password) {
      throw new Error("Name, email, and password are required.");
    }

    if (isMongoConnected) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) throw new Error("A user with this email already exists!");
      const created = await User.create({
        ...userData,
        email: cleanEmail,
        role: userData.role || 'salesman',
        status: userData.status || 'active',
        phone: userData.phone || ''
      });
      const { password, ...safeUser } = created.toObject();
      return safeUser;
    } else {
      const existing = localStore.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) throw new Error("A user with this email already exists!");
      const newUser = {
        _id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: userData.name.trim(),
        email: cleanEmail,
        password: userData.password,
        role: userData.role || 'salesman',
        phone: userData.phone || '',
        status: userData.status || 'active',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      };
      localStore.users.push(newUser);
      saveLocalStore();
      const { password, ...safeUser } = newUser;
      return safeUser;
    }
  },

  async updateUser(id, updateData) {
    if (isMongoConnected) {
      const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) throw new Error("User not found");
      const { password, ...safeUser } = updated.toObject();
      return safeUser;
    } else {
      const idx = localStore.users.findIndex(u => u._id === id);
      if (idx === -1) throw new Error("User not found");
      localStore.users[idx] = { ...localStore.users[idx], ...updateData };
      saveLocalStore();
      const { password, ...safeUser } = localStore.users[idx];
      return safeUser;
    }
  },

  async deleteUser(id) {
    if (isMongoConnected) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) throw new Error("User not found");
      return { success: true };
    } else {
      const idx = localStore.users.findIndex(u => u._id === id);
      if (idx === -1) throw new Error("User not found");
      localStore.users.splice(idx, 1);
      saveLocalStore();
      return { success: true };
    }
  },

  // ── Products ──
  async getProducts({ search = '', category = '', lowStock = false }) {
    if (isMongoConnected) {
      const query = {};
      if (category && category !== 'All') query.category = category;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ];
      }
      if (lowStock === 'true' || lowStock === true) {
        query.$expr = { $lte: ['$stock', '$minStock'] };
      }
      return await Product.find(query).sort({ name: 1 });
    } else {
      return localStore.products.filter(p => {
        const matchesCategory = !category || category === 'All' || p.category.toLowerCase() === category.toLowerCase();
        const matchesSearch = !search || 
          p.name.toLowerCase().includes(search.toLowerCase()) || 
          p.barcode.toLowerCase().includes(search.toLowerCase());
        const matchesLowStock = !lowStock || (p.stock <= p.minStock);
        return matchesCategory && matchesSearch && matchesLowStock;
      });
    }
  },

  async getProductByBarcode(barcode) {
    if (isMongoConnected) {
      return await Product.findOne({ barcode });
    } else {
      return localStore.products.find(p => p.barcode === barcode) || null;
    }
  },

  async getProductById(id) {
    if (isMongoConnected) {
      return await Product.findById(id);
    } else {
      return localStore.products.find(p => p._id === id) || null;
    }
  },

  async createProduct(productData) {
    let images = Array.isArray(productData.images) && productData.images.length > 0 
      ? productData.images 
      : (productData.image ? [productData.image] : []);
    const image = images[0] || productData.image || '';

    if (isMongoConnected) {
      const existing = await Product.findOne({ barcode: productData.barcode });
      if (existing) throw new Error("A product with this barcode already exists!");
      return await Product.create({
        ...productData,
        image,
        images
      });
    } else {
      const existing = localStore.products.find(p => p.barcode === productData.barcode);
      if (existing) throw new Error("A product with this barcode already exists!");
      const newProduct = {
        ...productData,
        image,
        images,
        _id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString()
      };
      localStore.products.push(newProduct);
      saveLocalStore();
      return newProduct;
    }
  },

  async updateProduct(id, updateData) {
    let images = updateData.images;
    if (images && !Array.isArray(images)) images = [images];
    if (!images && updateData.image) images = [updateData.image];
    const image = (images && images.length > 0) ? images[0] : updateData.image;

    const finalData = { ...updateData };
    if (images !== undefined) finalData.images = images;
    if (image !== undefined) finalData.image = image;

    if (isMongoConnected) {
      const updated = await Product.findByIdAndUpdate(id, finalData, { new: true });
      if (!updated) throw new Error("Product not found");
      return updated;
    } else {
      const index = localStore.products.findIndex(p => p._id === id);
      if (index === -1) throw new Error("Product not found");
      localStore.products[index] = { ...localStore.products[index], ...finalData };
      saveLocalStore();
      return localStore.products[index];
    }
  },

  async deleteProduct(id) {
    if (isMongoConnected) {
      return await Product.findByIdAndDelete(id);
    } else {
      const index = localStore.products.findIndex(p => p._id === id);
      if (index === -1) throw new Error("Product not found");
      const deleted = localStore.products.splice(index, 1)[0];
      saveLocalStore();
      return deleted;
    }
  },

  // Stock operations
  async decrementStock(items) {
    for (const item of items) {
      const qty = Number(item.qty) || 1;
      if (isMongoConnected) {
        await Product.findOneAndUpdate(
          { $or: [{ _id: item.productId }, { barcode: item.barcode }] },
          { $inc: { stock: -qty } }
        );
      } else {
        const prod = localStore.products.find(p => p._id === item.productId || p.barcode === item.barcode);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - qty);
        }
      }
    }
    if (!isMongoConnected) saveLocalStore();
  },

  async incrementStock(items) {
    for (const item of items) {
      const qty = Number(item.qty) || 1;
      if (isMongoConnected) {
        await Product.findOneAndUpdate(
          { $or: [{ _id: item.productId }, { barcode: item.barcode }] },
          { $inc: { stock: qty } }
        );
      } else {
        const prod = localStore.products.find(p => p._id === item.productId || p.barcode === item.barcode);
        if (prod) {
          prod.stock += qty;
        }
      }
    }
    if (!isMongoConnected) saveLocalStore();
  },

  async createOrder(orderData) {
    if (isMongoConnected) {
      const order = await Order.create(orderData);
      await this.decrementStock(orderData.items);
      return order;
    } else {
      const newOrder = {
        ...orderData,
        _id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };
      localStore.orders.unshift(newOrder);
      await this.decrementStock(orderData.items);
      saveLocalStore();
      return newOrder;
    }
  },

  async updateOrder(id, updateData) {
    if (isMongoConnected) {
      const updated = await Order.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) throw new Error("Order not found");
      return updated;
    } else {
      const idx = localStore.orders.findIndex(o => o._id === id || o.orderNo === id);
      if (idx === -1) throw new Error("Order not found");
      localStore.orders[idx] = { ...localStore.orders[idx], ...updateData };
      saveLocalStore();
      return localStore.orders[idx];
    }
  },

  async deleteOrder(id) {
    if (isMongoConnected) {
      const order = await Order.findById(id);
      if (!order) throw new Error("Order not found");
      // Restore inventory stock
      if (order.items && order.items.length > 0) {
        await this.incrementStock(order.items);
      }
      await Order.findByIdAndDelete(id);
      return order;
    } else {
      const idx = localStore.orders.findIndex(o => o._id === id || o.orderNo === id);
      if (idx === -1) throw new Error("Order not found");
      const order = localStore.orders[idx];
      // Restore inventory stock
      if (order.items && order.items.length > 0) {
        await this.incrementStock(order.items);
      }
      localStore.orders.splice(idx, 1);
      saveLocalStore();
      return order;
    }
  },

  async getOrders({ limit = 50, search = '' } = {}) {
    if (isMongoConnected) {
      const query = {};
      if (search) {
        query.$or = [
          { orderNo: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } }
        ];
      }
      return await Order.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    } else {
      let res = [...localStore.orders];
      if (search) {
        const s = search.toLowerCase();
        res = res.filter(o => 
          (o.orderNo && o.orderNo.toLowerCase().includes(s)) ||
          (o.customerName && o.customerName.toLowerCase().includes(s))
        );
      }
      return res.slice(0, Number(limit));
    }
  },

  async getOrderById(id) {
    if (isMongoConnected) {
      return await Order.findById(id);
    } else {
      return localStore.orders.find(o => o._id === id || o.orderNo === id) || null;
    }
  },

  // ── Purchases (Stock In / Suppliers) ──
  async getPurchases() {
    if (isMongoConnected) {
      return await Purchase.find().sort({ createdAt: -1 });
    } else {
      return localStore.purchases || [];
    }
  },

  async createPurchase(purchaseData) {
    const purchaseNo = `PO-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullData = {
      ...purchaseData,
      purchaseNo,
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const purchase = await Purchase.create(fullData);
      await this.incrementStock(purchaseData.items);
      return purchase;
    } else {
      const newPurchase = {
        ...fullData,
        _id: `pur_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };
      localStore.purchases.unshift(newPurchase);
      await this.incrementStock(purchaseData.items);
      saveLocalStore();
      return newPurchase;
    }
  },

  async updatePurchase(id, updateData) {
    if (isMongoConnected) {
      const updated = await Purchase.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) throw new Error("Purchase record not found");
      return updated;
    } else {
      const idx = localStore.purchases.findIndex(p => p._id === id || p.purchaseNo === id);
      if (idx === -1) throw new Error("Purchase record not found");
      localStore.purchases[idx] = { ...localStore.purchases[idx], ...updateData };
      saveLocalStore();
      return localStore.purchases[idx];
    }
  },

  async deletePurchase(id) {
    if (isMongoConnected) {
      const p = await Purchase.findById(id);
      if (!p) throw new Error("Purchase record not found");
      if (p.items && p.items.length > 0) {
        await this.decrementStock(p.items);
      }
      await Purchase.findByIdAndDelete(id);
      return p;
    } else {
      const idx = localStore.purchases.findIndex(p => p._id === id || p.purchaseNo === id);
      if (idx === -1) throw new Error("Purchase record not found");
      const p = localStore.purchases[idx];
      if (p.items && p.items.length > 0) {
        await this.decrementStock(p.items);
      }
      localStore.purchases.splice(idx, 1);
      saveLocalStore();
      return p;
    }
  },

  // ── Expenses ──
  async getExpenses({ category = '' } = {}) {
    if (isMongoConnected) {
      const query = {};
      if (category && category !== 'All') query.category = category;
      return await Expense.find(query).sort({ date: -1 });
    } else {
      let list = localStore.expenses || [];
      if (category && category !== 'All') {
        list = list.filter(e => e.category === category);
      }
      return list;
    }
  },



  async createExpense(expenseData) {
    let images = Array.isArray(expenseData.receiptImages) && expenseData.receiptImages.length > 0
      ? expenseData.receiptImages
      : (expenseData.receiptImage ? [expenseData.receiptImage] : []);
    const fullData = {
      ...expenseData,
      receiptImage: images[0] || expenseData.receiptImage || '',
      receiptImages: images,
      date: expenseData.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    if (isMongoConnected) {
      return await Expense.create(fullData);
    } else {
      const newExpense = {
        ...fullData,
        _id: `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };
      localStore.expenses.unshift(newExpense);
      saveLocalStore();
      return newExpense;
    }
  },

  async updateExpense(id, updateData) {
    let images = updateData.receiptImages;
    if (images && !Array.isArray(images)) images = [images];
    if (!images && updateData.receiptImage) images = [updateData.receiptImage];
    const receiptImage = (images && images.length > 0) ? images[0] : updateData.receiptImage;

    const finalData = { ...updateData };
    if (images !== undefined) finalData.receiptImages = images;
    if (receiptImage !== undefined) finalData.receiptImage = receiptImage;

    if (isMongoConnected) {
      const updated = await Expense.findByIdAndUpdate(id, finalData, { new: true });
      if (!updated) throw new Error("Expense not found");
      return updated;
    } else {
      const index = localStore.expenses.findIndex(e => e._id === id);
      if (index === -1) throw new Error("Expense not found");
      localStore.expenses[index] = { ...localStore.expenses[index], ...finalData };
      saveLocalStore();
      return localStore.expenses[index];
    }
  },

  async deleteExpense(id) {
    if (isMongoConnected) {
      return await Expense.findByIdAndDelete(id);
    } else {
      const index = localStore.expenses.findIndex(e => e._id === id);
      if (index === -1) throw new Error("Expense not found");
      const deleted = localStore.expenses.splice(index, 1)[0];
      saveLocalStore();
      return deleted;
    }
  },

  // ── Settings ──
  async getSettings() {
    if (isMongoConnected) {
      let s = await Setting.findOne();
      if (!s) s = await Setting.create(initialSettings);
      return s;
    } else {
      return localStore.settings;
    }
  },

  async updateSettings(data) {
    if (isMongoConnected) {
      let s = await Setting.findOne();
      if (!s) return await Setting.create(data);
      return await Setting.findByIdAndUpdate(s._id, data, { new: true });
    } else {
      localStore.settings = { ...localStore.settings, ...data };
      saveLocalStore();
      return localStore.settings;
    }
  },

  // Dynamic Product Categories
  async addProductCategory(catName) {
    if (isMongoConnected) {
      const s = await this.getSettings();
      if (!s.productCategories.includes(catName)) {
        s.productCategories.push(catName);
        await s.save();
      }
      return s;
    } else {
      if (!localStore.settings.productCategories) localStore.settings.productCategories = [...initialSettings.productCategories];
      if (!localStore.settings.productCategories.includes(catName)) {
        localStore.settings.productCategories.push(catName);
        saveLocalStore();
      }
      return localStore.settings;
    }
  },

  async deleteProductCategory(catName) {
    if (isMongoConnected) {
      const s = await this.getSettings();
      s.productCategories = s.productCategories.filter(c => c !== catName);
      await s.save();
      return s;
    } else {
      if (!localStore.settings.productCategories) localStore.settings.productCategories = [...initialSettings.productCategories];
      localStore.settings.productCategories = localStore.settings.productCategories.filter(c => c !== catName);
      saveLocalStore();
      return localStore.settings;
    }
  },

  // Dynamic Expense Categories
  async addExpenseCategory(catName) {
    if (isMongoConnected) {
      const s = await this.getSettings();
      if (!s.expenseCategories.includes(catName)) {
        s.expenseCategories.push(catName);
        await s.save();
      }
      return s;
    } else {
      if (!localStore.settings.expenseCategories) localStore.settings.expenseCategories = [...initialSettings.expenseCategories];
      if (!localStore.settings.expenseCategories.includes(catName)) {
        localStore.settings.expenseCategories.push(catName);
        saveLocalStore();
      }
      return localStore.settings;
    }
  },

  async deleteExpenseCategory(catName) {
    if (isMongoConnected) {
      const s = await this.getSettings();
      s.expenseCategories = s.expenseCategories.filter(c => c !== catName);
      await s.save();
      return s;
    } else {
      if (!localStore.settings.expenseCategories) localStore.settings.expenseCategories = [...initialSettings.expenseCategories];
      localStore.settings.expenseCategories = localStore.settings.expenseCategories.filter(c => c !== catName);
      saveLocalStore();
      return localStore.settings;
    }
  },

  // Dynamic Payment Methods
  async addPaymentMethod(methodName) {
    if (isMongoConnected) {
      const s = await this.getSettings();
      if (!s.paymentMethods.includes(methodName)) {
        s.paymentMethods.push(methodName);
        await s.save();
      }
      return s;
    } else {
      if (!localStore.settings.paymentMethods) localStore.settings.paymentMethods = [...initialSettings.paymentMethods];
      if (!localStore.settings.paymentMethods.includes(methodName)) {
        localStore.settings.paymentMethods.push(methodName);
        saveLocalStore();
      }
      return localStore.settings;
    }
  },

  async deletePaymentMethod(methodName) {
    if (isMongoConnected) {
      const s = await this.getSettings();
      s.paymentMethods = s.paymentMethods.filter(m => m !== methodName);
      await s.save();
      return s;
    } else {
      if (!localStore.settings.paymentMethods) localStore.settings.paymentMethods = [...initialSettings.paymentMethods];
      localStore.settings.paymentMethods = localStore.settings.paymentMethods.filter(m => m !== methodName);
      saveLocalStore();
      return localStore.settings;
    }
  },

  // ── Advanced Analytics (Profit & Loss, COGS, Expenses) ──
  async getAnalytics() {
    let orders = [];
    let products = [];
    let expenses = [];
    let purchases = [];

    if (isMongoConnected) {
      orders = await Order.find();
      products = await Product.find();
      expenses = await Expense.find();
      purchases = await Purchase.find();
    } else {
      orders = localStore.orders || [];
      products = localStore.products || [];
      expenses = localStore.expenses || [];
      purchases = localStore.purchases || [];
    }

    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

    // Calculate Cost of Goods Sold (COGS) based on sold items
    let cogs = 0;
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        const prod = products.find(p => p._id === it.productId || p.barcode === it.barcode);
        const unitCost = prod ? Number(prod.costPrice || 0) : 0;
        cogs += unitCost * it.qty;
      });
    });

    const grossProfit = totalSales - cogs;
    const netProfit = grossProfit - totalExpenses;

    // Today's orders & expenses
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => new Date(o.createdAt).toISOString().slice(0, 10) === today);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayExpenses = expenses.filter(e => new Date(e.date).toISOString().slice(0, 10) === today)
                                  .reduce((sum, e) => sum + Number(e.amount), 0);

    // Low stock items count
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    // Top selling items
    const itemMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        if (!itemMap[it.name]) {
          itemMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
        }
        itemMap[it.name].qty += it.qty;
        itemMap[it.name].revenue += it.total;
      });
    });
    const topProducts = Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Payment methods breakdown
    const paymentBreakdown = {
      cash: orders.filter(o => o.paymentMethod === 'cash').length,
      card: orders.filter(o => o.paymentMethod === 'card').length,
      mobile_wallet: orders.filter(o => o.paymentMethod === 'mobile_wallet').length,
    };

    // Category wise expenses
    const expenseByCategory = {};
    expenses.forEach(e => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount);
    });

    return {
      todaySales,
      todayOrdersCount: todayOrders.length,
      todayExpenses,
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalExpenses,
      totalPurchases,
      cogs,
      grossProfit,
      netProfit,
      lowStockCount,
      topProducts,
      paymentBreakdown,
      expenseByCategory,
      recentOrders: orders.slice(0, 5)
    };
  }
};
