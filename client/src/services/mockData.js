// Clean, Production-Accurate Fallback State
// Only keeps the 1 School (SD Public school babhanauli kushinagar)
// and the 1 Teacher Demo (Pradeep Kumar Madheshia).
// All dummy vacancies & applications are wiped clean.

// Purge any stale legacy localStorage items from previous versions
if (typeof localStorage !== 'undefined') {
  try {
    const rawJobs = localStorage.getItem('teachment_mock_jobs');
    if (rawJobs && (rawJobs.includes('Paradox') || rawJobs.includes('Daffodils'))) {
      localStorage.removeItem('teachment_mock_jobs');
      localStorage.removeItem('teachment_mock_apps');
      localStorage.removeItem('teachment_mock_applicants');
      localStorage.removeItem('teachment_mock_session');
    }
  } catch (e) {}
}

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
    qualifications: 'B.Ed, M.Sc Mathematics, CTET Qualified',
    syllabus: 'CBSE',
    experience_years: 7,
    medium: 'English',
    state: 'Uttar Pradesh',
    district: 'Kushinagar',
    city: 'Babhanauli',
    pin_code: '274304',
    gender: 'Male',
    resume_path: null,
    resume_filename: null,
    resume_data: null,
    parsed_skills: 'Classroom Management, Mathematics, Physics, Chemistry, Science, Lesson Planning, Student Assessment, CBSE Curriculum',
    profile_completion: 85,
    expected_salary: 35000
  }
};

export const DEMO_SCHOOL = {
  token: 'demo-school-token-2026',
  user: {
    id: 2,
    name: 'SD Public school babhanauli kushinagar',
    email: 's.d.publicschoolbabhanauli@gmail.com',
    role: 'school',
    phone: '9335893076',
    avatar: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    status: 'verified'
  },
  profile: {
    id: 1,
    user_id: 2,
    school_name: 'SD Public school babhanauli kushinagar',
    principal_name: 'Principal SD Public School',
    board: 'CBSE',
    about_text: 'SD Public School, Babhanauli, Kushinagar is dedicated to educational excellence, holistic personality development, and nurturing future leaders with modern pedagogical standards.',
    state: 'Uttar Pradesh',
    district: 'Kushinagar',
    city: 'Babhanauli',
    address: 'Babhanauli, Kushinagar, Uttar Pradesh, 274304',
    logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    profile_completion: 100,
    vacancy_count: 0
  }
};

// 0 initial jobs - exactly matching the clean database state
export const INITIAL_JOBS = [];

// Exactly 1 teacher in directory
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
    qualifications: 'B.Ed, M.Sc Mathematics, CTET Qualified',
    syllabus: 'CBSE',
    experience_years: 7,
    medium: 'English',
    city: 'Babhanauli',
    district: 'Kushinagar',
    state: 'Uttar Pradesh',
    rating: 4.9,
    parsed_skills: 'Classroom Management, Mathematics, Physics, Chemistry, Science, Lesson Planning, Student Assessment, CBSE Curriculum',
    resume_path: null,
    resume_filename: null,
    resume_data: null
  }
];

// Exactly 1 school in partner schools directory
export const INITIAL_SCHOOLS = [
  {
    id: 1,
    school_name: 'SD Public school babhanauli kushinagar',
    principal_name: 'Principal SD Public School',
    board: 'CBSE',
    about_text: 'SD Public School, Babhanauli, Kushinagar is dedicated to educational excellence, holistic personality development, and nurturing future leaders with modern pedagogical standards.',
    state: 'Uttar Pradesh',
    district: 'Kushinagar',
    city: 'Babhanauli',
    address: 'Babhanauli, Kushinagar, Uttar Pradesh, 274304',
    logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    vacancy_count: 0
  }
];

export const INITIAL_APPLICATIONS = [];
export const INITIAL_APPLICANTS = [];

// Helper methods for session storage
export function getStoredSession() {
  try {
    const raw = localStorage.getItem('teachment_mock_session');
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Auto-migrate stale cached demo teacher / school from earlier visits
    if (
      session?.user?.email === 'teachment.tech@gmail.com' ||
      session?.profile?.school_name === 'Paradox High School' ||
      session?.profile?.school_name === 'Paradox International'
    ) {
      const updated = JSON.parse(JSON.stringify(DEMO_SCHOOL));
      saveStoredSession(updated);
      return updated;
    }

    if (
      session?.user?.email === 'teacher@teachment.com' &&
      (!session.profile?.city || session.profile?.city === 'Mumbai' || session.profile?.city === 'Lucknow')
    ) {
      const updated = JSON.parse(JSON.stringify(DEMO_TEACHER));
      if (session.profile?.resume_path && !session.profile.resume_path.includes('sample_resume')) {
        updated.profile.resume_path = session.profile.resume_path;
        if (session.profile.parsed_skills) updated.profile.parsed_skills = session.profile.parsed_skills;
        if (session.profile.resume_filename) updated.profile.resume_filename = session.profile.resume_filename;
        if (session.profile.resume_data) updated.profile.resume_data = session.profile.resume_data;
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
