require('dotenv').config();
const { Pool } = require('pg');

async function testNeon() {
  console.log('====================================================');
  console.log('🚀 TEACHMENT - Neon PostgreSQL Connection Diagnostic');
  console.log('====================================================');

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('localhost') || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    console.log('❌ DATABASE_URL is not configured for Neon!');
    console.log('');
    console.log('👉 To connect to Neon:');
    console.log('1. Go to https://neon.tech and create/open your project.');
    console.log('2. In your Neon dashboard, copy the PostgreSQL Connection String.');
    console.log('   (It looks like: postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require)');
    console.log('3. Open "server/.env" and set:');
    console.log('   DATABASE_URL=your_copied_neon_connection_string_here');
    console.log('   USE_POSTGRES=true');
    console.log('4. Run: npm run test:neon');
    console.log('====================================================');
    process.exit(1);
  }

  const isNeon = dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require');
  console.log(`📡 Connecting to: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`🔒 SSL: Enabled`);

  const startTime = Date.now();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    const infoRes = await pool.query(`
      SELECT 
        NOW() as current_time, 
        current_database() as db_name, 
        current_user as db_user, 
        version() as pg_version
    `);
    const pingMs = Date.now() - startTime;
    const info = infoRes.rows[0];

    console.log('✅ Connected successfully to Neon PostgreSQL!');
    console.log(`⚡ Ping Latency: ${pingMs} ms`);
    console.log(`🗄️ Database:     ${info.db_name}`);
    console.log(`👤 User:         ${info.db_user}`);
    console.log(`⏱️ Server Time:  ${info.current_time}`);
    console.log(`📦 Engine:       ${info.pg_version.split(' on ')[0]}`);
    console.log('----------------------------------------------------');
    console.log('📊 Table Verification:');

    const tables = ['users', 'teacher_profiles', 'school_profiles', 'jobs', 'job_applications'];
    for (const table of tables) {
      try {
        const countRes = await pool.query(`SELECT count(*) as count FROM ${table}`);
        console.log(`   ✔️  ${table.padEnd(20)}: ${countRes.rows[0].count} records`);
      } catch (tableErr) {
        console.log(`   ⚠️  ${table.padEnd(20)}: Not created yet (Run migration or seed)`);
      }
    }

    console.log('====================================================');
    console.log('🎉 Neon PostgreSQL is READY for TEACHMENT!');
    console.log('   To migrate your existing data to Neon: npm run migrate:neon');
    console.log('   To seed fresh demo data to Neon:       npm run seed');
    console.log('====================================================');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('❌ Connection Failed:', err.message);
    console.error('');
    console.error('Troubleshooting tips:');
    console.error('- Check if your Neon database is active (Neon databases pause when idle; first connection wakes it up).');
    console.error('- Ensure your DATABASE_URL in server/.env includes ?sslmode=require');
    console.error('- Verify your password and user permissions in the Neon dashboard.');
    console.log('====================================================');
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

testNeon();
