const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

// Dual DB Adapter: PostgreSQL with automatic SQLite fallback
const initDatabase = async () => {
  if (process.env.DATABASE_URL && process.env.USE_POSTGRES === 'true') {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 3000
      });
      // Test connection
      await pool.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL database.');
      pgPool = pool;
      dbType = 'postgres';
      await runMigrations();
      return;
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed:', err.message);
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
    console.log('✅ PostgreSQL tables verified/created.');
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

    console.log('✅ SQLite tables verified/created with required_skills support.');
  }
};

/**
 * Universal query runner:
 * Accepts Postgres style parameterization ($1, $2, ...) and standard SQL.
 * If running on SQLite, automatically converts $1, $2 to ?
 */
const query = (text, params = []) => {
  const safeParams = params.map(p => (p === undefined ? null : p));
  if (dbType === 'postgres') {
    return pgPool.query(text, safeParams);
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
  getDbType: () => dbType
};
