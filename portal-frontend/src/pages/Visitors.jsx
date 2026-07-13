import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiClock } from 'react-icons/fi';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      // We already set axios defaults in context, but just to be sure we hit the right endpoint
      const { data } = await axios.get('/api/visitors', { withCredentials: true });
      setVisitors(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-error">Access Denied. Admins only.</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto font-body-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-primary font-headline-md text-3xl font-bold mb-2">Live Visitor Desk</h1>
          <p className="text-on-surface-variant">Real-time sync of all onboarding modal submissions from WordPress.</p>
        </div>
        <button 
          onClick={fetchVisitors} 
          className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-container transition-colors shadow-sm text-sm font-bold"
        >
          <FiClock /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-error-container text-error p-4 rounded-md mb-6 border border-error/20">
          {error}
        </div>
      )}

      <div className="bg-white rounded-md shadow-sm border border-trust-slate overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading visitor logs...</div>
        ) : visitors.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="mx-auto text-4xl text-trust-slate mb-3" />
            <p className="text-on-surface-variant font-medium">No visitors logged yet.</p>
            <p className="text-sm text-outline mt-1">Waiting for WordPress frontend traffic...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-trust-slate text-primary font-bold text-sm">
                  <th className="p-4">Visitor Identity</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Intent Vector</th>
                  <th className="p-4">Time Logged</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor._id} className="border-b border-trust-slate/50 hover:bg-surface/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-on-surface">{visitor.name}</div>
                      {visitor.device && <div className="text-xs text-outline mt-1 capitalize">{visitor.device}</div>}
                    </td>
                    <td className="p-4">
                      {visitor.email ? (
                        <a href={`mailto:${visitor.email}`} className="text-primary font-medium hover:underline">
                          {visitor.email}
                        </a>
                      ) : (
                        <span className="text-outline text-sm italic">Not Provided</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        visitor.intent === 'partner' 
                          ? 'bg-[#bb001b]/10 text-[#bb001b] border border-[#bb001b]/20' 
                          : 'bg-[#27267d]/10 text-[#27267d] border border-[#27267d]/20'
                      }`}>
                        {visitor.intent === 'partner' ? 'Partnership' : 'Land Buyer'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {formatDate(visitor.timeSubmitted)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visitors;
