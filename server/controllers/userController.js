// User Controller
class UserController {
    // In-memory storage (replace with database in production)
    constructor() {
        this.users = new Map();
    }

    // Get user balance
    async getBalance(req, res) {
        try {
            const userId = req.headers['user-id'] || req.query.userId || 'demo_user';

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            const user = this.users.get(userId) || { balance: 0.01 };

            res.json({
                success: true,
                balance: user.balance || 0.01
            });

        } catch (error) {
            console.error('Error getting balance:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving balance'
            });
        }
    }

    // Update user balance
    async updateBalance(req, res) {
        try {
            const { userId, amount, operation } = req.body;

            if (!userId || amount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters'
                });
            }

            let user = this.users.get(userId) || { balance: 0.01, transactions: [] };

            if (operation === 'add') {
                user.balance += parseFloat(amount);
            } else if (operation === 'deduct') {
                if (user.balance < parseFloat(amount)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient balance'
                    });
                }
                user.balance -= parseFloat(amount);
            } else {
                user.balance = parseFloat(amount);
            }

            // Add transaction
            user.transactions = user.transactions || [];
            user.transactions.push({
                amount: parseFloat(amount),
                operation,
                timestamp: new Date(),
                balance: user.balance
            });

            this.users.set(userId, user);

            res.json({
                success: true,
                balance: user.balance
            });

        } catch (error) {
            console.error('Error updating balance:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating balance'
            });
        }
    }

    // Get user profile
    async getProfile(req, res) {
        try {
            const { userId } = req.params;

            const user = this.users.get(userId) || {
                id: userId,
                balance: 0.01,
                boxesOpened: 0,
                prizesWon: 0,
                albumsCompleted: 0,
                createdAt: new Date()
            };

            res.json({
                success: true,
                user
            });

        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving profile'
            });
        }
    }

    // Get transaction history
    async getHistory(req, res) {
        try {
            const { userId } = req.params;

            const user = this.users.get(userId);
            const transactions = user?.transactions || [];

            res.json({
                success: true,
                transactions: transactions.slice(0, 50) // Last 50 transactions
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

module.exports = new UserController();
