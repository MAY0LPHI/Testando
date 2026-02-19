const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_id TEXT,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Lootboxes table
  db.run(`
    CREATE TABLE IF NOT EXISTS lootbox_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image_url TEXT
    )
  `);

  // User lootbox openings
  db.run(`
    CREATE TABLE IF NOT EXISTS lootbox_openings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lootbox_id INTEGER NOT NULL,
      prize_won TEXT NOT NULL,
      prize_value REAL,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lootbox_id) REFERENCES lootbox_types(id)
    )
  `);

  // Albums table
  db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      total_stickers INTEGER NOT NULL,
      reward TEXT NOT NULL
    )
  `);

  // User album progress
  db.run(`
    CREATE TABLE IF NOT EXISTS user_album_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      album_id INTEGER NOT NULL,
      stickers_collected TEXT DEFAULT '[]',
      progress INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (album_id) REFERENCES albums(id),
      UNIQUE(user_id, album_id)
    )
  `);

  // Insert default lootbox types
  db.run(`
    INSERT OR IGNORE INTO lootbox_types (id, name, price, description) VALUES
    (1, 'SKYDROP X', 5.00, 'Alinhe 3 para ganhar'),
    (2, 'FORTUNE X', 27.90, 'Alinhe 3 para ganhar'),
    (3, 'PRIME FORTUNE', 49.99, 'Melhor escolha + Somente prêmios físicos'),
    (4, 'ULTRA FORTUNE', 97.00, 'Somente prêmios físicos + Chance dobrada de prêmios altos'),
    (5, 'SKYDROP DELUXE', 197.00, 'Somente prêmios físicos'),
    (6, 'DIAMOND EDITION', 497.00, 'Somente prêmios físicos')
  `);

  // Insert default albums
  db.run(`
    INSERT OR IGNORE INTO albums (id, name, total_stickers, reward) VALUES
    (1, 'Audio Master 1', 10, 'KIT MASTER AUDIO'),
    (2, 'CINEMA CONTROLLER PS5 EDITION', 176, 'Controle Dualsense PS5 Original'),
    (3, 'PS5 PRO', 1872, 'PS5 PRO')
  `);
});

module.exports = db;
