// src/components/layout/Header.tsx
import React, { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { Folder } from 'lucide-react';
import apiService from '../../services/api';

interface HeaderProps {
  user?: User | null;
  refreshKey?: number; // Optional prop to trigger refresh
}

interface ProjectLimits {
  currentCount: number;
  maxAllowed: number | null;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ user, refreshKey }) => {
  const [projectLimits, setProjectLimits] = useState<ProjectLimits | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjectLimits();
    }
  }, [user, refreshKey]); // Re-fetch when refreshKey changes

  const fetchProjectLimits = async () => {
    try {
      setLoadingLimits(true);
      const response = await apiService.getProjectLimits();
      if (response.success) {
        setProjectLimits(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch project limits:', error);
    } finally {
      setLoadingLimits(false);
    }
  };
  // const handleLogout = async (): Promise<void> => {
  //   try {
  //     await signOut(auth);
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //   }
  // };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-12 lg:px-12">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Search */}
          <div className="flex items-center flex-1 max-w-lg">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search projects, files, reports..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {/* Right side - User info */}
          <div className="flex items-center space-x-4">
            {/* Project Limits Display */}
            {user && projectLimits && (
              <div 
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-default group relative"
                title={
                  projectLimits.maxAllowed !== null
                    ? `You have used ${projectLimits.currentCount} out of ${projectLimits.maxAllowed} projects`
                    : `Unlimited projects (${projectLimits.role})`
                }
              >
                <Folder className="h-4 w-4 text-indigo-600" />
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold text-indigo-900">
                    {projectLimits.currentCount}
                  </span>
                  {projectLimits.maxAllowed !== null ? (
                    <>
                      <span className="text-sm text-indigo-600">/</span>
                      <span className="text-sm font-medium text-indigo-700">
                        {projectLimits.maxAllowed}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-indigo-600 ml-1">∞</span>
                  )}
                  <span className="text-xs text-indigo-600 ml-1">projects</span>
                </div>
                
                {/* Progress bar for limited users */}
                {projectLimits.maxAllowed !== null && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-200 rounded-b-lg overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${(projectLimits.currentCount / projectLimits.maxAllowed) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Loading state for project limits */}
            {user && loadingLimits && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* User Avatar and Info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </div>
                    {/* <div className="text-xs text-gray-500">
                      {user.email}
                    </div> */}
                  </div>
                  <div className="relative">
                    <img
                      className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover"
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=6366f1&color=fff`}
                      alt={user.displayName || user.email || 'User'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="h-10 w-10 rounded-full border-2 border-gray-200 bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium hidden"
                      style={{ display: 'none' }}
                    >
                      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;