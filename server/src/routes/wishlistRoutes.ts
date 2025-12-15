import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlist,
  clearWishlist,
} from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.post('/toggle', toggleWishlist);
router.get('/check/:productId', checkWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.delete('/clear', clearWishlist);

export default router;
