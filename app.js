require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const PORT = process.env.PORT || 3000;

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petRoutes = require('./routes/petRoutes');
const journalRoutes = require('./routes/journalRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shopRoutes = require('./routes/shopRoutes');
const orderRoutes = require('./routes/orderRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

app.use(flash());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret',
  resave: false,
  saveUninitialized: true
}));

// Lets shared partials (navbar) highlight the current page
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use(authRoutes);
app.use(pageRoutes);
app.use(adminRoutes);
app.use(petRoutes);
app.use(journalRoutes);
app.use(paymentRoutes);
app.use(shopRoutes);
app.use(orderRoutes);
app.use(serviceRoutes);

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
