const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const schoolRoutes = require('./routes/school');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client (reflect requesting origin for credentials support)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads (resumes, logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/school', schoolRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'TEACHMENT Backend API',
    database: db.getDbType(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

// Initialize Database & Start Server
const startServer = async () => {
  try {
    await db.initDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 TEACHMENT Server running on http://localhost:${PORT}`);
      console.log(`📁 Static files served at http://localhost:${PORT}/uploads`);
      console.log(`📡 Connected Database Type: ${db.getDbType().toUpperCase()}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
