const bcrypt = require('bcryptjs');
const db = require('../config/db');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function resetAndClean() {
  console.log('====================================================');
  console.log('🧹 TEACHMENT - Database Cleanup & Setup');
  console.log('   Retaining ONLY:');
  console.log('   1. School:  SD Public school babhanauli kushinagar');
  console.log('   2. Teacher: Pradeep Kumar Madheshia (teacher demo)');
  console.log('   Deleting all jobs/vacancies, applications & other accounts.');
  console.log('====================================================');

  await db.initDatabase();
  const dbType = db.getDbType();
  console.log(`📡 Operating on active database: ${dbType.toUpperCase()}`);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Delete all applications and jobs
  await db.query('DELETE FROM job_applications');
  await db.query('DELETE FROM jobs');
  console.log('🗑️  All vacancies and job applications deleted.');

  // 2. Clear all profiles and users
  await db.query('DELETE FROM school_profiles');
  await db.query('DELETE FROM teacher_profiles');
  await db.query('DELETE FROM users');
  console.log('🗑️  All other school and teacher profiles deleted.');

  // Reset sequence counters on Postgres if applicable
  if (dbType === 'postgres') {
    try {
      await db.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false)`);
      await db.query(`SELECT setval(pg_get_serial_sequence('school_profiles', 'id'), 1, false)`);
      await db.query(`SELECT setval(pg_get_serial_sequence('teacher_profiles', 'id'), 1, false)`);
      await db.query(`SELECT setval(pg_get_serial_sequence('jobs', 'id'), 1, false)`);
      await db.query(`SELECT setval(pg_get_serial_sequence('job_applications', 'id'), 1, false)`);
    } catch (seqErr) {
      console.log('Note on sequences:', seqErr.message);
    }
  }

  // 3. Create the ONE School: SD Public school babhanauli kushinagar
  console.log('🏫 Creating School: SD Public school babhanauli kushinagar...');
  const schoolUser = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'school', $5)`,
    [
      'SD Public school babhanauli kushinagar',
      's.d.publicschoolbabhanauli@gmail.com',
      passwordHash,
      '9335893076',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const schoolUserId = schoolUser.rows[0]?.id || schoolUser.lastID;

  await db.query(
    `INSERT INTO school_profiles (
      user_id, school_name, principal_name, board, about_text,
      state, district, city, address, logo_path, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 100)`,
    [
      schoolUserId,
      'SD Public school babhanauli kushinagar',
      'Principal SD Public School',
      'CBSE',
      'SD Public School, Babhanauli, Kushinagar is dedicated to educational excellence, holistic personality development, and nurturing future leaders with modern pedagogical standards.',
      'Uttar Pradesh',
      'Kushinagar',
      'Babhanauli',
      'Babhanauli, Kushinagar, Uttar Pradesh, 274304',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
    ]
  );
  console.log('✅ School created with user ID:', schoolUserId);

  // 4. Create the ONE Teacher Demo profile
  console.log('👨‍🏫 Creating Teacher Demo: Pradeep Kumar Madheshia...');
  const teacherUser = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role, avatar)
     VALUES ($1, $2, $3, $4, 'teacher', $5)`,
    [
      'Pradeep Kumar Madheshia',
      'teacher@teachment.com',
      passwordHash,
      '8375955572',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    ]
  );
  const teacherUserId = teacherUser.rows[0]?.id || teacherUser.lastID;

  await db.query(
    `INSERT INTO teacher_profiles (
      user_id, subject, post, qualifications, syllabus, experience_years,
      medium, state, district, city, pin_code, gender, resume_path,
      parsed_skills, profile_completion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 100)`,
    [
      teacherUserId,
      'Science & Maths',
      'TGT',
      'B.Ed, M.Sc Mathematics, CTET Qualified',
      'CBSE',
      7,
      'English',
      'Uttar Pradesh',
      'Kushinagar',
      'Babhanauli',
      '274304',
      'Male',
      '/uploads/resumes/sample_resume.pdf',
      'Classroom Management, Mathematics, Physics, Chemistry, Science, Lesson Planning, Student Assessment, CBSE Curriculum'
    ]
  );
  console.log('✅ Teacher created with user ID:', teacherUserId);

  // Synchronize SQLite local backup file too
  try {
    const sqlitePath = path.join(__dirname, '..', 'teachment.sqlite');
    const localDb = new sqlite3.Database(sqlitePath);
    await new Promise((resolve) => {
      localDb.serialize(() => {
        localDb.run('DELETE FROM job_applications');
        localDb.run('DELETE FROM jobs');
        localDb.run('DELETE FROM school_profiles');
        localDb.run('DELETE FROM teacher_profiles');
        localDb.run('DELETE FROM users');

        localDb.run(
          `INSERT INTO users (id, name, email, password_hash, phone, role, avatar)
           VALUES (1, 'SD Public school babhanauli kushinagar', 's.d.publicschoolbabhanauli@gmail.com', ?, '9335893076', 'school', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80')`,
          [passwordHash]
        );
        localDb.run(
          `INSERT INTO school_profiles (id, user_id, school_name, principal_name, board, about_text, state, district, city, address, logo_path, profile_completion)
           VALUES (1, 1, 'SD Public school babhanauli kushinagar', 'Principal SD Public School', 'CBSE', 'SD Public School, Babhanauli, Kushinagar is dedicated to educational excellence, holistic personality development, and nurturing future leaders with modern pedagogical standards.', 'Uttar Pradesh', 'Kushinagar', 'Babhanauli', 'Babhanauli, Kushinagar, Uttar Pradesh, 274304', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80', 100)`
        );

        localDb.run(
          `INSERT INTO users (id, name, email, password_hash, phone, role, avatar)
           VALUES (2, 'Pradeep Kumar Madheshia', 'teacher@teachment.com', ?, '8375955572', 'teacher', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')`,
          [passwordHash]
        );
        localDb.run(
          `INSERT INTO teacher_profiles (id, user_id, subject, post, qualifications, syllabus, experience_years, medium, state, district, city, pin_code, gender, resume_path, parsed_skills, profile_completion)
           VALUES (1, 2, 'Science & Maths', 'TGT', 'B.Ed, M.Sc Mathematics, CTET Qualified', 'CBSE', 7, 'English', 'Uttar Pradesh', 'Kushinagar', 'Babhanauli', '274304', 'Male', '/uploads/resumes/sample_resume.pdf', 'Classroom Management, Mathematics, Physics, Chemistry, Science, Lesson Planning, Student Assessment, CBSE Curriculum', 100)`
        );

        localDb.close(() => resolve());
      });
    });
    console.log('✅ Local SQLite mirrored to exact same clean state.');
  } catch (sqErr) {
    console.warn('Note on SQLite mirror:', sqErr.message);
  }

  console.log('====================================================');
  console.log('🎉 Database Cleanup Completed Successfully!');
  console.log('----------------------------------------------------');
  console.log('1. School Profile:');
  console.log('   Name:     SD Public school babhanauli kushinagar');
  console.log('   Email:    s.d.publicschoolbabhanauli@gmail.com');
  console.log('   Password: password123');
  console.log('   City:     Babhanauli, Kushinagar, UP');
  console.log('----------------------------------------------------');
  console.log('2. Teacher Demo Profile:');
  console.log('   Name:     Pradeep Kumar Madheshia');
  console.log('   Email:    teacher@teachment.com');
  console.log('   Password: password123');
  console.log('   City:     Babhanauli, Kushinagar, UP');
  console.log('----------------------------------------------------');
  console.log('3. Vacancies: 0 (All dummy vacancies deleted)');
  console.log('4. Applications: 0 (All dummy applications deleted)');
  console.log('====================================================');
  process.exit(0);
}

resetAndClean().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
