import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import MainAdminDashboard from './components/MainAdminDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RegistrationScreen from './components/RegistrationScreen';
import NotificationViewer from './components/NotificationViewer';
import UserList from './components/UserList';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminView, setAdminView] = useState('stats');
  const [view, setView] = useState<'login' | 'register' | 'app'>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('karmic-canteen-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setView('app');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('karmic-canteen-user', JSON.stringify(user));
    setView('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAdminView('stats');
    localStorage.removeItem('karmic-canteen-user');
    setView('login');
  };

  const handleAdminNavigate = (view: string) => {
    setAdminView(view);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };

  const renderContent = () => {
    if (view !== 'app' || !currentUser) {
      if (view === 'register') {
        return <RegistrationScreen onRegisterSuccess={handleLogin} onSwitchToLogin={() => setView('login')} />;
      }
      return <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
    }
    
    return (
      <>
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" aria-hidden="true" />}
        <NotificationViewer user={currentUser} />
        <div className="min-h-screen bg-background font-sans flex">
          <Sidebar 
              user={currentUser} 
              adminView={adminView} 
              onAdminNavigate={handleAdminNavigate}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header user={currentUser} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {(() => {
                    switch (currentUser.role) {
                      case UserRole.MAIN_ADMIN:
                        return <MainAdminDashboard user={currentUser} />;
                      case UserRole.ADMIN:
                        return <AdminDashboard user={currentUser} activeView={adminView} />;
                      case UserRole.EMPLOYEE:
                        return <EmployeeDashboard user={currentUser} />;
                      default:
                        handleLogout();
                        return null;
                    }
                })()
              }
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {renderContent()}
      <UserList />
    </>
  );
};

export default App;