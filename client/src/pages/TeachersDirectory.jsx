import React, { useState, useEffect } from 'react';
import {
  Search,
  GraduationCap,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Sparkles,
  BookOpen,
  Award,
  Globe,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { api, UPLOAD_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeachersDirectory({ onOpenAuthModal }) {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedPost, setSelectedPost] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.getTeachers();
      setTeachers(res.teachers || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique subjects and posts for quick filters
  const subjects = ['All', ...new Set(teachers.map((t) => t.subject).filter(Boolean))];
  const postLevels = ['All', 'PRT', 'TGT', 'PGT'];

  // Client-side instant filtering as employer types
  const filteredTeachers = teachers.filter((t) => {
    // 1. Search filter by name, subject, city, skills
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const name = (t.name || '').toLowerCase();
      const subject = (t.subject || '').toLowerCase();
      const city = (t.city || '').toLowerCase();
      const skills = (t.parsed_skills || '').toLowerCase();
      const quals = (t.qualifications || '').toLowerCase();

      const matchesSearch =
        name.includes(term) ||
        subject.includes(term) ||
        city.includes(term) ||
        skills.includes(term) ||
        quals.includes(term);

      if (!matchesSearch) return false;
    }

    // 2. Subject filter
    if (selectedSubject !== 'All' && t.subject !== selectedSubject) {
      return false;
    }

    // 3. Post level filter
    if (selectedPost !== 'All' && t.post !== selectedPost) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Verified Educator Directory — Direct Recruitment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find & Hire Verified Teachers
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Browse verified pedagogical profiles, search candidates by name or specialization, and connect directly with educators across India.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teacher by name, subject, or skills (e.g. Pooja, Maths, Python)..."
                className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Subject:</span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}

            <span className="text-slate-300 mx-2 hidden sm:inline">|</span>

            <span className="text-slate-400 font-semibold mr-1">Level:</span>
            {postLevels.map((post) => (
              <button
                key={post}
                onClick={() => setSelectedPost(post)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedPost === post
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {post}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex justify-between items-center px-1 mb-6 text-sm text-slate-500">
          <span>
            Showing <strong>{filteredTeachers.length}</strong> registered educators
          </span>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Unmasked Direct Phone & Email Access</span>
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading educator profiles...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-3">
            <GraduationCap className="w-14 h-14 mx-auto text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800">No teachers found</h3>
            <p className="text-sm text-slate-500">
              No educators matched your search term "{searchTerm}". Try clearing your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('All');
                setSelectedPost('All');
              }}
              className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((t) => (
              <div
                key={t.profile_id || t.user_id}
                onClick={() => setSelectedTeacher(t)}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  {/* Top Avatar & Name Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        t.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                      }}
                      alt={t.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-200 transition shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {t.name}
                        </h3>
                        {t.profile_completion >= 80 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Profile" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {t.subject && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {t.subject}
                          </span>
                        )}
                        {t.post && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {t.post}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pedagogical Details Bar */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2 pt-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Experience: <strong>{t.experience_years > 0 ? `${t.experience_years} Years` : 'Fresher'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Qualifications: <strong>{t.qualifications || 'B.Ed / CTET'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Location: <strong>{[t.city, t.state].filter(Boolean).join(', ') || 'India'}</strong>
                      </span>
                    </div>

                    {t.syllabus && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Board: <strong>{t.syllabus}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags preview */}
                  {t.parsed_skills && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {t.parsed_skills
                          .split(',')
                          .slice(0, 3)
                          .map((skill, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        {t.parsed_skills.split(',').length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium self-center">
                            +{t.parsed_skills.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Card Action */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Direct Contact Available</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeacher(t);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FULL TEACHER PROFILE MODAL */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <img
                  src={
                    selectedTeacher.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                  }}
                  alt={selectedTeacher.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl font-black">{selectedTeacher.name}</h2>
                    <span className="text-xs bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2.5 py-0.5 rounded-full font-bold">
                      Verified Educator
                    </span>
                  </div>
                  <p className="text-indigo-100 text-sm font-medium">
                    {selectedTeacher.post} Faculty • {selectedTeacher.subject}
                  </p>
                  <div className="text-xs text-indigo-200 flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                    <span>Exp: {selectedTeacher.experience_years > 0 ? `${selectedTeacher.experience_years} Years` : 'Fresher'}</span>
                    <span>•</span>
                    <span>Board: {selectedTeacher.syllabus || 'CBSE'}</span>
                    <span>•</span>
                    <span>Location: {[selectedTeacher.city, selectedTeacher.state].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* DIRECT CONTACT BAR */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Direct Recruiter Contact Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Direct Phone</div>
                      <a
                        href={`tel:${selectedTeacher.phone}`}
                        className="font-bold text-slate-800 hover:text-emerald-700 hover:underline"
                      >
                        {selectedTeacher.phone || 'Contact provided on application'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Direct Email</div>
                      <a
                        href={`mailto:${selectedTeacher.email}`}
                        className="font-bold text-slate-800 hover:text-indigo-700 hover:underline truncate block"
                      >
                        {selectedTeacher.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pedagogical Profile Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Pedagogical Qualifications & Specialization</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium block">Specialization</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.subject || 'General'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Teaching Level</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.post || 'TGT'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Experience</span>
                    <strong className="text-slate-800 text-sm">
                      {selectedTeacher.experience_years > 0 ? `${selectedTeacher.experience_years} Years` : 'Fresher'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Qualifications</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.qualifications || 'B.Ed'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Board / Syllabus</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.syllabus || 'CBSE'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Instruction Medium</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.medium || 'English'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">City / State</span>
                    <strong className="text-slate-800 text-sm">
                      {[selectedTeacher.city, selectedTeacher.state].filter(Boolean).join(', ') || 'N/A'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">PIN Code</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.pin_code || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Gender</span>
                    <strong className="text-slate-800 text-sm">{selectedTeacher.gender || 'Not specified'}</strong>
                  </div>
                </div>
              </div>

              {/* Parsed Skills & Expertise */}
              {selectedTeacher.parsed_skills && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Extracted Skills & Subject Competencies</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.parsed_skills.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume PDF Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Verified Curriculum Vitae (PDF)</h5>
                    <p className="text-xs text-slate-500">
                      {selectedTeacher.resume_path ? 'Official candidate resume uploaded and verified.' : 'Resume document pending upload.'}
                    </p>
                  </div>
                </div>

                {selectedTeacher.resume_path ? (
                  <a
                    href={
                      selectedTeacher.resume_path.startsWith('data:') ||
                      selectedTeacher.resume_path.startsWith('blob:') ||
                      selectedTeacher.resume_path.startsWith('http')
                        ? selectedTeacher.resume_path
                        : `${UPLOAD_BASE_URL}${selectedTeacher.resume_path}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <span>View Resume PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold px-3 py-1.5 bg-slate-200/60 rounded-xl text-center">
                    No PDF Available
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
