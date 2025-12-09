import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAllProductsAdmin,
} from '../controllers/adminController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Products route for admin
router.get('/products', getAllProductsAdmin);

// Notification routes
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/read-all', markAllNotificationsAsRead);
router.patch('/notifications/:id/read', markNotificationAsRead);

export default router;
