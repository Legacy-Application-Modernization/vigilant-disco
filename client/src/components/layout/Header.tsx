import type { FC } from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Header: FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left section - Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search projects, files, reports..."
          />
        </div>
      </div>
      
      {/* Right section - Icons */}
      <div className="flex items-center">
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-3 relative">
          <button 
            className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="User menu"
          >
            <img
              className="h-8 w-8 rounded-full"
              src="https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=fff"
              alt="User"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;