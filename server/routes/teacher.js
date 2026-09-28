const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const db = require('../config/db');
const { authenticateToken, optionalToken, requireRole } = require('../middleware/auth');

// Multer configuration for PDF resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resume files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Multer configuration for teacher profile avatar images
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || (file.mimetype && file.mimetype.startsWith('image/'))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed for profile photo.'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Helper: Compute profile completion percentage
const computeProfileCompletion = (profile) => {
  const fields = [
    'subject', 'post', 'qualifications', 'syllabus',
    'experience_years', 'medium', 'state', 'district',
    'city', 'pin_code', 'gender', 'resume_path'
  ];
  let filled = 0;
  for (const field of fields) {
    if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
      filled++;
    }
  }
  return Math.min(100, Math.round((filled / fields.length) * 100));
};

// 1. PUBLIC / OPTIONALLY AUTHENTICATED: BROWSE JOBS
router.get('/jobs', optionalToken, async (req, res) => {
  try {
    const { keyword, jobType, datePosted, experience, minSalary, maxSalary } = req.query;

    // Find teacher profile id if user is logged in as teacher
    let teacherId = null;
    if (req.user && req.user.role === 'teacher') {
      const teacherProf = await db.query(`SELECT id FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
      teacherId = teacherProf.rows[0] ? teacherProf.rows[0].id : null;
    }

    let queryText = `
      SELECT 
        j.*,
        s.school_name,
        s.principal_name,
        s.board,
        s.city as school_city,
        s.district as school_district,
        s.state as school_state,
        s.logo_path,
        CASE WHEN ja.id IS NOT NULL THEN 1 ELSE 0 END as is_applied,
        ja.status as application_status,
        ja.ai_match_score
      FROM jobs j
      JOIN school_profiles s ON j.school_id = s.id
      LEFT JOIN job_applications ja ON ja.job_id = j.id AND ja.teacher_id = $1
      WHERE j.status = 'Open'
    `;
    const params = [teacherId];
    let paramIndex = 2;

    if (keyword && keyword.trim() !== '') {
      queryText += ` AND (
        LOWER(j.title) LIKE LOWER($${paramIndex}) OR
        LOWER(j.subject) LIKE LOWER($${paramIndex}) OR
        LOWER(s.school_name) LIKE LOWER($${paramIndex}) OR
        LOWER(s.city) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${keyword.trim()}%`);
      paramIndex++;
    }

    if (jobType && jobType !== 'All') {
      queryText += ` AND j.job_type = $${paramIndex}`;
      params.push(jobType);
      paramIndex++;
    }

    // Date posted filter
    if (datePosted && datePosted !== 'All') {
      let intervalSql = '';
      if (datePosted === 'Last Hour') intervalSql = "j.created_at >= datetime('now', '-1 hour')";
      else if (datePosted === 'Last 24 Hour' || datePosted === 'Last 24 Hours') intervalSql = "j.created_at >= datetime('now', '-24 hours')";
      else if (datePosted === 'Last 7 Days') intervalSql = "j.created_at >= datetime('now', '-7 days')";
      else if (datePosted === 'Last 14 Days') intervalSql = "j.created_at >= datetime('now', '-14 days')";
      else if (datePosted === 'Last 30 Days') intervalSql = "j.created_at >= datetime('now', '-30 days')";

      if (intervalSql && db.getDbType() === 'sqlite') {
        queryText += ` AND ${intervalSql}`;
      } else if (intervalSql && db.getDbType() === 'postgres') {
        let pgInterval = '';
        if (datePosted === 'Last Hour') pgInterval = "j.created_at >= NOW() - INTERVAL '1 hour'";
        else if (datePosted === 'Last 24 Hour' || datePosted === 'Last 24 Hours') pgInterval = "j.created_at >= NOW() - INTERVAL '24 hours'";
        else if (datePosted === 'Last 7 Days') pgInterval = "j.created_at >= NOW() - INTERVAL '7 days'";
        else if (datePosted === 'Last 14 Days') pgInterval = "j.created_at >= NOW() - INTERVAL '14 days'";
        else if (datePosted === 'Last 30 Days') pgInterval = "j.created_at >= NOW() - INTERVAL '30 days'";
        if (pgInterval) queryText += ` AND ${pgInterval}`;
      }
    }

    // Experience filter
    if (experience && experience.trim() !== '') {
      const expItems = experience.split(',').map((s) => s.trim()).filter(Boolean);
      const expClauses = [];
      expItems.forEach((exp) => {
        if (exp === 'Fresher' || exp === '0') expClauses.push('j.experience_required = 0');
        else if (exp === '1 Year' || exp === '1') expClauses.push('j.experience_required = 1');
        else if (exp === '2 Year' || exp === '2') expClauses.push('j.experience_required = 2');
        else if (exp === '3 Year' || exp === '3') expClauses.push('j.experience_required = 3');
        else if (exp === '4 Year' || exp === '4') expClauses.push('j.experience_required = 4');
        else if (exp === 'Above' || exp === '5') expClauses.push('j.experience_required >= 5');
      });
      if (expClauses.length > 0) {
        queryText += ` AND (${expClauses.join(' OR ')})`;
      }
    }

    // Salary filters (monthly)
    if (minSalary && !isNaN(minSalary)) {
      queryText += ` AND (j.max_salary >= $${paramIndex} OR j.max_salary IS NULL)`;
      params.push(parseInt(minSalary, 10));
      paramIndex++;
    }
    if (maxSalary && !isNaN(maxSalary)) {
      queryText += ` AND (j.min_salary <= $${paramIndex} OR j.min_salary IS NULL)`;
      params.push(parseInt(maxSalary, 10));
      paramIndex++;
    }

    queryText += ` ORDER BY j.created_at DESC`;

    const result = await db.query(queryText, params);
    res.json({ jobs: result.rows });
  } catch (err) {
    console.error('Browse jobs error:', err);
    res.status(500).json({ error: 'Failed to retrieve jobs.' });
  }
});

// All teacher private routes require authentication and teacher role
router.use(authenticateToken);
router.use(requireRole('teacher'));

// 2. GET Teacher Profile
router.get('/profile', async (req, res) => {
  try {
    const userRes = await db.query(
      `SELECT id, name, email, phone, role, avatar FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let profRes = await db.query(
      `SELECT * FROM teacher_profiles WHERE user_id = $1`,
      [req.user.id]
    );

    if (profRes.rows.length === 0) {
      await db.query(`INSERT INTO teacher_profiles (user_id) VALUES ($1)`, [req.user.id]);
      profRes = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    }

    res.json({
      user: userRes.rows[0],
      profile: profRes.rows[0]
    });
  } catch (err) {
    console.error('Fetch teacher profile error:', err);
    res.status(500).json({ error: 'Failed to fetch teacher profile.' });
  }
});

// 2. UPDATE Teacher Profile
router.put('/profile', async (req, res) => {
  try {
    const {
      name, email, phone, avatar,
      subject, post, qualifications, syllabus,
      experience_years, medium, state, district, city, pin_code, gender,
      parsed_skills
    } = req.body;

    // Check email uniqueness if changing email
    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const existing = await db.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2`,
        [trimmedEmail, req.user.id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'This email address is already in use by another account.' });
      }
      await db.query(`UPDATE users SET email = $1 WHERE id = $2`, [trimmedEmail, req.user.id]);
    }

    // Update user table details if provided
    if (name !== undefined || phone !== undefined || avatar !== undefined) {
      await db.query(
        `UPDATE users SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          avatar = COALESCE($3, avatar)
         WHERE id = $4`,
        [name, phone, avatar, req.user.id]
      );
    }

    // Update teacher_profiles (everything editable)
    await db.query(
      `UPDATE teacher_profiles SET
        subject = $1,
        post = $2,
        qualifications = $3,
        syllabus = $4,
        experience_years = $5,
        medium = $6,
        state = $7,
        district = $8,
        city = $9,
        pin_code = $10,
        gender = $11,
        parsed_skills = COALESCE($12, parsed_skills)
       WHERE user_id = $13`,
      [
        subject, post, qualifications, syllabus,
        experience_years || 0, medium, state, district, city, pin_code, gender,
        parsed_skills, req.user.id
      ]
    );

    // Recompute profile completion
    const updatedProf = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    const completion = computeProfileCompletion(updatedProf.rows[0]);

    await db.query(
      `UPDATE teacher_profiles SET profile_completion = $1 WHERE user_id = $2`,
      [completion, req.user.id]
    );

    const userRes = await db.query(
      `SELECT id, name, email, phone, role, avatar FROM users WHERE id = $1`,
      [req.user.id]
    );
    const finalProf = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);

    res.json({
      message: 'Profile updated successfully',
      user: userRes.rows[0],
      profile: finalProf.rows[0]
    });
  } catch (err) {
    console.error('Update teacher profile error:', err);
    res.status(500).json({ error: 'Failed to update teacher profile.' });
  }
});

// 2.1 UPLOAD AVATAR / PROFILE PHOTO (Image file)
router.post('/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid image file (JPG, PNG, WEBP).' });
    }

    const relativePath = `/uploads/avatars/${req.file.filename}`;

    await db.query(
      `UPDATE users SET avatar = $1 WHERE id = $2`,
      [relativePath, req.user.id]
    );

    const userRes = await db.query(
      `SELECT id, name, email, phone, role, avatar FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      message: 'Profile picture updated successfully',
      avatar: relativePath,
      user: userRes.rows[0]
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload profile photo.' });
  }
});

// 3. UPLOAD RESUME (PDF)
const { parseResumeFile } = require('../services/resumeParser');

router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid PDF file.' });
    }

    const relativePath = `/uploads/resumes/${req.file.filename}`;
    const absolutePath = req.file.path;

    // 1. Direct High-Accuracy PDF Extraction via local parser
    let extracted = await parseResumeFile(absolutePath, req.file.originalname);
    let parsedSkills = extracted.skills && extracted.skills.length > 0
      ? extracted.skills.join(', ')
      : 'Classroom Management, Lesson Planning, Student Engagement, Pedagogy';

    // 2. Optionally query Python AI Microservice to enrich semantic skills if available
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(absolutePath), req.file.filename);

      const aiResponse = await axios.post(`${aiServiceUrl}/parse-resume`, formData, {
        headers: formData.getHeaders(),
        timeout: 5000
      });

      if (aiResponse.data && aiResponse.data.skills && Array.isArray(aiResponse.data.skills)) {
        const combined = Array.from(new Set([...extracted.skills, ...aiResponse.data.skills]));
        parsedSkills = combined.join(', ');
        extracted.skills = combined;
      }
      console.log('🤖 AI Resume Parsing merged:', parsedSkills);
    } catch (aiErr) {
      console.log('ℹ️ AI service optional enrichment skipped (local parser succeeded):', aiErr.message);
    }

    // 3. Fetch existing profile
    let currentProfRes = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    if (currentProfRes.rows.length === 0) {
      await db.query(`INSERT INTO teacher_profiles (user_id) VALUES ($1)`, [req.user.id]);
      currentProfRes = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    }
    const currentProf = currentProfRes.rows[0];

    // Determine values to update - prioritize extracted info when profile fields are empty or default
    const newSubject = extracted.subject || currentProf.subject || null;
    const newPost = extracted.post || currentProf.post || null;
    const newQuals = (extracted.qualifications && extracted.qualifications.length > 0)
      ? extracted.qualifications.join(', ')
      : (currentProf.qualifications || null);
    const newExp = (extracted.experience_years && extracted.experience_years > 0)
      ? extracted.experience_years
      : (currentProf.experience_years || 0);
    const newSyllabus = extracted.syllabus || currentProf.syllabus || 'CBSE';
    const newCity = extracted.city || currentProf.city || null;
    const newState = extracted.state || currentProf.state || null;

    // Update teacher_profiles with the new resume path, parsed skills, and extracted fields
    await db.query(
      `UPDATE teacher_profiles SET
        resume_path = $1,
        parsed_skills = $2,
        subject = COALESCE($3, subject),
        post = COALESCE($4, post),
        qualifications = COALESCE($5, qualifications),
        experience_years = CASE WHEN $6 > 0 THEN $6 ELSE experience_years END,
        syllabus = COALESCE($7, syllabus),
        city = COALESCE($8, city),
        state = COALESCE($9, state)
       WHERE user_id = $10`,
      [relativePath, parsedSkills, newSubject, newPost, newQuals, newExp, newSyllabus, newCity, newState, req.user.id]
    );

    // Update user name/phone if candidate details detected in resume and current user is placeholder
    const userRes = await db.query(`SELECT id, name, phone, email FROM users WHERE id = $1`, [req.user.id]);
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      const isPlaceholderName = !u.name || /js-teachment|demo/i.test(u.name);
      const isPlaceholderPhone = !u.phone || u.phone === '9335893077' || u.phone === '9335893076';

      const updateName = (isPlaceholderName && extracted.name) ? extracted.name : u.name;
      const updatePhone = (isPlaceholderPhone && extracted.phone) ? extracted.phone : u.phone;

      if (updateName !== u.name || updatePhone !== u.phone) {
        await db.query(`UPDATE users SET name = $1, phone = $2 WHERE id = $3`, [updateName, updatePhone, req.user.id]);
      }
    }

    // Recompute profile completion
    const updatedProfRes = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    const completion = computeProfileCompletion(updatedProfRes.rows[0]);
    await db.query(`UPDATE teacher_profiles SET profile_completion = $1 WHERE user_id = $2`, [completion, req.user.id]);

    const finalProf = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    const finalUser = await db.query(`SELECT id, name, email, phone, role, avatar FROM users WHERE id = $1`, [req.user.id]);

    res.json({
      message: 'Resume uploaded and parsed successfully',
      resumePath: relativePath,
      parsedSkills,
      parsedData: extracted,
      profile: finalProf.rows[0],
      user: finalUser.rows[0]
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: 'Failed to upload and process resume: ' + err.message });
  }
});

// (Browse jobs endpoint moved to top with optionalToken)

// 5. APPLY FOR JOB (Triggers AI Match Score calculation)
router.post('/apply/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const teacherProf = await db.query(`SELECT * FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    if (teacherProf.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }
    const teacher = teacherProf.rows[0];

    // Check if job exists
    const jobRes = await db.query(
      `SELECT j.*, s.school_name, s.city as school_city, s.state as school_state, s.board
       FROM jobs j
       JOIN school_profiles s ON j.school_id = s.id
       WHERE j.id = $1`,
      [jobId]
    );
    if (jobRes.rows.length === 0) {
      return res.status(404).json({ error: 'Job vacancy not found.' });
    }
    const job = jobRes.rows[0];

    // Check if already applied
    const existing = await db.query(
      `SELECT * FROM job_applications WHERE job_id = $1 AND teacher_id = $2`,
      [jobId, teacher.id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this position.' });
    }

    // Calculate AI Match Score via Python Microservice
    let aiScore = 75.0; // fallback default
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const matchPayload = {
        job_id: job.id,
        teacher_id: teacher.id,
        teacher: {
          post: teacher.post,
          subject: teacher.subject,
          experience_years: teacher.experience_years,
          qualifications: teacher.qualifications,
          city: teacher.city,
          state: teacher.state,
          pin_code: teacher.pin_code,
          parsed_skills: teacher.parsed_skills,
          resume_path: teacher.resume_path
        },
        job: {
          title: job.title,
          subject: job.subject,
          post_level: job.post_level,
          experience_required: job.experience_required,
          city: job.school_city,
          state: job.school_state,
          shift_timings: job.shift_timings
        }
      };

      const matchRes = await axios.post(`${aiServiceUrl}/calculate-match`, matchPayload, { timeout: 10000 });
      if (matchRes.data && typeof matchRes.data.match_score === 'number') {
        aiScore = matchRes.data.match_score;
      }
      console.log(`🎯 AI Compatibility Score computed for Job #${jobId} & Teacher #${teacher.id}: ${aiScore}%`);
    } catch (aiErr) {
      console.warn('⚠️ AI Match calculation service error/fallback:', aiErr.message);
      // Heuristic fallback calculation
      let score = 50;
      if (teacher.subject && job.subject && teacher.subject.toLowerCase() === job.subject.toLowerCase()) score += 20;
      if (teacher.post && job.post_level && teacher.post.toLowerCase() === job.post_level.toLowerCase()) score += 20;
      if (teacher.city && job.school_city && teacher.city.toLowerCase() === job.school_city.toLowerCase()) score += 10;
      aiScore = Math.min(98, score);
    }

    // Insert Application
    const applyRes = await db.query(
      `INSERT INTO job_applications (job_id, teacher_id, ai_match_score, status)
       VALUES ($1, $2, $3, 'Applied')`,
      [jobId, teacher.id, aiScore]
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      jobId,
      aiMatchScore: aiScore,
      status: 'Applied'
    });
  } catch (err) {
    console.error('Apply job error:', err);
    res.status(500).json({ error: 'Failed to submit job application.' });
  }
});

// 6. APPLIED JOBS LIST
router.get('/applied', async (req, res) => {
  try {
    const teacherProf = await db.query(`SELECT id FROM teacher_profiles WHERE user_id = $1`, [req.user.id]);
    if (teacherProf.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }

    const appliedRes = await db.query(
      `SELECT 
        ja.id as application_id,
        ja.ai_match_score,
        ja.status as application_status,
        ja.applied_at,
        j.*,
        s.school_name,
        s.city as school_city,
        s.district as school_district,
        s.state as school_state,
        s.logo_path
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN school_profiles s ON j.school_id = s.id
       WHERE ja.teacher_id = $1
       ORDER BY ja.applied_at DESC`,
      [teacherProf.rows[0].id]
    );

    res.json({ applications: appliedRes.rows });
  } catch (err) {
    console.error('Fetch applied jobs error:', err);
    res.status(500).json({ error: 'Failed to retrieve applied jobs.' });
  }
});

module.exports = router;


