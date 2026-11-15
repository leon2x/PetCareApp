const assert = require('node:assert/strict');
const test = require('node:test');

const orderModelPath = require.resolve('../models/orderModel');
const dbConfigPath = require.resolve('../config/db');

// Load orderModel with a fake database pool so no real MySQL connection is needed.
function loadOrderModel(pool) {
  delete require.cache[orderModelPath];
  require.cache[dbConfigPath] = { id: dbConfigPath, filename: dbConfigPath, loaded: true, exports: pool };
  try {
    return require(orderModelPath);
  } finally {
    delete require.cache[orderModelPath];
    delete require.cache[dbConfigPath];
  }
}

function fakePool({ orderError, itemsError, commitError, connectionError } = {}) {
  const calls = [];
  const connection = {
    beginTransaction(cb) { calls.push('begin'); cb(null); },
    query(sql, params, cb) {
      calls.push(sql.includes('INSERT INTO order_items') ? 'items' : 'order');
      if (sql.includes('INSERT INTO orders')) return cb(orderError || null, { insertId: 7 });
      return cb(itemsError || null, { affectedRows: 2 });
    },
    commit(cb) { calls.push('commit'); cb(commitError || null); },
    rollback(cb) { calls.push('rollback'); cb(null); },
    release() { calls.push('release'); }
  };
  const pool = {
    getConnection(cb) { calls.push('getConnection'); cb(connectionError || null, connectionError ? undefined : connection); },
    query() { assert.fail('create() must use a dedicated connection, not pool.query'); }
  };
  return { pool, calls };
}

const order = {
  orderRef: 'PC-20261110-1234', userId: 2, petId: 5, total: 79, currency: 'sgd',
  paymentStatus: 'APPROVED', orderStatus: 'CONFIRMED', providerPaymentId: 'mock_1',
  appointmentAt: '2026-11-12 10:00:00', estimatedDelivery: '2026-11-12'
};
const items = [
  { id: 1, name: 'Vaccination', type: 'service', price: 35, quantity: 1 },
  { id: 4, name: 'Dog Food (2kg)', type: 'product', price: 22, quantity: 2 }
];
const run = (model) => new Promise((resolve) => model.create(order, items, (error, orderId) => resolve({ error, orderId })));

test('saves the order and items in one transaction and releases the connection', async () => {
  const { pool, calls } = fakePool();
  const outcome = await run(loadOrderModel(pool));
  assert.equal(outcome.error, null);
  assert.equal(outcome.orderId, 7);
  assert.deepEqual(calls, ['getConnection', 'begin', 'order', 'items', 'commit', 'release']);
});

test('rolls back and releases when the order insert fails', async () => {
  const failure = new Error('order insert failed');
  const { pool, calls } = fakePool({ orderError: failure });
  const outcome = await run(loadOrderModel(pool));
  assert.equal(outcome.error, failure);
  assert.deepEqual(calls, ['getConnection', 'begin', 'order', 'rollback', 'release']);
});

test('rolls back and releases when the items insert fails, with no commit', async () => {
  const failure = new Error('items insert failed');
  const { pool, calls } = fakePool({ itemsError: failure });
  const outcome = await run(loadOrderModel(pool));
  assert.equal(outcome.error, failure);
  assert.equal(calls.includes('commit'), false);
  assert.deepEqual(calls.slice(-2), ['rollback', 'release']);
});

test('rolls back and releases when the commit fails', async () => {
  const failure = new Error('commit failed');
  const { pool, calls } = fakePool({ commitError: failure });
  const outcome = await run(loadOrderModel(pool));
  assert.equal(outcome.error, failure);
  assert.deepEqual(calls.slice(-2), ['rollback', 'release']);
});

test('reports a connection error without trying to release anything', async () => {
  const failure = new Error('no connection');
  const { pool, calls } = fakePool({ connectionError: failure });
  const outcome = await run(loadOrderModel(pool));
  assert.equal(outcome.error, failure);
  assert.deepEqual(calls, ['getConnection']);
});
