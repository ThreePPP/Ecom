import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.put('/:productId', authenticate, updateCartItem);
router.delete('/:productId', authenticate, removeFromCart);
router.delete('/', authenticate, clearCart);

export default router;
