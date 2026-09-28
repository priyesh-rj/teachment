import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Briefcase,
  TrendingUp,
  FileText,
  ShieldCheck,
  Award,
  Users,
  Clock,
  ChevronRight,
  Star,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  BadgeCheck,
  Layers,
  Zap,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function HomePage({
  onOpenAuthModal,
  onNavigateToJobs,
  onNavigateToSchools,
  onSelectSearchKeyword
}) {
  const { user } = useAuth();
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('teacher'); // 'teacher' | 'school'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroSubject, setHeroSubject] = useState('');
  const [heroLevel, setHeroLevel] = useState('');

  const [liveJobs, setLiveJobs] = useState([]);
  const [liveSchools, setLiveSchools] = useState([]);

  useEffect(() => {
    api.getJobs().then(res => setLiveJobs(res.jobs || [])).catch(() => setLiveJobs([]));
    api.getSchools().then(res => setLiveSchools(res.schools || [])).catch(() => setLiveSchools([]));
  }, []);

  // Top Partner Schools (Dynamic from database)
  const partnerSchools = liveSchools.length > 0 ? liveSchools.map(s => ({
    name: s.school_name,
    board: `${s.board || 'CBSE'} Board`,
    city: [s.city, s.district, s.state].filter(Boolean).join(', ') || 'Kushinagar, UP',
    type: 'Co-Educational Senior Sec',
    image: s.logo_path || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
    vacancies: Number(s.vacancy_count) || 0
  })) : [
    {
      name: 'SD Public school babhanauli kushinagar',
      board: 'CBSE Affiliated',
      city: 'Babhanauli, Kushinagar, UP',
      type: 'Co-Educational Senior Sec',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
      vacancies: 0
    }
  ];

  // FAQ Items
  const faqs = [
    {
      q: 'How does TEACHMENT connect teachers and schools without middlemen?',
      a: 'Unlike traditional placement agencies that charge heavy commissions or take a percentage of your first salary, TEACHMENT provides direct, unmasked contact. Schools review verified teacher profiles and AI compatibility match scores, then directly contact candidates via unmasked phone or email.'
    },
    {
      q: 'Is registering and applying for jobs completely free for teachers?',
      a: 'Yes, 100% free! Teachers can create full pedagogical profiles, upload PDF resumes, access AI resume compatibility scoring, and apply directly to unlimited school vacancies with zero hidden fees.'
    },
    {
      q: 'How does the AI Pedagogical Compatibility Engine work?',
      a: 'Our Python-powered AI service processes pedagogical keywords (like CTET, B.Ed, NEP 2020, Smart Board, Classroom Management) and performs TF-IDF vectorization and cosine similarity against school job requirements to generate transparent compatibility percentage scores.'
    },
    {
      q: 'How do Schools and Employers benefit from TEACHMENT?',
      a: 'Schools can post vacancies, instantly filter verified teachers by board syllabus (CBSE/ICSE/State), experience level, and city, review AI match rankings, and reach qualified teachers immediately without paying agency broker fees.'
    },
    {
      q: 'Can I test my resume before applying to jobs?',
      a: 'Absolutely! Our built-in Pedagogical Resume Analyzer scans your uploaded CV for essential educational credentials, subject depth, and certifications, providing actionable recommendations to maximize your visibility to top school principals.'
    }
  ];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (onSelectSearchKeyword) {
      onSelectSearchKeyword(heroSearch || heroSubject || heroLevel);
    }
    onNavigateToJobs();
  };

  const handleApplyClick = (job) => {
    if (!user) {
      onOpenAuthModal({
        isLogin: false,
        role: 'teacher',
        promptMessage: `Please sign in or register as a Job Seeker to apply directly for "${job.title}".`
      });
      return;
    }
    onNavigateToJobs();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-100">
        {/* Subtle Decorative Background Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/80 text-indigo-900 text-xs font-bold tracking-wide shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                <span>AI-Powered Direct Teacher-School Recruitment</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">Passionate Teachers</span> Directly with Top Schools.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Skip recruitment agencies, 0% brokerage, and weeks of unread emails. TEACHMENT matches certified educators with accredited K-12 schools using smart pedagogical AI.
              </p>

              {/* DUAL REGISTRATION / ACCESS BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                {/* Register as Job Seeker */}
                <button
                  onClick={() =>
                    onOpenAuthModal({
                      isLogin: false,
                      role: 'teacher',
                      promptMessage: 'Create your Job Seeker profile to apply directly to top schools!'
                    })
                  }
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Register as Job Seeker</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>

                {/* Register as Employer */}
                <button
                  onClick={() =>
                    onOpenAuthModal({
                      isLogin: false,
                      role: 'school',
                      promptMessage: 'Register your School or College to post vacancies and hire verified teachers!'
                    })
                  }
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 hover:text-indigo-600 border border-slate-300 font-bold text-sm sm:text-base shadow-sm hover:border-indigo-300 transition cursor-pointer"
                >
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Register as Employer</span>
                </button>

                {/* Direct Sign In */}
                <button
                  onClick={() =>
                    onOpenAuthModal({
                      isLogin: true,
                      promptMessage: 'Welcome back! Sign in to access your dashboard.'
                    })
                  }
                  className="inline-flex items-center justify-center px-4 py-3.5 text-slate-600 hover:text-indigo-600 text-sm font-bold transition hover:underline"
                >
                  <span>Already have an account? Sign In</span>
                </button>
              </div>

              {/* QUICK JOB SEARCH BAR */}
              <div className="pt-4">
                <form
                  onSubmit={handleHeroSearch}
                  className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 flex flex-col md:flex-row gap-2"
                >
                  <div className="flex-1 flex items-center px-3 gap-2 border-b md:border-b-0 md:border-r border-slate-100 py-1.5">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Subject or Role (e.g. Maths, PGT, Science)"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  <div className="flex-1 flex items-center px-3 gap-2 border-b md:border-b-0 md:border-r border-slate-100 py-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <select
                      value={heroLevel}
                      onChange={(e) => setHeroLevel(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-slate-700 cursor-pointer"
                    >
                      <option value="">All Post Levels (PGT, TGT, PRT)</option>
                      <option value="PGT">PGT (Class 11 - 12)</option>
                      <option value="TGT">TGT (Class 6 - 10)</option>
                      <option value="PRT">PRT (Primary)</option>
                      <option value="Coordinator">Academic Coordinator</option>
                      <option value="Principal">Principal / Headmaster</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Jobs</span>
                  </button>
                </form>

                {/* Popular Search Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">Popular Searches:</span>
                  {['PGT Maths', 'TGT English', 'PRT Science', 'CBSE Mumbai', 'NEP 2020 Trained'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setHeroSearch(tag);
                        if (onSelectSearchKeyword) onSelectSearchKeyword(tag);
                        onNavigateToJobs();
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg text-xs transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  100% Direct Contact
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Verified CTET & B.Ed
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Zero Brokerage Fees
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual with Interactive Micro-Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Generated Classroom Photography */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                  <img
                    src="/images/hero-classroom.jpg"
                    alt="Modern high-tech classroom with teacher and students"
                    className="w-full h-80 sm:h-96 lg:h-[460px] object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Photo Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                      Interactive Smart Classroom
                    </p>
                    <p className="text-sm font-bold text-white drop-shadow-sm">
                      Over 400+ leading institutions recruiting certified faculty directly.
                    </p>
                  </div>
                </div>

                {/* Floating Glassmorphic Badge 1: AI Match Score */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-sm">
                    98%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>AI Compatibility</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      CBSE Syllabus & Pedagogy Matched
                    </div>
                  </div>
                </div>

                {/* Floating Glassmorphic Badge 2: Direct Interview */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Direct Principal Connect</div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Unmasked Phone & WhatsApp
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS & TRUST BAR */}
      <section className="bg-white py-10 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">1,500+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Certified Educators</div>
              <div className="text-[11px] text-slate-500 mt-0.5">B.Ed, CTET & TET Qualified</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">420+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Accredited Schools</div>
              <div className="text-[11px] text-slate-500 mt-0.5">CBSE, ICSE & Cambridge</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">₹0</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Agency Brokerage</div>
              <div className="text-[11px] text-slate-500 mt-0.5">100% Free for Teachers</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-violet-600 tracking-tight">94%</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">AI Match Precision</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Pedagogy & Subject Alignment</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (DUAL TRACK: JOB SEEKERS VS EMPLOYERS) */}
      <section id="how-it-works" className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Transparent 4-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How TEACHMENT Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A simplified, automated direct recruitment bridge designed specifically for educators and academic institutions.
            </p>

            {/* Workflow Mode Switcher */}
            <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl mt-4">
              <button
                type="button"
                onClick={() => setActiveWorkflowTab('teacher')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeWorkflowTab === 'teacher'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>For Job Seekers (Teachers)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkflowTab('school')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeWorkflowTab === 'school'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>For Employers (Schools & Colleges)</span>
              </button>
            </div>
          </div>

          {/* Workflow Content: Teacher Track */}
          {activeWorkflowTab === 'teacher' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Build Profile & Upload CV</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your subject mastery (Maths, Physics, English, etc.), board experience, and upload your PDF resume.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
                  <span>Fast 2-minute setup</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">AI Pedagogical Analysis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our AI extracts certifications (CTET, B.Ed) and pedagogical skills (Smart Board, NEP 2020) to compute your match score.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                  <span>Automated skill scoring</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">1-Click Direct Application</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore verified school openings with instant match scores and apply without paying any recruitment consultant.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
                  <span>Zero brokerage cost</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-violet-600 group-hover:text-white transition">
                  4
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Direct Principal Interview</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  School administrators receive your unmasked contact details and call you directly for demo classes and offers.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-violet-600">
                  <span>Direct phone & WhatsApp</span>
                </div>
              </div>
            </div>
          ) : (
            /* Workflow Content: School / Employer Track */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Post Vacancy in 60 Seconds</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Define your requirement: Subject, Level (PGT/TGT/PRT), Board affiliation, experience requirements, and salary package.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
                  <span>Simple job builder</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">AI Ranks Top Candidates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our microservice immediately scores candidate resumes based on syllabus alignment and pedagogical competence.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                  <span>Ranked by compatibility</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Unmasked Contact Access</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  View candidates' actual mobile numbers, email addresses, and verified credentials without gatekeepers.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
                  <span>Zero masked pipelines</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-lg mb-4 group-hover:bg-violet-600 group-hover:text-white transition">
                  4
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Hire & Save Lakhs in Fees</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conduct direct demos, make offers, and manage recruitment pipeline status (Shortlisted, Interviewed, Hired) in one place.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-violet-600">
                  <span>0% Placement fee</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Workflow Action Button */}
          <div className="mt-12 text-center">
            {activeWorkflowTab === 'teacher' ? (
              <button
                type="button"
                onClick={() =>
                  onOpenAuthModal({
                    isLogin: false,
                    role: 'teacher',
                    promptMessage: 'Get started by creating your Job Seeker profile today!'
                  })
                }
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition cursor-pointer"
              >
                <span>Register as Job Seeker (Teacher)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onOpenAuthModal({
                    isLogin: false,
                    role: 'school',
                    promptMessage: 'Register your Institution to post positions and recruit certified teachers!'
                  })
                }
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition cursor-pointer"
              >
                <span>Register as Employer (School / College)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. BUILD A GOOD RESUME & AI SKILLS ANALYZER SHOWCASE */}
      <section id="resume-builder" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Column */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 bg-slate-900 group">
                  <img
                    src="/images/ai-resume-scan.jpg"
                    alt="AI Pedagogical Resume Scanning Mockup"
                    className="w-full h-auto object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>

                {/* Floating Tag 1 */}
                <div className="absolute -bottom-4 left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Automatic PDF Parsing</div>
                    <div className="text-[11px] text-slate-500">Extracts degrees, CTET & teaching skills</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>AI Pedagogical Resume Analyzer</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Build a Resume That School Principals Can’t Overlook.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Standard resumes fail in academic hiring because schools look for specific pedagogical keywords, board experience, and government certifications. TEACHMENT analyzes your CV against our proprietary K-12 ontology.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pedagogical Competency Extraction</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Highlights skills like NEP 2020, Smart Board, Classroom Management, and Experiential Learning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Government Certification Verification</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prominently showcases CTET (Paper 1 & 2), State TET, B.Ed, M.Ed, and NET credentials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Automated Job Match Compatibility Score</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      See your calculated fit score (e.g. 96%) before submitting, allowing you to tailor qualifications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  onClick={() =>
                    onOpenAuthModal({
                      isLogin: false,
                      role: 'teacher',
                      promptMessage: 'Register to upload your resume and receive an instant AI compatibility score!'
                    })
                  }
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload & Score Your Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      'Teacher Resume Tip:\n1. Clearly state your B.Ed/CTET credentials at the top.\n2. Mention specific grades taught (e.g. Class 9-10 CBSE Board).\n3. List digital tools used (e.g. Smart Boards, Google Classroom, PhET Sims).'
                    )
                  }
                  className="px-4 py-3.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                >
                  View Top 5 Resume Tips →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SEARCH FOR JOBS & FEATURED OPENINGS */}
      <section id="featured-jobs" className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Featured Teaching Vacancies</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Active Positions
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Direct recruitments currently open with verified principal contacts.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToJobs}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition group cursor-pointer"
            >
              <span>Browse Job Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
            </button>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveJobs.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-3 shadow-xs">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Open Vacancies Currently</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  All previous dummy vacancies have been wiped. When verified partner schools post new teaching positions, they will appear here in real time.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToSchools}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Browse Partner Schools
                  </button>
                </div>
              </div>
            ) : (
              liveJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 transition duration-300 flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top row: School & badges */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.logo_path || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=120&q=80'}
                          alt={job.school_name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {job.title}
                          </h4>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {job.school_name} • <span className="font-semibold text-indigo-600">{job.subject}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {job.post_level}
                      </span>
                    </div>

                    {/* Meta details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{[job.city, job.state].filter(Boolean).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Exp: {job.experience_required} Yrs</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>₹{Number(job.min_salary).toLocaleString('en-IN')} - ₹{Number(job.max_salary).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Direct Recruitment</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyClick(job)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Apply Direct</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onNavigateToJobs}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <span>Browse All Open Roles in Job Search Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. WHY TEACHMENT (VALUE PROPOSITION) */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Schools & Teachers Choose TEACHMENT
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Say goodbye to unverified middlemen, hidden agency cuts, and non-responsive job boards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 hover:border-indigo-200 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Direct Principal Pipeline</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No recruitment agency gatekeepers. Verified schools receive direct access to candidate phone numbers and portfolios for immediate interviews.
              </p>
            </div>

            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 hover:border-indigo-200 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">0% Commission Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Teachers keep 100% of their earnings. Schools avoid paying 1-month CTC agency cuts, preserving budget for school educational resources.
              </p>
            </div>

            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 hover:border-indigo-200 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pedagogical AI Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Smart compatibility matching designed for schools: matches by board syllabus, CTET certification level, and classroom teaching methodology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TOP VERIFIED PARTNER INSTITUTIONS */}
      <section id="for-schools" className="py-20 bg-[#f8fafc] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Verified School Directory</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Leading Partner Institutions
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Accredited schools actively hiring faculty through TEACHMENT.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToSchools}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerSchools.map((school, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition group flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 overflow-hidden relative">
                    <img
                      src={school.image}
                      alt={school.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs">
                      {school.board}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {school.name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{school.city}</span>
                    </div>
                    <div className="text-xs text-slate-600">{school.type}</div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToJobs}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs border border-slate-200 hover:border-indigo-200 transition text-center cursor-pointer"
                  >
                    View {school.vacancies} Open Roles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Voices of Educators & School Leaders
            </h2>
            <p className="text-slate-500 text-sm">
              Real feedback from teachers who got placed and principals who hired through TEACHMENT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "Within 3 days of uploading my resume and having it analyzed by the AI, I was called directly by the principal of SD Public School. No commission cuts, transparent package!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Teacher"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Dr. Sneha Roy</div>
                  <div className="text-[11px] text-slate-500">PGT Mathematics Faculty</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "As an academic director, finding certified CBSE physics teachers was a nightmare through consultants. With TEACHMENT, I reviewed matched resumes and closed the vacancy in 48 hours."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Principal"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Principal</div>
                  <div className="text-[11px] text-slate-500">SD Public School, Babhanauli Kushinagar</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "The AI resume scoring helped me realize that my smart board and experiential learning certifications made my profile stand out. Landed my dream position as TGT Science!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
                  alt="Teacher"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Pooja Verma</div>
                  <div className="text-[11px] text-slate-500">TGT Science & STEM Educator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section id="faq" className="py-20 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-indigo-600 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL CONVERSION CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to Step Into Your Next Classroom or Hire Your Star Faculty?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal">
            Join thousands of passionate educators and hundreds of accredited schools recruiting directly through TEACHMENT today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() =>
                onOpenAuthModal({
                  isLogin: false,
                  role: 'teacher',
                  promptMessage: 'Register as Job Seeker to explore and apply directly!'
                })
              }
              className="px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Register as Job Seeker</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenAuthModal({
                  isLogin: false,
                  role: 'school',
                  promptMessage: 'Register your Institution to post positions and recruit top faculty!'
                })
              }
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Register as Employer</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
