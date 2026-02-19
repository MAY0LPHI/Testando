const db = require('./database');

class User {
  static create(username, email, hashedPassword) {
    return new Promise((resolve, reject) => {
      const signupBonus = parseFloat(process.env.SIGNUP_BONUS) || 4.00;
      db.run(
        'INSERT INTO users (username, email, password, balance) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, signupBonus],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static updateBalance(userId, newBalance) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET balance = ? WHERE id = ?',
        [newBalance, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, username, email, balance, created_at FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = User;
