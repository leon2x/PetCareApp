const connection = require('../config/db');

// Saves the order and its items together. If any insert fails, everything is rolled back.
function create(order, items, callback) {
  connection.beginTransaction((txErr) => {
    if (txErr) return callback(txErr);

    const orderSql = `INSERT INTO orders
      (order_ref, user_id, pet_id, total, currency, payment_status, order_status, provider_payment_id, appointment_at, estimated_delivery)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const orderValues = [
      order.orderRef, order.userId, order.petId, order.total, order.currency,
      order.paymentStatus, order.orderStatus, order.providerPaymentId,
      order.appointmentAt, order.estimatedDelivery
    ];

    connection.query(orderSql, orderValues, (err, result) => {
      if (err) return connection.rollback(() => callback(err));

      const orderId = result.insertId;
      const itemRows = items.map((i) => [orderId, i.id, i.name, i.type, i.price, i.quantity]);
      const itemsSql = 'INSERT INTO order_items (order_id, item_id, item_name, item_type, unit_price, quantity) VALUES ?';

      connection.query(itemsSql, [itemRows], (err2) => {
        if (err2) return connection.rollback(() => callback(err2));

        connection.commit((commitErr) => {
          if (commitErr) return connection.rollback(() => callback(commitErr));
          callback(null, orderId);
        });
      });
    });
  });
}

function findByUser(userId, callback) {
  const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC';
  connection.query(sql, [userId], callback);
}

// Only returns the order if it belongs to this user
function findByIdForUser(orderId, userId, callback) {
  const sql = `SELECT o.*, p.name AS pet_name
               FROM orders o LEFT JOIN pets p ON p.id = o.pet_id
               WHERE o.id = ? AND o.user_id = ?`;
  connection.query(sql, [orderId, userId], callback);
}

function findItems(orderId, callback) {
  connection.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [orderId], callback);
}

module.exports = { create, findByUser, findByIdForUser, findItems };
