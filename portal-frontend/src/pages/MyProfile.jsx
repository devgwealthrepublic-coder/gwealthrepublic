import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiCamera, FiMapPin, FiPhone, FiLock, FiSave, FiAlertCircle } from 'react-icons/fi';

const MyProfile = () => {
  const { user, login } = useAuth(); // login function updates user context if needed, but we can just update local state or re-auth
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    officeLocation: user?.officeLocation || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
  });
  const [password, setPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = 'http://localhost:5000/api/users';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/me`, { withCredentials: true });
      setProfile(data.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('phone', profile.phone);
    formData.append('officeLocation', profile.officeLocation);
    formData.append('bio', profile.bio);
    if (password) formData.append('password', password);
    if (selectedImage) formData.append('profilePicture', selectedImage);

    try {
      const { data } = await axios.put(`${API_URL}/profile`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Profile updated successfully!');
      setProfile(data.data);
      setSelectedImage(null);
      setPassword('');
      
      // Update local storage user data manually to keep auth context in sync
      const storedData = JSON.parse(localStorage.getItem('gwealth_user') || '{}');
      if (storedData.data) {
        storedData.data = { ...storedData.data, ...data.data };
        localStorage.setItem('gwealth_user', JSON.stringify(storedData));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <FiUser className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-headline-md font-bold text-slate-800">My Profile</h1>
          <p className="text-on-surface-variant font-body-md">Manage your personal information and security settings</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm flex items-center gap-3">
          <FiSave className="text-green-500" />
          <p className="text-green-700 font-medium">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-center gap-3">
          <FiAlertCircle className="text-red-500" />
          <p className="text-red-700 font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Profile Picture Section */}
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 flex items-center justify-center">
              {previewImage || profile.profilePicture ? (
                <img src={previewImage || profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-primary-container transition-colors">
              <FiCamera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Profile Photo</h3>
            <p className="text-slate-500 text-sm">Upload a professional headshot. Recommended size: 400x400px.</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-800 bg-white"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-800 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Office Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-slate-400" />
                <select 
                  value={profile.officeLocation}
                  onChange={(e) => setProfile({...profile, officeLocation: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-800 bg-white"
                >
                  <option value="Online">Online</option>
                  <option value="Aba">Aba</option>
                  <option value="Asaba">Asaba</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Update Password (Optional)</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-800 bg-white placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Short Bio</label>
            <textarea 
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows="4"
              placeholder="Tell clients a bit about your real estate experience..."
              className="w-full p-4 border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none text-slate-800 bg-white placeholder-slate-400"
            ></textarea>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded font-bold hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : <><FiSave /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
