const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticateToken, optionalToken, requireRole } = require('../middleware/auth');

// Multer configuration for school logo & profile pictures
const schoolLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'school-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const schoolLogoFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || (file.mimetype && file.mimetype.startsWith('image/'))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed for school logo/profile photo.'), false);
  }
};

const uploadSchoolLogo = multer({
  storage: schoolLogoStorage,
  fileFilter: schoolLogoFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 0. BROWSE ALL REGISTERED TEACHERS / EDUCATORS DIRECTORY (For Employers/Schools)
router.get('/teachers', optionalToken, async (req, res) => {
  try {
    const { search, subject, post, city } = req.query;

    let queryText = `
      SELECT 
        tp.id as profile_id,
        tp.user_id,
        tp.subject,
        tp.post,
        tp.qualifications,
        tp.syllabus,
        tp.experience_years,
        tp.medium,
        tp.state,
        tp.district,
        tp.city,
        tp.pin_code,
        tp.gender,
        tp.resume_path,
        tp.parsed_skills,
        tp.profile_completion,
        u.name,
        u.email,
        u.phone,
        u.avatar,
        u.created_at as joined_at
      FROM teacher_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE u.role = 'teacher'
    `;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
      queryText += ` AND (
        LOWER(u.name) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(tp.subject, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(tp.city, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(tp.parsed_skills, '')) LIKE LOWER($${paramIndex}) OR
        LOWER(COALESCE(tp.qualifications, '')) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (subject && subject.trim() !== '') {
      queryText += ` AND LOWER(tp.subject) LIKE LOWER($${paramIndex})`;
      params.push(`%${subject.trim()}%`);
      paramIndex++;
    }

    if (post && post.trim() !== '') {
      queryText += ` AND LOWER(tp.post) = LOWER($${paramIndex})`;
      params.push(post.trim());
      paramIndex++;
    }

    if (city && city.trim() !== '') {
      queryText += ` AND LOWER(tp.city) LIKE LOWER($${paramIndex})`;
      params.push(`%${city.trim()}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY tp.profile_completion DESC, u.name ASC`;

    const result = await db.query(queryText, params);
    res.json({ teachers: result.rows });
  } catch (err) {
    console.error('Browse teachers error:', err);
    res.status(500).json({ error: 'Failed to retrieve teachers.' });
  }
});

// All school private routes require authentication and school role
router.use(authenticateToken);
router.use(requireRole('school'));

// Helper: Compute school profile completion
const computeSchoolProfileCompletion = (profile) => {
  const fields = ['school_name', 'principal_name', 'board', 'about_text', 'state', 'district', 'city', 'address', 'logo_path'];
  let filled = 0;
  for (const field of fields) {
    if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
      filled++;
    }
  }
  return Math.min(100, Math.round((filled / fields.length) * 100));
};

// 1. GET School Profile
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
      `SELECT * FROM school_profiles WHERE user_id = $1`,
      [req.user.id]
    );

    if (profRes.rows.length === 0) {
      await db.query(
        `INSERT INTO school_profiles (user_id, school_name, profile_completion) VALUES ($1, $2, 20)`,
        [req.user.id, userRes.rows[0].name]
      );
      profRes = await db.query(`SELECT * FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    }

    res.json({
      user: userRes.rows[0],
      profile: profRes.rows[0]
    });
  } catch (err) {
    console.error('Fetch school profile error:', err);
    res.status(500).json({ error: 'Failed to fetch school profile.' });
  }
});

// 2. UPDATE School Profile (Everything editable: name, email, phone, avatar/logo, school details, address, etc.)
router.put('/profile', async (req, res) => {
  try {
    const {
      name, email, phone, avatar,
      school_name, principal_name, board, about_text,
      state, district, city, address, logo_path
    } = req.body;

    const resolvedAvatar = avatar || logo_path;

    // Email validation & uniqueness check if changing email
    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const existing = await db.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2`,
        [trimmedEmail, req.user.id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'This email address is already in use by another account.' });
      }

      await db.query(
        `UPDATE users SET email = $1 WHERE id = $2`,
        [trimmedEmail, req.user.id]
      );
    }

    // Update users table details
    if (name !== undefined || phone !== undefined || resolvedAvatar !== undefined) {
      await db.query(
        `UPDATE users SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          avatar = COALESCE($3, avatar)
         WHERE id = $4`,
        [name, phone, resolvedAvatar, req.user.id]
      );
    }

    // Update school_profiles details
    await db.query(
      `UPDATE school_profiles SET
        school_name = COALESCE($1, school_name),
        principal_name = COALESCE($2, principal_name),
        board = COALESCE($3, board),
        about_text = COALESCE($4, about_text),
        state = COALESCE($5, state),
        district = COALESCE($6, district),
        city = COALESCE($7, city),
        address = COALESCE($8, address),
        logo_path = COALESCE($9, logo_path)
       WHERE user_id = $10`,
      [
        school_name, principal_name, board, about_text,
        state, district, city, address, resolvedAvatar,
        req.user.id
      ]
    );

    const updatedProf = await db.query(`SELECT * FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    const completion = computeSchoolProfileCompletion(updatedProf.rows[0]);
    await db.query(`UPDATE school_profiles SET profile_completion = $1 WHERE user_id = $2`, [completion, req.user.id]);

    const userRes = await db.query(`SELECT id, name, email, phone, role, avatar FROM users WHERE id = $1`, [req.user.id]);
    const finalProf = await db.query(`SELECT * FROM school_profiles WHERE user_id = $1`, [req.user.id]);

    res.json({
      message: 'School profile updated successfully',
      user: userRes.rows[0],
      profile: finalProf.rows[0]
    });
  } catch (err) {
    console.error('Update school profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to update school profile.' });
  }
});

// 2.1 UPLOAD School Logo / Profile Picture
router.post('/avatar', uploadSchoolLogo.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid image file (JPG, PNG, WEBP).' });
    }

    const relativePath = `/uploads/logos/${req.file.filename}`;

    await db.query(`UPDATE users SET avatar = $1 WHERE id = $2`, [relativePath, req.user.id]);
    await db.query(`UPDATE school_profiles SET logo_path = $1 WHERE user_id = $2`, [relativePath, req.user.id]);

    const userRes = await db.query(`SELECT id, name, email, phone, role, avatar FROM users WHERE id = $1`, [req.user.id]);
    const profRes = await db.query(`SELECT * FROM school_profiles WHERE user_id = $1`, [req.user.id]);

    res.json({
      message: 'School logo / profile picture updated successfully',
      avatar: relativePath,
      logo_path: relativePath,
      user: userRes.rows[0],
      profile: profRes.rows[0]
    });
  } catch (err) {
    console.error('School avatar upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload profile photo.' });
  }
});

// 3. GET School's Posted Jobs ("Your Job Post")
router.get('/jobs', async (req, res) => {
  try {
    const schoolProf = await db.query(`SELECT id FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    if (schoolProf.rows.length === 0) {
      return res.status(404).json({ error: 'School profile not found.' });
    }
    const schoolId = schoolProf.rows[0].id;

    const jobsRes = await db.query(
      `SELECT 
        j.*,
        COUNT(ja.id) as applicant_count,
        MAX(ja.ai_match_score) as top_match_score
       FROM jobs j
       LEFT JOIN job_applications ja ON j.id = ja.job_id
       WHERE j.school_id = $1
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [schoolId]
    );

    res.json({ jobs: jobsRes.rows });
  } catch (err) {
    console.error('Fetch school jobs error:', err);
    res.status(500).json({ error: 'Failed to retrieve posted jobs.' });
  }
});

// 4. POST New Job Vacancy
router.post('/jobs', async (req, res) => {
  try {
    const {
      title, subject, post_level, experience_required,
      min_salary, max_salary, shift_timings, openings, job_type, required_skills
    } = req.body;

    if (!title || !subject || !post_level) {
      return res.status(400).json({ error: 'Title, subject, and post level are required.' });
    }

    const schoolProf = await db.query(`SELECT id FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    if (schoolProf.rows.length === 0) {
      return res.status(404).json({ error: 'School profile not found.' });
    }
    const schoolId = schoolProf.rows[0].id;

    const insertRes = await db.query(
      `INSERT INTO jobs (
        school_id, title, subject, post_level, experience_required,
        min_salary, max_salary, shift_timings, openings, job_type, status, required_skills
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open', $11)`,
      [
        schoolId, title, subject, post_level,
        experience_required || 0,
        min_salary || 10000,
        max_salary || 20000,
        shift_timings || '10:00AM - 2:00PM',
        openings || 1,
        job_type || 'Onsite',
        required_skills || null
      ]
    );

    res.status(201).json({
      message: 'Job vacancy published successfully!',
      jobId: insertRes.rows[0]?.id || insertRes.lastID
    });
  } catch (err) {
    console.error('Post job error:', err);
    res.status(500).json({ error: 'Failed to create job posting.' });
  }
});

// 5. UPDATE Job Listing / Status (Edit, Close)
router.put('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      title, subject, post_level, experience_required,
      min_salary, max_salary, shift_timings, openings, job_type, status,
      required_skills
    } = req.body;

    const schoolProf = await db.query(`SELECT id FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    const schoolId = schoolProf.rows[0].id;

    // Verify ownership
    const jobCheck = await db.query(`SELECT id FROM jobs WHERE id = $1 AND school_id = $2`, [jobId, schoolId]);
    if (jobCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Job not found or access denied.' });
    }

    await db.query(
      `UPDATE jobs SET
        title = COALESCE($1, title),
        subject = COALESCE($2, subject),
        post_level = COALESCE($3, post_level),
        experience_required = COALESCE($4, experience_required),
        min_salary = COALESCE($5, min_salary),
        max_salary = COALESCE($6, max_salary),
        shift_timings = COALESCE($7, shift_timings),
        openings = COALESCE($8, openings),
        job_type = COALESCE($9, job_type),
        status = COALESCE($10, status),
        required_skills = COALESCE($11, required_skills)
       WHERE id = $12`,
      [
        title ?? null,
        subject ?? null,
        post_level ?? null,
        experience_required !== undefined ? experience_required : null,
        min_salary !== undefined ? min_salary : null,
        max_salary !== undefined ? max_salary : null,
        shift_timings ?? null,
        openings !== undefined ? openings : null,
        job_type ?? null,
        status ?? null,
        required_skills !== undefined ? required_skills : null,
        jobId
      ]
    );

    res.json({ message: 'Job updated successfully.' });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Failed to update job vacancy.' });
  }
});

// 6. DELETE Job Listing
router.delete('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const schoolProf = await db.query(`SELECT id FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    const schoolId = schoolProf.rows[0].id;

    const jobCheck = await db.query(`SELECT id FROM jobs WHERE id = $1 AND school_id = $2`, [jobId, schoolId]);
    if (jobCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Job not found or access denied.' });
    }

    await db.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
    res.json({ message: 'Job vacancy deleted successfully.' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job vacancy.' });
  }
});

// 7. VIEW APPLICANTS (Direct Recruitment Flow: Uncensored Contact Info + AI Match Score)
router.get('/jobs/:id/applicants', async (req, res) => {
  try {
    const jobId = req.params.id;
    const schoolProf = await db.query(`SELECT id FROM school_profiles WHERE user_id = $1`, [req.user.id]);
    const schoolId = schoolProf.rows[0].id;

    // Check ownership
    const jobCheck = await db.query(`SELECT * FROM jobs WHERE id = $1 AND school_id = $2`, [jobId, schoolId]);
    if (jobCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Job not found or access denied.' });
    }

    const applicantsRes = await db.query(
      `SELECT 
        ja.id as application_id,
        ja.ai_match_score,
        ja.status as application_status,
        ja.applied_at,
        u.name as candidate_name,
        u.email as candidate_email,
        u.phone as candidate_phone,
        u.avatar as candidate_avatar,
        tp.id as teacher_profile_id,
        tp.subject,
        tp.post,
        tp.qualifications,
        tp.syllabus,
        tp.experience_years,
        tp.medium,
        tp.state,
        tp.district,
        tp.city,
        tp.pin_code,
        tp.gender,
        tp.resume_path,
        tp.parsed_skills
       FROM job_applications ja
       JOIN teacher_profiles tp ON ja.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       WHERE ja.job_id = $1
       ORDER BY ja.ai_match_score DESC, ja.applied_at DESC`,
      [jobId]
    );

    res.json({
      job: jobCheck.rows[0],
      applicants: applicantsRes.rows
    });
  } catch (err) {
    console.error('View applicants error:', err);
    res.status(500).json({ error: 'Failed to retrieve applicants.' });
  }
});

// 8. UPDATE Application Status (Shortlisted, Contacted, Rejected)
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!['Applied', 'Shortlisted', 'Contacted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid application status.' });
    }

    await db.query(`UPDATE job_applications SET status = $1 WHERE id = $2`, [status, applicationId]);
    res.json({ message: `Applicant status marked as ${status}.` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update application status.' });
  }
});

module.exports = router;

