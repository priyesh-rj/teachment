import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import JobSearch from './pages/JobSearch';
import TeachersDirectory from './pages/TeachersDirectory';
import AuthModal from './components/AuthModal';
import { Building2, MapPin, Sparkles, CheckCircle2, GraduationCap, ArrowRight } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  // Default to HomePage for visitors
  const [activePage, setActivePage] = useState('home');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // Rich Auth Modal Configuration
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    initialIsLogin: true,
    initialRole: 'teacher',
    promptMessage: ''
  });

  const openAuthModal = ({ isLogin = true, role = 'teacher', promptMessage = '' } = {}) => {
    setAuthModalConfig({
      isOpen: true,
      initialIsLogin: isLogin,
      initialRole: role,
      promptMessage
    });
  };

  const closeAuthModal = () => {
    setAuthModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Protected route access control
  const navigateToPage = (page) => {
    if (page === 'teacher-dashboard') {
      if (!user || user.role !== 'teacher') {
        openAuthModal({
          isLogin: true,
          role: 'teacher',
          promptMessage: 'Please sign in or register as a Job Seeker (Teacher) to access the Teacher Portal.'
        });
        return;
      }
    }

    if (page === 'school-dashboard') {
      if (!user || user.role !== 'school') {
        openAuthModal({
          isLogin: true,
          role: 'school',
          promptMessage: 'Please sign in or register as an Employer (School) to access the School Dashboard.'
        });
        return;
      }
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When user state changes (login/logout)
  useEffect(() => {
    if (user) {
      if (user.role === 'school') {
        setActivePage('school-dashboard');
      } else if (user.role === 'teacher') {
        setActivePage('teacher-dashboard');
      }
    } else {
      // If logged out from dashboard, return to home
      setActivePage((prev) =>
        prev === 'teacher-dashboard' || prev === 'school-dashboard' ? 'home' : prev
      );
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto animate-bounce shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="text-sm font-semibold text-slate-600">Initializing TEACHMENT...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={navigateToPage}
        openPostModal={() => {
          if (!user) {
            openAuthModal({
              isLogin: false,
              role: 'school',
              promptMessage: 'Please register your Institution or sign in to post teaching vacancies.'
            });
            return;
          }
          setIsPostModalOpen(true);
        }}
        onOpenAuthModal={openAuthModal}
      />

      {/* Main Page Routing */}
      <div className="flex-1">
        {activePage === 'home' && (
          <HomePage
            onOpenAuthModal={openAuthModal}
            onNavigateToJobs={() => navigateToPage('jobs')}
            onNavigateToSchools={() => navigateToPage('schools')}
            onSelectSearchKeyword={(kw) => setSearchKeyword(kw)}
          />
        )}

        {activePage === 'teacher-dashboard' && (
          user && user.role === 'teacher' ? (
            <TeacherDashboard onNavigateToJobs={() => navigateToPage('jobs')} />
          ) : (
            <HomePage
              onOpenAuthModal={openAuthModal}
              onNavigateToJobs={() => navigateToPage('jobs')}
              onNavigateToSchools={() => navigateToPage('schools')}
              onSelectSearchKeyword={(kw) => setSearchKeyword(kw)}
            />
          )
        )}

        {activePage === 'school-dashboard' && (
          user && user.role === 'school' ? (
            <SchoolDashboard
              isPostModalOpen={isPostModalOpen}
              setIsPostModalOpen={setIsPostModalOpen}
            />
          ) : (
            <HomePage
              onOpenAuthModal={openAuthModal}
              onNavigateToJobs={() => navigateToPage('jobs')}
              onNavigateToSchools={() => navigateToPage('schools')}
              onSelectSearchKeyword={(kw) => setSearchKeyword(kw)}
            />
          )
        )}

        {activePage === 'jobs' && (
          <JobSearch
            onOpenAuthModal={openAuthModal}
            initialKeyword={searchKeyword}
          />
        )}

        {activePage === 'teachers' && (
          <TeachersDirectory
            onOpenAuthModal={openAuthModal}
          />
        )}

        {activePage === 'schools' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900">Partner School Directory</h2>
              <p className="text-sm text-slate-500 mt-2">
                Recruiting directly through TEACHMENT with unmasked contact pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School 1: Paradox */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80"
                    alt="Paradox"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Paradox International</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">CBSE Board</span>
                      <span>• Principal: Teachment Team</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A leading progressive K-12 institution committed to modern pedagogical methods, academic excellence, and holistic student development.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Mumbai, Maharashtra
                  </span>
                  <button
                    onClick={() => navigateToPage('jobs')}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    View 3 Vacancies →
                  </button>
                </div>
              </div>

              {/* School 2: Daffodils */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80"
                    alt="Daffodils"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Daffodils World School</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">CBSE Board</span>
                      <span>• Principal: Dr. Ananya Sen</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  State-of-the-art infrastructure fostering innovative learning, STEM robotics, and holistic sports culture.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Sikar, Rajasthan
                  </span>
                  <button
                    onClick={() => navigateToPage('jobs')}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    View 1 Vacancy →
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={navigateToPage} />

      {/* Auth Modal with presets */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        onClose={closeAuthModal}
        initialIsLogin={authModalConfig.initialIsLogin}
        initialRole={authModalConfig.initialRole}
        promptMessage={authModalConfig.promptMessage}
        onSuccessLogin={(role) => {
          closeAuthModal();
          const target = role === 'school' ? 'school-dashboard' : 'teacher-dashboard';
          setActivePage(target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

