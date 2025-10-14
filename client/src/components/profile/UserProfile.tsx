import { useState } from 'react';
import type { FC } from 'react';
import ProfileSettings from './ProfileSettings';
import ApiKeys from './ApiKeys';
import Billing from './Billing';
import Notifications from './Notifications';
import { currentUser } from '../../data/userData';

type ProfileTab = 'profile' | 'api' | 'billing' | 'notifications';

const UserProfile: FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Edit Profile
        </button>
      </div>
      
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 left-6">
            <img 
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              <div className="flex items-center mt-1">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md mr-2">
                  {currentUser.role}
                </span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-md">
                  {currentUser.plan} Plan
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>Member since {currentUser.joinDate}</div>
              <div className="mt-1">{currentUser.company}</div>
              <div className="mt-1">{currentUser.location}</div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">{currentUser.bio}</p>
          </div>
          <div className="mt-6 flex">
            <div className="mr-10">
              <div className="text-2xl font-bold text-gray-900">{currentUser.projects}</div>
              <div className="text-sm text-gray-500">Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentUser.conversions}</div>
              <div className="text-sm text-gray-500">Conversions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Settings
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'api'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('api')}
            >
              API Keys
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'billing'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings user={currentUser} />}
          {activeTab === 'api' && <ApiKeys />}
          {activeTab === 'billing' && <Billing />}
          {activeTab === 'notifications' && <Notifications />}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;