import {  useState } from 'react';
import type { FC } from 'react';

const Notifications: FC = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    conversionUpdates: true,
    projectCollaborations: true,
    accountUpdates: true,
    marketingPromotions: false
  });

  const [webNotifications, setWebNotifications] = useState({
    browserNotifications: true,
    inAppNotifications: true
  });

  const [weeklyDigest, setWeeklyDigest] = useState({
    enabled: true,
    day: 'Monday'
  });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
        <p className="text-sm text-gray-500">
          Manage how and when you receive notifications about your account and projects.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Conversion Updates</p>
                <p className="text-xs text-gray-500">Receive updates when your PHP code conversions are complete.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-conversion" 
                  checked={emailNotifications.conversionUpdates}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    conversionUpdates: !emailNotifications.conversionUpdates
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${emailNotifications.conversionUpdates ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Project Collaborations</p>
                <p className="text-xs text-gray-500">Receive notifications when you are added to a project or receive comments.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-project" 
                  checked={emailNotifications.projectCollaborations}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    projectCollaborations: !emailNotifications.projectCollaborations
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${emailNotifications.projectCollaborations ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Account Updates</p>
                <p className="text-xs text-gray-500">Receive important updates about your account, billing, and security.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-account" 
                  checked={emailNotifications.accountUpdates}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    accountUpdates: !emailNotifications.accountUpdates
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${emailNotifications.accountUpdates ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Marketing & Promotions</p>
                <p className="text-xs text-gray-500">Receive updates about new features, offers, and tips.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-marketing" 
                  checked={emailNotifications.marketingPromotions}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    marketingPromotions: !emailNotifications.marketingPromotions
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${emailNotifications.marketingPromotions ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Web Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Browser Notifications</p>
                <p className="text-xs text-gray-500">Receive desktop notifications when using the web app.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-browser" 
                  checked={webNotifications.browserNotifications}
                  onChange={() => setWebNotifications({
                    ...webNotifications,
                    browserNotifications: !webNotifications.browserNotifications
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${webNotifications.browserNotifications ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">In-App Notifications</p>
                <p className="text-xs text-gray-500">Receive notifications within the application interface.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-inapp" 
                  checked={webNotifications.inAppNotifications}
                  onChange={() => setWebNotifications({
                    ...webNotifications,
                    inAppNotifications: !webNotifications.inAppNotifications
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${webNotifications.inAppNotifications ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Weekly Digest</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Weekly Activity Summary</p>
                <p className="text-xs text-gray-500">Receive a weekly summary of your conversions and project activity.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle-digest" 
                  checked={weeklyDigest.enabled}
                  onChange={() => setWeeklyDigest({
                    ...weeklyDigest,
                    enabled: !weeklyDigest.enabled
                  })}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${weeklyDigest.enabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
            <div>
              <label htmlFor="digest-day" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Day for Weekly Digest
              </label>
              <select
                id="digest-day"
                value={weeklyDigest.day}
                onChange={(e) => setWeeklyDigest({
                  ...weeklyDigest,
                  day: e.target.value
                })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option>Monday</option>
                <option>Wednesday</option>
                <option>Friday</option>
                <option>Sunday</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;