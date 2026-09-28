require('dotenv').config();
const db = require('../config/db');

async function runTest() {
  try {
    await db.initDatabase();
    console.log('Using database:', db.getDbType());

    // 1. Get SD Public School profile
    const schoolRes = await db.query('SELECT * FROM school_profiles WHERE user_id = 1');
    if (schoolRes.rows.length === 0) {
      throw new Error('School profile not found.');
    }
    const school = schoolRes.rows[0];
    console.log('1. School Profile:', {
      name: school.school_name,
      city: school.city,
      district: school.district,
      state: school.state,
      address: school.address
    });

    // 2. Post a vacancy from school
    const postRes = await db.query(
      `INSERT INTO jobs (
        school_id, title, subject, post_level, experience_required,
        min_salary, max_salary, shift_timings, openings, job_type, status, required_skills
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        school.id,
        'Senior Mathematics Faculty',
        'Mathematics',
        'PGT',
        3,
        25000,
        45000,
        '09:00AM - 02:00PM',
        2,
        'Onsite',
        'Open',
        'CBSE, Calculus, Algebra'
      ]
    );
    const jobId = postRes.rows[0]?.id || postRes.lastID;
    console.log('2. ✅ Vacancy posted by school with Job ID:', jobId);

    // 3. Teacher queries jobs
    const teacherJobsRes = await db.query(`
      SELECT 
        j.*,
        s.school_name,
        s.principal_name,
        s.board,
        s.city as school_city,
        s.district as school_district,
        s.state as school_state,
        s.address as school_address,
        s.logo_path
      FROM jobs j
      JOIN school_profiles s ON j.school_id = s.id
      WHERE j.id = $1
    `, [jobId]);

    const teacherJob = teacherJobsRes.rows[0];
    const realLocation = [teacherJob.school_city, teacherJob.school_district, teacherJob.school_state].filter(Boolean).join(', ');
    console.log('3. ✅ Teacher side job view:', {
      title: teacherJob.title,
      school: teacherJob.school_name,
      real_location: realLocation,
      status_tag: teacherJob.status
    });

    if (teacherJob.status !== 'Open') {
      throw new Error('Expected status to be Open');
    }
    if (!realLocation.includes('Babhanauli') || !realLocation.includes('Kushinagar')) {
      throw new Error('Real location did not include Babhanauli Kushinagar');
    }

    // 4. School toggles status to 'Closed'
    await db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['Closed', jobId]);
    const closedCheck = await db.query(`
      SELECT j.id, j.title, j.status, s.city as school_city, s.state as school_state
      FROM jobs j
      JOIN school_profiles s ON j.school_id = s.id
      WHERE j.id = $1
    `, [jobId]);

    console.log('4. ✅ After school closed vacancy, teacher still sees it with Closed tag:', {
      id: closedCheck.rows[0].id,
      status_tag: closedCheck.rows[0].status
    });
    if (closedCheck.rows[0].status !== 'Closed') {
      throw new Error('Expected status to be Closed');
    }

    // Reopen vacancy
    await db.query('UPDATE jobs SET status = $1 WHERE id = $2', ['Open', jobId]);

    // 5. Check applicant count before teacher applies
    const schoolJobsBefore = await db.query(`
      SELECT 
        j.id,
        j.title,
        CAST(COALESCE((SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id), 0) AS INTEGER) AS applicant_count
      FROM jobs j
      WHERE j.id = $1
    `, [jobId]);
    console.log('5. ✅ School side applicant_count BEFORE teacher applies:', schoolJobsBefore.rows[0].applicant_count);
    if (schoolJobsBefore.rows[0].applicant_count !== 0) {
      throw new Error('Expected 0 applicants before applying');
    }

    // 6. Teacher (Pradeep Kumar Madheshia, user 2) applies
    const teacherRes = await db.query('SELECT * FROM teacher_profiles WHERE user_id = 2');
    const teacher = teacherRes.rows[0];

    await db.query(
      `INSERT INTO job_applications (job_id, teacher_id, ai_match_score, status)
       VALUES ($1, $2, $3, 'Applied')`,
      [jobId, teacher.id, 96.5]
    );
    console.log('6. ✅ Teacher applied for job.');

    // 7. Check applicant count on school side AFTER application
    const schoolJobsAfter = await db.query(`
      SELECT 
        j.id,
        j.title,
        CAST(COALESCE((SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id), 0) AS INTEGER) AS applicant_count,
        (SELECT MAX(ja.ai_match_score) FROM job_applications ja WHERE ja.job_id = j.id) AS top_match_score
      FROM jobs j
      WHERE j.id = $1
    `, [jobId]);
    console.log('7. ✅ School side applicant_count AFTER teacher applies:', {
      applicant_count: schoolJobsAfter.rows[0].applicant_count,
      top_match_score: schoolJobsAfter.rows[0].top_match_score
    });
    if (schoolJobsAfter.rows[0].applicant_count !== 1) {
      throw new Error('Expected applicant_count to be 1');
    }

    // 8. On click Applicants: Check teacher details returned for school view
    const applicantsRes = await db.query(`
      SELECT 
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
        tp.parsed_skills,
        tp.profile_completion
      FROM job_applications ja
      JOIN teacher_profiles tp ON ja.teacher_id = tp.id
      JOIN users u ON tp.user_id = u.id
      WHERE ja.job_id = $1
    `, [jobId]);

    const applicant = applicantsRes.rows[0];
    console.log('8. ✅ On click Applicants, teacher details shown to school:', {
      candidate_name: applicant.candidate_name,
      candidate_email: applicant.candidate_email,
      candidate_phone: applicant.candidate_phone,
      subject: applicant.subject,
      post: applicant.post,
      qualifications: applicant.qualifications,
      experience_years: applicant.experience_years,
      teacher_location: `${applicant.city}, ${applicant.district}, ${applicant.state} (${applicant.pin_code})`,
      skills: applicant.parsed_skills,
      ai_match_score: applicant.ai_match_score,
      application_status: applicant.application_status
    });

    if (applicant.candidate_name !== 'Pradeep Kumar Madheshia') {
      throw new Error('Candidate name did not match Pradeep Kumar Madheshia');
    }

    // 9. Clean up test records
    await db.query('DELETE FROM job_applications WHERE job_id = $1', [jobId]);
    await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
    console.log('9. ✅ Cleaned up test vacancy and application. Database verified clean!');

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTest();
