import React, { useState, useEffect } from 'react';
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Bookmark,
  CheckCircle,
  Sparkles,
  Info,
  Calendar,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSavedJobs, toggleSaveJob } from '../services/savedJobs';

function SwitchToggle({ checked, onChange, id, label }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer select-none group py-0.5"
    >
      <div className="relative inline-flex items-center shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-indigo-600' : 'bg-slate-300'
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-xs ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        ></div>
      </div>
      {label && (
        <span className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}

export default function JobSearch({ onOpenAuthModal, initialKeyword = '' }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  // Exact filters from uploaded screenshot + status tag filter
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Open' | 'Closed'
  const [isOnline, setIsOnline] = useState(false);
  const [datePosted, setDatePosted] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState({
    Fresher: false,
    '1 Year': false,
    '2 Year': false,
    '3 Year': false,
    '4 Year': false,
    Above: false,
  });
  const [salaryRange, setSalaryRange] = useState({ min: 10000, max: 120000 });

  const [applyingId, setApplyingId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [savedJobs, setSavedJobs] = useState(() => new Set(getSavedJobs().map((j) => String(j.id))));

  const hasActiveFilters =
    statusFilter !== 'All' ||
    isOnline ||
    datePosted !== 'All' ||
    Object.values(selectedExperience).some(Boolean) ||
    salaryRange.min > 10000 ||
    salaryRange.max < 120000;

  const handleResetFilters = () => {
    setStatusFilter('All');
    setIsOnline(false);
    setDatePosted('All');
    setSelectedExperience({
      Fresher: false,
      '1 Year': false,
      '2 Year': false,
      '3 Year': false,
      '4 Year': false,
      Above: false,
    });
    setSalaryRange({ min: 10000, max: 120000 });
  };

  useEffect(() => {
    const syncSaved = () => {
      setSavedJobs(new Set(getSavedJobs().map((j) => String(j.id))));
    };
    window.addEventListener('teachment_saved_jobs_changed', syncSaved);
    return () => window.removeEventListener('teachment_saved_jobs_changed', syncSaved);
  }, []);

  useEffect(() => {
    if (initialKeyword && searchKeyword !== initialKeyword) {
      setSearchKeyword(initialKeyword);
    }
  }, [initialKeyword]);

  useEffect(() => {
    const handleStatusChanged = (e) => {
      const { jobId, status } = e?.detail || {};
      if (jobId && status) {
        setJobs((prev) =>
          prev.map((j) =>
            Number(j.id) === Number(jobId)
              ? { ...j, application_status: status }
              : j
          )
        );
      }
      fetchJobs();
    };
    window.addEventListener('teachment_application_status_changed', handleStatusChanged);
    return () => window.removeEventListener('teachment_application_status_changed', handleStatusChanged);
  }, []);

  const expKey = JSON.stringify(selectedExperience);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, isOnline, datePosted, expKey, salaryRange.min, salaryRange.max, searchKeyword]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const activeExp = Object.entries(selectedExperience)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      const res = await api.getJobs({
        keyword: searchKeyword,
        status: statusFilter === 'All' ? '' : statusFilter,
        jobType: isOnline ? 'Online' : '',
        datePosted: datePosted === 'All' ? '' : datePosted,
        experience: activeExp.join(','),
        minSalary: salaryRange.min > 10000 ? salaryRange.min : '',
        maxSalary: salaryRange.max < 120000 ? salaryRange.max : '',
      });
      setJobs(res?.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (j) => {
    const parts = [
      j.school_city || j.city,
      j.school_district || j.district,
      j.school_state || j.state,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    if (j.school_address || j.address) return j.school_address || j.address;
    return 'Babhanauli, Kushinagar, Uttar Pradesh';
  };

  const filteredJobs = jobs.filter((job) => {
    // 0. Status Filter (Open / Closed)
    if (statusFilter !== 'All') {
      const jStatus = (job.status || 'Open').toLowerCase();
      if (jStatus !== statusFilter.toLowerCase()) {
        return false;
      }
    }

    // 1. Online filter
    if (isOnline) {
      const type = (job.job_type || '').toLowerCase();
      const shift = (job.shift_timings || '').toLowerCase();
      if (!type.includes('online') && !shift.includes('online')) {
        return false;
      }
    }

    // 2. Experience Level filter
    const activeExp = Object.entries(selectedExperience)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    if (activeExp.length > 0) {
      const exp = Number(job.experience_required) || 0;
      const matches = activeExp.some((lvl) => {
        if (lvl === 'Fresher') return exp === 0;
        if (lvl === '1 Year') return exp === 1;
        if (lvl === '2 Year') return exp === 2;
        if (lvl === '3 Year') return exp === 3;
        if (lvl === '4 Year') return exp === 4;
        if (lvl === 'Above') return exp >= 5;
        return false;
      });
      if (!matches) return false;
    }

    // 3. Salary Range filter
    const jobMin = job.min_salary || 0;
    const jobMax = job.max_salary || jobMin;
    if (salaryRange.min > 10000 && jobMax < salaryRange.min) {
      return false;
    }
    if (salaryRange.max < 120000 && jobMin > salaryRange.max) {
      return false;
    }

    // 4. Date Posted filter
    if (datePosted !== 'All' && job.created_at) {
      const jobDate = new Date(job.created_at).getTime();
      const now = Date.now();
      const diffHours = (now - jobDate) / (1000 * 60 * 60);
      if (datePosted === 'Last Hour' && diffHours > 1) return false;
      if ((datePosted === 'Last 24 Hour' || datePosted === 'Last 24 Hours') && diffHours > 24) return false;
      if (datePosted === 'Last 7 Days' && diffHours > 24 * 7) return false;
      if (datePosted === 'Last 14 Days' && diffHours > 24 * 14) return false;
      if (datePosted === 'Last 30 Days' && diffHours > 24 * 30) return false;
    }

    // 5. Client-side keyword search filter
    if (searchKeyword && searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      const match =
        (job.title || '').toLowerCase().includes(kw) ||
        (job.subject || '').toLowerCase().includes(kw) ||
        (job.school_name || '').toLowerCase().includes(kw) ||
        (job.school_city || job.city || '').toLowerCase().includes(kw) ||
        (job.school_district || job.district || '').toLowerCase().includes(kw) ||
        (job.school_state || job.state || '').toLowerCase().includes(kw) ||
        (job.post_level || '').toLowerCase().includes(kw) ||
        (job.required_skills || '').toLowerCase().includes(kw);
      if (!match) return false;
    }

    return true;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    if (!user) {
      onOpenAuthModal({
        isLogin: false,
        role: 'teacher',
        promptMessage: 'Please register as a Job Seeker (Teacher) to apply directly to this school vacancy!'
      });
      return;
    }

    if (user.role !== 'teacher') {
      alert('Please switch to a Teacher account to apply for positions.');
      return;
    }

    setApplyingId(jobId);
    try {
      const res = await api.applyJob(jobId);
      alert(
        `🎉 Application Sent!\nAI Compatibility Score: ${res.aiMatchScore}%\nYour unmasked direct contact info is now visible to the school principal.`
      );
      // Refresh list to update badge state
      await fetchJobs();
    } catch (err) {
      alert('Application error: ' + err.message);
    } finally {
      setApplyingId(null);
    }
  };

  const toggleBookmark = (job) => {
    toggleSaveJob(job);
    setSavedJobs(new Set(getSavedJobs().map((j) => String(j.id))));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header (Screenshot 3) */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find your dream job now
          </h1>
          <p className="text-base text-slate-500 font-medium">
            Know your worth and find the job that qualifies your life
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-6 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Enter Keyword / Designation / Location"
                className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Grid: Sidebar Filters & Job Cards (Screenshot 3) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar Filter (Exact match to uploaded specification) */}
          <aside className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            {/* 1. Online switch */}
            <div>
              <SwitchToggle
                id="filter-online"
                checked={isOnline}
                onChange={setIsOnline}
                label="Online"
              />
            </div>

            {/* Vacancy Status (Open / Closed) */}
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3.5">Vacancy Status</h3>
              <div className="space-y-2.5">
                {[
                  { id: 'status-all', value: 'All', label: 'All Vacancies' },
                  { id: 'status-open', value: 'Open', label: '🟢 Open Only' },
                  { id: 'status-closed', value: 'Closed', label: '🔴 Closed Only' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="statusFilter"
                      value={item.value}
                      checked={statusFilter === item.value}
                      onChange={() => setStatusFilter(item.value)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                    <span className="group-hover:text-indigo-600 transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Date Posted */}
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3.5">Date Posted</h3>
              <div className="space-y-2.5">
                {[
                  'All',
                  'Last Hour',
                  'Last 24 Hour',
                  'Last 7 Days',
                  'Last 14 Days',
                  'Last 30 Days',
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="datePosted"
                      value={item}
                      checked={datePosted === item}
                      onChange={() => setDatePosted(item)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                    <span className="group-hover:text-indigo-600 transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Experience Level */}
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3.5">Experience Level</h3>
              <div className="space-y-3">
                {[
                  { id: 'exp-fresher', key: 'Fresher', label: 'Fresher' },
                  { id: 'exp-1yr', key: '1 Year', label: '1 Year' },
                  { id: 'exp-2yr', key: '2 Year', label: '2 Year' },
                  { id: 'exp-3yr', key: '3 Year', label: '3 Year' },
                  { id: 'exp-4yr', key: '4 Year', label: '4 Year' },
                  { id: 'exp-above', key: 'Above', label: 'Above' },
                ].map((exp) => (
                  <SwitchToggle
                    key={exp.key}
                    id={exp.id}
                    checked={Boolean(selectedExperience[exp.key])}
                    onChange={(val) =>
                      setSelectedExperience((prev) => ({
                        ...prev,
                        [exp.key]: val,
                      }))
                    }
                    label={exp.label}
                  />
                ))}
              </div>
            </div>

            {/* 4. Salary (In Months) */}
            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-bold text-slate-900">Salary (In Months)</h3>
                {(salaryRange.min > 10000 || salaryRange.max < 120000) && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    ₹{(salaryRange.min / 1000).toFixed(0)}k - ₹{(salaryRange.max / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              {/* Dual Range Slider */}
              <div className="space-y-2 pt-1">
                <div className="relative h-6 flex items-center">
                  {/* Background track */}
                  <div className="absolute w-full h-1.5 bg-slate-200 rounded-full"></div>
                  {/* Colored active bar */}
                  <div
                    className="absolute h-1.5 bg-indigo-600 rounded-full transition-all"
                    style={{
                      left: `${((salaryRange.min - 10000) / 110000) * 100}%`,
                      right: `${100 - ((salaryRange.max - 10000) / 110000) * 100}%`,
                    }}
                  ></div>
                  {/* Min handle */}
                  <input
                    type="range"
                    min="10000"
                    max="120000"
                    step="5000"
                    value={salaryRange.min}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), salaryRange.max - 5000);
                      setSalaryRange((prev) => ({ ...prev, min: val }));
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  />
                  {/* Max handle */}
                  <input
                    type="range"
                    min="10000"
                    max="120000"
                    step="5000"
                    value={salaryRange.max}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), salaryRange.min + 5000);
                      setSalaryRange((prev) => ({ ...prev, max: val }));
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium px-0.5">
                  <span>₹10,000</span>
                  <span>₹1,20,000+</span>
                </div>
              </div>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition border border-slate-200 hover:border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </aside>

          {/* Right Column: Job Cards */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center px-1 text-sm text-slate-500">
              <span>
                {loading && jobs.length === 0 ? (
                  <span className="inline-flex items-center gap-2 text-indigo-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    Finding teaching vacancies...
                  </span>
                ) : (
                  <>Showing <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'vacancy' : 'vacancies'}</>
                )}
              </span>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
                ⚡ Direct Recruitment — Zero Agency Fees
              </span>
            </div>

            {loading && jobs.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2.5 flex-1">
                        <div className="h-6 bg-slate-200 rounded-md w-2/3"></div>
                        <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                        <div className="h-4 bg-slate-100 rounded-md w-1/2 pt-2"></div>
                      </div>
                      <div className="w-28 h-10 bg-slate-200 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <Briefcase className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="text-base font-bold text-slate-800">No jobs found matching your criteria</h4>
                <p className="text-sm text-slate-500">Try relaxing your search terms or filters.</p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Active Filters</span>
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isApplied = Boolean(job.is_applied);
                const isBookmarked = savedJobs.has(job.id);
                const isExpanded = expandedJobId === job.id;

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 shadow-xs hover:shadow-md transition duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Job Header & Metadata */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h2 className="text-xl font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition">
                            {job.title}
                          </h2>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                              (job.status || 'Open').toLowerCase() === 'open'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                (job.status || 'Open').toLowerCase() === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                              }`}
                            />
                            {(job.status || 'Open').toLowerCase() === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                          <span>{job.school_name}</span>
                          {job.board && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {job.board}
                            </span>
                          )}
                        </div>

                        {/* Details line */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 pt-2">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {job.experience_required > 0 ? `${job.experience_required} Years` : 'Fresher / 1 Year'}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                            {job.min_salary?.toLocaleString()} - {job.max_salary?.toLocaleString()}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{formatLocation(job)}</span>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {(job.status || 'Open').toLowerCase() === 'open' ? 'Actively Hiring' : 'Applications Closed'}
                          </span>
                        </div>

                        {/* Post & Shift Timings line */}
                        <div className="text-xs text-slate-500 pt-1">
                          Post: <span className="font-semibold text-slate-700">{job.post_level}</span> | Openings:{' '}
                          <span className="font-semibold text-slate-700">{job.openings}</span> | Shift:{' '}
                          <span className="font-semibold text-slate-700">{job.shift_timings}</span>
                        </div>

                        {/* Read more toggle */}
                        <div className="pt-2">
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md transition"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-2 border border-slate-100">
                            <p>
                              <strong>Subject Focus:</strong> {job.subject}
                            </p>
                            <p>
                              <strong>Shift Hours:</strong> {job.shift_timings}
                            </p>
                            <p>
                              <strong>Campus Location:</strong> {formatLocation(job)}
                              {job.school_address && job.school_address !== formatLocation(job) ? ` (${job.school_address})` : ''}
                            </p>
                            <p>
                              <strong>Direct Recruitment:</strong> Direct hiring by school. The school principal will contact you directly via phone or email upon application review.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons (Bookmark & Apply / Applied state) */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-2 sm:pt-0">
                        <button
                          onClick={() => toggleBookmark(job)}
                          className={`p-2.5 rounded-xl border transition shadow-2xs cursor-pointer flex items-center justify-center ${
                            isBookmarked
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200'
                          }`}
                          title={isBookmarked ? 'Remove from Saved Jobs' : 'Bookmark / Save Job'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>

                        {isApplied ? (
                          <div className="flex flex-col items-end gap-1">
                            {(() => {
                              const appStatus = (job.application_status || 'Applied').trim().toLowerCase();
                              if (appStatus === 'shortlisted') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 text-sm font-bold shadow-xs">
                                    <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-500 animate-pulse" />
                                    <span>Shortlisted</span>
                                  </span>
                                );
                              }
                              if (appStatus === 'rejected') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-bold shadow-xs">
                                    <XCircle className="w-4 h-4 text-rose-600" />
                                    <span>Rejected</span>
                                  </span>
                                );
                              }
                              if (appStatus === 'contacted') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-bold shadow-xs">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span>Contacted</span>
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold shadow-xs">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  <span>Applied</span>
                                </span>
                              );
                            })()}
                            {job.ai_match_score && (
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3" />
                                {job.ai_match_score}% AI Match
                              </span>
                            )}
                          </div>
                        ) : (job.status || 'Open').toLowerCase() === 'closed' ? (
                          <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-sm font-bold cursor-not-allowed select-none">
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Applications Closed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={applyingId === job.id}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{applyingId === job.id ? 'Scoring AI...' : 'Apply Job'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
