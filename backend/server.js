require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import database to initialize
require('./models/database');

// Import Mercado Pago configuration
const { configureMercadoPago } = require('./config/mercadopago');

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const lootboxRoutes = require('./routes/lootbox');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Mercado Pago
configureMercadoPago();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/lootbox', lootboxRoutes);
app.use('/api/user', userRoutes);

// Statistics endpoint (simulated real-time data)
app.get('/api/stats', async (req, res) => {
  try {
    const Lootbox = require('./models/Lootbox');
    const User = require('./models/User');
    
    const totalOpenings = await Lootbox.getTotalOpenings();
    const users = await User.getAllUsers();
    
    res.json({
      boxesOpened: totalOpenings || 12097,
      shipments: Math.floor((totalOpenings || 12097) * 0.75),
      users: users.length || 37142,
      online: Math.floor(Math.random() * 300) + 150 // Random online users
    });
  } catch (error) {
    res.json({
      boxesOpened: 12097,
      shipments: 9032,
      users: 37142,
      online: 199
    });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});
