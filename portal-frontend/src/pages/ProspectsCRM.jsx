import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiPlus, FiTrash2, FiEdit2, FiPhone, FiCheckCircle } from 'react-icons/fi';

const ProspectsCRM = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    interestLevel: 'Warm',
    notes: ''
  });

  const API_URL = '/api/leads';

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await axios.get(API_URL, { withCredentials: true });
      setLeads(data.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingId(lead._id);
      setFormData({
        name: lead.name,
        phone: lead.phone,
        interestLevel: lead.interestLevel,
        notes: lead.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', interestLevel: 'Warm', notes: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { data } = await axios.put(`${API_URL}/${editingId}`, formData, { withCredentials: true });
        setLeads(leads.map(l => l._id === editingId ? data.data : l));
      } else {
        const { data } = await axios.post(API_URL, formData, { withCredentials: true });
        setLeads([data.data, ...leads]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prospect?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setLeads(leads.filter(l => l._id !== id));
    } catch (err) {
      alert('Error deleting lead');
    }
  };

  const getInterestColor = (level) => {
    switch(level) {
      case 'Hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'Warm': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your CRM...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-slate-800 flex items-center gap-3">
            <FiUsers className="text-primary" /> Prospect CRM
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">Track and manage your real estate leads</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-5 py-2.5 rounded-md font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
        >
          <FiPlus /> Add Prospect
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Prospect Name</th>
                <th className="p-4 font-bold">Phone Number</th>
                <th className="p-4 font-bold">Interest Level</th>
                <th className="p-4 font-bold">Date Added</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    You have no prospects added yet. Click "Add Prospect" to start tracking your leads.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{lead.name}</td>
                    <td className="p-4">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                        <FiPhone size={14} /> {lead.phone}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getInterestColor(lead.interestLevel)}`}>
                        {lead.interestLevel}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(lead)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded transition-colors"
                          title="Edit Prospect"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lead._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete Prospect"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Prospect' : 'Add New Prospect'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary outline-none text-slate-800 bg-white placeholder-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <input 
                  type="text" required
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary outline-none text-slate-800 bg-white placeholder-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Interest Level</label>
                <select 
                  value={formData.interestLevel} onChange={e => setFormData({...formData, interestLevel: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary outline-none text-slate-800 bg-white"
                >
                  <option value="Hot">Hot (Ready to buy)</option>
                  <option value="Warm">Warm (Interested, needs follow up)</option>
                  <option value="Cold">Cold (Just browsing)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Notes / Remarks</label>
                <textarea 
                  rows="3"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary outline-none resize-none text-slate-800 bg-white placeholder-slate-400"
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-container flex items-center gap-2">
                  <FiCheckCircle /> {editingId ? 'Save Changes' : 'Add Prospect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectsCRM;
