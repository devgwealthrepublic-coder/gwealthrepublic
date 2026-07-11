import React, { useState, useEffect } from 'react';
import { FiFolder, FiImage, FiVideo, FiFileText, FiDownload, FiUploadCloud, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AssetVault = () => {
  const { isAdmin } = useAuth();
  
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', type: 'image', category: 'Promotional Flyers', size: '' });
  const [fileToUpload, setFileToUpload] = useState(null);

  const categories = ["All Assets", "Promotional Flyers", "Site Videos", "Site Layouts", "Legal Documents"];
  const [activeCategory, setActiveCategory] = useState("All Assets");

  const fetchAssets = async () => {
    try {
      const res = await axios.get('/api/assets');
      const data = res.data;
      if (data.success) {
        setAssets(data.data);
      } else {
        setError('Failed to fetch assets');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filteredAssets = activeCategory === "All Assets" 
    ? assets 
    : assets.filter(a => a.category === activeCategory);

  const getIcon = (type) => {
    switch(type) {
      case 'image': return <FiImage size={24} className="text-blue-500" />;
      case 'video': return <FiVideo size={24} className="text-purple-500" />;
      case 'document': return <FiFileText size={24} className="text-orange-500" />;
      default: return <FiFolder size={24} className="text-gray-500" />;
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      alert('Please select a file to upload.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('type', uploadData.type);
      formData.append('category', uploadData.category);
      if (uploadData.size) formData.append('size', uploadData.size);
      formData.append('file', fileToUpload);

      const res = await axios.post('/api/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      if (data.success) {
        setAssets([data.data, ...assets]);
        setShowUploadModal(false);
        setUploadData({ title: '', type: 'image', category: 'Promotional Flyers', size: '' });
        setFileToUpload(null);
      } else {
        alert(data.message || 'Error uploading asset');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this asset from the vault?")) {
      try {
        const res = await axios.delete(`/api/assets/${id}`);
        const data = res.data;
        if (data.success) {
          setAssets(assets.filter(a => a._id !== id));
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting asset');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-primary">Loading assets...</div>;
  if (error) return <div className="p-8 text-center text-error">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-primary mb-2">Marketing Asset Vault</h1>
          <p className="text-outline font-body-md">Official hub for downloading high-res flyers, drone videos, and layout maps.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowUploadModal(true)} className="bg-primary text-white px-6 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm">
            <FiUploadCloud size={18} /> Add New Asset URL
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white border border-trust-slate text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset._id} className="bg-white rounded-xl border border-trust-slate overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-40 bg-surface flex items-center justify-center relative overflow-hidden">
              {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
              ) : (
                getIcon(asset.type)
              )}
              
              {/* Hover overlay for download */}
              <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="bg-white text-primary p-3 rounded-full hover:scale-110 transition-transform shadow-lg" title="Download Asset">
                  <FiDownload size={20} />
                </a>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{asset.category}</div>
              <h3 className="font-bold text-on-surface mb-2 line-clamp-2" title={asset.title}>{asset.title}</h3>
              
              <div className="mt-auto flex justify-between items-center text-xs text-outline font-label-md pt-4 border-t border-trust-slate">
                <span>{asset.size}</span>
                <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {isAdmin && (
              <button 
                onClick={() => handleDelete(asset._id)}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-md text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white shadow-sm"
                title="Delete Asset"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {filteredAssets.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-trust-slate text-outline">
          <FiFolder size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-bold text-lg text-on-surface-variant">No assets found in this category.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-trust-slate sticky top-0 bg-surface z-20 rounded-t-xl">
              <h2 className="text-2xl font-headline-md font-bold text-primary">Add New Asset</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Asset Title</label>
                  <input type="text" required value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900" placeholder="e.g. Phase 3 Layout Map" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Asset Type</label>
                  <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900">
                    <option value="image">Image (JPG/PNG)</option>
                    <option value="video">Video (MP4)</option>
                    <option value="document">Document (PDF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Category</label>
                  <select value={uploadData.category} onChange={e => setUploadData({...uploadData, category: e.target.value})} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900">
                    {categories.filter(c => c !== 'All Assets').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Select File</label>
                  <input type="file" required onChange={e => setFileToUpload(e.target.files[0])} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Estimated Size (Optional - Auto calculated if left blank)</label>
                  <input type="text" value={uploadData.size} onChange={e => setUploadData({...uploadData, size: e.target.value})} className="w-full p-3 border border-trust-slate rounded-md outline-none bg-white text-gray-900" placeholder="e.g. 2.4 MB" />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-md font-bold mt-4 hover:bg-primary-container transition-colors shadow-sm">
                  Add Asset to Vault
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetVault;
