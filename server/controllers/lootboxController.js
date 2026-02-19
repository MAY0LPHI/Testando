// Lootbox Controller
// Box configurations
const BOXES = {
    'skydrop-x': {
        id: 1,
        name: 'SKYDROP X',
        price: 5.00,
        prizes: [
            { name: 'NFT NÍVEL ALTO BOX DA JOR', rarity: 'legendary', probability: 0.05 },
            { name: 'Fone Bluetooth Premium', rarity: 'epic', probability: 0.15 },
            { name: 'Carregador Portátil', rarity: 'rare', probability: 0.30 },
            { name: 'Cabo USB-C', rarity: 'common', probability: 0.50 }
        ]
    },
    'fortune-x': {
        id: 2,
        name: 'FORTUNE X',
        price: 27.90,
        prizes: [
            { name: 'iPhone 16', rarity: 'legendary', probability: 0.02 },
            { name: 'AirPods Pro', rarity: 'epic', probability: 0.10 },
            { name: 'Caixa de Som JBL', rarity: 'rare', probability: 0.28 },
            { name: 'Mouse Gamer', rarity: 'common', probability: 0.60 }
        ]
    },
    'prime-fortune': {
        id: 3,
        name: 'PRIME FORTUNE',
        price: 49.99,
        prizes: [
            { name: 'iPhone 17', rarity: 'legendary', probability: 0.03 },
            { name: 'PlayStation 5', rarity: 'legendary', probability: 0.05 },
            { name: 'Câmera GoPro', rarity: 'epic', probability: 0.12 },
            { name: 'Smart Watch', rarity: 'rare', probability: 0.30 },
            { name: 'Teclado Mecânico', rarity: 'common', probability: 0.50 }
        ]
    },
    'ultra-fortune': {
        id: 4,
        name: 'ULTRA FORTUNE',
        price: 97.00,
        prizes: [
            { name: 'iPhone 17 Pro Max', rarity: 'legendary', probability: 0.08 },
            { name: 'PlayStation 5 Pro', rarity: 'legendary', probability: 0.10 },
            { name: 'MacBook Air', rarity: 'epic', probability: 0.15 },
            { name: 'iPad Pro', rarity: 'rare', probability: 0.27 },
            { name: 'Apple Watch Ultra', rarity: 'rare', probability: 0.40 }
        ]
    },
    'skydrop-deluxe': {
        id: 5,
        name: 'SKYDROP DELUXE',
        price: 197.00,
        prizes: [
            { name: 'iPhone 17 Pro Max 1TB', rarity: 'legendary', probability: 0.12 },
            { name: 'PS5 + 3 Jogos', rarity: 'legendary', probability: 0.15 },
            { name: 'MacBook Pro 14"', rarity: 'epic', probability: 0.20 },
            { name: 'iPad Pro + Apple Pencil', rarity: 'epic', probability: 0.28 },
            { name: 'AirPods Max', rarity: 'rare', probability: 0.25 }
        ]
    },
    'diamond-edition': {
        id: 6,
        name: 'DIAMOND EDITION',
        price: 497.00,
        prizes: [
            { name: 'iPhone 17 Pro Max + MacBook', rarity: 'legendary', probability: 0.20 },
            { name: 'MacBook Pro 16" M3 Max', rarity: 'legendary', probability: 0.25 },
            { name: 'PlayStation 5 Pro + TV 55"', rarity: 'legendary', probability: 0.18 },
            { name: 'iPad Pro 12.9" + Magic Keyboard', rarity: 'epic', probability: 0.22 },
            { name: 'iPhone 17 Pro Max', rarity: 'epic', probability: 0.15 }
        ]
    }
};

class LootboxController {
    constructor() {
        this.openingHistory = new Map();
    }

    // Get all boxes
    async getAllBoxes(req, res) {
        try {
            res.json({
                success: true,
                boxes: BOXES
            });
        } catch (error) {
            console.error('Error getting boxes:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving boxes'
            });
        }
    }

    // Get specific box
    async getBox(req, res) {
        try {
            const { boxId } = req.params;
            const box = BOXES[boxId];

            if (!box) {
                return res.status(404).json({
                    success: false,
                    message: 'Box not found'
                });
            }

            res.json({
                success: true,
                box
            });

        } catch (error) {
            console.error('Error getting box:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving box'
            });
        }
    }

    // Open a box
    async openBox(req, res) {
        try {
            const { boxId, userId } = req.body;

            if (!boxId || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Box ID and User ID required'
                });
            }

            const box = BOXES[boxId];
            if (!box) {
                return res.status(404).json({
                    success: false,
                    message: 'Box not found'
                });
            }

            // Select prize based on probability
            const prize = this.selectPrizeByProbability(box.prizes);

            // Save to history
            const history = this.openingHistory.get(userId) || [];
            history.unshift({
                boxId,
                boxName: box.name,
                prize: prize.name,
                rarity: prize.rarity,
                timestamp: new Date(),
                price: box.price
            });

            // Keep only last 100 entries
            if (history.length > 100) {
                history.pop();
            }

            this.openingHistory.set(userId, history);

            res.json({
                success: true,
                prize,
                boxName: box.name,
                boxPrice: box.price
            });

        } catch (error) {
            console.error('Error opening box:', error);
            res.status(500).json({
                success: false,
                message: 'Error opening box'
            });
        }
    }

    // Select prize by probability
    selectPrizeByProbability(prizes) {
        const random = Math.random();
        let cumulativeProbability = 0;

        for (const prize of prizes) {
            cumulativeProbability += prize.probability;
            if (random <= cumulativeProbability) {
                return prize;
            }
        }

        // Fallback to last prize
        return prizes[prizes.length - 1];
    }

    // Get opening history
    async getHistory(req, res) {
        try {
            const { userId } = req.params;
            const history = this.openingHistory.get(userId) || [];

            res.json({
                success: true,
                history: history.slice(0, 50) // Last 50 openings
            });

        } catch (error) {
            console.error('Error getting history:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving history'
            });
        }
    }
}

module.exports = new LootboxController();
