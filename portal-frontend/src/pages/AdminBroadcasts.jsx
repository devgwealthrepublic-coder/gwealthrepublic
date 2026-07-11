import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRadio, FiPlus, FiTrash2, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const AdminBroadcasts = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const API_URL = 'http://localhost:5000/api/notices';

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await axios.get(API_URL, { withCredentials: true });
      setNotices(data.data);
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(API_URL, formData, { withCredentials: true });
      setNotices([data.data, ...notices]);
      setShowModal(false);
      setFormData({ title: '', message: '', type: 'info' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing broadcast');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast? It will be removed from all partner dashboards.')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      alert('Error deleting broadcast');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'urgent': return <FiAlertCircle className="text-red-500 w-6 h-6" />;
      case 'success': return <FiCheckCircle className="text-green-500 w-6 h-6" />;
      default: return <FiInfo className="text-primary w-6 h-6" />;
    }
  };

  const getTypeStyles = (type) => {
    switch(type) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading broadcasts...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-slate-800 flex items-center gap-3">
            <FiRadio className="text-primary" /> Broadcast Studio
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">Publish announcements to all partner dashboards in real-time.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-md font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
        >
          <FiPlus /> New Broadcast
        </button>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FiRadio className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Broadcasts Yet</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Create your first broadcast to communicate with your partner network. It will instantly appear on their dashboards.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className={`p-6 rounded-xl border shadow-sm flex gap-4 ${getTypeStyles(notice.type)}`}>
              <div className="shrink-0 mt-1">
                {getIcon(notice.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{notice.title}</h3>
                    <p className="text-xs opacity-70 mb-2 font-medium uppercase tracking-wider">{new Date(notice.createdAt).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(notice._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white/50 rounded transition-colors"
                    title="Delete Broadcast"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{notice.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FiRadio className="text-primary" /> Create Broadcast
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Broadcast Title</label>
                <input 
                  type="text" required
                  placeholder="e.g. Site Inspection this Saturday"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded focus:ring-2 focus:ring-primary outline-none text-slate-800 bg-white placeholder-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Notice Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`border rounded p-3 cursor-pointer text-center flex flex-col items-center gap-2 transition-colors ${formData.type === 'info' ? 'bg-blue-50 border-blue-300 ring-2 ring-primary' : 'hover:bg-slate-50 border-slate-200'}`}>
                    <input type="radio" name="type" value="info" className="hidden" checked={formData.type === 'info'} onChange={() => setFormData({...formData, type: 'info'})} />
                    <FiInfo className={formData.type === 'info' ? 'text-primary' : 'text-slate-400'} size={20} />
                    <span className="text-xs font-bold text-slate-700">General Info</span>
                  </label>
                  <label className={`border rounded p-3 cursor-pointer text-center flex flex-col items-center gap-2 transition-colors ${formData.type === 'success' ? 'bg-green-50 border-green-300 ring-2 ring-green-500' : 'hover:bg-slate-50 border-slate-200'}`}>
                    <input type="radio" name="type" value="success" className="hidden" checked={formData.type === 'success'} onChange={() => setFormData({...formData, type: 'success'})} />
                    <FiCheckCircle className={formData.type === 'success' ? 'text-green-500' : 'text-slate-400'} size={20} />
                    <span className="text-xs font-bold text-slate-700">Good News</span>
                  </label>
                  <label className={`border rounded p-3 cursor-pointer text-center flex flex-col items-center gap-2 transition-colors ${formData.type === 'urgent' ? 'bg-red-50 border-red-300 ring-2 ring-red-500' : 'hover:bg-slate-50 border-slate-200'}`}>
                    <input type="radio" name="type" value="urgent" className="hidden" checked={formData.type === 'urgent'} onChange={() => setFormData({...formData, type: 'urgent'})} />
                    <FiAlertCircle className={formData.type === 'urgent' ? 'text-red-500' : 'text-slate-400'} size={20} />
                    <span className="text-xs font-bold text-slate-700">Urgent</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Message Content</label>
                <textarea 
                  rows="5" required
                  placeholder="Type your announcement here..."
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded focus:ring-2 focus:ring-primary outline-none resize-none text-slate-800 bg-white placeholder-slate-400"
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-container flex items-center gap-2">
                  <FiRadio /> Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBroadcasts;
