// File: server/routes/userRoutes.js
const express = require('express');
const { registerUser, authUser, getUserProfile, updateLocation, liveLocation } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/location', protect, updateLocation);
// server/routes/userRoutes.js
router.get('/live/:userId', liveLocation);
  

module.exports = router;