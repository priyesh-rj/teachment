const path = require('path');
const fs = require('fs');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

async function migrateToNeon() {
  console.log('====================================================');
  console.log('🚀 TEACHMENT - SQLite to Neon PostgreSQL Data Migration');
  console.log('====================================================');

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('localhost') || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    console.log('❌ DATABASE_URL is not configured for Neon!');
    console.log('');
    console.log('👉 Please set your Neon connection string in "server/.env":');
    console.log('   DATABASE_URL=postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require');
    console.log('   USE_POSTGRES=true');
    console.log('   Then rerun: npm run migrate:neon');
    console.log('====================================================');
    process.exit(1);
  }

  // 1. Connect to SQLite source
  const sqlitePath = path.join(__dirname, '..', 'teachment.sqlite');
  if (!fs.existsSync(sqlitePath)) {
    console.error(`❌ SQLite source database not found at: ${sqlitePath}`);
    process.exit(1);
  }

  const sqliteDb = new sqlite3.Database(sqlitePath);
  const sqliteQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  };

  // 2. Connect to Neon destination
  console.log(`📡 Connecting to Neon PostgreSQL...`);
  const pgPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    await pgPool.query('SELECT 1');
    console.log('✅ Connected to Neon PostgreSQL.');
  } catch (connErr) {
    console.error('❌ Failed to connect to Neon PostgreSQL:', connErr.message);
    sqliteDb.close();
    process.exit(1);
  }

  try {
    // 3. Create / verify schema on Neon
    console.log('🛠️ Creating / verifying tables on Neon...');
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');

    await pgPool.query(schemaSql);
    await pgPool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_skills TEXT;');
    console.log('✅ Neon schema verified.');

    // 4. Migrate users
    console.log('📦 Migrating users...');
    const users = await sqliteQuery('SELECT * FROM users ORDER BY id ASC');
    for (const u of users) {
      await pgPool.query(
        `INSERT INTO users (id, name, email, password_hash, phone, role, avatar, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           phone = EXCLUDED.phone,
           role = EXCLUDED.role,
           avatar = EXCLUDED.avatar,
           created_at = EXCLUDED.created_at`,
        [u.id, u.name, u.email, u.password_hash, u.phone, u.role, u.avatar, u.created_at]
      );
    }
    console.log(`   ✔️  Users migrated: ${users.length}`);

    // 5. Migrate school_profiles
    console.log('📦 Migrating school_profiles...');
    const schools = await sqliteQuery('SELECT * FROM school_profiles ORDER BY id ASC');
    for (const s of schools) {
      await pgPool.query(
        `INSERT INTO school_profiles (
           id, user_id, school_name, principal_name, board, about_text,
           state, district, city, address, logo_path, profile_completion
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           school_name = EXCLUDED.school_name,
           principal_name = EXCLUDED.principal_name,
           board = EXCLUDED.board,
           about_text = EXCLUDED.about_text,
           state = EXCLUDED.state,
           district = EXCLUDED.district,
           city = EXCLUDED.city,
           address = EXCLUDED.address,
           logo_path = EXCLUDED.logo_path,
           profile_completion = EXCLUDED.profile_completion`,
        [
          s.id, s.user_id, s.school_name, s.principal_name, s.board, s.about_text,
          s.state, s.district, s.city, s.address, s.logo_path, s.profile_completion
        ]
      );
    }
    console.log(`   ✔️  School profiles migrated: ${schools.length}`);

    // 6. Migrate teacher_profiles
    console.log('📦 Migrating teacher_profiles...');
    const teachers = await sqliteQuery('SELECT * FROM teacher_profiles ORDER BY id ASC');
    for (const t of teachers) {
      await pgPool.query(
        `INSERT INTO teacher_profiles (
           id, user_id, subject, post, qualifications, syllabus, experience_years,
           medium, state, district, city, pin_code, gender, resume_path,
           parsed_skills, profile_completion
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO UPDATE SET
           subject = EXCLUDED.subject,
           post = EXCLUDED.post,
           qualifications = EXCLUDED.qualifications,
           syllabus = EXCLUDED.syllabus,
           experience_years = EXCLUDED.experience_years,
           medium = EXCLUDED.medium,
           state = EXCLUDED.state,
           district = EXCLUDED.district,
           city = EXCLUDED.city,
           pin_code = EXCLUDED.pin_code,
           gender = EXCLUDED.gender,
           resume_path = EXCLUDED.resume_path,
           parsed_skills = EXCLUDED.parsed_skills,
           profile_completion = EXCLUDED.profile_completion`,
        [
          t.id, t.user_id, t.subject, t.post, t.qualifications, t.syllabus, t.experience_years,
          t.medium, t.state, t.district, t.city, t.pin_code, t.gender, t.resume_path,
          t.parsed_skills, t.profile_completion
        ]
      );
    }
    console.log(`   ✔️  Teacher profiles migrated: ${teachers.length}`);

    // 7. Migrate jobs
    console.log('📦 Migrating jobs...');
    const jobs = await sqliteQuery('SELECT * FROM jobs ORDER BY id ASC');
    for (const j of jobs) {
      await pgPool.query(
        `INSERT INTO jobs (
           id, school_id, title, subject, post_level, experience_required,
           min_salary, max_salary, shift_timings, openings, job_type,
           required_skills, status, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           school_id = EXCLUDED.school_id,
           title = EXCLUDED.title,
           subject = EXCLUDED.subject,
           post_level = EXCLUDED.post_level,
           experience_required = EXCLUDED.experience_required,
           min_salary = EXCLUDED.min_salary,
           max_salary = EXCLUDED.max_salary,
           shift_timings = EXCLUDED.shift_timings,
           openings = EXCLUDED.openings,
           job_type = EXCLUDED.job_type,
           required_skills = EXCLUDED.required_skills,
           status = EXCLUDED.status,
           created_at = EXCLUDED.created_at`,
        [
          j.id, j.school_id, j.title, j.subject, j.post_level, j.experience_required,
          j.min_salary, j.max_salary, j.shift_timings, j.openings, j.job_type,
          j.required_skills || null, j.status || 'Open', j.created_at
        ]
      );
    }
    console.log(`   ✔️  Jobs migrated: ${jobs.length}`);

    // 8. Migrate job_applications
    console.log('📦 Migrating job_applications...');
    const applications = await sqliteQuery('SELECT * FROM job_applications ORDER BY id ASC');
    for (const a of applications) {
      await pgPool.query(
        `INSERT INTO job_applications (
           id, job_id, teacher_id, ai_match_score, status, applied_at
         ) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           ai_match_score = EXCLUDED.ai_match_score,
           status = EXCLUDED.status,
           applied_at = EXCLUDED.applied_at`,
        [a.id, a.job_id, a.teacher_id, a.ai_match_score, a.status, a.applied_at]
      );
    }
    console.log(`   ✔️  Job applications migrated: ${applications.length}`);

    // 9. Reset Sequences in PostgreSQL
    console.log('🔄 Synchronizing PostgreSQL auto-increment sequences...');
    const seqTables = ['users', 'school_profiles', 'teacher_profiles', 'jobs', 'job_applications'];
    for (const t of seqTables) {
      await pgPool.query(`
        SELECT setval(
          pg_get_serial_sequence('${t}', 'id'),
          COALESCE((SELECT MAX(id) FROM ${t}), 1)
        )
      `);
    }
    console.log('✅ Sequences synchronized.');

    console.log('====================================================');
    console.log('🎉 Data migration to Neon PostgreSQL COMPLETED!');
    console.log(`   Total Users:        ${users.length}`);
    console.log(`   Total Schools:      ${schools.length}`);
    console.log(`   Total Teachers:     ${teachers.length}`);
    console.log(`   Total Jobs:         ${jobs.length}`);
    console.log(`   Total Applications: ${applications.length}`);
    console.log('====================================================');
    console.log('🚀 You can now start the server: npm run dev');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

migrateToNeon();
