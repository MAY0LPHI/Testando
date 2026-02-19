// Payment Controller - Handles Mercado Pago Integration
const { mercadopago, publicKey, isConfigured } = require('../config/mercadopago');
const QRCode = require('qrcode');

// Store for payment tracking (in production, use database)
const paymentStore = new Map();
const processedPayments = new Set(); // Prevent duplicate credits

class PaymentController {
    // Get Mercado Pago public key
    async getConfig(req, res) {
        try {
            if (!isConfigured) {
                return res.status(503).json({
                    success: false,
                    message: 'Mercado Pago not configured. Please contact support.'
                });
            }

            res.json({
                success: true,
                publicKey: publicKey
            });
        } catch (error) {
            console.error('Error getting config:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving configuration'
            });
        }
    }

    // Create PIX payment
    async createPixPayment(req, res) {
        try {
            const { amount, userId, description } = req.body;

            // Validate input
            if (!amount || amount < 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor mínimo é R$ 20,00'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID é obrigatório'
                });
            }

            if (!isConfigured) {
                return res.status(503).json({
                    success: false,
                    message: 'Mercado Pago não configurado. Use o modo de demonstração.'
                });
            }

            // Create payment preference
            const payment = {
                transaction_amount: parseFloat(amount),
                description: description || `Recarga de saldo - R$ ${amount}`,
                payment_method_id: 'pix',
                payer: {
                    email: `${userId}@surpriseboxjor.com`,
                    first_name: 'Cliente',
                    last_name: 'SurpriseBoxJor'
                },
                notification_url: process.env.WEBHOOK_URL || 'https://yourdomain.com/api/payment/webhook',
                metadata: {
                    user_id: userId,
                    type: 'balance_recharge'
                }
            };

            const response = await mercadopago.payment.create(payment);
            const paymentData = response.body;

            // Generate QR Code
            let qrCodeBase64 = '';
            if (paymentData.point_of_interaction?.transaction_data?.qr_code) {
                const qrCode = paymentData.point_of_interaction.transaction_data.qr_code;
                qrCodeBase64 = await QRCode.toDataURL(qrCode);
                qrCodeBase64 = qrCodeBase64.replace('data:image/png;base64,', '');
            }

            // Store payment info
            paymentStore.set(paymentData.id.toString(), {
                id: paymentData.id,
                userId,
                amount: parseFloat(amount),
                status: 'pending',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            });

            res.json({
                success: true,
                payment: {
                    id: paymentData.id,
                    status: paymentData.status,
                    amount: parseFloat(amount),
                    qrCode: paymentData.point_of_interaction?.transaction_data?.qr_code || '',
                    qrCodeBase64: qrCodeBase64,
                    ticketUrl: paymentData.point_of_interaction?.transaction_data?.ticket_url || ''
                }
            });

        } catch (error) {
            console.error('Error creating PIX payment:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar pagamento PIX',
                error: error.message
            });
        }
    }

    // Create credit card payment
    async createCardPayment(req, res) {
        try {
            const { amount, userId, cardData, description } = req.body;

            // Validate input
            if (!amount || amount < 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor mínimo é R$ 20,00'
                });
            }

            if (!userId || !cardData) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos'
                });
            }

            if (!isConfigured) {
                return res.status(503).json({
                    success: false,
                    message: 'Mercado Pago não configurado'
                });
            }

            // Parse expiration date
            const [expMonth, expYear] = cardData.expirationDate.split('/');

            // Create payment
            const payment = {
                transaction_amount: parseFloat(amount),
                token: 'card_token', // In production, create token on frontend
                description: description || `Recarga de saldo - R$ ${amount}`,
                installments: parseInt(cardData.installments) || 1,
                payment_method_id: 'visa', // Would be determined from card number
                payer: {
                    email: `${userId}@surpriseboxjor.com`,
                    identification: {
                        type: 'CPF',
                        number: cardData.cpf
                    }
                },
                notification_url: process.env.WEBHOOK_URL || 'https://yourdomain.com/api/payment/webhook',
                metadata: {
                    user_id: userId,
                    type: 'balance_recharge'
                }
            };

            // Note: In production, use Mercado Pago SDK on frontend to create card token
            // This is a simplified version for demonstration
            
            const response = await mercadopago.payment.create(payment);
            const paymentData = response.body;

            // Store payment info
            paymentStore.set(paymentData.id.toString(), {
                id: paymentData.id,
                userId,
                amount: parseFloat(amount),
                status: paymentData.status,
                createdAt: new Date()
            });

            res.json({
                success: true,
                payment: {
                    id: paymentData.id,
                    status: paymentData.status,
                    amount: parseFloat(amount),
                    statusDetail: paymentData.status_detail
                }
            });

        } catch (error) {
            console.error('Error creating card payment:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar pagamento com cartão',
                error: error.message
            });
        }
    }

    // Get payment status
    async getPaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;

            if (!isConfigured) {
                // Demo mode - simulate payment approval after 5 seconds
                const storedPayment = paymentStore.get(paymentId);
                if (storedPayment) {
                    const elapsed = Date.now() - storedPayment.createdAt.getTime();
                    if (elapsed > 5000) {
                        storedPayment.status = 'approved';
                        paymentStore.set(paymentId, storedPayment);
                    }
                    
                    return res.json({
                        success: true,
                        status: storedPayment.status,
                        amount: storedPayment.amount,
                        userId: storedPayment.userId
                    });
                }
                
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            const response = await mercadopago.payment.get(paymentId);
            const payment = response.body;

            // Update local store
            const storedPayment = paymentStore.get(paymentId);
            if (storedPayment) {
                storedPayment.status = payment.status;
                paymentStore.set(paymentId, storedPayment);

                // If approved and not yet processed, add balance
                if (payment.status === 'approved' && !processedPayments.has(paymentId)) {
                    processedPayments.add(paymentId);
                    // In production, update database here
                    console.log(`✅ Payment ${paymentId} approved. Adding R$ ${storedPayment.amount} to user ${storedPayment.userId}`);
                }
            }

            res.json({
                success: true,
                status: payment.status,
                amount: payment.transaction_amount,
                userId: payment.metadata?.user_id
            });

        } catch (error) {
            console.error('Error getting payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao verificar status do pagamento'
            });
        }
    }

    // Handle Mercado Pago webhook
    async handleWebhook(req, res) {
        try {
            const { type, data } = req.body;

            console.log('📬 Webhook received:', type, data);

            if (type === 'payment') {
                const paymentId = data.id;
                
                // Get payment details
                const response = await mercadopago.payment.get(paymentId);
                const payment = response.body;

                const storedPayment = paymentStore.get(paymentId.toString());

                if (payment.status === 'approved' && storedPayment) {
                    // Prevent duplicate processing
                    if (!processedPayments.has(paymentId.toString())) {
                        processedPayments.add(paymentId.toString());
                        
                        // Add balance to user (in production, update database)
                        console.log(`✅ Webhook: Payment ${paymentId} approved. Adding R$ ${storedPayment.amount} to user ${storedPayment.userId}`);
                        
                        // Update payment status
                        storedPayment.status = 'approved';
                        paymentStore.set(paymentId.toString(), storedPayment);
                    }
                }
            }

            // Always return 200 to Mercado Pago
            res.status(200).send('OK');

        } catch (error) {
            console.error('Error handling webhook:', error);
            // Still return 200 to prevent retries
            res.status(200).send('OK');
        }
    }

    // Add balance (internal endpoint)
    async addBalance(req, res) {
        try {
            const { userId, amount, paymentId } = req.body;

            // Validate
            if (!userId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters'
                });
            }

            // Check if already processed
            if (paymentId && processedPayments.has(paymentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already processed'
                });
            }

            // In production, update database here
            // For now, just mark as processed
            if (paymentId) {
                processedPayments.add(paymentId);
            }

            console.log(`💰 Added R$ ${amount} to user ${userId}`);

            res.json({
                success: true,
                message: 'Balance added successfully',
                newBalance: amount // In production, return actual new balance from DB
            });

        } catch (error) {
            console.error('Error adding balance:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding balance'
            });
        }
    }
}

module.exports = new PaymentController();
