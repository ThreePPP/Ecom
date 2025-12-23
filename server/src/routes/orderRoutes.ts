import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
} from '../controllers/orderController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/admin/all', authenticate, isAdmin, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/pay', authenticate, updateOrderToPaid);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);
router.delete('/:id', authenticate, isAdmin, deleteOrder);

export default router;
