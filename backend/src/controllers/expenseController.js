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
    const { title, category, amount, paymentMethod, date, notes, receiptImage, recordedBy } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: "Title and amount are required" });
    }

    const expense = await db.createExpense({
      title: title.trim(),
      category: category || 'Other',
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      date: date || new Date().toISOString(),
      notes: notes || '',
      receiptImage: receiptImage || '',
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

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteExpense(id);
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
