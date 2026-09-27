import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'manager', 'salesman', 'cashier'], 
    default: 'salesman' 
  },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
