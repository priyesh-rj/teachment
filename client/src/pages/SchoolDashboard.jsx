import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  User,
  BookOpen,
  MapPin,
  FileText,
  MoreVertical,
  Trash2,
  Edit,
  XCircle,
  Users,
  Plus,
  IndianRupee,
  Clock,
  Briefcase,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Globe
} from 'lucide-react';
import { api, UPLOAD_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper to format relative time (e.g. "Just now", "5 mins ago", "Yesterday", "2 days ago")
export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';

  let date;
  if (typeof dateInput === 'string' && !dateInput.includes('T') && !dateInput.endsWith('Z')) {
    date = new Date(dateInput.replace(' ', 'T') + 'Z');
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

const PRESET_SCHOOL_LOGOS = [
  { id: 's1', label: 'Modern Academy', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80' },
  { id: 's2', label: 'Heritage Public', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=256&q=80' },
  { id: 's3', label: 'STEM & Tech Campus', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=256&q=80' },
  { id: 's4', label: 'Global International', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=256&q=80' },
  { id: 's5', label: 'Senior Collegiate', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=256&q=80' },
  { id: 's6', label: 'High School Crest', url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=256&q=80' },
  { id: 's7', label: 'Montessori & Prep', url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=256&q=80' },
  { id: 's8', label: 'Education Trust', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=256&q=80' },
];

export default function SchoolDashboard({ isPostModalOpen, setIsPostModalOpen }) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile'); // Profile vs Post
  const [profileData, setProfileData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kebab menu state
  const [openKebabJobId, setOpenKebabJobId] = useState(null);

  // Applicants Modal state
  const [viewApplicantsJob, setViewApplicantsJob] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Edit Job Modal state
  const [editingJob, setEditingJob] = useState(null);

  // Edit School Profile Modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  // School Logo / Profile Picture Modal States
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarTab, setAvatarTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // New Job Form state
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    subject: '',
    post_level: 'TGT',
    experience_required: 1,
    min_salary: 15000,
    max_salary: 30000,
    shift_timings: '09:00AM - 02:00PM',
    openings: 1,
    job_type: 'Onsite',
    required_skills: '',
    status: 'Open',
  });

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    setLoading(true);
    try {
      const [profRes, jobsRes] = await Promise.all([
        api.getSchoolProfile(),
        api.getSchoolJobs(),
      ]);
      setProfileData(profRes);
      setJobs(jobsRes.jobs || []);
      setProfileForm({
        name: profRes.user?.name || '',
        email: profRes.user?.email || '',
        phone: profRes.user?.phone || '',
        avatar: profRes.user?.avatar || profRes.profile?.logo_path || '',
        school_name: profRes.profile?.school_name || '',
        principal_name: profRes.profile?.principal_name || '',
        board: profRes.profile?.board || 'CBSE',
        about_text: profRes.profile?.about_text || '',
        address: profRes.profile?.address || '',
        city: profRes.profile?.city || '',
        district: profRes.profile?.district || '',
        state: profRes.profile?.state || '',
      });
    } catch (err) {
      console.error('Error fetching school data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await api.createJob(newJobForm);
      alert('✅ Vacancy posted successfully!');
      setIsPostModalOpen(false);
      setNewJobForm({
        title: '',
        subject: '',
        post_level: 'TGT',
        experience_required: 1,
        min_salary: 15000,
        max_salary: 30000,
        shift_timings: '09:00AM - 02:00PM',
        openings: 1,
        job_type: 'Onsite',
        required_skills: '',
        status: 'Open',
      });
      await fetchSchoolData();
    } catch (err) {
      alert('Failed to post job: ' + err.message);
    }
  };

  const openEditModal = (job) => {
    setEditingJob({
      id: job.id,
      title: job.title || '',
      subject: job.subject || '',
      post_level: job.post_level || 'TGT',
      experience_required: job.experience_required ?? 0,
      openings: job.openings ?? 1,
      min_salary: job.min_salary ?? 15000,
      max_salary: job.max_salary ?? 30000,
      shift_timings: job.shift_timings || '09:00AM - 02:00PM',
      job_type: job.job_type || 'Onsite',
      required_skills: job.required_skills || '',
      status: job.status || 'Open',
    });
    setOpenKebabJobId(null);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      await api.updateJob(editingJob.id, {
        title: editingJob.title,
        subject: editingJob.subject,
        post_level: editingJob.post_level,
        experience_required: parseInt(editingJob.experience_required) || 0,
        min_salary: parseInt(editingJob.min_salary) || 0,
        max_salary: parseInt(editingJob.max_salary) || 0,
        shift_timings: editingJob.shift_timings,
        openings: parseInt(editingJob.openings) || 1,
        job_type: editingJob.job_type || 'Onsite',
        status: editingJob.status || 'Open',
        required_skills: editingJob.required_skills || '',
      });
      alert('✅ Job vacancy updated successfully!');
      setEditingJob(null);
      await fetchSchoolData();
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this vacancy?')) return;
    try {
      await api.deleteJob(jobId);
      setOpenKebabJobId(null);
      await fetchSchoolData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleCloseJob = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'Closed' ? 'Open' : 'Closed';
    try {
      await api.updateJob(jobId, { status: newStatus });
      setOpenKebabJobId(null);
      await fetchSchoolData();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleViewApplicants = async (job) => {
    setViewApplicantsJob(job);
    setOpenKebabJobId(null);
    setLoadingApplicants(true);
    try {
      const res = await api.getJobApplicants(job.id);
      setApplicantsList(res.applicants || []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId, status) => {
    try {
      await api.updateApplicantStatus(appId, status);
      setApplicantsList((prev) =>
        prev.map((a) =>
          Number(a.application_id) === Number(appId) || Number(a.id) === Number(appId)
            ? { ...a, application_status: status, status }
            : a
        )
      );
    } catch (err) {
      alert('Failed to update applicant status: ' + err.message);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSchoolAvatar = async () => {
    if (!selectedFile) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      await api.uploadSchoolAvatar(formData);
      await fetchSchoolData();
      await refreshUser();
      setAvatarModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      alert('✅ School logo / profile picture updated successfully!');
    } catch (err) {
      alert('Failed to upload profile picture: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleApplyPresetAvatar = async (url) => {
    if (!url) return;
    setAvatarUploading(true);
    try {
      await api.updateSchoolProfile({ avatar: url, logo_path: url });
      await fetchSchoolData();
      await refreshUser();
      setAvatarModalOpen(false);
      setSelectedPreset(null);
      alert('✅ School logo updated successfully!');
    } catch (err) {
      alert('Failed to update logo: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleApplyCustomUrl = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!customAvatarUrl || !customAvatarUrl.trim()) {
      alert('Please enter a valid image URL');
      return;
    }
    setAvatarUploading(true);
    try {
      await api.updateSchoolProfile({ avatar: customAvatarUrl.trim(), logo_path: customAvatarUrl.trim() });
      await fetchSchoolData();
      await refreshUser();
      setAvatarModalOpen(false);
      setCustomAvatarUrl('');
      alert('✅ School logo updated successfully!');
    } catch (err) {
      alert('Failed to update logo: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateSchoolProfile(profileForm);
      alert('✅ School profile updated successfully!');
      setEditProfileOpen(false);
      await fetchSchoolData();
      await refreshUser();
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const p = profileData?.profile || {};
  const u = profileData?.user || user || {};
  const completion = p.profile_completion || 100;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Toggle: Profile vs Post (Screenshot 1 & 2) */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('Profile')}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'Profile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('Post')}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'Post'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Post
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SCHOOL PROFILE VIEW (Screenshot 2)
         ========================================================================= */}
      {activeTab === 'Profile' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/70 mb-8 space-y-8">
          {/* Green Progress Bar: Profile Completion: 100% */}
          <div>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-2">
              <span>Profile Completion: {completion}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>

          {/* Identity Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
                <img
                  src={
                    u.avatar ||
                    p.logo_path ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80'
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80';
                  }}
                  alt={p.school_name || u.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md group-hover:ring-indigo-300 transition-all duration-200"
                />
                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/45 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                  <Camera className="w-6 h-6 mb-0.5 text-white drop-shadow-md" />
                  <span className="text-[11px] font-bold tracking-wide">Change Logo</span>
                </div>
                {/* Bottom-right Camera Badge Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarModalOpen(true);
                  }}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg ring-2 ring-white transition transform hover:scale-110 active:scale-95 cursor-pointer"
                  title="Change Logo / Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{p.school_name || u.name || 'Institution Name'}</h1>
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                    title="Edit School Profile"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                {u.name && u.name !== p.school_name && (
                  <div className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Person: <strong className="text-slate-700">{u.name}</strong></span>
                  </div>
                )}
                <div className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email: {u.email || 'Not specified'}</span>
                </div>
                <div className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Phone: {u.phone || 'Not specified'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditProfileOpen(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit School Profile</span>
            </button>
          </div>

          {/* Details Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* School */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase">School Name</div>
                <div className="text-base font-bold text-slate-800 truncate">{p.school_name || 'Not provided'}</div>
              </div>
            </div>

            {/* Principal */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase">Principal / Head</div>
                <div className="text-base font-bold text-slate-800 truncate">{p.principal_name || 'Not specified'}</div>
              </div>
            </div>

            {/* Board */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase">Affiliated Board</div>
                <div className="text-base font-bold text-slate-800 truncate">{p.board || 'CBSE'}</div>
              </div>
            </div>

            {/* Campus Address */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-500 uppercase">Campus Address</div>
                <div className="text-sm font-bold text-slate-800 truncate">{p.address || 'Address not specified'}</div>
              </div>
            </div>

            {/* City & District */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase">City & District</div>
                <div className="text-base font-bold text-slate-800 truncate">
                  {p.city ? `${p.city}${p.district ? `, ${p.district}` : ''}` : 'Not specified'}
                </div>
              </div>
            </div>

            {/* State */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase">State</div>
                <div className="text-base font-bold text-slate-800 truncate">{p.state || 'Not specified'}</div>
              </div>
            </div>

            {/* About School */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition p-5 rounded-xl border border-slate-200/60 sm:col-span-2 md:col-span-3">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1.5">About School</div>
              <div className="text-sm text-slate-700 leading-relaxed">
                {p.about_text || 'A leading progressive educational institution committed to quality education and holistic development.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: YOUR JOB POST DASHBOARD (Screenshot 1)
         ========================================================================= */}
      {activeTab === 'Post' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center sm:text-left">
              Your Job Post
            </h2>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-bold text-slate-800">No vacancies published yet</p>
              <p className="text-sm mt-1">Create your first job post to start receiving direct teacher applicants.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs transition relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                            (job.status || 'Open').toLowerCase() === 'open'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              (job.status || 'Open').toLowerCase() === 'open' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {(job.status || 'Open').toLowerCase() === 'open' ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-600">
                        {p.school_name || u.name || 'School'}
                      </div>

                      {/* Details row (Screenshot 1) */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {job.experience_required > 0 ? `${job.experience_required} Year` : 'Fresher / 1 Year'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          {job.min_salary} - {job.max_salary}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{[p.city, p.district, p.state].filter(Boolean).join(', ') || p.address || 'Campus Location'}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTimeAgo(job.created_at)}
                        </span>
                      </div>

                      {/* Post & Shift line */}
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Post: <strong className="font-semibold text-slate-700">{job.post_level}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Subject: <strong className="font-semibold text-slate-700">{job.subject}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Openings: <strong className="font-semibold text-slate-700">{job.openings}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Shift: <strong className="font-semibold text-slate-700">{job.shift_timings}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Type: <strong className="font-semibold text-slate-700">{job.job_type || 'Onsite'}</strong></span>
                      </div>

                      {/* Required Skills tags */}
                      {job.required_skills && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">Skills:</span>
                          {job.required_skills.split(',').filter(Boolean).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => openEditModal(job)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/60 transition shadow-2xs cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Edit Vacancy</span>
                        </button>

                        <button
                          onClick={() => handleCloseJob(job.id, job.status)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition shadow-2xs cursor-pointer ${
                            (job.status || 'Open').toLowerCase() === 'closed'
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                          }`}
                          title="Click to toggle vacancy Open/Closed status"
                        >
                          {(job.status || 'Open').toLowerCase() === 'closed' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reopen Vacancy</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Mark as Closed</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleViewApplicants(job)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>Applicants ({parseInt(job.applicant_count, 10) || 0})</span>
                          {job.top_match_score && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                              Top: {job.top_match_score}%
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Kebab 3-Dots Menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenKebabJobId(openKebabJobId === job.id ? null : job.id)
                        }
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Kebab Dropdown Menu */}
                      {openKebabJobId === job.id && (
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            <span>Delete</span>
                          </button>

                          <button
                            onClick={() => openEditModal(job)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                            <span>Edit Vacancy</span>
                          </button>

                          <button
                            onClick={() => handleCloseJob(job.id, job.status)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                          >
                            <XCircle className="w-4 h-4 text-slate-500" />
                            <span>{(job.status || 'Open').toLowerCase() === 'closed' ? 'Mark as Open' : 'Mark as Closed'}</span>
                          </button>

                          <button
                            onClick={() => handleViewApplicants(job)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5 border-t border-slate-100 transition"
                          >
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span>View Applicants</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DIRECT HIRING MODAL: VIEW APPLICANTS & AI SCORES
         ========================================================================= */}
      {viewApplicantsJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  Direct Recruitment Flow
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  Applicants for {viewApplicantsJob.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct interview flow. Uncensored candidate phone & email provided directly with AI compatibility ranking.
                </p>
              </div>
              <button
                onClick={() => setViewApplicantsJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {loadingApplicants ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-xs text-slate-500 mt-2">Loading and ranking candidate profiles...</p>
              </div>
            ) : applicantsList.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl">
                No educators have applied for this posting yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {applicantsList.map((cand, idx) => (
                  <div
                    key={cand.application_id}
                    className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-indigo-200 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Candidate Avatar & Core Info */}
                      <div className="flex items-center gap-4">
                        <img
                          src={cand.candidate_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                          alt={cand.candidate_name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-slate-900">{cand.candidate_name}</h4>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                              #{idx + 1} Best Match
                            </span>
                            {(() => {
                              const appStatus = cand.application_status || cand.status;
                              if (!appStatus) return null;
                              return (
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                                    appStatus === 'Rejected'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : appStatus === 'Shortlisted'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : appStatus === 'Contacted'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {appStatus}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                            <span>Specialization: <strong className="text-slate-800">{cand.subject || 'Not specified'}</strong></span>
                            <span>•</span>
                            <span>Level: <strong className="text-slate-800">{cand.post || 'TGT'}</strong></span>
                            <span>•</span>
                            <span>Exp: <strong className="text-slate-800">{cand.experience_years > 0 ? `${cand.experience_years} Years` : 'Fresher'}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                              <strong className="text-slate-800">
                                {[cand.city, cand.district, cand.state].filter(Boolean).join(', ') || 'Location on Profile'}
                                {cand.pin_code ? ` (${cand.pin_code})` : ''}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Match Score Badge */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400">AI Compatibility</span>
                        <div className="text-lg font-extrabold text-emerald-600 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span>{cand.ai_match_score}%</span>
                        </div>
                      </div>
                    </div>

                    {/* DIRECT CONTACT BAR: Uncensored Phone & Email */}
                    <div className="p-3 bg-white rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Direct Phone:</span>
                          <a href={`tel:${cand.candidate_phone}`} className="text-emerald-700 font-bold hover:underline">
                            {cand.candidate_phone}
                          </a>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Direct Email:</span>
                          <a href={`mailto:${cand.candidate_email}`} className="text-indigo-700 font-bold hover:underline">
                            {cand.candidate_email}
                          </a>
                        </span>
                      </div>

                      {((cand.resume_path && !cand.resume_path.includes('sample_resume')) || cand.resume_data) ? (
                        <a
                          href={
                            cand.resume_path && !cand.resume_path.includes('sample_resume')
                              ? (cand.resume_path.startsWith('data:') ||
                                 cand.resume_path.startsWith('blob:') ||
                                 cand.resume_path.startsWith('http')
                                  ? cand.resume_path
                                  : `${UPLOAD_BASE_URL}${cand.resume_path}`)
                              : (cand.resume_data || `${UPLOAD_BASE_URL}/api/teacher/resume-file/${cand.teacher_profile_id || cand.profile_id}`)
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Full Resume PDF {cand.resume_filename ? `(${cand.resume_filename})` : ''}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No resume uploaded</span>
                      )}
                    </div>

                    {/* Educator Skills Tags */}
                    {cand.parsed_skills && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-semibold text-slate-500">Indexed Skills:</span>
                        {cand.parsed_skills.split(',').filter(Boolean).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pedagogical tags & Status controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>Qualifications: <strong className="text-slate-700">{cand.qualifications || 'B.Ed'}</strong></span>
                        <span>•</span>
                        <span>Board: <strong className="text-slate-700">{cand.syllabus || 'CBSE'}</strong></span>
                        <span>•</span>
                        <span>Medium: <strong className="text-slate-700">{cand.medium || 'English'}</strong></span>
                        {cand.applied_at && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(cand.applied_at)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Direct status buttons */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          const appStatus = cand.application_status || cand.status || 'Applied';
                          const resolvedId = cand.application_id || cand.id;
                          return (
                            <>
                              <button
                                onClick={() => handleUpdateApplicantStatus(resolvedId, 'Shortlisted')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  appStatus === 'Shortlisted'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {appStatus === 'Shortlisted' ? '✓ Shortlisted' : 'Shortlist'}
                              </button>
                              <button
                                onClick={() => handleUpdateApplicantStatus(resolvedId, 'Contacted')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  appStatus === 'Contacted'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                }`}
                              >
                                {appStatus === 'Contacted' ? '✓ Contacted' : 'Mark Contacted'}
                              </button>
                              <button
                                onClick={() => handleUpdateApplicantStatus(resolvedId, 'Rejected')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  appStatus === 'Rejected'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                }`}
                              >
                                {appStatus === 'Rejected' ? '✕ Rejected' : 'Reject'}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          POST NEW VACANCY MODAL
         ========================================================================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Post Teaching Vacancy
            </h3>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Vacancy Title (e.g. English Teacher - TGT)
                </label>
                <input
                  type="text"
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  placeholder="e.g. English Teacher"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newJobForm.subject}
                    onChange={(e) => setNewJobForm({ ...newJobForm, subject: e.target.value })}
                    placeholder="e.g. English, Maths, Science"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Post Grade Level</label>
                  <select
                    value={newJobForm.post_level}
                    onChange={(e) => setNewJobForm({ ...newJobForm, post_level: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PRT">PRT (Primary Teacher)</option>
                    <option value="TGT">TGT (Trained Graduate Teacher)</option>
                    <option value="PGT">PGT (Post Graduate Teacher)</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Experience Required (Years)</label>
                  <input
                    type="number"
                    value={newJobForm.experience_required}
                    onChange={(e) => setNewJobForm({ ...newJobForm, experience_required: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Openings</label>
                  <input
                    type="number"
                    value={newJobForm.openings}
                    onChange={(e) => setNewJobForm({ ...newJobForm, openings: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Min Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newJobForm.min_salary}
                    onChange={(e) => setNewJobForm({ ...newJobForm, min_salary: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newJobForm.max_salary}
                    onChange={(e) => setNewJobForm({ ...newJobForm, max_salary: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Shift Timings</label>
                  <input
                    type="text"
                    value={newJobForm.shift_timings}
                    onChange={(e) => setNewJobForm({ ...newJobForm, shift_timings: e.target.value })}
                    placeholder="e.g. 10:00AM - 2:00PM"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
                  <select
                    value={newJobForm.job_type}
                    onChange={(e) => setNewJobForm({ ...newJobForm, job_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Status Tag</label>
                  <select
                    value={newJobForm.status}
                    onChange={(e) => setNewJobForm({ ...newJobForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Open">🟢 Open (Actively Hiring)</option>
                    <option value="Closed">🔴 Closed (Applications Closed)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Required Skills / Keywords</label>
                  <input
                    type="text"
                    value={newJobForm.required_skills}
                    onChange={(e) => setNewJobForm({ ...newJobForm, required_skills: e.target.value })}
                    placeholder="e.g. CBSE Syllabus, Python, Laboratory, Problem Solving (comma-separated)"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Campus Location notice */}
                <div className="sm:col-span-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2 text-xs text-indigo-900">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Campus Location:</strong> {[p.city, p.district, p.state].filter(Boolean).join(', ') || p.address || 'Babhanauli, Kushinagar, Uttar Pradesh'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
                >
                  Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB VACANCY MODAL - SHOW ALL DETAILS */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Edit Job Vacancy</h3>
                  <p className="text-xs text-slate-500">Update all details, requirements, compensation & status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vacancy Title / Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  placeholder="e.g. Senior Secondary Physics Teacher"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  required
                />
              </div>

              {/* Subject & Post Grade Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingJob.subject}
                    onChange={(e) => setEditingJob({ ...editingJob, subject: e.target.value })}
                    placeholder="e.g. Physics, Mathematics, English"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Post Grade Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingJob.post_level}
                    onChange={(e) => setEditingJob({ ...editingJob, post_level: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition bg-white"
                  >
                    <option value="PRT">PRT (Primary Teacher)</option>
                    <option value="TGT">TGT (Trained Graduate Teacher)</option>
                    <option value="PGT">PGT (Post Graduate Teacher)</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>

              {/* Experience Required & Number of Openings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience Required (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editingJob.experience_required}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, experience_required: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingJob.openings}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, openings: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editingJob.min_salary}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, min_salary: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editingJob.max_salary}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, max_salary: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Shift Timings & Job Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Timings
                  </label>
                  <input
                    type="text"
                    value={editingJob.shift_timings}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, shift_timings: e.target.value })
                    }
                    placeholder="e.g. 08:30AM - 02:30PM"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={editingJob.job_type}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, job_type: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition bg-white"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              {/* Required Skills & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vacancy Status
                  </label>
                  <select
                    value={editingJob.status}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition bg-white font-medium"
                  >
                    <option value="Open">🟢 Open (Active Listing)</option>
                    <option value="Closed">🔴 Closed (Paused / Filled)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Skills / Keywords
                  </label>
                  <input
                    type="text"
                    value={editingJob.required_skills || ''}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, required_skills: e.target.value })
                    }
                    placeholder="e.g. CBSE Syllabus, Laboratory, Python"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Vacancy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHOOL PROFILE MODAL (Everything editable) */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Edit School Profile</h3>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Picture / Logo Section */}
              <div className="flex items-center gap-4 p-3.5 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-100 rounded-xl">
                <div className="relative group shrink-0">
                  <img
                    src={
                      profileForm.avatar ||
                      u.avatar ||
                      p.logo_path ||
                      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={profileForm.school_name || u.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80';
                    }}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-300 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarModalOpen(true)}
                    className="absolute inset-0 bg-slate-950/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800">School Logo / Profile Picture</div>
                  <div className="text-xs text-slate-500">Upload your institution crest/logo or choose from presets</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Change Logo</span>
                </button>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    School / Institution Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.school_name}
                    onChange={(e) => setProfileForm({ ...profileForm, school_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Modern Public School"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact / Admin Person Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Rajesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Principal / Head of School</label>
                  <input
                    type="text"
                    value={profileForm.principal_name}
                    onChange={(e) => setProfileForm({ ...profileForm, principal_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Dr. Ananya Sen"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Official Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="school@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Affiliated Board</label>
                  <select
                    value={profileForm.board}
                    onChange={(e) => setProfileForm({ ...profileForm, board: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE">ICSE / ISC</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB (International Baccalaureate)</option>
                    <option value="Cambridge">Cambridge / IGCSE</option>
                    <option value="Other">Other Curriculum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={profileForm.district}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Suburban Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Campus / Street Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Plot 42, Sector 15, Ring Road"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Logo URL (optional)</label>
                  <input
                    type="url"
                    value={profileForm.avatar || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://... or click Change Logo above"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">About School / Vision Statement</label>
                <textarea
                  rows="3"
                  value={profileForm.about_text}
                  onChange={(e) => setProfileForm({ ...profileForm, about_text: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe your institution, facilities, culture, and achievements..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED CHANGE SCHOOL LOGO / PROFILE PICTURE MODAL */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl my-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Change School Logo</h3>
                  <p className="text-xs text-slate-500">Update your institution crest or profile picture</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAvatarModalOpen(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setSelectedPreset(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current / Active Preview */}
            <div className="flex flex-col items-center justify-center py-2 mb-5">
              <div className="relative">
                <img
                  src={
                    filePreview ||
                    selectedPreset ||
                    u.avatar ||
                    p.logo_path ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80'
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80';
                  }}
                  alt="School Logo Preview"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-indigo-100 shadow-md"
                />
                {(filePreview || selectedPreset) && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-2 ring-white shadow">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-bold text-slate-800">{p.school_name || u.name || 'Institution Name'}</div>
                <div className="text-xs text-slate-500">{p.board ? `${p.board} Affiliated School` : 'Educational Institution'}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-5">
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  avatarTab === 'upload'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  avatarTab === 'presets'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>School Emblems</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  avatarTab === 'url'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>
            </div>

            {/* Tab 1: Upload from Device */}
            {avatarTab === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">
                    {selectedFile ? selectedFile.name : 'Click to browse school logo file'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Supports PNG, JPG, WEBP, or SVG (max. 5MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate text-xs font-medium text-slate-700">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarModalOpen(false);
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || avatarUploading}
                    onClick={handleUploadSchoolAvatar}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {avatarUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Apply Logo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: School Emblems Presets */}
            {avatarTab === 'presets' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Select an emblem to represent your school:</p>
                <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                  {PRESET_SCHOOL_LOGOS.map((item) => {
                    const isSelected = selectedPreset === item.url || (!selectedPreset && (u.avatar === item.url || p.logo_path === item.url));
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedPreset(item.url)}
                        className={`group relative flex flex-col items-center p-2 rounded-2xl transition-all border cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-14 h-14 rounded-xl object-cover shadow-xs group-hover:scale-105 transition"
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1.5 text-center leading-tight line-clamp-1">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarModalOpen(false);
                      setSelectedPreset(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedPreset || avatarUploading}
                    onClick={() => handleApplyPresetAvatar(selectedPreset)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {avatarUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Selected Logo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Web Image URL */}
            {avatarTab === 'url' && (
              <form onSubmit={handleApplyCustomUrl} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or school website logo link"
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste a direct image link (PNG, JPG, SVG, WEBP).
                  </p>
                </div>

                {customAvatarUrl && (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={customAvatarUrl}
                      alt="URL Preview"
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=256&q=80';
                      }}
                    />
                    <span className="text-xs text-slate-600 truncate flex-1">{customAvatarUrl}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarModalOpen(false);
                      setCustomAvatarUrl('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customAvatarUrl || avatarUploading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {avatarUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Set Logo URL</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
