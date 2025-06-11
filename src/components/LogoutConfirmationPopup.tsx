import React from 'react';

interface LogoutConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationPopup: React.FC<LogoutConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Confirmation Message */}
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Are you sure you want to logout? You'll need to login again to access your account.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-black rounded-lg text-sm font-medium text-black bg-white hover:bg-gray-50 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationPopup; 