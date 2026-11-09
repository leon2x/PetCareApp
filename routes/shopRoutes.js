const express = require('express');
const { isLoggedIn } = require('../middleware/auth');
const shopController = require('../controllers/shopController');

const router = express.Router();

router.get('/shop', isLoggedIn, shopController.showShop);
router.get('/cart', isLoggedIn, shopController.showCart);
router.post('/cart/add', isLoggedIn, shopController.addToCart);
router.post('/cart/update', isLoggedIn, shopController.updateCart);
router.post('/cart/remove', isLoggedIn, shopController.removeFromCart);

module.exports = router;
