import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  barcode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    required: true,
  }
});

const orderSchema = new mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
  },
  change: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_wallet', 'other'],
    default: 'cash',
  },
  customerName: {
    type: String,
    default: 'Walk-in Customer',
  },
  customerPhone: {
    type: String,
    default: '',
  },
  cashier: {
    type: String,
    default: 'Admin',
  },
  status: {
    type: String,
    enum: ['completed', 'refunded', 'cancelled'],
    default: 'completed',
  }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
