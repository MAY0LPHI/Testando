const express = require('express');
const router = express.Router();
const { getPreference, getPayment } = require('../config/mercadopago');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Create payment preference (PIX or Credit Card)
router.post('/create-preference', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.userId;

    if (!amount || amount < 20) {
      return res.status(400).json({ error: 'Valor mínimo de R$ 20,00' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Create transaction record
    const transactionId = await Transaction.create(userId, 'deposit', amount, paymentMethod);

    const preferenceClient = getPreference();
    
    // In demo mode, return mock data
    if (!preferenceClient) {
      return res.json({
        id: `demo_pref_${transactionId}`,
        init_point: '#',
        sandbox_init_point: '#',
        qr_code: `demo_qr_code_${transactionId}`,
        qr_code_base64: null,
        ticket_url: null,
        transaction_id: transactionId
      });
    }

    const preferenceData = {
      items: [
        {
          title: 'Recarga de Saldo - SurpriseBoxJor',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(amount)
        }
      ],
      payer: {
        email: user.email,
        name: user.username
      },
      external_reference: transactionId.toString(),
      notification_url: process.env.WEBHOOK_URL,
      back_urls: {
        success: `${process.env.FRONTEND_URL}?payment=success`,
        failure: `${process.env.FRONTEND_URL}?payment=failure`,
        pending: `${process.env.FRONTEND_URL}?payment=pending`
      },
      auto_return: 'approved'
    };

    // For PIX, add payment methods configuration
    if (paymentMethod === 'pix') {
      preferenceData.payment_methods = {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' }
        ]
      };
    }

    const response = await preferenceClient.create({ body: preferenceData });

    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      qr_code: response.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
      transaction_id: transactionId
    });
  } catch (error) {
    console.error('Payment preference error:', error);
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
});

// Webhook for payment notifications
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      const paymentClient = getPayment();
      if (!paymentClient) {
        return res.status(200).send('OK');
      }
      
      // Get payment details from Mercado Pago
      const paymentData = await paymentClient.get({ id: paymentId });
      
      if (paymentData.status === 'approved') {
        const externalReference = paymentData.external_reference;
        const transaction = await Transaction.findById(parseInt(externalReference));
        
        if (transaction && transaction.status === 'pending') {
          // Update transaction status
          await Transaction.updateStatus(transaction.id, 'approved');
          
          // Update user balance
          const user = await User.findById(transaction.user_id);
          const newBalance = user.balance + transaction.amount;
          await User.updateBalance(user.id, newBalance);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

// Get payment status
router.get('/status/:paymentId', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const paymentClient = getPayment();
    if (!paymentClient) {
      return res.json({
        status: 'pending',
        status_detail: 'demo_mode'
      });
    }
    
    const paymentData = await paymentClient.get({ id: paymentId });
    
    res.json({
      status: paymentData.status,
      status_detail: paymentData.status_detail
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Erro ao verificar status do pagamento' });
  }
});

// Manual payment approval (for testing)
router.post('/approve-payment', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.userId;

    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction || transaction.user_id !== userId) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    if (transaction.status === 'approved') {
      return res.status(400).json({ error: 'Transação já aprovada' });
    }

    // Update transaction status
    await Transaction.updateStatus(transaction.id, 'approved');
    
    // Update user balance
    const user = await User.findById(userId);
    const newBalance = user.balance + transaction.amount;
    await User.updateBalance(userId, newBalance);

    res.json({
      message: 'Pagamento aprovado com sucesso',
      newBalance
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Erro ao aprovar pagamento' });
  }
});

module.exports = router;
