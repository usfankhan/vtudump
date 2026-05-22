const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_super_secret_jwt_key_here';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the React frontend from the 'dist' folder
app.use(express.static(path.join(__dirname, '../dist')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Database Initialization
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('DB Connection Error:', err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'student'
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    subject TEXT,
    year TEXT,
    url TEXT,
    type TEXT,
    uploadedBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    link TEXT,
    imageUrl TEXT,
    active INTEGER DEFAULT 1
  )`);

  db.get("SELECT count(*) as count FROM users WHERE email = 'admin'", (err, row) => {
    if (row && row.count === 0) {
      bcrypt.hash('admin123', 10, (err, hash) => {
        db.run("INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')", ['admin', hash]);
      });
    }
  });
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], function(err) {
      if (err) return res.status(400).json({ error: "Email already exists" });
      const token = jwt.sign({ id: this.lastID, email, role: 'student' }, JWT_SECRET);
      res.json({ token, user: { id: this.lastID, email, role: 'student' } });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Invalid credentials" });
    bcrypt.compare(password, user.password, (err, match) => {
      if (!match) return res.status(400).json({ error: "Invalid credentials" });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- DOCUMENT ROUTES ---
app.get('/api/documents', (req, res) => {
  db.all("SELECT * FROM documents ORDER BY createdAt DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/documents', authenticateToken, upload.single('file'), (req, res) => {
  const { title, description, subject, year } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const url = 'http://localhost:5000/uploads/' + file.filename;
  const type = file.mimetype;
  const uploadedBy = req.user.email;

  db.run(`INSERT INTO documents (title, description, subject, year, url, type, uploadedBy) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [title, description, subject, year, url, type, uploadedBy], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, description, subject, year, url, type, uploadedBy });
  });
});

app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const id = req.params.id;
  // Note: For a complete implementation, you'd also delete the file from the uploads folder
  db.run("DELETE FROM documents WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted successfully" });
  });
});

// --- AD ROUTES ---
app.get('/api/ads', (req, res) => {
  db.all("SELECT * FROM ads", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/ads', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { title, description, link, imageUrl } = req.body;
  db.run(`INSERT INTO ads (title, description, link, imageUrl, active) 
          VALUES (?, ?, ?, ?, 1)`, [title, description, link, imageUrl], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, description, link, imageUrl, active: 1 });
  });
});

app.put('/api/ads/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { active } = req.body;
  db.run("UPDATE ads SET active = ? WHERE id = ?", [active ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated successfully" });
  });
});

// Serve the React frontend for any unknown routes (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
