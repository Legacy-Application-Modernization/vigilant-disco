// src/components/layout/Header.tsx
import React, { useEffect, useState, useRef } from 'react';
import { type User } from 'firebase/auth';
import { Folder, Bell, CheckCircle, X } from 'lucide-react';
import apiService from '../../services/api';
import { usePhaseNotifications } from '../../contexts/PhaseNotificationContext';

interface HeaderProps {
  user?: User | null;
  refreshKey?: number; // Optional prop to trigger refresh
  onSearch?: (query: string) => void; // Callback for search
}

interface ProjectLimits {
  currentCount: number;
  maxAllowed: number | null;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ user, refreshKey, onSearch }) => {
  const { notifications, removeNotification, clearAllNotifications } = usePhaseNotifications();
  const [projectLimits, setProjectLimits] = useState<ProjectLimits | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjectLimits();
    }
  }, [user, refreshKey]); // Re-fetch when refreshKey changes

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      }
      // Clear search input after search
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
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
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full transition-colors"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Recent activity updates</p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">Updates will appear here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => {
                          return (
                            <div 
                              key={notification.id}
                              onClick={() => removeNotification(notification.id)}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group relative"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    Phase {notification.phase_number}: {notification.phase_name}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5 truncate">
                                    {notification.repository}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Completed
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(notification.timestamp).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                >
                                  <X className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar and Info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center space-x-2 justify-end">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </div>
                      {/* Role Badge */}
                      {projectLimits && (
                        <span 
                          className={`
                            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${projectLimits.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : projectLimits.role === 'manager'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }
                          `}
                          title={`Role: ${projectLimits.role}`}
                        >
                          {projectLimits.role === 'admin' && '👑'}
                          {projectLimits.role === 'manager' && '📊'}
                          {projectLimits.role === 'user' && '👤'}
                          <span className="ml-1 capitalize">{projectLimits.role}</span>
                        </span>
                      )}
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
                    {/* Role indicator badge on avatar for admins/managers */}
                    {projectLimits && projectLimits.role !== 'user' && (
                      <div 
                        className={`
                          absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs border-2 border-white
                          ${projectLimits.role === 'admin' 
                            ? 'bg-purple-500' 
                            : 'bg-blue-500'
                          }
                        `}
                        title={`${projectLimits.role.charAt(0).toUpperCase() + projectLimits.role.slice(1)} Role`}
                      >
                        {projectLimits.role === 'admin' ? '👑' : '📊'}
                      </div>
                    )}
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