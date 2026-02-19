// Lootbox Routes
const express = require('express');
const router = express.Router();
const lootboxController = require('../controllers/lootboxController');

// Get all boxes
router.get('/boxes', lootboxController.getAllBoxes);

// Get specific box
router.get('/boxes/:boxId', lootboxController.getBox);

// Open a box
router.post('/open', lootboxController.openBox);

// Get opening history
router.get('/history/:userId', lootboxController.getHistory);

module.exports = router;
