import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMap, FiCheckCircle, FiCopy, FiInfo, FiAlertTriangle, FiCheck, FiLink } from 'react-icons/fi';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    activePartners: 0,
    propertiesManaged: 0,
    availableProperties: 0,
    loading: true
  });
  
  const [properties, setProperties] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [usersRes, propertiesRes] = await Promise.all([
            axios.get('http://localhost:5000/api/users', { withCredentials: true }),
            axios.get('http://localhost:5000/api/properties')
          ]);
          
          const usersList = usersRes.data.data || [];
          const propsList = propertiesRes.data.data || [];
          
          setStats({
            pendingApprovals: usersList.filter(u => u.status === 'pending' && u.role === 'realtor').length,
            activePartners: usersList.filter(u => u.status === 'approved' && u.role === 'realtor').length,
            propertiesManaged: propsList.length,
            availableProperties: propsList.length,
            loading: false
          });
        } else {
          // Fetch data for Partner Dashboard
          const [propertiesRes, noticesRes] = await Promise.all([
            axios.get('http://localhost:5000/api/properties'),
            axios.get('http://localhost:5000/api/notices', { withCredentials: true })
          ]);
          
          const propsList = propertiesRes.data.data || [];
          setProperties(propsList.filter(p => p.status !== 'Sold Out'));
          setNotices(noticesRes.data.data || []);
          
          if (propsList.length > 0) {
             const firstProp = propsList[0];
             const slug = firstProp.propertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
             setSelectedProperty(slug);
          }

          setStats(prev => ({
            ...prev,
            availableProperties: propsList.filter(p => p.status !== 'Sold Out').length,
            loading: false
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchData();
    
    // Set up real-time polling every 10 seconds for notices/stats
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `https://gwealthrepublic.com/properties/${selectedProperty}?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getNoticeIcon = (type) => {
    switch (type) {
      case 'urgent': return <FiAlertTriangle className="text-red-500" />;
      case 'success': return <FiCheckCircle className="text-green-500" />;
      default: return <FiInfo className="text-primary" />;
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
      
      {/* 1. Verified Partner Banner (Partners Only) */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center border-2 border-brand-gold">
              <FiCheckCircle size={32} className="text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-headline-lg flex items-center gap-2">
                Verified Partner <span className="text-brand-gold font-light">of GWealth</span>
              </h1>
              <p className="text-slate-300 font-body-md mt-1">Welcome back, {user?.fullName}</p>
            </div>
          </div>
          
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Your Unique Code</p>
              <p className="text-xl font-mono font-bold text-brand-gold">{user?.referralCode}</p>
            </div>
            <button 
              onClick={handleCopyCode}
              className="bg-brand-gold text-slate-900 p-3 rounded-md hover:bg-yellow-400 transition-colors flex items-center gap-2 font-bold text-sm"
            >
              {copiedCode ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
            </button>
          </div>
        </div>
      )}

      {/* Admin Welcome */}
      {isAdmin && (
        <div className="mb-8">
          <h1 className="text-3xl font-headline-lg font-bold text-primary mb-2">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-on-surface-variant font-body-lg">Here is an overview of the GWealth Nation platform today.</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isAdmin ? (
          <>
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
              <div className="bg-slate-100 text-primary p-4 rounded-full"><FiUsers size={28} /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Approvals</p>
                <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{stats.loading ? '...' : stats.pendingApprovals}</h2>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
              <div className="bg-green-50 text-green-600 p-4 rounded-full"><FiCheckCircle size={28} /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Partners</p>
                <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{stats.loading ? '...' : stats.activePartners}</h2>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-full"><FiMap size={28} /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Properties Managed</p>
                <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{stats.loading ? '...' : stats.propertiesManaged}</h2>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-full"><FiMap size={28} /></div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Available Properties</p>
              <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{stats.loading ? '...' : stats.availableProperties}</h2>
            </div>
          </div>
        )}
      </div>

      {/* Partner Specific Layout (Split View) */}
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Smart Link Generator */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FiLink className="text-primary" /> Smart Link Generator
              </h2>
              <p className="text-sm text-slate-500 mt-1">Generate a tracking link to share with prospects.</p>
            </div>
            <div className="p-6 flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Select Property</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary outline-none text-slate-800 bg-white"
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                >
                  {properties.map(p => {
                    const slug = p.propertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    return (
                      <option key={p._id} value={slug}>{p.propertyName}</option>
                    );
                  })}
                </select>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 break-all font-mono text-sm text-slate-700">
                https://gwealthrepublic.com/properties/{selectedProperty}?ref={user?.referralCode}
              </div>
              
              <button 
                onClick={handleCopyLink}
                className="w-full py-3 bg-primary text-white rounded-md font-bold hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? <><FiCheck /> Link Copied!</> : <><FiCopy /> Copy Smart Link</>}
              </button>
            </div>
          </div>

          {/* Admin Noticeboard */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[450px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Admin Broadcasts</h2>
                <p className="text-sm text-slate-500 mt-1">Updates and announcements from GWealth.</p>
              </div>
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                {notices.length} New
              </span>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {notices.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  <FiInfo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent broadcasts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notices.map(notice => (
                    <div key={notice._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getNoticeIcon(notice.type)}</div>
                        <div>
                          <h3 className="font-bold text-slate-800">{notice.title}</h3>
                          <p className="text-xs text-slate-400 mb-2">{new Date(notice.createdAt).toLocaleString()}</p>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{notice.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Admin Recent Activity */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm mt-8">
          <h3 className="text-xl font-headline-md font-bold text-primary mb-4 border-b border-slate-100 pb-4">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 opacity-50" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
            <p className="text-slate-400 font-body-md italic text-center max-w-md">No recent system activity to display. New property uploads and partner registrations will appear here.</p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;
