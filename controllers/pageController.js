const petModel = require('../models/petModel');
const orderModel = require('../models/orderModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');
const { categoryFor } = require('../helpers/serviceCategories');

function localDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// The home page works for visitors (service overview) and signed-in users (personal dashboard).
// A failed lookup only hides that section; the page still loads.
function home(req, res) {
  const user = req.session && req.session.user;

  serviceModel.getActiveServices((serviceError, services) => {
    const serviceList = (serviceError ? [] : services).map((service) => ({
      ...service,
      category: categoryFor(service.name)
    }));
    const page = {
      session: req.session,
      services: serviceList,
      pets: [],
      upcoming: [],
      recentOrders: [],
      bookingCount: 0,
      messages: [],
      errors: []
    };

    if (!user) return res.render('index', page);

    petModel.findByOwner(user.id, (petError, pets) => {
      page.pets = petError ? [] : pets;

      serviceBookingModel.getBookingsByOwner(user.id, (bookingError, bookings) => {
        const all = bookingError ? [] : bookings;
        const today = localDateString(new Date());
        page.bookingCount = all.length;
        page.upcoming = all.filter((b) => b.booking_date >= today && b.booking_status !== 'cancelled')
          .sort((a, b) => a.booking_date.localeCompare(b.booking_date))
          .slice(0, 3);

        orderModel.findByUser(user.id, (orderError, orders) => {
          page.recentOrders = orderError ? [] : orders.slice(0, 3);
          res.render('index', page);
        });
      });
    });
  });
}

module.exports = { home };
