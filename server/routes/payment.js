// Payment Routes
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Get Mercado Pago configuration (public key)
router.get('/config', paymentController.getConfig);

// Create PIX payment
router.post('/create-pix', paymentController.createPixPayment);

// Create credit card payment
router.post('/create-card', paymentController.createCardPayment);

// Get payment status
router.get('/status/:paymentId', paymentController.getPaymentStatus);

// Mercado Pago webhook (IPN)
router.post('/webhook', paymentController.handleWebhook);

// Add balance (internal use after payment confirmation)
router.post('/add-balance', paymentController.addBalance);

module.exports = router;
