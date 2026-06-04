const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcryptjs');
const { generateToken, authMiddleware } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helpers
function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: !!row.completed,
    due_date: row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Routes
app.get('/api/tasks', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(rowToTask));
  });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { title, description, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const stmt = db.prepare('INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)');
  stmt.run(userId, title, description || '', due_date || null, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rowToTask(row));
    });
  });
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const { title, description, completed, due_date } = req.body;
  const updated_at = new Date().toISOString();
  db.run(
    'UPDATE tasks SET title = ?, description = ?, completed = ?, due_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    [title, description, completed ? 1 : 0, due_date || null, updated_at, id, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(rowToTask(row));
      });
    }
  );
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hash = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  stmt.run(name || '', email, hash, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT id, name, email FROM users WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const token = generateToken(row);
      res.status(201).json({ user: row, token });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, name: row.name, email: row.email };
    const token = generateToken(user);
    res.json({ user, token });
  });
});

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
