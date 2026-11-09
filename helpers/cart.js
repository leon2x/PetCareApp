const { findItem } = require('../data/catalogue');

const MAX_QTY = 10;

// Turn the session cart ({ itemId: quantity }) into priced lines using the SERVER catalogue.
function buildCart(sessionCart) {
  const lines = [];
  let total = 0;

  Object.keys(sessionCart || {}).forEach((id) => {
    const item = findItem(id);
    const quantity = Number(sessionCart[id]);
    if (!item || !Number.isInteger(quantity) || quantity < 1) return;

    const lineTotal = item.price * quantity;
    total += lineTotal;
    lines.push({
      id: item.id,
      name: item.name,
      type: item.type,
      price: item.price,
      quantity,
      lineTotal
    });
  });

  return { lines, total, count: lines.reduce((sum, l) => sum + l.quantity, 0) };
}

module.exports = { buildCart, MAX_QTY };
