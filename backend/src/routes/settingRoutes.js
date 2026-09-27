import express from 'express';
import { 
  getSettings, 
  updateSettings, 
  addCategory, 
  deleteCategory, 
  addPaymentMethod, 
  deletePaymentMethod 
} from '../controllers/settingController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/category', addCategory);
router.delete('/category', deleteCategory);
router.post('/payment-method', addPaymentMethod);
router.delete('/payment-method', deletePaymentMethod);

export default router;

