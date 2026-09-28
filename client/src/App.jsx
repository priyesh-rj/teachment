import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import JobSearch from './pages/JobSearch';
import TeachersDirectory from './pages/TeachersDirectory';
import SchoolsDirectory from './pages/SchoolsDirectory';
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
          <SchoolsDirectory
            onNavigateToJobs={() => navigateToPage('jobs')}
            onOpenAuthModal={openAuthModal}
          />
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

