const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Resilient dynamic resume serving from Database if physical file is missing from disk
app.get('/uploads/resumes/:filename', async (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', 'resumes', req.params.filename);
  if (fs.existsSync(filePath)) {
    return next();
  }
  try {
    const resumePathQuery = `/uploads/resumes/${req.params.filename}`;
    const result = await db.query(
      `SELECT resume_data, resume_filename FROM teacher_profiles WHERE resume_path = $1 OR resume_path LIKE $2 LIMIT 1`,
      [resumePathQuery, `%${req.params.filename}`]
    );
    if (result.rows.length > 0 && result.rows[0].resume_data) {
      const row = result.rows[0];
      const base64Data = row.resume_data.replace(/^data:application\/pdf;base64,/, '');
      const buf = Buffer.from(base64Data, 'base64');
      const resumeDir = path.join(__dirname, 'uploads', 'resumes');
      if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
      fs.writeFileSync(filePath, buf);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(row.resume_filename || req.params.filename)}"`);
      return res.send(buf);
    }
  } catch (err) {
    console.warn('Could not restore resume from DB:', err.message);
  }
  next();
});

// Serve static uploads (resumes, logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes (Mounted under both /api and direct to ensure Vercel and local parity)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/teacher', teacherRoutes);
app.use('/teacher', teacherRoutes);

app.use('/api/school', schoolRoutes);
app.use('/school', schoolRoutes);

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

if (!process.env.VERCEL && require.main === module) {
  startServer();
}

module.exports = app;
