const orderModel = require('../models/orderModel');
const petModel = require('../models/petModel');
const MockProvider = require('../services/mockPaymentProvider');
const { buildCart } = require('../helpers/cart');
const { estimateDelivery, toSqlDate, parseAppointment } = require('../helpers/delivery');

function generateOrderRef() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
  return 'PC-' + stamp + '-' + Math.floor(1000 + Math.random() * 9000);
}

function showCheckout(req, res) {
  const cart = buildCart(req.session.cart);
  if (cart.lines.length === 0) {
    req.flash('error', 'Your cart is empty.');
    return res.redirect('/cart');
  }

  petModel.findByOwner(req.session.user.id, (err, pets) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Could not load your pets. Please try again.');
      return res.redirect('/cart');
    }

    res.render('checkout', {
      session: req.session,
      cart,
      pets,
      hasService: cart.lines.some((l) => l.type === 'service'),
      hasProduct: cart.lines.some((l) => l.type === 'product'),
      estimatedDelivery: estimateDelivery(),
      errors: req.flash('error')
    });
  });
}

function placeOrder(req, res) {
  const cart = buildCart(req.session.cart);
  if (cart.lines.length === 0) {
    req.flash('error', 'Your cart is empty.');
    return res.redirect('/cart');
  }

  const hasService = cart.lines.some((l) => l.type === 'service');
  const hasProduct = cart.lines.some((l) => l.type === 'product');
  const userId = req.session.user.id;

  petModel.findByOwner(userId, async (err, pets) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Could not place your order. Please try again.');
      return res.redirect('/checkout');
    }

    let petId = null;
    let appointmentSql = null;

    if (hasService) {
      const pet = pets.find((p) => String(p.id) === String(req.body.pet_id));
      if (!pet) {
        req.flash('error', 'Please choose which of your pets the service is for.');
        return res.redirect('/checkout');
      }
      petId = pet.id;

      const appointment = parseAppointment(req.body.appointment_at);
      if (!appointment) {
        req.flash('error', 'Please choose an appointment between 9:00 and 17:00, within the next 60 days.');
        return res.redirect('/checkout');
      }
      appointmentSql = appointment.sql;
    }

    const orderRef = generateOrderRef();

    // Payment methods are not built for CA1: checkout goes straight to the mock provider as APPROVED.
    // The amount is the server-calculated total, never a value sent by the browser.
    const payment = await MockProvider.createPayment({
      amount: cart.total,
      currency: 'sgd',
      merchantReference: orderRef,
      description: 'PetCare order ' + orderRef,
      testStatus: 'APPROVED'
    });

    if (payment.status !== 'APPROVED') {
      req.flash('error', 'Payment was not approved, so your order was not placed.');
      return res.redirect('/checkout');
    }

    const order = {
      orderRef,
      userId,
      petId,
      total: cart.total,
      currency: 'sgd',
      paymentStatus: payment.status,
      orderStatus: 'CONFIRMED',
      providerPaymentId: payment.providerPaymentId,
      appointmentAt: appointmentSql,
      estimatedDelivery: hasProduct ? toSqlDate(estimateDelivery()) : null
    };

    orderModel.create(order, cart.lines, (createErr, orderId) => {
      if (createErr) {
        console.error('Error saving order:', createErr);
        req.flash('error', 'Could not save your order. You have not been charged. Please try again.');
        return res.redirect('/checkout');
      }

      req.session.cart = {};
      req.flash('success', 'Order confirmed. Thank you!');
      res.redirect('/orders/' + orderId);
    });
  });
}

function showOrder(req, res) {
  orderModel.findByIdForUser(req.params.id, req.session.user.id, (err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Could not load the order.');
    }
    if (orders.length === 0) {
      return res.status(404).send('Order not found.');
    }

    orderModel.findItems(orders[0].id, (itemsErr, items) => {
      if (itemsErr) {
        console.error(itemsErr);
        return res.status(500).send('Could not load the order.');
      }
      res.render('orderConfirmation', {
        session: req.session,
        order: orders[0],
        items,
        messages: req.flash('success')
      });
    });
  });
}

function listOrders(req, res) {
  orderModel.findByUser(req.session.user.id, (err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Could not load your orders.');
    }
    res.render('orders', { session: req.session, orders });
  });
}

module.exports = { showCheckout, placeOrder, showOrder, listOrders };
