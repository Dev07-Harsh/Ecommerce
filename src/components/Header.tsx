import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LogoutConfirmationPopup from './LogoutConfirmationPopup';

const Header = () => {
  const navigate = useNavigate();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);

  const handleLogout = () => {
    // Implement your logout logic here
    // For example: clear local storage, reset auth state, etc.
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Your logo or brand name */}
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/all-products" className="text-gray-600 hover:text-orange-500 transition-colors">
              Products
            </Link>
            <Link to="/new-product" className="text-gray-600 hover:text-orange-500 transition-colors">
              New Product
            </Link>
            <Link to="/promotion" className="text-gray-600 hover:text-orange-500 transition-colors">
              Promotion
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Other header items */}
          <button
            onClick={() => setIsLogoutPopupOpen(true)}
            className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Logout Confirmation Popup */}
        <LogoutConfirmationPopup
          isOpen={isLogoutPopupOpen}
          onClose={() => setIsLogoutPopupOpen(false)}
          onConfirm={() => {
            handleLogout();
            setIsLogoutPopupOpen(false);
          }}
        />
      </div>
    </header>
  );
};

export default Header; 