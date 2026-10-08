import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  origin?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  origin = 'localhost:5173'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 animate-fadeIn">
      <div className="w-full max-w-sm bg-white text-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-300">
        <div className="px-5 pt-4 pb-2">
          <div className="text-xs font-semibold text-gray-500 mb-1">{origin} says</div>
          <p className="text-sm text-gray-800 font-normal leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50">
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-medium text-white bg-purple-700 hover:bg-purple-800 rounded transition shadow-sm"
          >
            OK
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
