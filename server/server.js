// Server Entry Point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Database Connection
const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ MongoDB connected successfully');
        } else {
            console.log('⚠️  MongoDB URI not found. Running in offline mode with localStorage.');
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.log('⚠️  Running in offline mode with localStorage.');
    }
};

connectDB();

// Routes
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const lootboxRoutes = require('./routes/lootbox');

app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lootbox', lootboxRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🎁 SurpriseBoxJor Server Running           ║
║   📍 http://localhost:${PORT}                    ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;
