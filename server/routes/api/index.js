const express = require('express');
const authRoutes = require('./auth.route');
const profilesRoutes = require('./profiles.route');
const usersRoutes = require('./users.route');
const mapsRoutes = require('./maps.route');
const uploadsRoutes = require('./uploads.route');

const router = express.Router();

router.get('/alive', (req, res) => {
  res.status(200).json({ status: 'pass' });
});

router.use('/auth', authRoutes);
router.use('/profiles', profilesRoutes);
router.use('/users', usersRoutes);
router.use('/maps', mapsRoutes);
router.use('/uploads', uploadsRoutes);

module.exports = router;
