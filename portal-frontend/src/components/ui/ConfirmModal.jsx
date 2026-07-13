import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${isDanger ? 'bg-error-container text-error' : 'bg-primary-container text-primary'}`}>
              <FiAlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-headline-md font-bold text-on-surface">{title}</h3>
          </div>
          <p className="text-on-surface-variant font-body-md pl-16">
            {message}
          </p>
        </div>
        
        <div className="bg-surface px-6 py-4 border-t border-trust-slate flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-bold text-outline hover:bg-trust-slate transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-md font-bold text-white transition-colors shadow-sm ${
              isDanger ? 'bg-error hover:bg-red-700' : 'bg-primary hover:bg-primary-container'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
