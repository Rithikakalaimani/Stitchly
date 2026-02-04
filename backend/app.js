const express = require('express');
const cors = require('cors');

const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/deliveries');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const garmentRoutes = require('./routes/garments');
const designRoutes = require('./routes/designs');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/garments', garmentRoutes);
app.use('/api/designs', designRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

module.exports = app;
