// Comprehensive Seed-Accurate Mock Data & Local Fallback State
// Guarantees all features (Teacher Demo, School Demo, Job Search, Dashboards)
// function flawlessly in standalone/Vercel environments even if the backend is not yet deployed.

export const DEMO_TEACHER = {
  token: 'demo-teacher-token-2026',
  user: {
    id: 1,
    name: 'Pradeep Kumar Madheshia',
    email: 'teacher@teachment.com',
    role: 'teacher',
    phone: '8375955572',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    status: 'active'
  },
  profile: {
    id: 1,
    user_id: 1,
    subject: 'Science & Maths',
    post: 'TGT',
    qualifications: 'CTET, UPTET, Diploma in Elementary Education, Central Board of Secondary Education',
    syllabus: 'CBSE',
    experience_years: 7,
    medium: 'English',
    state: 'Uttar Pradesh',
    district: 'Kushinagar',
    city: 'Lucknow',
    pin_code: '274304',
    gender: 'Male',
    resume_path: '/uploads/resumes/sample_resume.pdf',
    parsed_skills: 'TGT, Science & Maths, Classroom Management, Student Evaluation, Online Teaching Tools, Decision Making, Critical Thinking, Verbal Communication, Remote Learning, Physics, Chemistry, Mathematics, Maths, Science, Project Planning, Individualized Education Plans',
    profile_completion: 92,
    expected_salary: 35000
  }
};

export const DEMO_SCHOOL = {
  token: 'demo-school-token-2026',
  user: {
    id: 2,
    name: 'Ep-teachment Ep-01',
    email: 'teachment.tech@gmail.com',
    role: 'school',
    phone: '9335893076',
    avatar: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    status: 'verified'
  },
  profile: {
    id: 1,
    user_id: 2,
    school_name: 'Paradox High School',
    principal_name: 'Teachment Team',
    board: 'CBSE',
    about_text: 'A leading progressive K-12 institution committed to modern pedagogical methods, academic excellence, and holistic student development.',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    address: 'Sector 14, Bandra West, Mumbai, 400050',
    logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    profile_completion: 100
  }
};

export const INITIAL_JOBS = [
  {
    id: 1,
    school_id: 1,
    school_name: 'Paradox High School',
    title: 'English Teacher',
    subject: 'English',
    post_level: 'TGT',
    experience_required: 1,
    min_salary: 18000,
    max_salary: 28000,
    shift_timings: '10:00AM - 02:00PM',
    openings: 1,
    job_type: 'Onsite',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'Open',
    logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    required_skills: 'Grammar, Creative Writing, Phonetics, CBSE Pedagogy',
    match_score: 94
  },
  {
    id: 2,
    school_id: 1,
    school_name: 'Paradox High School',
    title: 'Computer Science Teacher',
    subject: 'Computer Science',
    post_level: 'PGT',
    experience_required: 2,
    min_salary: 25000,
    max_salary: 40000,
    shift_timings: '09:00AM - 02:00PM',
    openings: 1,
    job_type: 'Onsite',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'Open',
    logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    required_skills: 'Python, SQL, Robotics, Computer Fundamentals, Web Development',
    match_score: 90
  },
  {
    id: 3,
    school_id: 2,
    school_name: 'Daffodils World School',
    title: 'Senior Mathematics Lecturer',
    subject: 'Maths',
    post_level: 'PGT',
    experience_required: 2,
    min_salary: 30000,
    max_salary: 50000,
    shift_timings: '08:00AM - 01:30PM',
    openings: 2,
    job_type: 'Onsite',
    city: 'Sikar',
    district: 'Sikar',
    state: 'Rajasthan',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'Open',
    logo_path: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    required_skills: 'Calculus, Algebra, Coordinate Geometry, IIT-JEE Foundation',
    match_score: 98
  },
  {
    id: 4,
    school_id: 1,
    school_name: 'Paradox High School',
    title: 'Physics & STEM Educator',
    subject: 'Science',
    post_level: 'TGT',
    experience_required: 0,
    min_salary: 20000,
    max_salary: 32000,
    shift_timings: '08:30AM - 02:00PM',
    openings: 1,
    job_type: 'Onsite',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    created_at: new Date().toISOString(),
    status: 'Open',
    logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    required_skills: 'Physics, Lab Experiments, STEM Curriculum, Concept Clarity',
    match_score: 86
  },
  {
    id: 5,
    school_id: 2,
    school_name: 'Daffodils World School',
    title: 'Online Hindi Faculty',
    subject: 'Hindi',
    post_level: 'PRT',
    experience_required: 1,
    min_salary: 15000,
    max_salary: 25000,
    shift_timings: 'Flexible / Online',
    openings: 1,
    job_type: 'Online',
    city: 'Remote',
    district: 'Online',
    state: 'All India',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'Open',
    logo_path: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    required_skills: 'Hindi Literature, Vyakaran, Online Delivery, Digital Whiteboard',
    match_score: 75
  }
];

export const INITIAL_TEACHERS = [
  {
    id: 1,
    user_id: 1,
    name: 'Pradeep Kumar Madheshia',
    email: 'teacher@teachment.com',
    phone: '8375955572',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    subject: 'Science & Maths',
    post: 'TGT',
    qualifications: 'CTET, UPTET, Diploma in Elementary Education, Central Board of Secondary Education',
    syllabus: 'CBSE',
    experience_years: 7,
    medium: 'English',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    rating: 4.9,
    parsed_skills: 'TGT, Science & Maths, Classroom Management, Student Evaluation, Online Teaching Tools, Decision Making, Critical Thinking, Verbal Communication, Remote Learning, Physics, Chemistry, Mathematics, Maths, Science, Project Planning, Individualized Education Plans',
    resume_path: '/uploads/resumes/sample_resume.pdf'
  },
  {
    id: 2,
    user_id: 2,
    name: 'Pooja Verma',
    email: 'pooja.verma@gmail.com',
    phone: '9811223344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    subject: 'English',
    post: 'TGT',
    qualifications: 'B.Ed, M.A. English Literature',
    syllabus: 'CBSE',
    experience_years: 4,
    medium: 'English',
    city: 'Mumbai',
    state: 'Maharashtra',
    rating: 4.8,
    parsed_skills: 'English Grammar, Creative Writing, Phonetics, Literature Analysis',
    resume_path: '/uploads/resumes/sample_resume.pdf'
  },
  {
    id: 3,
    user_id: 3,
    name: 'Amit Kumar',
    email: 'amit.tech@gmail.com',
    phone: '9988776655',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    subject: 'Computer Science',
    post: 'PGT',
    qualifications: 'MCA, B.Ed',
    syllabus: 'CBSE',
    experience_years: 2,
    medium: 'English',
    city: 'Mumbai',
    state: 'Maharashtra',
    rating: 4.7,
    parsed_skills: 'Python, SQL, Robotics, Computer Fundamentals, Web Development',
    resume_path: '/uploads/resumes/sample_resume.pdf'
  },
  {
    id: 4,
    user_id: 4,
    name: 'Dr. Neha Gupta',
    email: 'neha.gupta@gmail.com',
    phone: '9876543219',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    subject: 'Physics',
    post: 'PGT',
    qualifications: 'Ph.D Physics, B.Ed, CSIR-NET',
    syllabus: 'CBSE, ISC',
    experience_years: 6,
    medium: 'English',
    city: 'Delhi NCR',
    state: 'Delhi',
    rating: 4.9,
    parsed_skills: 'Mechanics, Electromagnetism, Modern Physics, Practical Lab Experiments',
    resume_path: '/uploads/resumes/sample_resume.pdf'
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 1,
    job_id: 3,
    title: 'Senior Mathematics Lecturer',
    subject: 'Maths',
    school_name: 'Daffodils World School',
    status: 'Shortlisted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    ai_match_score: 98.0,
    min_salary: 30000,
    max_salary: 50000,
    job_type: 'Onsite',
    city: 'Sikar'
  },
  {
    id: 2,
    job_id: 1,
    title: 'English Teacher',
    subject: 'English',
    school_name: 'Paradox High School',
    status: 'Under Review',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    ai_match_score: 94.5,
    min_salary: 18000,
    max_salary: 28000,
    job_type: 'Onsite',
    city: 'Mumbai'
  }
];

export const INITIAL_APPLICANTS = [
  {
    id: 1,
    job_id: 1,
    name: 'Pooja Verma',
    email: 'pooja.verma@gmail.com',
    phone: '9811223344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    subject: 'English',
    post: 'TGT',
    experience_years: 4,
    ai_match_score: 94.5,
    status: 'Shortlisted',
    applied_at: new Date(Date.now() - 86400000).toISOString(),
    resume_path: '/uploads/resumes/sample_resume.pdf'
  },
  {
    id: 2,
    job_id: 2,
    name: 'Amit Kumar',
    email: 'amit.tech@gmail.com',
    phone: '9988776655',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    subject: 'Computer Science',
    post: 'PGT',
    experience_years: 2,
    ai_match_score: 96.2,
    status: 'Under Review',
    applied_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    resume_path: '/uploads/resumes/sample_resume.pdf'
  },
  {
    id: 3,
    job_id: 4,
    name: 'Pradeep Kumar Madheshia',
    email: 'teacher@teachment.com',
    phone: '8375955572',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    subject: 'Science & Maths',
    post: 'TGT',
    experience_years: 7,
    ai_match_score: 98.4,
    status: 'Interview Scheduled',
    applied_at: new Date().toISOString(),
    resume_path: '/uploads/resumes/sample_resume.pdf'
  }
];

// Helper methods for session storage
export function getStoredSession() {
  try {
    const raw = localStorage.getItem('teachment_mock_session');
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Auto-migrate stale cached demo teacher from earlier visits on Vercel
    if (
      session?.user?.email === 'teacher@teachment.com' &&
      (session.user.name === 'Js-teachment Js-01' || !session.profile?.city || session.profile?.city === 'Mumbai' || session.profile?.subject === 'Maths')
    ) {
      const updated = JSON.parse(JSON.stringify(DEMO_TEACHER));
      // preserve user uploaded resume if any
      if (session.profile?.resume_path && !session.profile.resume_path.includes('sample_resume.pdf')) {
        updated.profile.resume_path = session.profile.resume_path;
        if (session.profile.parsed_skills) updated.profile.parsed_skills = session.profile.parsed_skills;
        if (session.profile.resume_filename) updated.profile.resume_filename = session.profile.resume_filename;
      }
      saveStoredSession(updated);
      return updated;
    }

    return session;
  } catch {
    return null;
  }
}

export function saveStoredSession(session) {
  try {
    localStorage.setItem('teachment_mock_session', JSON.stringify(session));
  } catch (e) {
    console.warn('Could not save session to localStorage:', e);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem('teachment_mock_session');
  } catch (e) {
    console.warn('Could not clear session:', e);
  }
}
