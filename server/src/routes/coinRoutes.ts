import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getCoinTransactions,
  addCoins,
  spendCoins,
  getCoinSummary,
  adminAddCoins,
} from '../controllers/coinController';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Get coin transactions
router.get('/transactions', getCoinTransactions);

// Get coin summary
router.get('/summary', getCoinSummary);

// Add coins (topup or earn)
router.post('/add', addCoins);

// Spend coins
router.post('/spend', spendCoins);

// Admin: Add coins to any user
router.post('/admin/add', isAdmin, adminAddCoins);

export default router;
