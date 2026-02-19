const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Album = require('../models/Album');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Get user transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.getUserTransactions(userId);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Get user albums
router.get('/albums', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const albums = await Album.getAll();
    const userProgress = await Album.getAllUserProgress(userId);
    
    const albumsWithProgress = albums.map(album => {
      const progress = userProgress.find(p => p.album_id === album.id);
      return {
        ...album,
        progress: progress ? progress.progress : 0,
        stickersCollected: progress ? JSON.parse(progress.stickers_collected) : [],
        completed: progress ? progress.completed : false
      };
    });

    res.json(albumsWithProgress);
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ error: 'Erro ao buscar álbuns' });
  }
});

// Get album details
router.get('/albums/:albumId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const albumId = parseInt(req.params.albumId);
    
    const albums = await Album.getAll();
    const album = albums.find(a => a.id === albumId);
    
    if (!album) {
      return res.status(404).json({ error: 'Álbum não encontrado' });
    }

    let progress = await Album.getUserProgress(userId, albumId);
    if (!progress) {
      await Album.initializeUserProgress(userId, albumId);
      progress = await Album.getUserProgress(userId, albumId);
    }

    res.json({
      ...album,
      progress: progress.progress,
      stickersCollected: JSON.parse(progress.stickers_collected),
      completed: progress.completed
    });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Erro ao buscar álbum' });
  }
});

module.exports = router;
