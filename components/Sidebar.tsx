import React from 'react';
import { User, UserRole } from '../types';
import Logo from './Logo';
import { StatsIcon, MenuIcon, FeedbackIcon, UsersIcon, BellIcon, CloseIcon } from './icons';

interface SidebarProps {
  user: User;
  activeView: string;
  onAdminNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
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
  activeView,
  onAdminNavigate,
  isOpen,
  onClose,
}) => {
  return (
    <aside className={`w-64 bg-slate-800 text-white flex-col p-4 space-y-6 flex-shrink-0 flex fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex justify-between items-center">
        <div className="px-2">
            <Logo textColorClassName="text-white" />
        </div>
        <button onClick={onClose} className="md:hidden p-1 text-slate-300 hover:text-white rounded-full hover:bg-slate-700" aria-label="Close sidebar">
            <CloseIcon className="w-6 h-6"/>
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {user.role === UserRole.ADMIN && (
          <>
            <NavItem 
              icon={<StatsIcon className="w-5 h-5" />} 
              label="Live Stats" 
              isActive={activeView === 'stats'}
              onClick={() => onAdminNavigate('stats')}
            />
            <NavItem 
              icon={<MenuIcon className="w-5 h-5" />} 
              label="Menu Management" 
              isActive={activeView === 'menu'}
              onClick={() => onAdminNavigate('menu')}
            />
             <NavItem 
              icon={<BellIcon className="w-5 h-5" />} 
              label="Notifications" 
              isActive={activeView === 'notifications'}
              onClick={() => onAdminNavigate('notifications')}
            />
          </>
        )}

        {user.role === UserRole.MAIN_ADMIN && (
          <>
            <NavItem 
                icon={<StatsIcon className="w-5 h-5" />} 
                label="Dashboard" 
                isActive={activeView === 'dashboard'}
                onClick={() => onAdminNavigate('dashboard')}
            />
            <NavItem 
                icon={<UsersIcon className="w-5 h-5" />} 
                label="User Management" 
                isActive={activeView === 'users'}
                onClick={() => onAdminNavigate('users')}
            />
            <NavItem 
                icon={<FeedbackIcon className="w-5 h-5" />} 
                label="Feedback" 
                isActive={activeView === 'feedback'}
                onClick={() => onAdminNavigate('feedback')}
            />
            <NavItem 
                icon={<BellIcon className="w-5 h-5" />} 
                label="Notifications" 
                isActive={activeView === 'notifications'}
                onClick={() => onAdminNavigate('notifications')}
            />
          </>
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