import type { FC } from 'react';
import { Home, FileText, HelpCircle, Code } from 'lucide-react';
import SidebarItem from './SidebarItem';

type TabType = 'dashboard' | 'projects' | 'reports' | 'profile' | 'converter' | 'templates' | 'settings' | 'help';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-indigo-800 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-indigo-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Code className="text-indigo-800 w-5 h-5" />
          </div>
          <span className="text-xl font-semibold">LegacyModernize</span>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4">
          <div className="space-y-1">
            <SidebarItem 
              icon={<Home size={20} />} 
              text="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<FileText size={20} />} 
              text="Projects" 
              active={activeTab === 'projects'} 
              onClick={() => setActiveTab('projects')} 
            />
            {/* <SidebarItem 
              icon={<Activity size={20} />} 
              text="Reports" 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')} 
            /> */}
            {/* <SidebarItem 
              icon={<Database size={20} />} 
              text="Templates" 
              active={activeTab === 'templates'} 
              onClick={() => setActiveTab('templates')} 
            /> */}
            <SidebarItem 
              icon={<Code size={20} />} 
              text="Converter" 
              active={activeTab === 'converter'} 
              onClick={() => setActiveTab('converter')} 
            />
          </div>
            <SidebarItem 
                icon={<HelpCircle size={20} />} 
                text="Help & Support" 
                active={activeTab === 'help'} 
                onClick={() => setActiveTab('help')} 
              />
          
          {/* <div className="mt-8">
            <h6 className="text-xs font-medium text-indigo-300 uppercase tracking-wider px-3 mb-2">
              Account
            </h6>
            <div className="space-y-1">
              <SidebarItem 
                icon={<User size={20} />} 
                text="Profile" 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
              />
              <SidebarItem 
                icon={<Settings size={20} />} 
                text="Settings" 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')} 
              />
            
            </div>
          </div> */}
        </nav>
      </div>
      
      
    </div>
  );
};

export default Sidebar;