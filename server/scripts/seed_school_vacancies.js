const db = require('../config/db');

async function seedSchoolVacancies() {
  try {
    await db.initDatabase();
    console.log('Checking school profile...');
    const schoolRes = await db.query('SELECT id, user_id, school_name FROM school_profiles LIMIT 1');
    if (schoolRes.rows.length === 0) {
      console.error('No school profile found in database!');
      process.exit(1);
    }
    const schoolId = schoolRes.rows[0].id;
    console.log(`School found: ID ${schoolId}, Name: ${schoolRes.rows[0].school_name}`);

    // Check existing jobs count
    const existingJobs = await db.query('SELECT id FROM jobs WHERE school_id = $1', [schoolId]);
    if (existingJobs.rows.length > 0) {
      console.log(`School already has ${existingJobs.rows.length} jobs.`);
    } else {
      console.log('Seeding initial authentic vacancies for school...');
      const vacancies = [
        {
          title: 'TGT Mathematics & Science Teacher',
          subject: 'Science & Maths',
          post_level: 'TGT',
          experience_required: 2,
          min_salary: 25000,
          max_salary: 35000,
          shift_timings: '08:30AM - 02:00PM',
          openings: 2,
          job_type: 'Onsite',
          status: 'Open',
          required_skills: 'CBSE Curriculum, Mathematics, Physics, Chemistry, Lesson Planning, Student Assessment, Classroom Management'
        },
        {
          title: 'PGT English Lecturer',
          subject: 'English',
          post_level: 'PGT',
          experience_required: 3,
          min_salary: 30000,
          max_salary: 45000,
          shift_timings: '08:30AM - 02:00PM',
          openings: 1,
          job_type: 'Onsite',
          status: 'Open',
          required_skills: 'Senior Secondary CBSE English Core, Literature, Creative Writing, Communication Skills'
        },
        {
          title: 'Computer Science & IT Faculty',
          subject: 'Computer Science',
          post_level: 'PGT',
          experience_required: 1,
          min_salary: 28000,
          max_salary: 40000,
          shift_timings: '08:30AM - 02:00PM',
          openings: 1,
          job_type: 'Onsite',
          status: 'Open',
          required_skills: 'Python, Informatics Practices, AI & Robotics Basics, Computer Lab Management'
        },
        {
          title: 'PRT Primary Teacher (All Subjects)',
          subject: 'All Subjects',
          post_level: 'PRT',
          experience_required: 0,
          min_salary: 18000,
          max_salary: 25000,
          shift_timings: '08:30AM - 01:30PM',
          openings: 2,
          job_type: 'Onsite',
          status: 'Open',
          required_skills: 'Early Childhood Education, Activity-based Learning, Hindi, English, Environmental Studies'
        }
      ];

      for (const v of vacancies) {
        await db.query(
          `INSERT INTO jobs (
            school_id, title, subject, post_level, experience_required,
            min_salary, max_salary, shift_timings, openings, job_type, status, required_skills, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            schoolId, v.title, v.subject, v.post_level, v.experience_required,
            v.min_salary, v.max_salary, v.shift_timings, v.openings, v.job_type,
            v.status, v.required_skills
          ]
        );
        console.log(`✅ Vacancy created: ${v.title} (${v.post_level})`);
      }
    }

    const allJobs = await db.query('SELECT id, title, subject, post_level, min_salary, max_salary, status FROM jobs');
    console.log(`Total jobs in database now: ${allJobs.rows.length}`);
    console.table(allJobs.rows);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedSchoolVacancies();
