const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';
export const UPLOAD_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('teachment_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic Fetch Wrapper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoLogin: (role = 'school') =>
    request('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () => request('/auth/me'),

  // Teacher APIs
  getTeacherProfile: () => request('/teacher/profile'),
  updateTeacherProfile: (payload) =>
    request('/teacher/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  uploadTeacherAvatar: (formData) =>
    request('/teacher/avatar', {
      method: 'POST',
      body: formData,
    }),
  uploadResume: (formData) =>
    request('/teacher/resume', {
      method: 'POST',
      body: formData,
    }),
  getJobs: (params = {}) => {
    const clean = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        clean[k] = v;
      }
    });
    const query = new URLSearchParams(clean).toString();
    return request(`/teacher/jobs${query ? `?${query}` : ''}`);
  },
  applyJob: (jobId) =>
    request(`/teacher/apply/${jobId}`, {
      method: 'POST',
    }),
  getAppliedJobs: () => request('/teacher/applied'),

  // School APIs
  getSchoolProfile: () => request('/school/profile'),
  updateSchoolProfile: (payload) =>
    request('/school/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  uploadSchoolAvatar: (formData) =>
    request('/school/avatar', {
      method: 'POST',
      body: formData,
    }),
  getSchoolJobs: () => request('/school/jobs'),
  createJob: (payload) =>
    request('/school/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateJob: (jobId, payload) =>
    request(`/school/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteJob: (jobId) =>
    request(`/school/jobs/${jobId}`, {
      method: 'DELETE',
    }),
  getJobApplicants: (jobId) => request(`/school/jobs/${jobId}/applicants`),
  updateApplicantStatus: (appId, status) =>
    request(`/school/applications/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getTeachers: (params = {}) => {
    const clean = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        clean[k] = v;
      }
    });
    const query = new URLSearchParams(clean).toString();
    return request(`/school/teachers${query ? `?${query}` : ''}`);
  },
};

