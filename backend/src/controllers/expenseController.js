import { db } from '../data/dbStore.js';

export const getExpenses = async (req, res) => {
  try {
    const { category } = req.query;
    const expenses = await db.getExpenses({ category });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, date, notes, receiptImage, receiptImages, recordedBy } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: "Title and amount are required" });
    }

    const images = Array.isArray(receiptImages) && receiptImages.length > 0
      ? receiptImages
      : (receiptImage ? [receiptImage] : []);

    const expense = await db.createExpense({
      title: title.trim(),
      category: category || 'Other',
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      date: date || new Date().toISOString(),
      notes: notes || '',
      receiptImage: images[0] || '',
      receiptImages: images,
      recordedBy: recordedBy || 'Admin'
    });

    res.status(201).json({
      success: true,
      message: "Expense recorded successfully!",
      data: expense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateExpense(id, req.body);
    res.json({
      success: true,
      message: "Expense updated successfully!",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteExpense(id);
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
