import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Search, GraduationCap, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function SchoolsDirectory({ onNavigateToJobs, onOpenAuthModal }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.getSchools();
      setSchools(res.schools || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.school_name || '').toLowerCase().includes(term) ||
      (s.city || '').toLowerCase().includes(term) ||
      (s.district || '').toLowerCase().includes(term) ||
      (s.state || '').toLowerCase().includes(term) ||
      (s.board || '').toLowerCase().includes(term)
    );
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Verified Educational Institutions</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Partner School Directory
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Direct recruitment pipelines with verified K-12 schools & educational institutes.
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by school name, city, board..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-medium text-slate-500">Loading partner schools...</span>
          </div>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Schools Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'No schools matched your search criteria.' : 'No registered partner schools found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchools.map((school) => {
            const count = Number(school.vacancy_count) || 0;
            return (
              <div
                key={school.id || school.school_name}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        school.logo_path ||
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={school.school_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {school.school_name}
                      </h3>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {school.board || 'CBSE'} Board
                        </span>
                        {school.principal_name && (
                          <span className="truncate">• Principal: {school.principal_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {school.about_text ||
                      'A progressive educational institution dedicated to high pedagogical standards, holistic student growth, and innovative learning.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {[school.city, school.district, school.state].filter(Boolean).join(', ') || 'Uttar Pradesh'}
                    </span>
                  </span>

                  {count > 0 ? (
                    <button
                      onClick={() => onNavigateToJobs && onNavigateToJobs()}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View {count} {count === 1 ? 'Vacancy' : 'Vacancies'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">0 Open Vacancies</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
