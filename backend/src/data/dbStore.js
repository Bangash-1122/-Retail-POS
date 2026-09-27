import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { initialProducts, initialSettings } from './seedProducts.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Setting } from '../models/Setting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

let isMongoConnected = false;

// Fallback in-memory store
let localStore = {
  products: [...initialProducts.map((p, idx) => ({ ...p, _id: `prod_${Date.now()}_${idx}`, createdAt: new Date().toISOString() }))],
  orders: [],
  settings: { ...initialSettings }
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
      if (parsed.products && parsed.products.length > 0) {
        localStore.products = parsed.products;
      }
      if (parsed.orders) {
        localStore.orders = parsed.orders;
      }
      if (parsed.settings) {
        localStore.settings = { ...initialSettings, ...parsed.settings };
      }
    } else {
      saveLocalStore();
    }
  } catch (err) {
    console.error("Warning: Could not read local store.json, using defaults:", err.message);
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error("Warning: Could not save store.json:", err.message);
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
      console.log("Seeded initial settings into MongoDB.");
    }
  } catch (err) {
    isMongoConnected = false;
    console.log("MongoDB is not running locally. Using persistent JSON database storage (data/store.json). Everything works smoothly!");
  }
}

export const db = {
  isUsingMongo: () => isMongoConnected,

  // Products
  async getProducts({ search = '', category = '', lowStock = false }) {
    if (isMongoConnected) {
      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
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

  async createProduct(data) {
    if (isMongoConnected) {
      return await Product.create(data);
    } else {
      const exists = localStore.products.find(p => p.barcode === data.barcode);
      if (exists) {
        throw new Error(`Product with barcode "${data.barcode}" already exists.`);
      }
      const newProduct = {
        ...data,
        _id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStore.products.unshift(newProduct);
      saveLocalStore();
      return newProduct;
    }
  },

  async updateProduct(id, data) {
    if (isMongoConnected) {
      return await Product.findByIdAndUpdate(id, data, { new: true });
    } else {
      const index = localStore.products.findIndex(p => p._id === id);
      if (index === -1) throw new Error("Product not found");
      localStore.products[index] = {
        ...localStore.products[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
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

  // Decrement inventory when sale completed
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
    if (!isMongoConnected) {
      saveLocalStore();
    }
  },

  // Orders
  async createOrder(orderData) {
    if (isMongoConnected) {
      const order = await Order.create(orderData);
      await this.decrementStock(orderData.items);
      return order;
    } else {
      const newOrder = {
        ...orderData,
        _id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString()
      };
      localStore.orders.unshift(newOrder);
      await this.decrementStock(orderData.items);
      saveLocalStore();
      return newOrder;
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

  // Settings
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
      if (!s) {
        return await Setting.create(data);
      } else {
        return await Setting.findByIdAndUpdate(s._id, data, { new: true });
      }
    } else {
      localStore.settings = { ...localStore.settings, ...data };
      saveLocalStore();
      return localStore.settings;
    }
  },

  // Analytics
  async getAnalytics() {
    let orders = [];
    let products = [];
    if (isMongoConnected) {
      orders = await Order.find();
      products = await Product.find();
    } else {
      orders = localStore.orders;
      products = localStore.products;
    }

    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;

    // Today's orders
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
      return orderDate === today;
    });
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

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

    return {
      todaySales,
      todayOrdersCount: todayOrders.length,
      totalSales,
      totalOrders,
      totalProducts: products.length,
      lowStockCount,
      topProducts,
      paymentBreakdown,
      recentOrders: orders.slice(0, 5)
    };
  }
};
