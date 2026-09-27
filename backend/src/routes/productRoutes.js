import express from 'express';
import {
  getProducts,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
