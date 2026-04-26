const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes        = require('./routes/auth');
const classesRoutes     = require('./routes/classes');
const bookingsRoutes    = require('./routes/bookings');
const membershipsRoutes = require('./routes/memberships');
const usersRoutes       = require('./routes/users');
const adminRoutes       = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/classes',     classesRoutes);
app.use('/api/bookings',    bookingsRoutes);
app.use('/api/memberships', membershipsRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/admin',       adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'BYEM GYM API is running!', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
