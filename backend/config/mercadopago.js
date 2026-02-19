const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

let client = null;
let preference = null;
let payment = null;

const configureMercadoPago = () => {
  try {
    client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000 }
    });
    preference = new Preference(client);
    payment = new Payment(client);
  } catch (error) {
    console.warn('Mercado Pago not configured - using demo mode');
  }
};

module.exports = { configureMercadoPago, getPreference: () => preference, getPayment: () => payment };
