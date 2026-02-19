// User Routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user balance
router.get('/balance', userController.getBalance);

// Update user balance
router.post('/balance', userController.updateBalance);

// Get user profile
router.get('/profile/:userId', userController.getProfile);

// Get transaction history
router.get('/history/:userId', userController.getHistory);

module.exports = router;
