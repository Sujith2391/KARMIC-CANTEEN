import React from 'react';
import { User, UserRole } from '../types';
import Logo from './Logo';
import { StatsIcon, MenuIcon, FeedbackIcon, UsersIcon, BellIcon } from './icons';

interface SidebarProps {
  user: User;
  adminView: string;
  onAdminNavigate: (view: string) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
      isActive
        ? 'bg-primary text-onPrimary shadow-lg'
        : 'text-slate-200 hover:bg-slate-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  user,
  adminView,
  onAdminNavigate,
}) => {
  return (
    <aside className="w-64 bg-slate-800 text-white flex-col p-4 space-y-6 flex-shrink-0 hidden md:flex">
      <div className="px-2">
        <Logo textColorClassName="text-white" />
      </div>

      <nav className="flex-1 space-y-2">
        {user.role === UserRole.ADMIN && (
          <>
            <NavItem 
              icon={<StatsIcon className="w-5 h-5" />} 
              label="Live Stats" 
              isActive={adminView === 'stats'}
              onClick={() => onAdminNavigate('stats')}
            />
            <NavItem 
              icon={<MenuIcon className="w-5 h-5" />} 
              label="Menu Management" 
              isActive={adminView === 'menu'}
              onClick={() => onAdminNavigate('menu')}
            />
            <NavItem 
              icon={<FeedbackIcon className="w-5 h-5" />} 
              label="Feedback" 
              isActive={adminView === 'feedback'}
              onClick={() => onAdminNavigate('feedback')}
            />
             <NavItem 
              icon={<BellIcon className="w-5 h-5" />} 
              label="Notifications" 
              isActive={adminView === 'notifications'}
              onClick={() => onAdminNavigate('notifications')}
            />
          </>
        )}

        {user.role === UserRole.MAIN_ADMIN && (
          <NavItem 
            icon={<UsersIcon className="w-5 h-5" />} 
            label="User Management" 
            isActive={true} // Only one option for main admin
            onClick={() => {}} // No-op, it's the only view
          />
        )}
        
        {user.role === UserRole.EMPLOYEE && (
            <div className="px-4 py-2 text-sm text-slate-400">
                <p className="font-semibold">Welcome, {user.name.split(' ')[0]}!</p>
                <p className="mt-2 text-xs">Plan your meals for the week and help us reduce food waste.</p>
            </div>
        )}
      </nav>
      
      <div className="mt-auto">
        {/* Future content can go here */}
      </div>
    </aside>
  );
};

export default Sidebar;