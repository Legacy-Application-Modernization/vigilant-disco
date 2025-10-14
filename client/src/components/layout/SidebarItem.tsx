
import type { FC, ReactNode } from 'react';
interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: FC<SidebarItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <button
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
        active 
          ? 'bg-indigo-900 text-white' 
          : 'text-indigo-200 hover:bg-indigo-700'
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {text}
    </button>
  );
};

export default SidebarItem;