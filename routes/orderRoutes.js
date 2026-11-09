const express = require('express');
const { isLoggedIn } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/checkout', isLoggedIn, orderController.showCheckout);
router.post('/checkout', isLoggedIn, orderController.placeOrder);
router.get('/orders', isLoggedIn, orderController.listOrders);
router.get('/orders/:id', isLoggedIn, orderController.showOrder);

module.exports = router;
