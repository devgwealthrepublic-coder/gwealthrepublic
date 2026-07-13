import React, { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiUser, FiPhone, FiCheckCircle, FiClock } from 'react-icons/fi';
import axios from 'axios';

const Excursions = () => {
  const [excursions, setExcursions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExcursions = async () => {
    try {
      const res = await axios.get('/api/excursions');
      const data = res.data;
      if (data.success) {
        setExcursions(data.data);
      } else {
        setError('Failed to fetch excursions');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcursions();
  }, []);

  const handleAssign = async (id, coordinator, phone) => {
    try {
      const res = await axios.put(`/api/excursions/${id}`, { coordinator, status: 'scheduled' });
      const data = res.data;
      
      if (data.success) {
        setExcursions(excursions.map(ex => 
          ex._id === id ? data.data : ex
        ));
        
        // Open WhatsApp notification
        const message = encodeURIComponent(`Hello ${coordinator}, you have been assigned a new site inspection for ${data.data.property}. Client: ${data.data.clientName} (${data.data.phone}). Date: ${new Date(data.data.preferredDate).toLocaleDateString()}. Please reach out to them.`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating excursion');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await axios.put(`/api/excursions/${id}`, { status: 'completed' });
      const data = res.data;
      
      if (data.success) {
        setExcursions(excursions.map(ex => 
          ex._id === id ? data.data : ex
        ));
      }
    } catch (err) {
      console.error(err);
      alert('Error updating excursion');
    }
  };

  if (loading) return <div className="p-8 text-center text-primary">Loading excursions...</div>;
  if (error) return <div className="p-8 text-center text-error">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-primary mb-2">Inspection Excursions</h1>
          <p className="text-outline font-body-md">Manage site tours and assign regional coordinators to incoming leads.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-trust-slate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-trust-slate text-on-surface-variant font-label-md uppercase text-xs tracking-wider">
                <th className="p-4">Client Details</th>
                <th className="p-4">Requested Property & Branch</th>
                <th className="p-4">Preferred Date</th>
                <th className="p-4">Coordinator</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trust-slate">
              {excursions.map(ex => (
                <tr key={ex._id} className="hover:bg-surface-container transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                        {ex.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface flex items-center gap-2">
                          {ex.clientName}
                        </div>
                        <div className="text-xs text-outline flex items-center gap-1 mt-1">
                          <FiPhone size={12} /> {ex.phone}
                        </div>
                        {ex.referralCode ? (
                          <div className="text-[10px] uppercase font-bold text-trust-gold mt-1 bg-trust-gold/10 px-2 py-0.5 rounded w-max">
                            Ref: {ex.referralCode}
                          </div>
                        ) : (
                          <div className="text-[10px] uppercase font-bold text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded w-max border border-slate-200">
                            Direct Visitor
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-primary">{ex.property}</div>
                    <div className="text-xs text-outline flex items-center gap-1 mt-1">
                      <FiMapPin size={12} /> {ex.branch} Branch
                    </div>
                  </td>
                  <td className="p-4 text-on-surface font-body-md flex items-center gap-2 mt-3">
                    <FiCalendar className="text-primary" /> {new Date(ex.preferredDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {ex.status === 'pending' ? (
                        <select 
                        className="p-2 border border-trust-slate bg-white rounded-md text-sm text-gray-900 outline-none focus:border-primary w-full max-w-xs appearance-none font-bold"
                        onChange={(e) => handleAssign(ex._id, e.target.value, ex.phone)}
                        defaultValue=""
                      >
                        <option value="" disabled className="text-gray-500 font-normal">Assign Coordinator...</option>
                        <option value="Chinedu Okafor (PH)" className="font-normal text-gray-900">Chinedu Okafor (PH)</option>
                        <option value="Emeka Nnamdi (Aba)" className="font-normal text-gray-900">Emeka Nnamdi (Aba)</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                        <FiUser className="text-primary" /> {ex.coordinator}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${
                      ex.status === 'pending' ? 'bg-error-container text-error' :
                      ex.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ex.status === 'pending' && <FiClock size={12} />}
                      {ex.status === 'scheduled' && <FiCalendar size={12} />}
                      {ex.status === 'completed' && <FiCheckCircle size={12} />}
                      {ex.status.charAt(0).toUpperCase() + ex.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {ex.status === 'scheduled' && (
                      <button 
                        onClick={() => handleComplete(ex._id)}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Mark Complete
                      </button>
                    )}
                    {ex.status === 'completed' && (
                      <span className="text-sm text-outline font-bold">Done</span>
                    )}
                    {ex.status === 'pending' && (
                      <span className="text-sm text-outline italic">Awaiting Assignment</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {excursions.length === 0 && (
          <div className="p-8 text-center text-outline">No excursions scheduled at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default Excursions;
