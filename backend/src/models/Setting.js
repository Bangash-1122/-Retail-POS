import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  storeName: { type: String, default: "AL-MADINA SUPER MART" },
  storeTagline: { type: String, default: "Quality & Value Every Day" },
  address: { type: String, default: "Shop #14-B, Commercial Market, Main Boulevard" },
  city: { type: String, default: "Lahore, Pakistan" },
  phone: { type: String, default: "+92 300 9876543" },
  ntn: { type: String, default: "TRN-9843210-9" },
  currency: { type: String, default: "Rs." },
  taxRate: { type: Number, default: 5 },
  paperWidth: { type: String, enum: ['80mm', '58mm'], default: '80mm' },
  receiptFooter: { type: String, default: "Goods once sold can be exchanged within 3 days with receipt.\nThank you for shopping with us!" },
  enableBeep: { type: Boolean, default: true },
  autoPrintReceipt: { type: Boolean, default: true }
}, { timestamps: true });

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
