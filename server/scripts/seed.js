const bcrypt = require('bcryptjs');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

async function seed() {
  console.log('🌱 Starting database seed...');
  await db.initDatabase();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Clear existing data
  try {
    await db.query('DELETE FROM job_applications');
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM school_profiles');
    await db.query('DELETE FROM teacher_profiles');
    await db.query('DELETE FROM users');
    console.log('🧹 Cleaned existing tables.');
  } catch (e) {
    console.log('Initial cleanup note:', e.message);
  }

  // 1. Create Schools
  // School 1: Paradox (from screenshots)
  const school1User = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'school', $5)`,
    [
      'Ep-teachment Ep-01',
      'teachment.tech@gmail.com',
      passwordHash,
      '9335893076',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const school1UserId = school1User.rows[0]?.id || school1User.lastID;

  const school1Prof = await db.query(
    `INSERT INTO school_profiles (
      user_id, school_name, principal_name, board, about_text, state, district, city, address, logo_path, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 100)`,
    [
      school1UserId,
      'Paradox',
      'Teachment Team',
      'Cbse',
      'A leading progressive K-12 institution committed to modern pedagogical methods, academic excellence, and holistic student development.',
      'Maharashtra',
      'Mumbai',
      'Mumbai',
      'Sector 14, Bandra West, Mumbai, 400050',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const school1ProfId = school1Prof.rows[0]?.id || school1Prof.lastID;

  // School 2: Daffodils World School
  const school2User = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'school', $5)`,
    [
      'Daffodils World School Admin',
      'admin@daffodils.edu',
      passwordHash,
      '9829012345',
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const school2UserId = school2User.rows[0]?.id || school2User.lastID;

  const school2Prof = await db.query(
    `INSERT INTO school_profiles (
      user_id, school_name, principal_name, board, about_text, state, district, city, address, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 100)`,
    [
      school2UserId,
      'Daffodils World School',
      'Dr. Ananya Sen',
      'CBSE',
      'State-of-the-art infrastructure fostering innovative learning and holistic sports culture.',
      'Rajasthan',
      'Sikar',
      'Sikar',
      'Daffodils Campus, Sikar Bypass, Sikar, 332001'
    ]
  );
  const school2ProfId = school2Prof.rows[0]?.id || school2Prof.lastID;

  // Ensure sample resume file exists
  const resumeDir = path.join(__dirname, '..', 'uploads', 'resumes');
  if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true });
  }
  const samplePdfPath = path.join(resumeDir, 'sample_resume.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    // Generate a minimal valid PDF file
    const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 124 >>
stream
BT
/F1 20 Tf
50 720 Td
(TEACHMENT CANDIDATE RESUME) Tj
/F1 12 Tf
0 -40 Td
(Subject: Mathematics / Science | Level: PGT / TGT) Tj
0 -25 Td
(Qualifications: B.Ed, M.Sc Mathematics, CTET Qualified) Tj
0 -25 Td
(Experience: Classroom Instruction, Lesson Planning, CBSE Syllabus) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000399 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
468
%%EOF`;
    fs.writeFileSync(samplePdfPath, minimalPdf);
  }

  // 2. Create Teachers
  // Teacher 1: Match screenshot (Js-teachment Js-01)
  const teacher1User = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'teacher', $5)`,
    [
      'Js-teachment Js-01',
      'teacher@teachment.com',
      passwordHash,
      '9335893077',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const teacher1UserId = teacher1User.rows[0]?.id || teacher1User.lastID;

  const teacher1Prof = await db.query(
    `INSERT INTO teacher_profiles (
      user_id, subject, post, qualifications, syllabus, experience_years,
      medium, state, district, city, pin_code, gender, resume_path,
      parsed_skills, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      teacher1UserId,
      'Maths',
      'Pgt',
      'Tech',
      'Si',
      0, // Fresher
      'English',
      'Uk',
      'Mumbai',
      'Mumbai',
      '225001',
      'Male',
      '/uploads/resumes/sample_resume.pdf',
      'Calculus, Algebra, Pedagogy, Smart Classroom, CBSE Curriculum',
      100
    ]
  );
  const teacher1ProfId = teacher1Prof.rows[0]?.id || teacher1Prof.lastID;

  // Teacher 2: Pooja Verma (English Specialist)
  const teacher2User = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'teacher', $5)`,
    [
      'Pooja Verma',
      'pooja.verma@gmail.com',
      passwordHash,
      '9811223344',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const teacher2UserId = teacher2User.rows[0]?.id || teacher2User.lastID;

  const teacher2Prof = await db.query(
    `INSERT INTO teacher_profiles (
      user_id, subject, post, qualifications, syllabus, experience_years,
      medium, state, district, city, pin_code, gender, resume_path,
      parsed_skills, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      teacher2UserId,
      'English',
      'TGT',
      'B.Ed, M.A. English Literature',
      'CBSE',
      3,
      'English',
      'Maharashtra',
      'Mumbai',
      'Mumbai',
      '400001',
      'Female',
      '/uploads/resumes/sample_resume.pdf',
      'English Grammar, Creative Writing, Phonetics, Literature Analysis, Active Listening',
      100
    ]
  );
  const teacher2ProfId = teacher2Prof.rows[0]?.id || teacher2Prof.lastID;

  // Teacher 3: Amit Kumar (Computer Science)
  const teacher3User = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'teacher', $5)`,
    [
      'Amit Kumar',
      'amit.tech@gmail.com',
      passwordHash,
      '9988776655',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const teacher3UserId = teacher3User.rows[0]?.id || teacher3User.lastID;

  const teacher3Prof = await db.query(
    `INSERT INTO teacher_profiles (
      user_id, subject, post, qualifications, syllabus, experience_years,
      medium, state, district, city, pin_code, gender, resume_path,
      parsed_skills, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      teacher3UserId,
      'Computer Science',
      'PGT',
      'MCA, B.Ed',
      'CBSE',
      2,
      'English',
      'Maharashtra',
      'Mumbai',
      'Mumbai',
      '400050',
      'Male',
      '/uploads/resumes/sample_resume.pdf',
      'Python, SQL, Robotics, Computer Fundamentals, Web Development',
      100
    ]
  );
  const teacher3ProfId = teacher3Prof.rows[0]?.id || teacher3Prof.lastID;

  // 3. Create Jobs (Exact matches from screenshots)
  // Job 1: English Teacher at Paradox
  const job1 = await db.query(
    `INSERT INTO jobs (
      school_id, title, subject, post_level, experience_required,
      min_salary, max_salary, shift_timings, openings, job_type, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open', datetime('now', '-2 days'))`,
    [
      school1ProfId,
      'English Teacher',
      'English',
      'TGT',
      1,
      10000,
      20000,
      '10:00AM - 2:00PM',
      1,
      'Onsite'
    ]
  );
  const job1Id = job1.rows[0]?.id || job1.lastID;

  // Job 2: Computer Teacher at Paradox
  const job2 = await db.query(
    `INSERT INTO jobs (
      school_id, title, subject, post_level, experience_required,
      min_salary, max_salary, shift_timings, openings, job_type, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open', datetime('now', '-5 days'))`,
    [
      school1ProfId,
      'Computer Teacher',
      'Computer Science',
      'PGT',
      2,
      10000,
      20000,
      '09:00 - 2:00PM',
      1,
      'Onsite'
    ]
  );
  const job2Id = job2.rows[0]?.id || job2.lastID;

  // Job 3: English teacher Teacher at Daffodils World School
  const job3 = await db.query(
    `INSERT INTO jobs (
      school_id, title, subject, post_level, experience_required,
      min_salary, max_salary, shift_timings, openings, job_type, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open', datetime('now', '-1 days'))`,
    [
      school2ProfId,
      'English teacher Teacher',
      'English',
      'TGT',
      2,
      20000,
      40000,
      '08:00AM - 15:15PM',
      1,
      'Onsite'
    ]
  );
  const job3Id = job3.rows[0]?.id || job3.lastID;

  // Job 4: Senior Mathematics Lecturer
  const job4 = await db.query(
    `INSERT INTO jobs (
      school_id, title, subject, post_level, experience_required,
      min_salary, max_salary, shift_timings, openings, job_type, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open', datetime('now', '-3 hours'))`,
    [
      school1ProfId,
      'Mathematics Lecturer',
      'Maths',
      'PGT',
      0,
      18000,
      35000,
      '08:00AM - 1:30PM',
      2,
      'Onsite'
    ]
  );
  const job4Id = job4.rows[0]?.id || job4.lastID;

  // 4. Job Applications with AI Match Scores
  // Pooja Verma -> English Teacher at Paradox (High match: 94.5%)
  await db.query(
    `INSERT INTO job_applications (job_id, teacher_id, ai_match_score, status)
     VALUES ($1, $2, 94.50, 'Shortlisted')`,
    [job1Id, teacher2ProfId]
  );

  // Amit Kumar -> Computer Teacher at Paradox (High match: 96.2%)
  await db.query(
    `INSERT INTO job_applications (job_id, teacher_id, ai_match_score, status)
     VALUES ($1, $2, 96.20, 'Contacted')`,
    [job2Id, teacher3ProfId]
  );

  // Rahul Sharma (Js-01) -> English Teacher at Paradox (Cross subject: 72.8%)
  await db.query(
    `INSERT INTO job_applications (job_id, teacher_id, ai_match_score, status)
     VALUES ($1, $2, 72.80, 'Applied')`,
    [job1Id, teacher1ProfId]
  );

  // Rahul Sharma -> Mathematics Lecturer at Paradox (High match: 95.0%)
  await db.query(
    `INSERT INTO job_applications (job_id, teacher_id, ai_match_score, status)
     VALUES ($1, $2, 95.00, 'Applied')`,
    [job4Id, teacher1ProfId]
  );

  console.log('✅ Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Accounts:');
  console.log('School:   email: teachment.tech@gmail.com | pass: password123');
  console.log('Teacher:  email: teacher@teachment.com   | pass: password123');
  console.log('Pooja:    email: pooja.verma@gmail.com    | pass: password123');
  console.log('----------------------------------------------------');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
