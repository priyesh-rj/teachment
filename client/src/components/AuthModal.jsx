import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, GraduationCap, Building2, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({
  isOpen,
  onClose,
  initialIsLogin = true,
  initialRole = 'teacher',
  promptMessage = '',
  onSuccessLogin
}) {
  const { login, register, switchDemoAccount } = useAuth();
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [role, setRole] = useState(initialRole); // teacher vs school
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialIsLogin);
      setRole(initialRole);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
    }
  }, [isOpen, initialIsLogin, initialRole]);

  if (!isOpen) return null;

  const handleDemoClick = async (type) => {
    setError('');
    setLoading(true);
    try {
      const logged = await switchDemoAccount(type);
      onClose();
      if (onSuccessLogin) {
        onSuccessLogin(logged?.role || (type === 'school' ? 'school' : 'teacher'));
      }
    } catch (err) {
      setError('Demo login failed: ' + (err.message || 'Server connection error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let loggedUser;
      if (isLogin) {
        loggedUser = await login(email, password);
      } else {
        loggedUser = await register({ name, email, password, phone, role });
      }
      onClose();
      if (onSuccessLogin) {
        onSuccessLogin(loggedUser?.role || role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl relative my-auto max-h-[92vh] flex flex-col border border-slate-100 overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Prompt alert message if intercepted from protected button */}
        {promptMessage && (
          <div className="mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Brand & Compact Header */}
        <div className="text-center mb-2.5 shrink-0">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white mb-1.5 shadow-xs">
            {role === 'school' ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <GraduationCap className="w-4 h-4" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isLogin
              ? 'Sign in to TEACHMENT'
              : role === 'school'
              ? 'Register as Employer (School)'
              : 'Register as Job Seeker (Teacher)'}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {isLogin
              ? 'Enter your credentials to access your dashboard'
              : role === 'school'
              ? 'Direct hiring with 0% recruitment commission'
              : 'Direct applications & AI pedagogical resume scoring'}
          </p>
        </div>

        {/* Compact 1-Click Fast Demo Logins */}
        <div className="mb-2.5 p-2 bg-indigo-50/80 rounded-xl border border-indigo-100 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>1-Click Demo Login</span>
            </span>
            <span className="text-[9px] text-indigo-600 font-semibold bg-white px-1.5 py-0.2 rounded border border-indigo-200">
              Pre-seeded
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoClick('teacher')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-800 shadow-2xs transition text-center flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Logging in...' : '👨‍🏫 Teacher Demo'}</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoClick('school')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-800 shadow-2xs transition text-center flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Logging in...' : '🏫 School Demo'}</span>
            </button>
          </div>
        </div>

        {/* Compact Tab Toggle: Sign In vs Register */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              isLogin ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              !isLogin ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {error && (
          <div className="mb-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg shrink-0">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {!isLogin && (
            <>
              {/* Compact Role Picker (Segmented row) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Account Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'teacher'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Job Seeker (Teacher)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('school')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'school'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Employer (School)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  {role === 'teacher' ? 'Full Name' : 'School Official Name'}
                </label>
                <div className="relative flex items-center">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={role === 'teacher' ? 'e.g. Dr. Priya Sharma' : 'e.g. St. Xavier School'}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Contact Mobile Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={role === 'school' ? 'admin@schoolname.edu' : 'teacher@example.com'}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-8 pr-2.5 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <span>
              {loading
                ? 'Authenticating...'
                : isLogin
                ? 'Sign In to Dashboard'
                : role === 'school'
                ? 'Create Employer Account'
                : 'Create Job Seeker Account'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Compact Bottom Switcher */}
        <div className="mt-2.5 text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 shrink-0">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setRole('teacher');
                }}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Register as Job Seeker
              </button>{' '}
              or{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setRole('school');
                }}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Employer
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

