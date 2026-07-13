import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiUserCheck, FiClock, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const NetworkTracker = () => {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await axios.get('/api/users/downline', { withCredentials: true });
        setNetwork(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load network data');
        setLoading(false);
      }
    };

    fetchNetwork();
  }, []);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate stats
  let totalRecruits = network.length;
  let activePartners = 0;
  let pendingPartners = 0;

  network.forEach(user => {
    if (user.status === 'approved') activePartners++;
    if (user.status === 'pending') pendingPartners++;
    totalRecruits += user.recruits.length;
    user.recruits.forEach(r => {
      if (r.status === 'approved') activePartners++;
      if (r.status === 'pending') pendingPartners++;
    });
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md">Pending</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Suspended</span>;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Network Data...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline-lg font-bold text-primary mb-2">My Network</h1>
        <p className="text-on-surface-variant font-body-lg">Track your downline marketers and their verification status.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-6 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-md"><FiUsers size={28} /></div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Network</p>
            <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{totalRecruits}</h2>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-6 flex items-center gap-4 shadow-sm">
          <div className="bg-green-50 text-green-600 p-4 rounded-md"><FiUserCheck size={28} /></div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Partners</p>
            <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{activePartners}</h2>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-6 flex items-center gap-4 shadow-sm">
          <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md"><FiClock size={28} /></div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Approvals</p>
            <h2 className="text-4xl font-headline-lg text-slate-800 font-bold">{pendingPartners}</h2>
          </div>
        </div>
      </div>

      {/* Network List */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Direct Recruits (Level 1)</h2>
        </div>
        
        {network.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-bold">You haven't recruited any partners yet.</p>
            <p className="text-sm mt-1">Share your Smart Link from the Dashboard to start building your network!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {network.map((user) => (
                  <React.Fragment key={user._id}>
                    {/* Level 1 Row */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center">
                        {user.recruits.length > 0 && (
                          <button 
                            onClick={() => toggleRow(user._id)}
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                          >
                            {expandedRows[user._id] ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{user.fullName}</div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">{user.referralCode}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700">{user.email}</div>
                        <div className="text-xs text-slate-500">{user.phone}</div>
                      </td>
                      <td className="p-4 text-slate-700">{user.officeLocation || 'N/A'}</td>
                      <td className="p-4">{getStatusBadge(user.status)}</td>
                      <td className="p-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                    
                    {/* Level 2 Rows (Nested) */}
                    {expandedRows[user._id] && user.recruits.length > 0 && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="6" className="p-0">
                          <div className="pl-12 py-3 pr-4 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Indirect Recruits (Level 2)</h4>
                            <table className="w-full text-left border-collapse bg-white border border-slate-200 rounded-md overflow-hidden">
                              <tbody className="text-sm">
                                {user.recruits.map(recruit => (
                                  <tr key={recruit._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="p-3 w-1/4">
                                      <div className="font-bold text-slate-800">{recruit.fullName}</div>
                                      <div className="text-xs text-slate-500 font-mono">{recruit.referralCode}</div>
                                    </td>
                                    <td className="p-3 w-1/4">
                                      <div className="text-slate-700">{recruit.email}</div>
                                      <div className="text-xs text-slate-500">{recruit.phone}</div>
                                    </td>
                                    <td className="p-3 w-1/6 text-slate-700">{recruit.officeLocation || 'N/A'}</td>
                                    <td className="p-3 w-1/6">{getStatusBadge(recruit.status)}</td>
                                    <td className="p-3 w-1/6 text-slate-500">{new Date(recruit.createdAt).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkTracker;
