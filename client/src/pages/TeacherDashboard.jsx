import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  Languages,
  Building,
  Globe,
  MapPin,
  Compass,
  User,
  FileText,
  Upload,
  Download,
  Edit2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  IndianRupee,
  Check,
  Bookmark,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
  Loader2
} from 'lucide-react';
import { api, UPLOAD_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSavedJobs, removeSavedJob } from '../services/savedJobs';

const PRESET_AVATARS = [
  { id: 'f1', label: 'Primary Teacher', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { id: 'f2', label: 'Science Faculty', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
  { id: 'f3', label: 'Maths Teacher', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&q=80' },
  { id: 'f4', label: 'English Educator', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
  { id: 'm1', label: 'Physics Faculty', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { id: 'm2', label: 'Chemistry Teacher', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
  { id: 'm3', label: 'Computer Science', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' },
  { id: 'm4', label: 'Principal / HOD', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80' },
];

export default function TeacherDashboard({ onNavigateToJobs }) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile'); // Profile, Resume, Saved Jobs, Applied Jobs
  const [profileData, setProfileData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobsList, setSavedJobsList] = useState(() => getSavedJobs());
  const [applyingSavedId, setApplyingSavedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Profile Picture Modal States
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarTab, setAvatarTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const syncSaved = () => {
      setSavedJobsList(getSavedJobs());
    };
    window.addEventListener('teachment_saved_jobs_changed', syncSaved);
    return () => window.removeEventListener('teachment_saved_jobs_changed', syncSaved);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAppliedJobs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getTeacherProfile();
      setProfileData(res);
      setEditForm({
        name: res.user?.name || '',
        email: res.user?.email || '',
        phone: res.user?.phone || '',
        avatar: res.user?.avatar || '',
        subject: res.profile?.subject || '',
        post: res.profile?.post || '',
        qualifications: res.profile?.qualifications || '',
        syllabus: res.profile?.syllabus || '',
        experience_years: res.profile?.experience_years || 0,
        medium: res.profile?.medium || '',
        state: res.profile?.state || '',
        district: res.profile?.district || '',
        city: res.profile?.city || '',
        pin_code: res.profile?.pin_code || '',
        gender: res.profile?.gender || 'Male',
        parsed_skills: res.profile?.parsed_skills || '',
      });
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await api.getAppliedJobs();
      setAppliedJobs(res.applications || []);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  const handleApplySavedJob = async (jobId) => {
    setApplyingSavedId(jobId);
    try {
      const res = await api.applyJob(jobId);
      alert(
        `🎉 Application Sent!\nAI Compatibility Score: ${res.aiMatchScore}%\nYour pedagogical profile is now directly shared with the school principal.`
      );
      await fetchAppliedJobs();
    } catch (err) {
      alert('Application error: ' + err.message);
    } finally {
      setApplyingSavedId(null);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF document only.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.uploadResume(formData);

      // Immediately sync local profileData and editForm with extracted info
      if (res.profile) {
        setProfileData((prev) => ({
          ...prev,
          profile: res.profile,
          user: res.user || prev?.user,
        }));
        setEditForm((prev) => ({
          ...prev,
          ...res.profile,
          name: res.user?.name || prev.name,
          phone: res.user?.phone || prev.phone,
          avatar: res.user?.avatar || prev.avatar,
        }));
      }

      const skillsMsg = res.parsedSkills || res.profile?.parsed_skills || 'Pedagogical skills indexed';
      const expMsg = res.profile?.experience_years ? `${res.profile.experience_years}+ Years Experience` : '';
      const subjMsg = res.profile?.subject ? `Subject: ${res.profile.subject}` : '';
      const summaryExtra = [subjMsg, expMsg].filter(Boolean).join(' • ');

      alert(
        `🎉 Resume Uploaded & Saved to Database Successfully!\n\n` +
        `File: ${res.resumeFilename || file.name}\n` +
        `Candidate Skills Detected:\n${skillsMsg}\n\n` +
        (summaryExtra ? `${summaryExtra}\n\n` : '') +
        `Your profile has been updated in the database!`
      );

      await fetchProfile();
      await refreshUser();
    } catch (err) {
      alert('⚠️ Resume Upload Failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFileSelect = (e) => {
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

  const handleUploadAvatarFile = async () => {
    if (!selectedFile) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      await api.uploadTeacherAvatar(formData);
      await fetchProfile();
      await refreshUser();
      setAvatarModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      alert('✅ Profile photo updated successfully!');
    } catch (err) {
      alert('Failed to upload profile photo: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleApplyPresetAvatar = async (url) => {
    if (!url) return;
    setAvatarUploading(true);
    try {
      await api.updateTeacherProfile({ avatar: url });
      await fetchProfile();
      await refreshUser();
      setAvatarModalOpen(false);
      setSelectedPreset(null);
      alert('✅ Profile photo updated successfully!');
    } catch (err) {
      alert('Failed to update avatar: ' + err.message);
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
      await api.updateTeacherProfile({ avatar: customAvatarUrl.trim() });
      await fetchProfile();
      await refreshUser();
      setAvatarModalOpen(false);
      setCustomAvatarUrl('');
      alert('✅ Profile photo updated successfully!');
    } catch (err) {
      alert('Failed to update avatar: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateTeacherProfile(editForm);
      alert('✅ Profile updated successfully!');
      setEditModalOpen(false);
      await fetchProfile();
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
  
  const getResumeUrl = (profile) => {
    if (!profile) return null;
    const path = profile.resume_path;
    const data = profile.resume_data;

    // Reject any legacy sample resume reference
    if (path && path.includes('sample_resume')) return null;

    if (path) {
      if (
        path.startsWith('data:') ||
        path.startsWith('blob:') ||
        path.startsWith('http://') ||
        path.startsWith('https://')
      ) {
        return path;
      }
      return `${UPLOAD_BASE_URL}${path}`;
    }

    if (data && typeof data === 'string') {
      if (data.startsWith('blob:') || data.startsWith('http')) return data;
      if (data.startsWith('data:application/pdf;base64,')) {
        try {
          const byteCharacters = atob(data.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          return URL.createObjectURL(blob);
        } catch {
          return data;
        }
      }
      return data;
    }

    return null;
  };
  const resumeUrl = getResumeUrl(p);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Tab Bar (Exact styling from screenshots) */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl gap-2 shadow-inner border border-slate-200/60">
          {['Profile', 'Resume', 'Saved Jobs', 'Applied Jobs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{tab}</span>
              {tab === 'Saved Jobs' && savedJobsList.length > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    activeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {savedJobsList.length}
                </span>
              )}
              {tab === 'Applied Jobs' && appliedJobs.length > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    activeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {appliedJobs.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Overview Card (Screenshot 2) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/70 mb-8">
        {/* Profile Completion Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-2">
            <span>Profile Completion: {completion}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>

        {/* Identity Bar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
              <img
                src={
                  u.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                }}
                alt={u.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-indigo-50 shadow-md group-hover:ring-indigo-300 transition-all duration-200"
              />
              {/* Dark Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/45 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                <Camera className="w-6 h-6 mb-0.5 text-white drop-shadow-md" />
                <span className="text-[11px] font-bold tracking-wide">Change Photo</span>
              </div>
              {/* Bottom-right Camera Badge Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarModalOpen(true);
                }}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg ring-2 ring-white transition transform hover:scale-110 active:scale-95"
                title="Change Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{u.name || 'Candidate Name'}</h1>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="text-slate-400 hover:text-indigo-600 transition"
                  title="Edit details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2">
                <span className="font-medium">Email:</span>
                <span>{u.email}</span>
              </div>
              <div className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2">
                <span className="font-medium">Phone:</span>
                <span>{u.phone || '9335893077'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* TAB 1: Profile Grid Cards (Screenshot 5) */}
        {activeTab === 'Profile' && (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* 1. Subject */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Subject</div>
                  <div className="text-base font-bold text-slate-800">{p.subject || 'Not Specified'}</div>
                </div>
              </div>

              {/* 2. Post */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Post</div>
                  <div className="text-base font-bold text-slate-800">{p.post || 'Not Specified'}</div>
                </div>
              </div>

              {/* 3. Qualifications */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Qualifications</div>
                  <div className="text-base font-bold text-slate-800">{p.qualifications || 'Pending Upload'}</div>
                </div>
              </div>

              {/* 4. Syllabus */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Syllabus</div>
                  <div className="text-base font-bold text-slate-800">{p.syllabus || 'CBSE'}</div>
                </div>
              </div>

              {/* 5. Experience */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Experience</div>
                  <div className="text-base font-bold text-slate-800">
                    {p.experience_years > 0 ? `${p.experience_years}+ Years` : (p.experience_years === 0 ? 'Fresher' : 'Not Specified')}
                  </div>
                </div>
              </div>

              {/* 6. Medium */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Medium</div>
                  <div className="text-base font-bold text-slate-800">{p.medium || 'English'}</div>
                </div>
              </div>

              {/* 7. State */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">State</div>
                  <div className="text-base font-bold text-slate-800">{p.state || 'Not Specified'}</div>
                </div>
              </div>

              {/* 8. District */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">District</div>
                  <div className="text-base font-bold text-slate-800">{p.district || 'Not Specified'}</div>
                </div>
              </div>

              {/* 9. City */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">City</div>
                  <div className="text-base font-bold text-slate-800">{p.city || 'Not Specified'}</div>
                </div>
              </div>

              {/* 10. PIN */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">PIN</div>
                  <div className="text-base font-bold text-slate-800">{p.pin_code || 'Not Specified'}</div>
                </div>
              </div>

              {/* 11. Gender */}
              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 rounded-xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Gender</div>
                  <div className="text-base font-bold text-slate-800">{p.gender || 'Not Specified'}</div>
                </div>
              </div>
            </div>

            {/* AI Parsed Competencies */}
            {p.parsed_skills && (
              <div className="mt-8 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI-Indexed Pedagogical Competencies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.parsed_skills.split(',').map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded-full shadow-xs border border-indigo-200"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Resume Management (Screenshot 4) */}
        {activeTab === 'Resume' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-800">Candidate Resume Document</h3>
                  {resumeUrl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ AI Indexed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending Upload
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {resumeUrl
                    ? (p.resume_filename ? `Current File: ${p.resume_filename}` : 'Active candidate resume document stored in database.')
                    : 'Upload your original resume in PDF format. It will be stored dynamically in the database and shown on your profile.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Parsing AI Index...' : (resumeUrl ? 'Re-upload Resume' : 'Upload Resume')}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    download={p.resume_filename || "Teacher_Resume.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold transition shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>

            {/* AI Skills Extracted Banner inside Resume Tab */}
            {p.parsed_skills && (
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Extracted Skills from Resume</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    {p.subject ? `Subject: ${p.subject}` : ''} {p.experience_years ? `• ${p.experience_years}+ Yrs` : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.parsed_skills.split(',').map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white text-indigo-700 text-xs font-medium rounded-md shadow-2xs border border-indigo-200"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inline PDF Viewer (Screenshot 4) */}
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-700">
              <div className="bg-slate-900 text-slate-300 px-4 py-2.5 text-xs flex justify-between items-center border-b border-slate-700/60">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium">Integrated PDF Document Viewer</span>
                </span>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700 transition"
                  >
                    <span>Open Full Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {resumeUrl ? (
                <div className="w-full h-[650px] bg-slate-100 relative">
                  <iframe
                    src={resumeUrl}
                    title="Teacher Resume Viewer"
                    className="w-full h-full border-0"
                  />
                  <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-slate-600 border border-slate-200 shadow-xs flex items-center gap-2">
                    <span>Previewing uploaded PDF</span>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      Direct Link
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 bg-slate-850">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-60" />
                  <p className="text-base font-semibold text-slate-200">No Resume Uploaded Yet</p>
                  <p className="text-sm mt-1 max-w-md mx-auto text-slate-400">
                    Upload your candidate resume in PDF format above to preview your document and activate AI-powered vacancy matching.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Saved Jobs */}
        {activeTab === 'Saved Jobs' && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Saved Vacancies ({savedJobsList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Positions you bookmarked while exploring jobs. Review details and apply anytime.
                </p>
              </div>
              <button
                onClick={onNavigateToJobs}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline self-start sm:self-auto"
              >
                + Explore More Jobs
              </button>
            </div>

            {savedJobsList.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Bookmark className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h4 className="text-base font-bold text-slate-800">No Saved Jobs Yet</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Click the bookmark icon on any vacancy in the Search Jobs page to save it here for quick review.
                </p>
                <button
                  onClick={onNavigateToJobs}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  Explore Teaching Jobs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedJobsList.map((job) => {
                  const isApplied = appliedJobs.some(
                    (a) => a.job_id === job.id || a.title === job.title
                  );
                  return (
                    <div
                      key={job.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <img
                          src={
                            job.school_logo ||
                            'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=128&q=80'
                          }
                          alt={job.school_name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0 mt-0.5 shadow-2xs"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-bold text-slate-900">{job.title}</h4>
                            {job.syllabus && (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {job.syllabus}
                              </span>
                            )}
                            {job.subject && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {job.subject}
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span>{job.school_name}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            {(job.school_city || job.school_state) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {[job.school_city, job.school_state].filter(Boolean).join(', ')}
                              </span>
                            )}
                            {(job.min_salary || job.max_salary) && (
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                                ₹{job.min_salary?.toLocaleString()} - ₹{job.max_salary?.toLocaleString()} / mo
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {job.experience_required > 0 ? `${job.experience_required} Yrs Exp` : 'Fresher / 1 Yr'}
                            </span>
                            {job.shift_timings && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {job.shift_timings}
                              </span>
                            )}
                            {job.post_level && (
                              <span className="text-slate-600">
                                Level: <strong className="text-slate-700">{job.post_level}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-row md:flex-col items-center sm:items-end justify-between md:justify-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        {isApplied ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplySavedJob(job.id)}
                            disabled={applyingSavedId === job.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{applyingSavedId === job.id ? 'Applying...' : 'Apply Now'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => removeSavedJob(job.id)}
                          className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition font-medium border border-transparent hover:border-rose-200"
                          title="Remove from saved jobs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Applied Jobs */}
        {activeTab === 'Applied Jobs' && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                Applied Positions ({appliedJobs.length})
              </h3>
              <button
                onClick={onNavigateToJobs}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Apply for more vacancies
              </button>
            </div>

            {appliedJobs.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                You have not applied to any vacancies yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {appliedJobs.map((app) => (
                  <div
                    key={app.application_id}
                    className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-slate-900">{app.title}</h4>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                            app.application_status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : app.application_status === 'Shortlisted'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : app.application_status === 'Contacted'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {app.application_status}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-600">{app.school_name}</div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {[app.school_city || app.city, app.school_district || app.district, app.school_state || app.state]
                              .filter(Boolean)
                              .join(', ') || 'Campus Location'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5" />
                          ₹{app.min_salary?.toLocaleString()} - ₹{app.max_salary?.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {app.shift_timings}
                        </span>
                      </div>
                    </div>

                    {/* AI Score Badge */}
                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-xs text-slate-400">AI Compatibility</div>
                      <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>{app.ai_match_score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Edit Candidate Profile</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Profile Photo Quick Action Banner */}
              <div className="flex items-center gap-4 p-3.5 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-100 rounded-xl">
                <div className="relative group shrink-0">
                  <img
                    src={
                      editForm.avatar ||
                      u.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={u.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                    }}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-300 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarModalOpen(true)}
                    className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800">Profile Picture</div>
                  <div className="text-xs text-slate-500">Upload a new photo from your device or pick a teacher avatar</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Change Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select
                    value={editForm.gender || 'Male'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Maths, English, Physics"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Post / Grade</label>
                  <select
                    value={editForm.post}
                    onChange={(e) => setEditForm({ ...editForm, post: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PRT">PRT (Primary Teacher)</option>
                    <option value="TGT">TGT (Trained Graduate Teacher)</option>
                    <option value="PGT">PGT (Post Graduate Teacher)</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={editForm.qualifications}
                    onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. B.Ed, M.Sc, Tech"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Syllabus / Board</label>
                  <input
                    type="text"
                    value={editForm.syllabus}
                    onChange={(e) => setEditForm({ ...editForm, syllabus: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="CBSE, ICSE, State Board"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editForm.experience_years}
                    onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Medium</label>
                  <input
                    type="text"
                    value={editForm.medium}
                    onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="English, Hindi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editForm.pin_code}
                    onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Skills / Key Competencies (comma-separated)
                  </label>
                  <textarea
                    rows="2"
                    value={editForm.parsed_skills || ''}
                    onChange={(e) => setEditForm({ ...editForm, parsed_skills: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Mathematics, Physics, Classroom Management, Lesson Planning, CBSE Curriculum"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Photo URL (optional)</label>
                  <input
                    type="url"
                    value={editForm.avatar || ''}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://... or click Change Photo above"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Change Profile Picture Modal */}
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
                  <h3 className="text-lg font-bold text-slate-900">Change Profile Photo</h3>
                  <p className="text-xs text-slate-500">Update your public educator avatar</p>
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
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
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
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                  }}
                  alt="Profile Avatar Preview"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-indigo-100 shadow-md"
                />
                {(filePreview || selectedPreset) && (
                  <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full ring-2 ring-white shadow">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-bold text-slate-800">{u.name || 'Candidate Name'}</div>
                <div className="text-xs text-slate-500">{p.post ? `${p.post} - ${p.subject || ''}` : 'Educator'}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-5">
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
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
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  avatarTab === 'presets'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Teacher Avatars</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
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
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleFileSelect}
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
                    {selectedFile ? selectedFile.name : 'Click to browse an image from device'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Supports JPG, PNG, WEBP, or GIF (max. 5MB)
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
                    onClick={handleUploadAvatarFile}
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
                        <span>Save & Apply Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Educator Avatar Presets */}
            {avatarTab === 'presets' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Select an educator avatar to instantly represent your profile:</p>
                <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                  {PRESET_AVATARS.map((item) => {
                    const isSelected = selectedPreset === item.url || (!selectedPreset && u.avatar === item.url);
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
                            className="w-14 h-14 rounded-full object-cover shadow-xs group-hover:scale-105 transition"
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
                        <span>Apply Selected Avatar</span>
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
                    Image Link / URL
                  </label>
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or any online image"
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste a direct image URL (PNG, JPG, WEBP).
                  </p>
                </div>

                {customAvatarUrl && (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={customAvatarUrl}
                      alt="URL Preview"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
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
                        <span>Set Image URL</span>
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
