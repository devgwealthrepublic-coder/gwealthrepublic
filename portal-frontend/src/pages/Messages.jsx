import React, { useState, useEffect } from 'react';
import { FiMail, FiTrash2, FiCheck, FiClock, FiSearch, FiSend } from 'react-icons/fi';
import axios from 'axios';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  // Use the same base URL pattern as other frontend components
  const API_URL = '/api/messages';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setMessages(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, currentStatus) => {
    if (currentStatus === 'Read') return;
    try {
      await axios.put(`${API_URL}/${id}`, { status: 'Read' });
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'Read' } : m));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'Read' });
      }
    } catch (err) {
      console.error('Error marking read:', err);
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
      setMessages(messages.filter(m => m._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading inbox...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inbox Hub</h1>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Messages List (Left 1/3) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <FiMail /> All Messages ({messages.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No messages found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      handleMarkRead(msg._id, msg.status);
                    }}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                      selectedMessage?._id === msg._id ? 'bg-blue-50/50 border-l-4 border-primary' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm truncate pr-2 ${msg.status === 'Unread' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.name}
                      </h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className={`text-xs mb-2 truncate ${msg.status === 'Unread' ? 'font-semibold text-primary' : 'text-slate-500'}`}>
                      {msg.subject}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        msg.status === 'Unread' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail (Right 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{selectedMessage.name}</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      &lt;{selectedMessage.email}&gt;
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FiClock /> {formatDate(selectedMessage.createdAt)}
                  </span>
                  
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}&body=Hi ${encodeURIComponent(selectedMessage.name)},%0A%0A`}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-primary-container transition-colors shadow-sm ml-2"
                  >
                    <FiSend size={14} /> Reply
                  </a>

                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors"
                    title="Delete Message"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
                <div className="bg-white p-6 rounded border border-slate-100 shadow-sm text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {selectedMessage.message}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
              <FiMail className="w-16 h-16 mb-4 text-slate-200" />
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
};

export default Messages;
