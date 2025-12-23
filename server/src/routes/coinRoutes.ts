import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getCoinTransactions,
  addCoins,
  spendCoins,
  getCoinSummary,
  adminAddCoins,
  adminRemoveCoins,
  submitTopupRequest,
  getMyTopupRequests,
  adminGetTopupRequests,
  adminProcessTopupRequest,
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

// Topup request routes
router.post('/topup-request', submitTopupRequest);
router.get('/topup-requests', getMyTopupRequests);

// Admin: Add coins to any user
router.post('/admin/add', isAdmin, adminAddCoins);

// Admin: Remove coins from any user
router.post('/admin/remove', isAdmin, adminRemoveCoins);

// Admin: Get all topup requests
router.get('/admin/topup-requests', isAdmin, adminGetTopupRequests);

// Admin: Process topup request (approve/reject)
router.post('/admin/topup-requests/:requestId/process', isAdmin, adminProcessTopupRequest);

export default router;
