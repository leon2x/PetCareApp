// Shop catalogue: the existing pet services plus pet products.
// The server is the source of truth for names and prices - the cart only stores item ids and quantities.
const services = require('./mockServices');

const products = [
  { id: 4, name: 'Dog Food (2kg)', price: 22 },
  { id: 5, name: 'Cat Food (2kg)', price: 20 },
  { id: 6, name: 'Pet Shampoo', price: 12 },
  { id: 7, name: 'Chew Toy', price: 8 }
];

const catalogue = [
  ...services.map((s) => ({ ...s, type: 'service' })),
  ...products.map((p) => ({ ...p, type: 'product' }))
];

function findItem(id) {
  return catalogue.find((item) => item.id === Number(id));
}

module.exports = { catalogue, findItem };
