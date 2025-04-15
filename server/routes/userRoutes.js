// File: server/routes/userRoutes.js
const express = require('express');
const { registerUser, authUser, getUserProfile, updateLocation } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/location', protect, updateLocation);

module.exports = router;