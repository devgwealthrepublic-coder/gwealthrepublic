import React, { useState, useEffect } from 'react';
import { FiUsers, FiTrash2, FiCopy, FiCheck, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const API_URL = '/api/subscribers';

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setSubscribers(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to load subscribers');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSubscribers(subscribers.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      setError('Failed to delete subscriber');
    }
  };

  const handleCopyEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-primary">Loading subscribers...</div>;
  if (error) return <div className="p-8 text-center text-error">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Newsletter Subscribers</h1>
          <p className="text-outline font-body-md">Manage your mailing list and copy emails for Resend campaigns.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-trust-slate rounded-md outline-none focus:border-primary"
            />
            <FiSearch className="absolute left-3 top-3 text-outline" />
          </div>
          <button
            onClick={handleCopyEmails}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-primary-container transition-colors shadow-sm"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? 'Copied!' : 'Copy All Emails'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-trust-slate overflow-hidden">
        <div className="p-4 border-b border-trust-slate bg-surface flex justify-between items-center">
          <h2 className="font-bold text-on-surface flex items-center gap-2">
            <FiUsers className="text-primary" /> Total Active Subscribers: {subscribers.length}
          </h2>
        </div>
        <div className="overflow-x-auto">
          {filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center text-outline">
              <FiUsers size={48} className="mx-auto mb-4 opacity-30" />
              <p>No subscribers found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-trust-slate text-on-surface-variant font-label-md uppercase text-xs tracking-wider">
                  <th className="p-4 pl-6">Email Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Subscribed Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trust-slate">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-surface transition-colors">
                    <td className="p-4 pl-6 font-medium text-on-surface">{sub.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-outline">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-2 text-error hover:bg-error-container rounded-md transition-colors"
                        title="Remove Subscriber"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Subscriber"
        message="Are you sure you want to remove this subscriber? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default Subscribers;
