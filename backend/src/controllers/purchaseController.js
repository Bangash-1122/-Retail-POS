import { db } from '../data/dbStore.js';

export const getPurchases = async (req, res) => {
  try {
    const purchases = await db.getPurchases();
    res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { supplierName, supplierPhone, items, totalAmount, paidAmount, paymentStatus, notes, createdBy } = req.body;
    if (!supplierName || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Supplier name and items are required" });
    }

    const purchase = await db.createPurchase({
      supplierName,
      supplierPhone: supplierPhone || '',
      items,
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount || totalAmount),
      paymentStatus: paymentStatus || 'paid',
      notes: notes || '',
      createdBy: createdBy || 'Admin'
    });

    res.status(201).json({
      success: true,
      message: "Purchase recorded and inventory updated!",
      data: purchase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updatePurchase(id, req.body);
    res.json({ success: true, message: "Purchase record updated!", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deletePurchase(id);
    res.json({ success: true, message: "Purchase deleted and inward inventory reversed!", data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

