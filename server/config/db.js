const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

// Dual DB Adapter: PostgreSQL (Neon / Cloud Postgres) with automatic SQLite fallback
const initDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPgUrl = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  const isNeon = dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require');
  const explicitlyDisabled = process.env.USE_POSTGRES === 'false';

  // Automatically attempt PostgreSQL if DATABASE_URL is set (especially Neon) unless explicitly disabled
  if (isPgUrl && !explicitlyDisabled && (process.env.USE_POSTGRES === 'true' || isNeon || !dbUrl.includes('localhost'))) {
    try {
      const { Pool } = require('pg');
      const poolConfig = {
        connectionString: dbUrl,
        connectionTimeoutMillis: 10000 // 10s for Neon serverless wake-up from cold starts
      };

      // Neon and cloud hosted Postgres require SSL
      if (isNeon || process.env.DATABASE_SSL === 'true' || !dbUrl.includes('localhost')) {
        poolConfig.ssl = {
          rejectUnauthorized: false
        };
      }

      console.log(`🔌 Attempting connection to PostgreSQL${isNeon ? ' (Neon Cloud)' : ''}...`);
      const pool = new Pool(poolConfig);

      // Test connection
      const testRes = await pool.query('SELECT 1 as connected');
      if (testRes.rows && testRes.rows.length > 0) {
        console.log(`✅ Connected successfully to ${isNeon ? 'Neon Serverless' : 'PostgreSQL'} database.`);
        pgPool = pool;
        dbType = 'postgres';
        await runMigrations();
        return;
      }
    } catch (err) {
      console.warn('⚠️ PostgreSQL / Neon connection failed:', err.message);
      if (process.env.USE_SQLITE_FALLBACK === 'false') {
        throw err;
      }
      console.log('🔄 Falling back to local SQLite database for instant localhost operation...');
    }
  }

  // SQLite Setup
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, '..', 'teachment.sqlite');
  
  await new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to open SQLite database', err);
        return reject(err);
      }
      console.log(`✅ Connected to local SQLite database at: ${dbPath}`);
      dbType = 'sqlite';
      resolve();
    });
  });

  await runMigrations();
};

// Run schema migration
const runMigrations = async () => {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (dbType === 'postgres') {
    // Convert SQLite AUTOINCREMENT to Postgres SERIAL
    const pgSql = schemaSql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
    await pgPool.query(pgSql);
    // Ensure required_skills column exists on jobs table
    await pgPool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_skills TEXT;');
    // Ensure resume columns exist on teacher_profiles table
    await pgPool.query('ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS resume_filename VARCHAR(255);');
    await pgPool.query('ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS resume_data TEXT;');
    // Clean up any legacy dummy sample resume references
    await pgPool.query("UPDATE teacher_profiles SET resume_path = NULL, resume_filename = NULL, resume_data = NULL WHERE resume_path LIKE '%sample_resume%';");
    console.log('✅ PostgreSQL / Neon tables verified/created with dynamic resume support.');
  } else {
    // Run SQLite statements
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await new Promise((resolve, reject) => {
        sqliteDb.run(stmt, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Safely ensure required_skills column exists on jobs table
    await new Promise((resolve) => {
      sqliteDb.run("ALTER TABLE jobs ADD COLUMN required_skills TEXT", () => {
        resolve(); // Ignore if column already exists
      });
    });

    // Safely ensure dynamic resume columns exist on teacher_profiles table
    await new Promise((resolve) => {
      sqliteDb.run("ALTER TABLE teacher_profiles ADD COLUMN resume_filename VARCHAR(255)", () => {
        resolve(); // Ignore if column already exists
      });
    });
    await new Promise((resolve) => {
      sqliteDb.run("ALTER TABLE teacher_profiles ADD COLUMN resume_data TEXT", () => {
        resolve(); // Ignore if column already exists
      });
    });

    // Clean up any legacy dummy sample resume references
    await new Promise((resolve) => {
      sqliteDb.run("UPDATE teacher_profiles SET resume_path = NULL, resume_filename = NULL, resume_data = NULL WHERE resume_path LIKE '%sample_resume%'", () => {
        resolve();
      });
    });

    console.log('✅ SQLite tables verified/created with dynamic resume support.');
  }
};

/**
 * Universal query runner:
 * Accepts Postgres style parameterization ($1, $2, ...) and standard SQL.
 * If running on SQLite, automatically converts $1, $2 to ?
 * If running on Postgres, automatically adds RETURNING id to INSERTs for uniform lastID behavior
 * and translates SQLite date helper functions.
 */
const query = async (text, params = []) => {
  const safeParams = params.map(p => (p === undefined ? null : p));

  if (dbType === 'postgres') {
    let pgText = text;

    // Convert SQLite datetime('now', ...) to PostgreSQL (NOW() - INTERVAL '...')
    // e.g. datetime('now', '-2 days') -> (NOW() - INTERVAL '2 days')
    // e.g. datetime('now', '-1 hour') -> (NOW() - INTERVAL '1 hour')
    pgText = pgText.replace(
      /datetime\s*\(\s*['"]now['"]\s*,\s*['"]-?(\d+)\s*(days?|hours?|mins?|minutes?|seconds?)['"]\s*\)/gi,
      "(NOW() - INTERVAL '$1 $2')"
    );

    // Automatically append RETURNING id for INSERT queries if not already present
    // This guarantees res.rows[0]?.id and res.lastID work identically across both SQLite and Postgres
    const isInsert = /^\s*INSERT\s+INTO/i.test(pgText);
    const hasReturning = /\bRETURNING\b/i.test(pgText);

    if (isInsert && !hasReturning) {
      pgText = `${pgText.trim().replace(/;+$/, '')} RETURNING id;`;
    }

    const res = await pgPool.query(pgText, safeParams);
    if (isInsert && res.rows && res.rows[0] && res.rows[0].id) {
      res.lastID = res.rows[0].id;
    }
    return res;
  }

  return new Promise((resolve, reject) => {
    // Convert $1, $2 ... to ? for SQLite
    const sqliteText = text.replace(/\$(\d+)/g, '?');
    
    const isSelect = /^\s*SELECT/i.test(sqliteText);
    const isInsert = /^\s*INSERT/i.test(sqliteText);

    if (isSelect) {
      sqliteDb.all(sqliteText, safeParams, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: (rows || []).length });
      });
    } else {
      sqliteDb.run(sqliteText, safeParams, function (err) {
        if (err) return reject(err);
        resolve({
          rows: isInsert ? [{ id: this.lastID }] : [],
          rowCount: this.changes,
          lastID: this.lastID
        });
      });
    }
  });
};

module.exports = {
  initDatabase,
  query,
  getDbType: () => dbType,
  getPool: () => pgPool
};
