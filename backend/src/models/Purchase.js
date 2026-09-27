import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  barcode: { type: String, required: true },
  name: { type: String, required: true },
  costPrice: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true },
});

const purchaseSchema = new mongoose.Schema({
  purchaseNo: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, default: '' },
  items: [purchaseItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
  paidAmount: { type: Number, required: true },
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Admin' },
}, { timestamps: true });

export const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
