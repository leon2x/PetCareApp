const orderModel = require('../models/orderModel');

// Only these values may be saved as an order status
const ALLOWED_STATUSES = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];

function listOrders(req, res) {
  orderModel.findAllWithCustomer((err, orders) => {
    if (err) {
      console.error(err);
      return res.send('Error loading orders');
    }
    res.render('adminOrders', { session: req.session, orders });
  });
}

function showOrder(req, res) {
  orderModel.findByIdWithCustomer(req.params.id, (err, orders) => {
    if (err) {
      console.error(err);
      return res.send('Error loading order');
    }
    if (orders.length === 0) return res.status(404).send('Order not found.');

    orderModel.findItems(orders[0].id, (itemsErr, items) => {
      if (itemsErr) {
        console.error(itemsErr);
        return res.send('Error loading order items');
      }
      res.render('adminOrderDetails', {
        session: req.session,
        order: orders[0],
        items,
        statuses: ALLOWED_STATUSES,
        messages: req.flash('success'),
        errors: req.flash('error')
      });
    });
  });
}

function updateStatus(req, res) {
  const orderId = req.params.id;
  const status = req.body.status;

  if (!ALLOWED_STATUSES.includes(status)) {
    req.flash('error', 'Invalid order status.');
    return res.redirect('/admin/orders/' + orderId);
  }

  orderModel.updateStatus(orderId, status, (err, result) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Could not update the order status.');
      return res.redirect('/admin/orders/' + orderId);
    }
    if (result.affectedRows === 0) return res.status(404).send('Order not found.');

    req.flash('success', 'Order status updated to ' + status + '.');
    res.redirect('/admin/orders/' + orderId);
  });
}

module.exports = { listOrders, showOrder, updateStatus };
