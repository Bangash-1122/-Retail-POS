import { db } from '../data/dbStore.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json({ success: true, message: "Settings saved successfully!", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    if (type === 'expense') {
      await db.addExpenseCategory(name.trim());
    } else {
      await db.addProductCategory(name.trim());
    }
    const settings = await db.getSettings();
    res.json({ success: true, message: "Category added successfully!", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Payment method name is required" });
    }
    await db.addPaymentMethod(name.trim());
    const settings = await db.getSettings();
    res.json({ success: true, message: "Payment method added successfully!", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    if (type === 'expense') {
      await db.deleteExpenseCategory(name.trim());
    } else {
      await db.deleteProductCategory(name.trim());
    }
    const settings = await db.getSettings();
    res.json({ success: true, message: "Category removed successfully!", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Payment method name is required" });
    }
    await db.deletePaymentMethod(name.trim());
    const settings = await db.getSettings();
    res.json({ success: true, message: "Payment method removed successfully!", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

