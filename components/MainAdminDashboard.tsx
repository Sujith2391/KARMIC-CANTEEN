import React from 'react';
import { User } from '../types';
import UserManagement from './main-admin/UserManagement';
import WorkforceDistribution from './main-admin/WorkforceDistribution';
import ConfirmationStats from './admin/ConfirmationStats';
import FeedbackViewer from './admin/FeedbackViewer';
import NotificationManager from './main-admin/NotificationManager';

interface MainAdminDashboardProps {
  user: User;
  activeView: string;
}

const MainAdminDashboard: React.FC<MainAdminDashboardProps> = ({ user, activeView }) => {
    const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <WorkforceDistribution />
            <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
                <ConfirmationStats />
            </div>
          </div>
        );
      case 'users':
        return (
            <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
                <UserManagement />
            </div>
        );
      case 'feedback':
        return (
            <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
                <FeedbackViewer />
            </div>
        );
      case 'notifications':
        return (
            <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
                <NotificationManager />
            </div>
        );
      default:
        return (
            <div className="space-y-6">
                <WorkforceDistribution />
                <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
                    <ConfirmationStats />
                </div>
            </div>
        );
    }
  };
  
  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-onSurface">HR Admin Dashboard</h2>
        <p className="text-slate-500">Welcome, {user.name}. Full administrative control panel.</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default MainAdminDashboard;