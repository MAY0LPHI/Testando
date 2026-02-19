const db = require('./database');

class Lootbox {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM lootbox_types', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM lootbox_types WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static recordOpening(userId, lootboxId, prizeWon, prizeValue) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO lootbox_openings (user_id, lootbox_id, prize_won, prize_value) VALUES (?, ?, ?, ?)',
        [userId, lootboxId, prizeWon, prizeValue],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  static getUserOpenings(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT lo.*, lt.name as lootbox_name 
         FROM lootbox_openings lo 
         JOIN lootbox_types lt ON lo.lootbox_id = lt.id 
         WHERE lo.user_id = ? 
         ORDER BY lo.opened_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static getTotalOpenings() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM lootbox_openings', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }
}

module.exports = Lootbox;
