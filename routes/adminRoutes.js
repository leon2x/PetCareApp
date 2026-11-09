const express = require('express');
const { isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const adminOrderController = require('../controllers/adminOrderController');

const router = express.Router();

router.get('/admin/dashboard', isAdmin, adminController.dashboard);
router.get('/admin/users', isAdmin, adminController.listUsers);
router.get('/admin/users/:id', isAdmin, adminController.userDetails);
router.post('/admin/users/delete/:id', isAdmin, adminController.deleteUser);
router.get('/admin/orders', isAdmin, adminOrderController.listOrders);
router.get('/admin/orders/:id', isAdmin, adminOrderController.showOrder);
router.post('/admin/orders/:id/status', isAdmin, adminOrderController.updateStatus);

module.exports = router;
