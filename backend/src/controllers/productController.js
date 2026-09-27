import { db } from '../data/dbStore.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    const products = await db.getProducts({ search, category, lowStock });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await db.getProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { barcode, name, category, price, costPrice, stock, minStock, image } = req.body;
    if (!barcode || !name || price === undefined) {
      return res.status(400).json({ success: false, message: "Barcode, name, and price are required." });
    }
    const product = await db.createProduct({
      barcode: barcode.trim(),
      name: name.trim(),
      category: category || 'General',
      price: Number(price),
      costPrice: Number(costPrice || 0),
      stock: Number(stock || 0),
      minStock: Number(minStock || 5),
      image: image || ''
    });
    res.status(201).json({ success: true, data: product, message: "Product created successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.updateProduct(id, req.body);
    res.json({ success: true, data: product, message: "Product updated successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
