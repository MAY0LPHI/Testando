const db = require('./database');

class Transaction {
  static create(userId, type, amount, paymentMethod = null, paymentId = null) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO transactions (user_id, type, amount, payment_method, payment_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, type, amount, paymentMethod, paymentId, 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  static updateStatus(transactionId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE transactions SET status = ? WHERE id = ?',
        [status, transactionId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static findByPaymentId(paymentId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM transactions WHERE payment_id = ?', [paymentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static getUserTransactions(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = Transaction;
