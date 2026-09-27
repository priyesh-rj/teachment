import React from 'react';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Identity & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Teach<span className="text-indigo-600">ment</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-Powered Direct Teacher–School Recruitment Platform. Connect certified educators directly with schools, eliminating recruiter commissions completely.
            </p>
            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Call us</div>
              <div className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                <Phone className="w-4 h-4 text-indigo-600" />
                <span>+91 6393373865</span>
              </div>
            </div>
          </div>

          {/* Column 1: For Job Seekers */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-indigo-600 transition">
                  Browse Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('teacher-dashboard')} className="hover:text-indigo-600 transition">
                  Candidate Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('teacher-dashboard')} className="hover:text-indigo-600 transition">
                  Candidate Profile
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('teacher-dashboard')} className="hover:text-indigo-600 transition">
                  Saved Jobs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: About Us */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              About Us
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#about" className="hover:text-indigo-600 transition">About Us</a>
              </li>
              <li>
                <a href="#invoices" className="hover:text-indigo-600 transition">Job Page Invoice</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-indigo-600 transition">Terms of Service</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-indigo-600 transition">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Helpful Resources */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Helpful Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
              </li>
              <li>
                <a href="#sitemap" className="hover:text-indigo-600 transition">Site Map</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-indigo-600 transition">Terms of Use</a>
              </li>
              <li>
                <a href="#direct-hiring" className="hover:text-indigo-600 transition">Direct Hiring Guarantee</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>
            © 2026 TEACHMENT Recruitment Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Localhost Build: React + Node.js Express + Python FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
