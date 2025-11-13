// src/components/layout/Sidebar.tsx
import React from 'react';
import { signOut, type User } from 'firebase/auth';
import { auth } from '../../firebase/config';

type TabType = 'dashboard' | 'projects' | 'reports' | 'profile' | 'converter' | 'templates' | 'settings' | 'help';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user?: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const handleLogout = async (): Promise<void> => {
    try {
      if (!auth) {
        console.warn('Auth not configured; cannot sign out');
        return;
      }

      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-indigo-800 w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
       <div className="flex items-center space-x-3">
  <div className="bg-white p-2 rounded-lg">
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      {/* Legacy box (old/dated look) */}
      <rect x="2" y="8" width="8" height="8" 
            stroke="#6B7280" strokeWidth="2" 
            fill="none" strokeDasharray="2,2"/>
      
      {/* Transformation arrow */}
      <path d="M11 12h6m0 0l-2-2m2 2l-2 2" 
            stroke="#4F46E5" strokeWidth="2" 
            strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Modern shape (sleek/modern look) */}
      <rect x="18" y="8" width="4" height="8" 
            fill="#4F46E5" rx="1"/>
      <rect x="14" y="10" width="3" height="4" 
            fill="#818CF8" rx="0.5"/>
    </svg>
  </div>
  <span className="text-xl font-bold text-white">LegacyModernize</span>
</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
              </svg>
              <span>Dashboard</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'projects'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Projects</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('converter')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'converter'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Converter</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => setActiveTab('help')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'help'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.196V6m0 12v3.804M2.196 12H6m12 0h3.804" />
              </svg>
              <span>Help & Support</span>
            </button>
          </li>

          {user && (
            <li className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-indigo-200 hover:bg-red-600 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign out</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;