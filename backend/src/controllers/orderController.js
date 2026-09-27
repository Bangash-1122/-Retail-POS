import { db } from '../data/dbStore.js';

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomNum}`;
}

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      discount = 0,
      tax = 0,
      total,
      paidAmount,
      change = 0,
      paymentMethod = 'cash',
      customerName = 'Walk-in Customer',
      customerPhone = '',
      cashier = 'Admin'
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty." });
    }

    const orderNo = generateOrderNumber();

    const orderData = {
      orderNo,
      items,
      subtotal: Number(subtotal),
      discount: Number(discount),
      tax: Number(tax),
      total: Number(total),
      paidAmount: Number(paidAmount || total),
      change: Number(change || 0),
      paymentMethod,
      customerName,
      customerPhone,
      cashier,
      createdAt: new Date().toISOString()
    };

    const newOrder = await db.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: "Order completed successfully!",
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { limit = 50, search = '' } = req.query;
    const orders = await db.getOrders({ limit, search });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateOrder(id, req.body);
    res.json({ success: true, message: "Order updated successfully!", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteOrder(id);
    res.json({ success: true, message: "Order voided/deleted and inventory restored!", data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

