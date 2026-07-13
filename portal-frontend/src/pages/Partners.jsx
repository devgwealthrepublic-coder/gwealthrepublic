import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Partners = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Pointing to the MERN backend API
      const { data } = await axios.get('/api/users');
      // Filter out admins so we only manage partners (realtors)
      setUsers(data.data.filter(u => u.role === 'realtor'));
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/status`, { status });
      fetchUsers(); // Refresh the list
    } catch (error) {
      alert('Failed to update partner status');
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-headline-lg font-bold text-primary mb-2">Partner Network</h1>
          <p className="text-on-surface-variant font-body-lg">Approve or reject pending partner applications.</p>
        </div>
        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-trust-slate rounded-md text-primary font-label-md hover:bg-surface-container transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh List
        </button>
      </div>

      <div className="bg-white border border-trust-slate rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container border-b border-trust-slate">
              <tr>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Name</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Contact Info</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Location</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Status</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trust-slate bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-outline">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-body-md">Loading partner network...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-outline font-body-md italic">
                    <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">group_off</span>
                    No partners found in the network.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-surface transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface font-body-md">{u.fullName}</div>
                      <div className="text-xs text-outline mt-1 font-mono">ID: {u._id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-body-md text-on-surface mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">mail</span>
                        {u.email}
                      </div>
                      <div className="text-sm text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">call</span>
                        {u.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-on-surface bg-surface border border-trust-slate px-2 py-1 rounded-md">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {u.officeLocation || 'Online'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${u.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' : 
                          u.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' : 
                          'bg-yellow-100 text-yellow-800 border border-yellow-200'}
                      `}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.status === 'pending' ? (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleUpdateStatus(u._id, 'approved')} 
                            className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
                            title="Approve Partner"
                          >
                            <FiCheck /> Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(u._id, 'rejected')} 
                            className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
                            title="Reject Partner"
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-outline italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Partners;
