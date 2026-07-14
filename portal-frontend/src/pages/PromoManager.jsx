import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiImage, FiPlus, FiTrash2, FiPower, FiLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const PromoManager = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    actionUrl: '',
    isActive: false
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data } = await axios.get('/api/advertisements', { withCredentials: true });
      setAds(data.data);
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a flyer image');
    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('actionUrl', formData.actionUrl);
    data.append('isActive', formData.isActive);
    data.append('file', file);

    try {
      const res = await axios.post('/api/advertisements', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAds([res.data.data, ...ads]);
      setShowModal(false);
      setFormData({ title: '', actionUrl: '', isActive: false });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating advertisement');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/api/advertisements/${id}`, { isActive: !currentStatus }, { withCredentials: true });
      let newAds = ads.map(a => {
        if (a._id === id) return { ...a, isActive: !currentStatus };
        return a;
      });
      setAds(newAds);
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      await axios.delete(`/api/advertisements/${id}`, { withCredentials: true });
      setAds(ads.filter(a => a._id !== id));
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
      alert('Error deleting advertisement');
    }
  };

  if (!isAdmin) return <div className="p-8 text-center text-error">Access Denied.</div>;
  if (loading) return <div className="p-8 text-center text-primary">Loading...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-primary mb-2 flex items-center gap-2">
            <FiImage /> Promo & Ads Manager
          </h1>
          <p className="text-on-surface-variant font-body-md">Upload and activate promotional flyers that appear instantly on the public WordPress site.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-md font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
        >
          <FiPlus /> New Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.length === 0 ? (
          <div className="col-span-full py-16 bg-white border border-trust-slate rounded-xl text-center shadow-sm">
            <FiImage size={48} className="mx-auto text-outline opacity-50 mb-4" />
            <p className="text-on-surface-variant font-bold text-lg">No advertisements found.</p>
          </div>
        ) : (
          ads.map(ad => (
            <div key={ad._id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-shadow ${ad.isActive ? 'border-primary ring-1 ring-primary' : 'border-trust-slate'}`}>
              <div className="h-48 relative bg-surface-container">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${ad.isActive ? 'bg-green-500/90 text-white' : 'bg-inverse-surface/80 text-white'}`}>
                  {ad.isActive ? 'Live on Site' : 'Inactive'}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-on-surface line-clamp-1 mb-2">{ad.title}</h3>
                {ad.actionUrl && (
                  <p className="text-xs text-primary flex items-center gap-1 mb-4 truncate">
                    <FiLink /> {ad.actionUrl}
                  </p>
                )}
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-trust-slate">
                  <button 
                    onClick={() => toggleActive(ad._id, ad.isActive)}
                    className={`flex-1 py-2 rounded font-bold text-sm flex justify-center items-center gap-2 transition-colors ${ad.isActive ? 'bg-surface text-on-surface-variant border border-trust-slate hover:bg-error-container hover:text-error hover:border-error' : 'bg-primary text-white hover:bg-primary-container'}`}
                  >
                    <FiPower /> {ad.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDelete(ad._id)}
                    className="p-2 border border-trust-slate rounded text-outline hover:bg-error hover:text-white hover:border-error transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md relative z-10">
            <div className="p-6 border-b border-trust-slate flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">Upload New Promo</h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Headline / Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900" placeholder="e.g. Flash Sale: 20% Off Epe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Target Link (Optional)</label>
                <input type="url" value={formData.actionUrl} onChange={e => setFormData({...formData, actionUrl: e.target.value})} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Flyer Image</label>
                <input type="file" required accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full p-3 border border-trust-slate rounded-md bg-white text-gray-900" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
                <label htmlFor="isActive" className="font-bold text-on-surface cursor-pointer">Activate immediately?</label>
              </div>
              <button disabled={submitting} type="submit" className="w-full bg-primary text-white py-3 rounded-md font-bold mt-4 hover:bg-primary-container transition-colors disabled:opacity-50">
                {submitting ? 'Uploading to Cloudinary...' : 'Upload Promo'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Advertisement"
        message="Are you sure you want to delete this advertisement? It will be removed from the frontend."
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default PromoManager;
