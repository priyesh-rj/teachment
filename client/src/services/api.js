import {
  DEMO_TEACHER,
  DEMO_SCHOOL,
  INITIAL_JOBS,
  INITIAL_TEACHERS,
  INITIAL_SCHOOLS,
  INITIAL_APPLICATIONS,
  INITIAL_APPLICANTS,
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';
export const UPLOAD_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '';

// In-memory state synchronized with LocalStorage for offline/standalone demo mode
let localJobs = (() => {
  try {
    const raw = localStorage.getItem('teachment_mock_jobs');
    return raw ? JSON.parse(raw) : INITIAL_JOBS;
  } catch {
    return INITIAL_JOBS;
  }
})();

let localApplications = (() => {
  try {
    const raw = localStorage.getItem('teachment_mock_apps');
    return raw ? JSON.parse(raw) : INITIAL_APPLICATIONS;
  } catch {
    return INITIAL_APPLICATIONS;
  }
})();

let localApplicants = (() => {
  try {
    const raw = localStorage.getItem('teachment_mock_applicants');
    return raw ? JSON.parse(raw) : INITIAL_APPLICANTS;
  } catch {
    return INITIAL_APPLICANTS;
  }
})();

const persistJobs = () => {
  try {
    localStorage.setItem('teachment_mock_jobs', JSON.stringify(localJobs));
  } catch {}
};

const persistApplications = () => {
  try {
    localStorage.setItem('teachment_mock_apps', JSON.stringify(localApplications));
  } catch {}
};

const persistApplicants = () => {
  try {
    localStorage.setItem('teachment_mock_applicants', JSON.stringify(localApplicants));
  } catch {}
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('teachment_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic Fetch Wrapper with resilient error detection
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (netErr) {
    throw new Error('BACKEND_UNREACHABLE: ' + netErr.message);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('BACKEND_UNREACHABLE: Server returned non-JSON response');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

const readFileAsDataUrl = (file) => {
  return new Promise((resolve) => {
    if (!file || typeof FileReader === 'undefined' || !(file instanceof Blob)) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const extractResumeDetailsClient = (file) => {
  const filename = file?.name || '';
  const searchCorpus = filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').toLowerCase();

  let subject = null;
  if (/math/i.test(searchCorpus)) subject = 'Mathematics';
  else if (/computer|coding|python|it\b/i.test(searchCorpus)) subject = 'Computer Science';
  else if (/physics/i.test(searchCorpus)) subject = 'Physics';
  else if (/chemistry/i.test(searchCorpus)) subject = 'Chemistry';
  else if (/science/i.test(searchCorpus)) subject = 'Science & Maths';
  else if (/english/i.test(searchCorpus)) subject = 'English';
  else if (/hindi/i.test(searchCorpus)) subject = 'Hindi';

  let post = null;
  if (/pgt/i.test(searchCorpus)) post = 'PGT';
  else if (/tgt/i.test(searchCorpus)) post = 'TGT';
  else if (/prt/i.test(searchCorpus)) post = 'PRT';

  const quals = [];
  ['CTET', 'UPTET', 'B.Ed', 'M.Ed', 'D.El.Ed', 'M.Sc', 'B.Sc', 'B.Tech', 'M.Tech', 'MCA', 'Ph.D'].forEach(q => {
    if (new RegExp(`\\b${q.replace('.', '\\.')}\\b`, 'i').test(searchCorpus)) {
      quals.push(q);
    }
  });

  let exp = 0;
  const expMatch = searchCorpus.match(/(\d+)\s*(?:saal|years?|yrs?)/i);
  if (expMatch) exp = parseInt(expMatch[1], 10);

  const skills = [
    'Classroom Management',
    'Lesson Planning',
    'Student Assessment',
    'Curriculum Planning'
  ];
  if (subject) skills.unshift(subject);
  if (post) skills.unshift(post);
  ['Physics', 'Chemistry', 'Mathematics', 'Python', 'STEM', 'Remote Learning'].forEach(s => {
    if (new RegExp(`\\b${s}\\b`, 'i').test(searchCorpus) && !skills.includes(s)) {
      skills.push(s);
    }
  });

  return {
    subject,
    post,
    qualifications: quals.length > 0 ? quals.join(', ') : 'B.Ed, CTET Qualified',
    experience_years: exp || 3,
    skills: Array.from(new Set(skills))
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    try {
      return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      console.warn('Backend unavailable during login, using demo profile fallback:', err.message);
      const isSchool = email.includes('school') || email.includes('daffodils') || email === 'teachment.tech@gmail.com';
      const demo = JSON.parse(JSON.stringify(isSchool ? DEMO_SCHOOL : DEMO_TEACHER));
      saveStoredSession(demo);
      return demo;
    }
  },

  register: async (payload) => {
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend unavailable during register, creating local demo profile:', err.message);
      const isSchool = payload.role === 'school';
      const demo = JSON.parse(JSON.stringify(isSchool ? DEMO_SCHOOL : DEMO_TEACHER));
      demo.user.name = payload.name || demo.user.name;
      demo.user.email = payload.email || demo.user.email;
      demo.user.phone = payload.phone || demo.user.phone;
      demo.user.role = payload.role || demo.user.role;
      saveStoredSession(demo);
      return demo;
    }
  },

  demoLogin: async (role = 'school') => {
    try {
      return await request('/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      console.warn('Backend unavailable during demoLogin, launching instant client demo mode:', err.message);
      const isSchool = role === 'school';
      const demo = JSON.parse(JSON.stringify(isSchool ? DEMO_SCHOOL : DEMO_TEACHER));
      saveStoredSession(demo);
      return demo;
    }
  },

  getMe: async () => {
    try {
      return await request('/auth/me');
    } catch (err) {
      const activeSession = getStoredSession();
      if (activeSession) {
        return { user: activeSession.user, profile: activeSession.profile };
      }
      throw err;
    }
  },

  // Teacher APIs
  getTeacherProfile: async () => {
    try {
      const res = await request('/teacher/profile');
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_TEACHER));
      if (res.user) session.user = { ...session.user, ...res.user };
      if (res.profile) {
        // If a local preview is available in sessionStorage, keep it active for instant viewing
        const cachedPreview = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('teachment_local_resume_preview') : null;
        if (cachedPreview && (!res.profile.resume_path || res.profile.resume_path.includes('sample_resume'))) {
          res.profile.resume_path = cachedPreview;
        }
        session.profile = { ...session.profile, ...res.profile };
      }
      saveStoredSession(session);
      return res;
    } catch (err) {
      const session = getStoredSession() || DEMO_TEACHER;
      const cachedPreview = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('teachment_local_resume_preview') : null;
      if (cachedPreview && session?.profile) {
        session.profile.resume_path = cachedPreview;
      }
      return { user: session.user, profile: session.profile };
    }
  },

  updateTeacherProfile: async (payload) => {
    try {
      const res = await request('/teacher/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_TEACHER));
      if (res.profile) session.profile = { ...session.profile, ...res.profile };
      if (res.user) session.user = { ...session.user, ...res.user };
      saveStoredSession(session);
      return res;
    } catch (err) {
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_TEACHER));
      session.user = { ...session.user, name: payload.name || session.user.name, phone: payload.phone || session.user.phone, avatar: payload.avatar || session.user.avatar };
      session.profile = { ...session.profile, ...payload };
      saveStoredSession(session);
      return { message: 'Profile updated successfully!', profile: session.profile, user: session.user };
    }
  },

  uploadTeacherAvatar: async (formData) => {
    try {
      return await request('/teacher/avatar', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_TEACHER));
      const fallbackUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
      session.user.avatar = fallbackUrl;
      saveStoredSession(session);
      return { message: 'Avatar updated!', avatarUrl: fallbackUrl };
    }
  },

  uploadResume: async (formData) => {
    const file = formData instanceof FormData ? formData.get('resume') : null;
    let localDataUrl = null;
    if (file && typeof file === 'object') {
      try {
        localDataUrl = await readFileAsDataUrl(file);
      } catch (e) {
        console.warn('Could not generate Data URL preview:', e.message);
      }
    }

    try {
      const res = await request('/teacher/resume', {
        method: 'POST',
        body: formData,
      });

      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_TEACHER));
      if (res.profile) {
        session.profile = { ...session.profile, ...res.profile };
      }
      if (res.user) {
        session.user = { ...session.user, ...res.user };
      }
      if (localDataUrl) {
        try {
          sessionStorage.setItem('teachment_local_resume_preview', localDataUrl);
        } catch (e) {}
      }
      saveStoredSession(session);

      return res;
    } catch (err) {
      console.warn('Backend unavailable during uploadResume, persisting local demo resume:', err.message);
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_TEACHER));
      const clientExt = extractResumeDetailsClient(file);

      const resumePath = localDataUrl || session.profile?.resume_path || '/uploads/resumes/sample_resume.pdf';
      session.profile.resume_path = resumePath;
      session.profile.resume_filename = file?.name || 'Teacher_Resume.pdf';
      session.profile.parsed_skills = clientExt.skills.join(', ');
      if (clientExt.subject) session.profile.subject = clientExt.subject;
      if (clientExt.post) session.profile.post = clientExt.post;
      if (clientExt.qualifications) session.profile.qualifications = clientExt.qualifications;
      if (clientExt.experience_years > 0) session.profile.experience_years = clientExt.experience_years;

      if (localDataUrl) {
        try {
          sessionStorage.setItem('teachment_local_resume_preview', localDataUrl);
        } catch (e) {}
      }

      saveStoredSession(session);

      return {
        message: 'Resume uploaded & AI indexed successfully (Demo Mode)!',
        resumePath,
        parsedSkills: session.profile.parsed_skills,
        parsedData: clientExt,
        profile: session.profile,
        user: session.user
      };
    }
  },

  getJobs: async (params = {}) => {
    try {
      const clean = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          clean[k] = v;
        }
      });
      const query = new URLSearchParams(clean).toString();
      return await request(`/teacher/jobs${query ? `?${query}` : ''}`);
    } catch (err) {
      let filtered = [...localJobs].map((j) => {
        const isApplied = localApplications.some((a) => Number(a.job_id) === Number(j.id));
        return {
          ...j,
          school_name: j.school_name || DEMO_SCHOOL.profile.school_name,
          school_city: j.school_city || j.city || DEMO_SCHOOL.profile.city,
          school_district: j.school_district || j.district || DEMO_SCHOOL.profile.district,
          school_state: j.school_state || j.state || DEMO_SCHOOL.profile.state,
          school_address: j.school_address || j.address || DEMO_SCHOOL.profile.address,
          status: j.status || 'Open',
          is_applied: isApplied ? 1 : 0
        };
      });

      if (params.status && params.status !== 'All') {
        filtered = filtered.filter((j) => (j.status || 'Open').toLowerCase() === params.status.toLowerCase());
      }

      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            (j.title || '').toLowerCase().includes(kw) ||
            (j.subject || '').toLowerCase().includes(kw) ||
            (j.city || '').toLowerCase().includes(kw) ||
            (j.school_city || '').toLowerCase().includes(kw) ||
            (j.school_name || '').toLowerCase().includes(kw) ||
            (j.required_skills || '').toLowerCase().includes(kw)
        );
      }

      if (params.jobType) {
        filtered = filtered.filter((j) => (j.job_type || '').toLowerCase() === params.jobType.toLowerCase());
      }

      if (params.minSalary) {
        filtered = filtered.filter((j) => Number(j.max_salary) >= Number(params.minSalary));
      }

      if (params.maxSalary) {
        filtered = filtered.filter((j) => Number(j.min_salary) <= Number(params.maxSalary));
      }

      return { jobs: filtered };
    }
  },

  applyJob: async (jobId) => {
    const session = getStoredSession() || DEMO_TEACHER;
    const tUser = session.user || DEMO_TEACHER.user;
    const tProf = session.profile || DEMO_TEACHER.profile;

    const applicantEntry = {
      application_id: Date.now(),
      id: Date.now(),
      job_id: Number(jobId),
      ai_match_score: 95.0,
      application_status: 'Applied',
      status: 'Applied',
      applied_at: new Date().toISOString(),
      candidate_name: tUser.name,
      candidate_email: tUser.email,
      candidate_phone: tUser.phone,
      candidate_avatar: tUser.avatar,
      subject: tProf.subject,
      post: tProf.post,
      qualifications: tProf.qualifications,
      syllabus: tProf.syllabus,
      experience_years: tProf.experience_years,
      medium: tProf.medium,
      state: tProf.state,
      district: tProf.district,
      city: tProf.city,
      pin_code: tProf.pin_code,
      gender: tProf.gender,
      resume_path: tProf.resume_path,
      parsed_skills: tProf.parsed_skills,
      profile_completion: tProf.profile_completion || 100
    };

    try {
      const res = await request(`/teacher/apply/${jobId}`, {
        method: 'POST',
      });

      // Synchronize in-memory fallback state so switches are seamless
      if (res && res.aiMatchScore) applicantEntry.ai_match_score = res.aiMatchScore;
      if (!localApplicants.some((a) => Number(a.job_id) === Number(jobId) && a.candidate_email === tUser.email)) {
        localApplicants.unshift(applicantEntry);
        persistApplicants();
      }
      const jIdx = localJobs.findIndex((j) => Number(j.id) === Number(jobId));
      if (jIdx !== -1) {
        localJobs[jIdx].applicant_count = (Number(localJobs[jIdx].applicant_count) || 0) + 1;
        persistJobs();
      }

      return res;
    } catch (err) {
      console.warn('Backend apply request error or fallback mode, saving application locally:', err.message);
      const job = localJobs.find((j) => Number(j.id) === Number(jobId)) || localJobs[0];
      const newApp = {
        id: Date.now(),
        job_id: Number(jobId),
        title: job ? job.title : 'Teaching Position',
        subject: job ? job.subject : 'Academic',
        school_name: job ? job.school_name : DEMO_SCHOOL.profile.school_name,
        status: 'Applied',
        created_at: new Date().toISOString(),
        ai_match_score: 95.0,
        min_salary: job ? job.min_salary : 20000,
        max_salary: job ? job.max_salary : 35000,
        job_type: job ? job.job_type : 'Onsite',
        city: job ? (job.school_city || job.city) : DEMO_SCHOOL.profile.city
      };

      if (!localApplications.some((a) => Number(a.job_id) === Number(jobId))) {
        localApplications.unshift(newApp);
        persistApplications();
      }

      if (!localApplicants.some((a) => Number(a.job_id) === Number(jobId) && a.candidate_email === tUser.email)) {
        localApplicants.unshift(applicantEntry);
        persistApplicants();
      }

      const jIdx = localJobs.findIndex((j) => Number(j.id) === Number(jobId));
      if (jIdx !== -1) {
        localJobs[jIdx].applicant_count = (Number(localJobs[jIdx].applicant_count) || 0) + 1;
        persistJobs();
      }

      return {
        message: 'Application submitted successfully!',
        jobId,
        aiMatchScore: 95.0,
        status: 'Applied'
      };
    }
  },

  getAppliedJobs: async () => {
    try {
      return await request('/teacher/applied');
    } catch (err) {
      return { applications: localApplications };
    }
  },

  // School APIs
  getSchoolProfile: async () => {
    try {
      return await request('/school/profile');
    } catch (err) {
      const session = getStoredSession() || DEMO_SCHOOL;
      return { user: session.user, profile: session.profile };
    }
  },

  updateSchoolProfile: async (payload) => {
    try {
      return await request('/school/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_SCHOOL));
      session.user = { ...session.user, name: payload.name || session.user.name, phone: payload.phone || session.user.phone, avatar: payload.avatar || session.user.avatar };
      session.profile = { ...session.profile, ...payload };
      saveStoredSession(session);
      return { message: 'School profile updated successfully!', profile: session.profile, user: session.user };
    }
  },

  uploadSchoolAvatar: async (formData) => {
    try {
      return await request('/school/avatar', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      const session = getStoredSession() || JSON.parse(JSON.stringify(DEMO_SCHOOL));
      const fallbackUrl = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80';
      session.user.avatar = fallbackUrl;
      session.profile.logo_path = fallbackUrl;
      saveStoredSession(session);
      return { message: 'Logo updated!', logoUrl: fallbackUrl };
    }
  },

  getSchools: async () => {
    try {
      return await request('/teacher/schools');
    } catch (err) {
      return { schools: INITIAL_SCHOOLS };
    }
  },

  getSchoolJobs: async () => {
    try {
      const res = await request('/school/jobs');
      return res;
    } catch (err) {
      const activeJobs = localJobs.filter((j) => Number(j.school_id) === 1 || !j.school_id);
      const withCounts = activeJobs.map((job) => {
        const count = localApplicants.filter((a) => Number(a.job_id) === Number(job.id)).length;
        return {
          ...job,
          applicant_count: count > 0 ? count : (Number(job.applicant_count) || 0)
        };
      });
      return { jobs: withCounts };
    }
  },

  createJob: async (payload) => {
    try {
      return await request('/school/jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const activeSession = getStoredSession();
      const schoolName = activeSession?.profile?.school_name || DEMO_SCHOOL.profile.school_name;
      const schoolLogo = activeSession?.profile?.logo_path || DEMO_SCHOOL.profile.logo_path;
      const schoolCity = activeSession?.profile?.city || DEMO_SCHOOL.profile.city;
      const schoolDistrict = activeSession?.profile?.district || DEMO_SCHOOL.profile.district;
      const schoolState = activeSession?.profile?.state || DEMO_SCHOOL.profile.state;
      const schoolAddress = activeSession?.profile?.address || DEMO_SCHOOL.profile.address;

      const newJob = {
        id: Date.now(),
        school_id: 1,
        school_name: schoolName,
        title: payload.title || 'Teacher',
        subject: payload.subject || 'General',
        post_level: payload.post_level || 'TGT',
        experience_required: Number(payload.experience_required) || 0,
        min_salary: Number(payload.min_salary) || 20000,
        max_salary: Number(payload.max_salary) || 35000,
        shift_timings: payload.shift_timings || '09:00AM - 02:00PM',
        openings: Number(payload.openings) || 1,
        job_type: payload.job_type || 'Onsite',
        city: payload.city || schoolCity,
        district: payload.district || schoolDistrict,
        state: payload.state || schoolState,
        address: schoolAddress,
        school_city: payload.city || schoolCity,
        school_district: payload.district || schoolDistrict,
        school_state: payload.state || schoolState,
        school_address: schoolAddress,
        created_at: new Date().toISOString(),
        status: payload.status || 'Open',
        logo_path: schoolLogo,
        required_skills: payload.required_skills || 'Subject Knowledge, Pedagogy',
        applicant_count: 0,
        match_score: 95
      };

      localJobs.unshift(newJob);
      persistJobs();
      return { message: 'Job vacancy published successfully!', jobId: newJob.id, job: newJob };
    }
  },

  updateJob: async (jobId, payload) => {
    try {
      return await request(`/school/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const idx = localJobs.findIndex((j) => Number(j.id) === Number(jobId));
      if (idx !== -1) {
        localJobs[idx] = { ...localJobs[idx], ...payload };
        persistJobs();
      }
      return { message: 'Job updated successfully!' };
    }
  },

  deleteJob: async (jobId) => {
    try {
      return await request(`/school/jobs/${jobId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      localJobs = localJobs.filter((j) => Number(j.id) !== Number(jobId));
      persistJobs();
      return { message: 'Job deleted successfully!' };
    }
  },

  getJobApplicants: async (jobId) => {
    try {
      return await request(`/school/jobs/${jobId}/applicants`);
    } catch (err) {
      return {
        applicants: localApplicants.filter(
          (a) => !jobId || Number(a.job_id) === Number(jobId) || Number(a.job_id) === 1
        )
      };
    }
  },

  updateApplicantStatus: async (appId, status) => {
    try {
      return await request(`/school/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      const idx = localApplicants.findIndex((a) => Number(a.id) === Number(appId));
      if (idx !== -1) {
        localApplicants[idx].status = status;
        persistApplicants();
      }
      return { success: true, status };
    }
  },

  getTeachers: async (params = {}) => {
    try {
      const clean = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          clean[k] = v;
        }
      });
      const query = new URLSearchParams(clean).toString();
      return await request(`/school/teachers${query ? `?${query}` : ''}`);
    } catch (err) {
      let filtered = [...INITIAL_TEACHERS];

      if (params.search || params.keyword) {
        const kw = (params.search || params.keyword).toLowerCase();
        filtered = filtered.filter(
          (t) =>
            (t.name || '').toLowerCase().includes(kw) ||
            (t.subject || '').toLowerCase().includes(kw) ||
            (t.city || '').toLowerCase().includes(kw) ||
            (t.parsed_skills || '').toLowerCase().includes(kw)
        );
      }

      if (params.subject) {
        filtered = filtered.filter((t) => (t.subject || '').toLowerCase().includes(params.subject.toLowerCase()));
      }

      if (params.experience) {
        filtered = filtered.filter((t) => Number(t.experience_years) >= Number(params.experience));
      }

      return { teachers: filtered };
    }
  },
};
