const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Lootbox = require('../models/Lootbox');
const User = require('../models/User');
const Album = require('../models/Album');
const Transaction = require('../models/Transaction');

// Prize pools for each lootbox type
const PRIZE_POOLS = {
  1: [ // SKYDROP X - R$ 5,00
    { name: 'Figurinha Comum', type: 'sticker', value: 0, weight: 70 },
    { name: 'Figurinha Rara', type: 'sticker', value: 0, weight: 20 },
    { name: 'Caixa de Som Bluetooth', type: 'physical', value: 150, weight: 5 },
    { name: 'Fone JBL', type: 'physical', value: 200, weight: 3 },
    { name: 'iPhone 16', type: 'physical', value: 5000, weight: 1.5 },
    { name: 'PlayStation 5', type: 'physical', value: 3500, weight: 0.5 }
  ],
  2: [ // FORTUNE X - R$ 27,90
    { name: 'Figurinha Rara', type: 'sticker', value: 0, weight: 50 },
    { name: 'Figurinha Épica', type: 'sticker', value: 0, weight: 25 },
    { name: 'Câmera GoPro', type: 'physical', value: 1500, weight: 10 },
    { name: 'iPad', type: 'physical', value: 3000, weight: 7 },
    { name: 'iPhone 16', type: 'physical', value: 5000, weight: 5 },
    { name: 'iPhone 17', type: 'physical', value: 7000, weight: 2 },
    { name: 'PlayStation 5', type: 'physical', value: 3500, weight: 1 }
  ],
  3: [ // PRIME FORTUNE - R$ 49,99
    { name: 'Caixa de Som JBL', type: 'physical', value: 300, weight: 35 },
    { name: 'Fone Bluetooth Premium', type: 'physical', value: 400, weight: 25 },
    { name: 'Câmera GoPro', type: 'physical', value: 1500, weight: 15 },
    { name: 'iPad', type: 'physical', value: 3000, weight: 10 },
    { name: 'iPhone 16', type: 'physical', value: 5000, weight: 8 },
    { name: 'PlayStation 5', type: 'physical', value: 3500, weight: 5 },
    { name: 'iPhone 17', type: 'physical', value: 7000, weight: 2 }
  ],
  4: [ // ULTRA FORTUNE - R$ 97,00
    { name: 'iPad Pro', type: 'physical', value: 4000, weight: 30 },
    { name: 'iPhone 16', type: 'physical', value: 5000, weight: 25 },
    { name: 'PlayStation 5', type: 'physical', value: 3500, weight: 20 },
    { name: 'iPhone 17', type: 'physical', value: 7000, weight: 15 },
    { name: 'MacBook Air', type: 'physical', value: 8000, weight: 7 },
    { name: 'PS5 PRO', type: 'physical', value: 6000, weight: 3 }
  ],
  5: [ // SKYDROP DELUXE - R$ 197,00
    { name: 'iPhone 16', type: 'physical', value: 5000, weight: 35 },
    { name: 'PlayStation 5', type: 'physical', value: 3500, weight: 25 },
    { name: 'iPhone 17', type: 'physical', value: 7000, weight: 20 },
    { name: 'MacBook Air', type: 'physical', value: 8000, weight: 10 },
    { name: 'PS5 PRO', type: 'physical', value: 6000, weight: 7 },
    { name: 'MacBook Pro', type: 'physical', value: 12000, weight: 3 }
  ],
  6: [ // DIAMOND EDITION - R$ 497,00
    { name: 'iPhone 17', type: 'physical', value: 7000, weight: 30 },
    { name: 'MacBook Air', type: 'physical', value: 8000, weight: 25 },
    { name: 'PS5 PRO', type: 'physical', value: 6000, weight: 20 },
    { name: 'MacBook Pro', type: 'physical', value: 12000, weight: 15 },
    { name: 'iPhone 17 Pro Max', type: 'physical', value: 10000, weight: 7 },
    { name: 'iMac 27"', type: 'physical', value: 15000, weight: 3 }
  ]
};

// RNG function with weighted probability
function selectPrize(prizePool) {
  const totalWeight = prizePool.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of prizePool) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }
  
  return prizePool[0]; // Fallback
}

// Get all lootboxes
router.get('/boxes', async (req, res) => {
  try {
    const lootboxes = await Lootbox.getAll();
    res.json(lootboxes);
  } catch (error) {
    console.error('Get lootboxes error:', error);
    res.status(500).json({ error: 'Erro ao buscar lootboxes' });
  }
});

// Get prizes for a specific lootbox
router.get('/prizes/:lootboxId', async (req, res) => {
  try {
    const lootboxId = parseInt(req.params.lootboxId);
    const prizes = PRIZE_POOLS[lootboxId] || [];
    res.json(prizes);
  } catch (error) {
    console.error('Get prizes error:', error);
    res.status(500).json({ error: 'Erro ao buscar prêmios' });
  }
});

// Open lootbox
router.post('/open', authMiddleware, async (req, res) => {
  try {
    const { lootboxId } = req.body;
    const userId = req.userId;

    const lootbox = await Lootbox.findById(lootboxId);
    if (!lootbox) {
      return res.status(404).json({ error: 'Lootbox não encontrada' });
    }

    const user = await User.findById(userId);
    if (user.balance < lootbox.price) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Deduct balance
    const newBalance = user.balance - lootbox.price;
    await User.updateBalance(userId, newBalance);

    // Create transaction
    await Transaction.create(userId, 'lootbox_open', -lootbox.price, 'balance', null);

    // Select prize
    const prizePool = PRIZE_POOLS[lootboxId];
    const prize = selectPrize(prizePool);

    // Record opening
    await Lootbox.recordOpening(userId, lootboxId, prize.name, prize.value);

    // If it's a sticker, add to user's album
    if (prize.type === 'sticker') {
      // Randomly assign to an album
      const albums = await Album.getAll();
      const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
      
      let progress = await Album.getUserProgress(userId, randomAlbum.id);
      if (!progress) {
        await Album.initializeUserProgress(userId, randomAlbum.id);
        progress = await Album.getUserProgress(userId, randomAlbum.id);
      }

      let stickersCollected = JSON.parse(progress.stickers_collected);
      const newStickerId = Math.floor(Math.random() * randomAlbum.total_stickers) + 1;
      
      if (!stickersCollected.includes(newStickerId)) {
        stickersCollected.push(newStickerId);
        await Album.updateProgress(userId, randomAlbum.id, stickersCollected, stickersCollected.length);
        
        if (stickersCollected.length === randomAlbum.total_stickers) {
          await Album.completeAlbum(userId, randomAlbum.id);
        }
      }
    }

    res.json({
      prize: prize.name,
      prizeType: prize.type,
      prizeValue: prize.value,
      newBalance
    });
  } catch (error) {
    console.error('Open lootbox error:', error);
    res.status(500).json({ error: 'Erro ao abrir lootbox' });
  }
});

// Get user's lootbox history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const history = await Lootbox.getUserOpenings(userId);
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

module.exports = router;
