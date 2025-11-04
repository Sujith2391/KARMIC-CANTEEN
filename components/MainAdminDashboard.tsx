import React from 'react';
import { User } from '../types';
import UserManagement from './main-admin/UserManagement';
import WorkforceDistribution from './main-admin/WorkforceDistribution';

interface MainAdminDashboardProps {
  user: User;
}

const MainAdminDashboard: React.FC<MainAdminDashboardProps> = ({ user }) => {
  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-onSurface">Main Admin Dashboard</h2>
        <p className="text-slate-500">Welcome, {user.name}. Manage users and view daily stats from this panel.</p>
      </div>
      
      <WorkforceDistribution />

      <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
        <UserManagement />
      </div>
    </div>
  );
};

export default MainAdminDashboard;