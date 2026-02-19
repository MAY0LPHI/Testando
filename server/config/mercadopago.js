// Mercado Pago Configuration
const mercadopago = require('mercadopago');
const dotenv = require('dotenv');

dotenv.config();

// Configure Mercado Pago
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

if (!accessToken) {
    console.warn('⚠️  Mercado Pago access token not configured. Payment features will be limited.');
}

// Initialize Mercado Pago
if (accessToken) {
    mercadopago.configure({
        access_token: accessToken
    });
    console.log('✅ Mercado Pago configured successfully');
}

module.exports = {
    mercadopago,
    publicKey,
    isConfigured: !!accessToken
};
