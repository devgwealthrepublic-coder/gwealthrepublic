import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiMap, FiUsers, FiLogOut, FiFileText, FiCheckSquare, FiPlusSquare, FiDollarSign, FiCalendar, FiFolder, FiMail, FiMonitor, FiUser, FiRadio } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const navGroups = [
    {
      title: null,
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <FiHome />, roles: ['admin', 'realtor'] },
        { name: 'Properties', path: '/properties', icon: <FiMap />, roles: ['admin'] },
        { name: 'Broadcast Studio', path: '/broadcasts', icon: <FiRadio />, roles: ['admin'] },
        { name: 'Partner Network', path: '/partners', icon: <FiUsers />, roles: ['admin'] },
        { name: 'My Profile', path: '/profile', icon: <FiUser />, roles: ['realtor'] },
        { name: 'My Network', path: '/network', icon: <FiUsers />, roles: ['realtor'] },
        { name: 'My Prospects', path: '/prospects', icon: <FiUsers />, roles: ['realtor'] },
        { name: 'Media Hub', path: '/media', icon: <FiFileText />, roles: ['realtor'] },
        { name: 'Promotions & Ads', path: '/promos', icon: <FiFolder />, roles: ['admin'] },
      ]
    },
    {
      title: 'Leads & Assets',
      roles: ['admin', 'realtor'],
      items: [
        { name: 'Inspection Excursions', path: '/excursions', icon: <FiCalendar />, roles: ['admin'] },
        { name: 'Marketing Asset Vault', path: '/assets-vault', icon: <FiFolder />, roles: ['admin', 'realtor'] },
        { name: 'Messages', path: '/messages', icon: <FiMail />, roles: ['admin'] },
        { name: 'Subscribers', path: '/subscribers', icon: <FiUsers />, roles: ['admin'] },
        { name: 'Live Visitor Desk', path: '/visitors', icon: <FiMonitor />, roles: ['admin'] },
      ]
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-trust-slate flex flex-col pt-8 pb-4 z-10 shadow-sm overflow-y-auto">
      <div className="mb-10 text-center px-4 flex flex-col items-center">
        <img src="/gwealth-logo3.0.png" alt="GWealth Nation Logo" className="h-14 w-auto object-contain mb-2" />
        <span className="text-sm text-outline font-label-md block">{isAdmin ? 'Admin Portal' : 'Partner Portal'}</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-4 pb-8">
        {navGroups.map((group, groupIdx) => {
          // If group has role restrictions, check them
          if (group.roles && !group.roles.includes(user?.role)) return null;

          const visibleItems = group.items.filter(item => item.roles.includes(user?.role));
          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={groupIdx}>
              {group.title && (
                <div className="text-xs font-bold text-outline uppercase tracking-wider mt-6 mb-2 px-4">
                  {group.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-label-md ${
                      isActive 
                        ? 'bg-primary-container text-white shadow-md' 
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 px-4 border-t border-trust-slate flex flex-col gap-4">
        <div className="flex flex-col">
          <p className="font-bold text-on-surface font-body-md truncate">{user?.fullName}</p>
          <p className="text-xs text-outline truncate">{user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-surface border border-trust-slate text-on-surface-variant rounded-md hover:bg-error-container hover:text-error hover:border-error transition-colors text-sm font-bold" 
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
};

export const PortalLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-primary font-body-md bg-surface">Loading...</div>;
  }

  // Protect routes - must be logged in and approved
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status !== 'approved' && user.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-center bg-surface">
        <div className="bg-white border border-trust-slate p-8 rounded-md shadow-lg max-w-lg w-full">
          <h2 className="text-primary font-headline-md text-2xl mb-4 font-bold">Account Pending</h2>
          <p className="text-on-surface-variant font-body-md mb-8">
            Your partner account is currently pending admin verification. 
            You will receive an email once your account has been approved.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('gwealth_user');
              window.location.href = '/login';
            }} 
            className="w-full bg-primary text-white py-3 rounded-md font-bold text-body-lg hover:bg-primary-container transition-colors shadow-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
