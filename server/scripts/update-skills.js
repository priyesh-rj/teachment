const db = require('../config/db');

async function updateSkills() {
  await db.initDatabase();
  await db.query("UPDATE jobs SET required_skills = 'Python, AI, Data Science' WHERE title LIKE '%Computer%' OR subject LIKE '%Computer%'");
  await db.query("UPDATE jobs SET required_skills = 'English Grammar, Literature Analysis, Phonetics, Interactive Teaching' WHERE title LIKE '%English%' OR subject LIKE '%English%'");
  await db.query("UPDATE jobs SET required_skills = 'Classroom Management, Calculus, CBSE Curriculum, Smart Board' WHERE required_skills IS NULL OR required_skills = ''");
  
  const jobs = await db.query('SELECT id, title, subject, required_skills FROM jobs');
  console.log('✅ Updated jobs with required_skills:');
  console.log(JSON.stringify(jobs.rows, null, 2));
  process.exit(0);
}

updateSkills().catch(err => {
  console.error(err);
  process.exit(1);
});
