const mercadopago = require('mercadopago');

const configureMercadoPago = () => {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
};

module.exports = { mercadopago, configureMercadoPago };
