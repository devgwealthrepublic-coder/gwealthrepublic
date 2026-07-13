import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiImage, FiExternalLink, FiUploadCloud, FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const PropertyManager = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  const [formData, setFormData] = useState({
    propertyName: '',
    description: '',
    location: 'Asaba', // Default enum
    address: '',
    pricePerPlot: '',
    plotsRemaining: '',
    plotSize: '',
    titleType: '',
    surveyNumber: '',
    badge: 'Verified Asset',
    status: 'Ready',
    videoDuration: '',
    surveyorName: '',
    publishToWordPress: false,
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/properties');
      setProperties(data.data || []);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'featuredImage') {
      setFeaturedImage(e.target.files[0]);
    } else if (e.target.name === 'videoFile') {
      setVideoFile(e.target.files[0]);
    } else if (e.target.name === 'images') {
      setGalleryImages(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setFormData({
      propertyName: '',
      description: '',
      location: 'Asaba',
      address: '',
      pricePerPlot: '',
      plotsRemaining: '',
      plotSize: '',
      titleType: '',
      surveyNumber: '',
      badge: 'Verified Asset',
      status: 'Ready',
      videoDuration: '',
      surveyorName: '',
      publishToWordPress: false,
    });
    setFeaturedImage(null);
    setVideoFile(null);
    setGalleryImages([]);
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Append files
    if (featuredImage) data.append('featuredImage', featuredImage);
    if (videoFile) data.append('videoFile', videoFile);
    galleryImages.forEach(file => {
      data.append('images', file);
    });

    try {
      if (editingId) {
        await axios.put(`/api/properties/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('gwealth_token')}` }
        });
      } else {
        await axios.post('/api/properties', data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('gwealth_token')}` }
        });
      }
      resetForm();
      fetchProperties();
    } catch (err) {
      console.error("Error saving property", err);
      setError(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      await axios.delete(`http://localhost:5000/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('gwealth_token')}` }
      });
      fetchProperties();
    } catch (err) {
      setError('Failed to delete property');
    }
  };

  const handleSyncToWP = async (id) => {
    try {
      const { data } = await axios.post(`/api/properties/${id}/publish`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('gwealth_token')}` }
      });
      if (!data.success) {
         alert('WordPress Sync Failed: ' + data.message);
      } else {
         alert(data.message);
      }
      fetchProperties();
    } catch (error) {
      alert('Failed to connect to the server for WordPress sync.');
    }
  };

  const openEditModal = (property) => {
    setEditingId(property._id);
    setFormData({
      propertyName: property.propertyName,
      description: property.description,
      location: property.location,
      address: property.address,
      pricePerPlot: property.pricePerPlot,
      plotSize: property.plotSize || '',
      titleType: property.titleType || '',
      surveyNumber: property.surveyNumber || '',
      surveyorName: property.surveyorName || '',
      videoDuration: property.videoDuration || '',
      badge: property.badge || 'Verified Asset',
      status: property.status || 'Ready',
      publishToWordPress: property.isPublishedToWordPress || false,
    });
    setShowModal(true);
  };

  const generateSurveyNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, surveyNumber: `GW/AB/${randomNum}/26` });
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-primary mb-2">Property Portfolio</h1>
          <p className="text-on-surface-variant font-body-md">Manage your real estate listings and sync to WordPress.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-primary text-white px-5 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-primary-container transition-colors shadow-md"
        >
          <FiPlus /> Add New Property
        </button>
      </div>

      {error && (
        <div className="bg-error-container text-error px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><FiX /></button>
        </div>
      )}

      <div className="bg-white border border-trust-slate rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container border-b border-trust-slate">
              <tr>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Property Details</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Location</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">Price (₦)</th>
                <th className="px-6 py-4 text-primary font-label-md uppercase tracking-wider font-bold">WP Sync Status</th>
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
                      <span className="font-body-md">Loading properties...</span>
                    </div>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-outline font-body-md italic">
                    <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">landscape</span>
                    No properties found. Click "Add New Property" to create your first listing.
                  </td>
                </tr>
              ) : (
                properties.map(p => (
                  <tr key={p._id} className="hover:bg-surface transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {p.featuredImage ? (
                          <img src={p.featuredImage} alt={p.propertyName} className="w-14 h-14 rounded-md object-cover shadow-sm border border-trust-slate" />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-surface-container flex items-center justify-center text-primary border border-trust-slate">
                            <FiImage size={24} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface font-body-md">{p.propertyName}</p>
                          <p className="text-xs text-outline mt-1 font-label-md flex items-center gap-1">
                            <span className="bg-surface-bright border border-trust-slate px-1.5 py-0.5 rounded text-on-surface-variant">{p.badge}</span>
                            <span className="bg-surface-bright border border-trust-slate px-1.5 py-0.5 rounded text-on-surface-variant">{p.status}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-on-surface font-body-md">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        {p.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-on-surface">
                      ₦{p.pricePerPlot ? p.pricePerPlot.toLocaleString() : '0'}
                    </td>
                    <td className="px-6 py-4">
                      {p.isPublishedToWordPress ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                          <FiCheckCircle /> Synced (ID: {p.wpPostId})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant border border-trust-slate">
                          <FiExternalLink /> Not Synced
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleSyncToWP(p._id)} 
                          className="flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 p-2 rounded-md transition-colors"
                          title="Force Sync to WordPress"
                        >
                          <FiRefreshCw size={16} />
                        </button>
                        <button 
                          onClick={() => openEditModal(p)} 
                          className="flex items-center justify-center bg-surface-container text-primary hover:bg-primary-container hover:text-white border border-trust-slate p-2 rounded-md transition-colors"
                          title="Edit Property"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p._id)} 
                          className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 p-2 rounded-md transition-colors"
                          title="Delete Property"
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

      {/* Property Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-10 overflow-y-auto">
          <div className="fixed inset-0 bg-inverse-surface/80 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col border border-trust-slate animate-fade-in my-auto">
            
            <div className="bg-white z-10 border-b border-trust-slate px-6 py-5 flex justify-between items-center rounded-t-xl shrink-0">
              <h2 className="text-xl md:text-2xl font-headline-md font-bold text-primary">
                {editingId ? 'Edit Land Estate' : 'Add New Land Estate'}
              </h2>
              <button type="button" onClick={resetForm} className="text-outline hover:text-error transition-colors p-2">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-label-md text-primary font-bold">Property Name <span className="text-error">*</span></label>
                  <input type="text" name="propertyName" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.propertyName} onChange={handleInputChange} required placeholder="e.g. Wealth Kingdom Estate Phase 3" />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-label-md text-primary font-bold">Marketing Description</label>
                  <textarea name="description" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Describe the estate's features, topography, and landmarks..." />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Primary Location <span className="text-error">*</span></label>
                  <select name="location" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.location} onChange={handleInputChange} required>
                    <option value="Aba">Aba</option>
                    <option value="Asaba">Asaba</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Anambra">Anambra</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Exact Address / Axis</label>
                  <input type="text" name="address" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.address} onChange={handleInputChange} placeholder="e.g. Opobo Road Axis, Ukwa" />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Price Per Plot (₦) <span className="text-error">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold">₦</span>
                    <input type="number" name="pricePerPlot" className="w-full pl-8 pr-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.pricePerPlot} onChange={handleInputChange} required placeholder="550000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Plot Size (SQM)</label>
                  <input type="text" name="plotSize" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.plotSize} onChange={handleInputChange} placeholder="e.g. 465 SQM" />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Legal Title Type</label>
                  <input type="text" name="titleType" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.titleType} onChange={handleInputChange} placeholder="Optional (e.g. Registered Survey & Deed)" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-label-md text-primary font-bold">Survey File Number</label>
                    <button type="button" onClick={generateSurveyNumber} className="text-xs font-bold text-blue-600 hover:text-blue-800 underline bg-blue-50 px-2 py-1 rounded">Auto-Generate</button>
                  </div>
                  <input type="text" name="surveyNumber" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.surveyNumber} onChange={handleInputChange} placeholder="Optional (e.g. AB/1234/26)" />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Cadastral Surveyor Name</label>
                  <input type="text" name="surveyorName" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.surveyorName} onChange={handleInputChange} placeholder="Optional (e.g. Surv. E. Okon (NIS))" />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Video Duration</label>
                  <input type="text" name="videoDuration" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.videoDuration} onChange={handleInputChange} placeholder="Optional (e.g. 01:45 mins)" />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Property Badge</label>
                  <select name="badge" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.badge} onChange={handleInputChange}>
                    <option value="Verified Asset">Verified Asset</option>
                    <option value="Legal Cleared">Legal Cleared</option>
                    <option value="Premium Listing">Premium Listing</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md text-primary font-bold">Sales Status</label>
                  <select name="status" className="w-full px-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md bg-white text-gray-900 placeholder-gray-400" value={formData.status} onChange={handleInputChange}>
                    <option value="Ready">Ready to Build</option>
                    <option value="Investment">Buy & Keep (Investment)</option>
                    <option value="Budget Site">Budget Site</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 bg-surface p-6 rounded-lg border border-trust-slate border-dashed">
                  <h4 className="text-primary font-bold font-label-md mb-4 flex items-center gap-2">
                    <FiUploadCloud size={20} /> Cloudinary Media Uploads
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface-variant">Featured Cover Image</label>
                      <input type="file" name="featuredImage" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-outline file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary-container file:text-white hover:file:bg-primary cursor-pointer transition-all" />
                      <p className="text-xs text-outline italic mt-1">This will be the main thumbnail on WordPress.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface-variant">Drone Walkthrough Video</label>
                      <input type="file" name="videoFile" accept="video/mp4,video/mov,video/webm" onChange={handleFileChange} className="w-full text-sm text-outline file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary-container file:text-white hover:file:bg-primary cursor-pointer transition-all" />
                      <p className="text-xs text-outline italic mt-1">Max 100MB. Upload high-res .mp4 drone footage.</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-bold text-on-surface-variant">Additional Gallery Images</label>
                      <input type="file" name="images" accept="image/*" multiple onChange={handleFileChange} className="w-full text-sm text-outline file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-surface-container file:text-primary hover:file:bg-trust-slate cursor-pointer transition-all" />
                      <p className="text-xs text-outline italic mt-1">Select multiple files to create a gallery slider.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="publishToWordPress" checked={formData.publishToWordPress} onChange={handleInputChange} className="w-5 h-5 rounded border-trust-slate text-primary focus:ring-primary" />
                    <div>
                      <span className="block font-bold text-primary font-label-md">Publish to WordPress (gwealthrepublic.com)</span>
                      <span className="text-sm text-on-surface-variant">Checking this will instantly push or update this property on the public website via the Sync Engine.</span>
                    </div>
                  </label>
                </div>

                <div className="col-span-1 md:col-span-2 flex gap-4 justify-end mt-4 pt-6 border-t border-trust-slate">
                  <button type="button" className="px-6 py-3 font-bold text-on-surface-variant bg-surface hover:bg-trust-slate border border-trust-slate rounded-md transition-colors" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-3 font-bold text-white bg-primary hover:bg-primary-container rounded-md shadow-md transition-colors flex items-center gap-2" disabled={submitting}>
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Saving & Uploading...
                      </>
                    ) : (
                      'Save Property'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone, and will remove it from WordPress if synced."
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default PropertyManager;
