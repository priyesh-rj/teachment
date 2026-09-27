import React, { useState } from 'react';
import {
  Briefcase,
  User,
  LogOut,
  GraduationCap,
  Building2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, openPostModal, onOpenAuthModal }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (target, hash = '') => {
    setActivePage(target);
    setIsMobileMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              <span>Teach</span>
              <span className="text-indigo-600">ment</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'resume-builder')}
            className="hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Resume Analyzer</span>
          </button>

          {user?.role === 'school' ? (
            <button
              type="button"
              onClick={() => handleNavClick('teachers')}
              className={`hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5 ${
                activePage === 'teachers' ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Teachers</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('jobs')}
                className={`hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5 ${
                  activePage === 'jobs' ? 'text-indigo-600 font-bold' : ''
                }`}
              >
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>Search Job</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('schools')}
                className={`hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5 ${
                  activePage === 'schools' ? 'text-indigo-600 font-bold' : ''
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>School Directory</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* If School */}
              {user.role === 'school' && (
                <button
                  type="button"
                  onClick={() => setActivePage('school-dashboard')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    activePage === 'school-dashboard'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>School Dashboard</span>
                </button>
              )}

              {/* If Teacher */}
              {user.role === 'teacher' && (
                <button
                  type="button"
                  onClick={() => setActivePage('teacher-dashboard')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    activePage === 'teacher-dashboard'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Teacher Profile</span>
                </button>
              )}

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Login / Register Button */
            <button
              type="button"
              onClick={() =>
                onOpenAuthModal({
                  isLogin: true,
                  promptMessage: 'Welcome! Sign in or register to access TEACHMENT.'
                })
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <button
              onClick={() => handleNavClick('home', 'resume-builder')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>AI Resume Analyzer</span>
            </button>

            {user?.role === 'school' ? (
              <button
                onClick={() => handleNavClick('teachers')}
                className={`text-left py-2 px-3 rounded-lg hover:bg-slate-50 flex items-center gap-2 ${
                  activePage === 'teachers' ? 'text-indigo-600 font-bold bg-indigo-50/60' : ''
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>Teachers</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('jobs')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Search Job</span>
                </button>
                <button
                  onClick={() => handleNavClick('schools')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>School Directory</span>
                </button>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setActivePage(user.role === 'school' ? 'school-dashboard' : 'teacher-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs text-center"
                >
                  My Dashboard ({user.role === 'school' ? 'School' : 'Teacher'})
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-slate-100 text-rose-600 rounded-xl font-bold text-xs text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuthModal({
                    isLogin: true,
                    promptMessage: 'Welcome! Sign in or register to access TEACHMENT.'
                  });
                }}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
