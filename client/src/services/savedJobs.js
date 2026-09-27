// Saved Jobs persistence service via localStorage with event synchronization

const STORAGE_KEY = 'teachment_saved_jobs';

export const getSavedJobs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load saved jobs from localStorage', err);
    return [];
  }
};

export const isJobSaved = (jobId) => {
  const list = getSavedJobs();
  return list.some((item) => String(item.id) === String(jobId));
};

export const toggleSaveJob = (job) => {
  try {
    const list = getSavedJobs();
    const index = list.findIndex((item) => String(item.id) === String(job.id));
    let updated;
    let wasSaved = false;

    if (index >= 0) {
      // Remove from saved
      updated = list.filter((item) => String(item.id) !== String(job.id));
      wasSaved = false;
    } else {
      // Add to saved (latest at top)
      updated = [
        {
          id: job.id,
          title: job.title,
          subject: job.subject,
          post_level: job.post_level,
          experience_required: job.experience_required,
          min_salary: job.min_salary,
          max_salary: job.max_salary,
          shift_timings: job.shift_timings,
          openings: job.openings,
          job_type: job.job_type || 'Onsite',
          school_name: job.school_name || 'Partner School',
          school_city: job.school_city || job.city || '',
          school_district: job.school_district || job.district || '',
          school_state: job.school_state || job.state || '',
          board: job.board || 'CBSE',
          required_skills: job.required_skills || '',
          created_at: job.created_at || new Date().toISOString(),
          saved_at: new Date().toISOString()
        },
        ...list
      ];
      wasSaved = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('teachment_saved_jobs_changed', { detail: { list, wasSaved, jobId: job.id } }));
    return { updatedList: updated, wasSaved };
  } catch (err) {
    console.error('Failed to save job to localStorage', err);
    return { updatedList: getSavedJobs(), wasSaved: false };
  }
};

export const removeSavedJob = (jobId) => {
  try {
    const list = getSavedJobs();
    const updated = list.filter((item) => String(item.id) !== String(jobId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('teachment_saved_jobs_changed', { detail: { list: updated, wasSaved: false, jobId } }));
    return updated;
  } catch (err) {
    console.error('Failed to remove saved job', err);
    return getSavedJobs();
  }
};
