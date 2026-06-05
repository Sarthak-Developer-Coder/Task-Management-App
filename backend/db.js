const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '..', 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  // Ensure migration: if tasks table existed without user_id, add the column
  db.all("PRAGMA table_info(tasks)", (err, rows) => {
    if (err) return console.error('PRAGMA failed', err);
    const hasUserId = rows && rows.some(r => r.name === 'user_id');
    if (!hasUserId) {
      db.run('ALTER TABLE tasks ADD COLUMN user_id INTEGER', (e) => {
        if (e) console.error('Failed to add user_id column:', e.message);
        else console.log('Migrated: added user_id to tasks');
      });
    }
  });
});

module.exports = db;