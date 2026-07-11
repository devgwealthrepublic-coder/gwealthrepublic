import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMap, FiCheckCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    activePartners: 0,
    propertiesManaged: 0,
    availableProperties: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin) {
          const [usersRes, propertiesRes] = await Promise.all([
            axios.get('http://localhost:5000/api/users'),
            axios.get('http://localhost:5000/api/properties')
          ]);
          
          const users = usersRes.data.data || [];
          const properties = propertiesRes.data.data || [];
          
          setStats({
            pendingApprovals: users.filter(u => u.status === 'pending' && u.role === 'realtor').length,
            activePartners: users.filter(u => u.status === 'approved' && u.role === 'realtor').length,
            propertiesManaged: properties.length,
            availableProperties: properties.length,
            loading: false
          });
        } else {
          const propertiesRes = await axios.get('http://localhost:5000/api/properties');
          const properties = propertiesRes.data.data || [];
          setStats(prev => ({
            ...prev,
            availableProperties: properties.filter(p => p.status !== 'Sold Out').length,
            loading: false
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
    
    // Set up real-time polling every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-headline-lg font-bold text-primary mb-2">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
        <p className="text-on-surface-variant font-body-lg">Here is an overview of the GWealth Nation platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {isAdmin ? (
          <>
            <div className="bg-white border border-trust-slate rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-surface-container text-primary p-4 rounded-full flex items-center justify-center">
                <FiUsers size={28} />
              </div>
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-1">Pending Approvals</p>
                <h2 className="text-4xl font-headline-lg text-on-surface font-bold">
                  {stats.loading ? '...' : stats.pendingApprovals}
                </h2>
              </div>
            </div>

            <div className="bg-white border border-trust-slate rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-50 text-green-600 p-4 rounded-full flex items-center justify-center">
                <FiCheckCircle size={28} />
              </div>
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-1">Active Partners</p>
                <h2 className="text-4xl font-headline-lg text-on-surface font-bold">
                  {stats.loading ? '...' : stats.activePartners}
                </h2>
              </div>
            </div>
            
            <div className="bg-white border border-trust-slate rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-full flex items-center justify-center">
                <FiMap size={28} />
              </div>
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-1">Properties Managed</p>
                <h2 className="text-4xl font-headline-lg text-on-surface font-bold">
                  {stats.loading ? '...' : stats.propertiesManaged}
                </h2>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-trust-slate rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-full flex items-center justify-center">
              <FiMap size={28} />
            </div>
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-1">Available Properties</p>
              <h2 className="text-4xl font-headline-lg text-on-surface font-bold">
                {stats.loading ? '...' : stats.availableProperties}
              </h2>
            </div>
          </div>
        )}

      </div>

      <div className="bg-white border border-trust-slate rounded-lg p-8 shadow-sm">
        <h3 className="text-xl font-headline-md font-bold text-primary mb-4 border-b border-trust-slate pb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 opacity-50" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
          <p className="text-outline font-body-md italic text-center max-w-md">No recent system activity to display. New property uploads and partner registrations will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
