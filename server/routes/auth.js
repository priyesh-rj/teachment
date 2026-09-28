const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required (name, email, password, phone, role).' });
    }

    if (!['teacher', 'school'].includes(role)) {
      return res.status(400).json({ error: "Role must be 'teacher' or 'school'." });
    }

    // Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default avatar
    const defaultAvatar = role === 'teacher' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      : 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80';

    const insertUserRes = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email.toLowerCase(), passwordHash, phone, role, defaultAvatar]
    );

    // Get user id (works for Postgres or SQLite)
    let userId;
    if (insertUserRes.rows && insertUserRes.rows[0] && insertUserRes.rows[0].id) {
      userId = insertUserRes.rows[0].id;
    } else if (insertUserRes.lastID) {
      userId = insertUserRes.lastID;
    } else {
      const u = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      userId = u.rows[0].id;
    }

    // Initialize corresponding profile
    if (role === 'teacher') {
      await db.query(
        `INSERT INTO teacher_profiles (user_id, profile_completion) VALUES ($1, 20)`,
        [userId]
      );
    } else {
      await db.query(
        `INSERT INTO school_profiles (user_id, school_name, profile_completion) VALUES ($1, $2, 20)`,
        [userId, name]
      );
    }

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), role, name },
      process.env.JWT_SECRET || 'teachment_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: userId, name, email: email.toLowerCase(), phone, role, avatar: defaultAvatar }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'teachment_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = userRes.rows[0];

    let profile = null;
    if (user.role === 'teacher') {
      const profRes = await db.query('SELECT * FROM teacher_profiles WHERE user_id = $1', [user.id]);
      profile = profRes.rows[0] || null;
    } else if (user.role === 'school') {
      const profRes = await db.query('SELECT * FROM school_profiles WHERE user_id = $1', [user.id]);
      profile = profRes.rows[0] || null;
    }

    res.json({ user, profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error fetching user details.' });
  }
});

// 1-Click Resilient Demo Login (Auto-recovering, never fails even if accounts are edited)
router.post('/demo', async (req, res) => {
  try {
    const { role = 'school' } = req.body;
    let user = null;

    if (role === 'school') {
      // 1. Try finding primary demo school account
      let userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', ['teachment.tech@gmail.com']);
      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      } else {
        // 2. Try finding any existing school account
        userRes = await db.query("SELECT * FROM users WHERE role = 'school' ORDER BY id ASC LIMIT 1");
        if (userRes.rows.length > 0) {
          user = userRes.rows[0];
        } else {
          // 3. Auto-provision demo school account
          const password_hash = await bcrypt.hash('password123', 10);
          const insUser = await db.query(
            `INSERT INTO users (name, email, password_hash, role, phone, avatar)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
              'Paradox International',
              'teachment.tech@gmail.com',
              password_hash,
              'school',
              '9335893076',
              'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
            ]
          );
          user = insUser.rows[0];

          await db.query(
            `INSERT INTO school_profiles (user_id, school_name, principal_name, board, about_text, state, district, city, address, logo_path, profile_completion)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              user.id,
              'Paradox International',
              'Teachment Team',
              'CBSE',
              'A leading progressive K-12 institution committed to modern pedagogical methods, academic excellence, and holistic student development.',
              'Maharashtra',
              'Mumbai',
              'Mumbai',
              'Sector 14, Bandra West, Mumbai, 400050',
              user.avatar,
              100
            ]
          );
        }
      }
    } else {
      // 1. Try finding primary demo teacher account
      let userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', ['teacher@teachment.com']);
      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      } else {
        // 2. Try finding any existing teacher account
        userRes = await db.query("SELECT * FROM users WHERE role = 'teacher' ORDER BY id ASC LIMIT 1");
        if (userRes.rows.length > 0) {
          user = userRes.rows[0];
        } else {
          // 3. Auto-provision demo teacher account
          const password_hash = await bcrypt.hash('password123', 10);
          const insUser = await db.query(
            `INSERT INTO users (name, email, password_hash, role, phone, avatar)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
              'Pradeep Madheshia',
              'teacher@teachment.com',
              password_hash,
              'teacher',
              '9335893076',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            ]
          );
          user = insUser.rows[0];

          await db.query(
            `INSERT INTO teacher_profiles (user_id, subject, post, qualifications, syllabus, experience_years, medium, state, district, city, pin_code, gender, parsed_skills, profile_completion)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              user.id,
              'Computer Science',
              'PGT',
              'M.Tech Computer Science, B.Ed.',
              'CBSE',
              6,
              'English',
              'Uttar Pradesh',
              'Kushinagar',
              'Kushinagar',
              '274304',
              'Male',
              'Python, Data Structures, Machine Learning, Web Development, CBSE Curriculum',
              90
            ]
          );
        }
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'teachment_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    let profile = null;
    if (user.role === 'teacher') {
      let profRes = await db.query('SELECT * FROM teacher_profiles WHERE user_id = $1', [user.id]);
      if (profRes.rows.length === 0) {
        await db.query(`INSERT INTO teacher_profiles (user_id) VALUES ($1)`, [user.id]);
        profRes = await db.query('SELECT * FROM teacher_profiles WHERE user_id = $1', [user.id]);
      }
      profile = profRes.rows[0];

      // If teacher profile is empty but resume exists, auto-sync from resume
      if (!profile.subject && profile.resume_path) {
        try {
          const { parseResumeFile } = require('../services/resumeParser');
          const absPath = path.join(__dirname, '..', profile.resume_path.replace(/^\//, ''));
          if (fs.existsSync(absPath)) {
            const ext = await parseResumeFile(absPath);
            await db.query(
              `UPDATE teacher_profiles SET
                subject = COALESCE($1, subject),
                post = COALESCE($2, post),
                qualifications = COALESCE($3, qualifications),
                experience_years = CASE WHEN $4 > 0 THEN $4 ELSE experience_years END,
                city = COALESCE($5, city),
                state = COALESCE($6, state),
                parsed_skills = COALESCE($7, parsed_skills),
                profile_completion = 90
               WHERE user_id = $8`,
              [
                ext.subject || 'Science & Maths',
                ext.post || 'TGT',
                (ext.qualifications && ext.qualifications.length > 0) ? ext.qualifications.join(', ') : 'CTET, D.El.Ed, B.Tech',
                ext.experience_years || 7,
                ext.city || 'Lucknow',
                ext.state || 'Uttar Pradesh',
                (ext.skills && ext.skills.length > 0) ? ext.skills.join(', ') : 'Classroom Management, Science, Maths, Lesson Planning',
                user.id
              ]
            );
            const refreshed = await db.query('SELECT * FROM teacher_profiles WHERE user_id = $1', [user.id]);
            profile = refreshed.rows[0];
          }
        } catch (e) {
          console.warn('Auto-sync profile on demo login:', e.message);
        }
      }
    } else {
      const profRes = await db.query('SELECT * FROM school_profiles WHERE user_id = $1', [user.id]);
      profile = profRes.rows[0] || null;
    }

    res.json({
      message: 'Demo logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      profile
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Server error during demo login.' });
  }
});

module.exports = router;
