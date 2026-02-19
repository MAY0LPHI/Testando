const db = require('./database');

class Album {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM albums', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getUserProgress(userId, albumId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_album_progress WHERE user_id = ? AND album_id = ?',
        [userId, albumId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static getAllUserProgress(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT uap.*, a.name, a.total_stickers, a.reward 
         FROM user_album_progress uap 
         JOIN albums a ON uap.album_id = a.id 
         WHERE uap.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static initializeUserProgress(userId, albumId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO user_album_progress (user_id, album_id, stickers_collected, progress) VALUES (?, ?, ?, ?)',
        [userId, albumId, '[]', 0],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  static updateProgress(userId, albumId, stickersCollected, progress) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE user_album_progress SET stickers_collected = ?, progress = ? WHERE user_id = ? AND album_id = ?',
        [JSON.stringify(stickersCollected), progress, userId, albumId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static completeAlbum(userId, albumId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE user_album_progress SET completed = 1 WHERE user_id = ? AND album_id = ?',
        [userId, albumId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = Album;
