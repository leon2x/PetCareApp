const { catalogue, findItem } = require('../data/catalogue');
const { buildCart, MAX_QTY } = require('../helpers/cart');

function showShop(req, res) {
  res.render('shop', {
    session: req.session,
    services: catalogue.filter((i) => i.type === 'service'),
    products: catalogue.filter((i) => i.type === 'product'),
    cart: buildCart(req.session.cart),
    messages: req.flash('success'),
    errors: req.flash('error')
  });
}

function showCart(req, res) {
  res.render('cart', {
    session: req.session,
    cart: buildCart(req.session.cart),
    messages: req.flash('success'),
    errors: req.flash('error')
  });
}

function addToCart(req, res) {
  const item = findItem(req.body.itemId);
  if (!item) {
    req.flash('error', 'That item does not exist.');
    return res.redirect('/shop');
  }

  if (!req.session.cart) req.session.cart = {};
  const current = Number(req.session.cart[item.id]) || 0;
  req.session.cart[item.id] = Math.min(current + 1, MAX_QTY);

  req.flash('success', item.name + ' added to your cart.');
  res.redirect('/shop');
}

function updateCart(req, res) {
  const item = findItem(req.body.itemId);
  const quantity = Number(req.body.quantity);

  if (!item || !req.session.cart || !req.session.cart[item.id]) {
    req.flash('error', 'That item is not in your cart.');
    return res.redirect('/cart');
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
    req.flash('error', 'Quantity must be a whole number from 1 to ' + MAX_QTY + '.');
    return res.redirect('/cart');
  }

  req.session.cart[item.id] = quantity;
  res.redirect('/cart');
}

function removeFromCart(req, res) {
  const item = findItem(req.body.itemId);
  if (item && req.session.cart) {
    delete req.session.cart[item.id];
  }
  res.redirect('/cart');
}

module.exports = { showShop, showCart, addToCart, updateCart, removeFromCart };
