import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    default: 'General'
  },
  amount: { type: Number, required: true, min: 1 },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  receiptImage: { type: String, default: '' },
  receiptImages: { type: [String], default: [] },
  recordedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
