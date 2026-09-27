const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function run() {
  await db.initDatabase();
  const passwordHash = await bcrypt.hash('password123', 10);

  // Check if teachment.tech@gmail.com exists
  const existing = await db.query('SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)', ['teachment.tech@gmail.com']);
  if (existing.rows.length === 0) {
    console.log('Inserting teachment.tech@gmail.com demo school account...');
    const userRes = await db.query(
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
    const userId = userRes.rows[0]?.id || userRes.lastID;
    await db.query(
      `INSERT INTO school_profiles (
        user_id, school_name, principal_name, board, about_text, state, district, city, address, logo_path, profile_completion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 100)`,
      [
        userId,
        'Paradox International',
        'Teachment Team',
        'CBSE',
        'A leading progressive K-12 institution committed to modern pedagogical methods, academic excellence, and holistic student development.',
        'Maharashtra',
        'Mumbai',
        'Mumbai',
        'Sector 14, Bandra West, Mumbai, 400050',
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
      ]
    );
    console.log('✅ Created demo school with ID:', userId);
  } else {
    console.log('teachment.tech@gmail.com already exists.');
  }

  // Ensure all existing demo accounts have valid passwordHash
  await db.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, [passwordHash, 's.d.publicschoolbabhanauli@gmail.com']);
  console.log('Done!');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
