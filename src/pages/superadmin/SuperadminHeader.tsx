// src/components/superadmin/SuperadminHeader.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Settings, LogOut, User, Menu } from 'lucide-react';
import LogoutConfirmationPopup from '../../components/LogoutConfirmationPopup';

interface SuperadminHeaderProps {
  onMenuClick?: () => void;
}

const SuperadminHeader: React.FC<SuperadminHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutPopupOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutPopupOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-30">
      <div className="px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 mr-2 text-orange-500 hover:text-orange-400 hover:bg-gray-900 rounded-lg transition-colors duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <img 
              src="/assets/images/logo.svg" 
              alt="ShopEasy Logo" 
              className="h-8 w-auto"
            />
          </div>
          
          {/* Navigation Links - could be expanded */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
            </div>
          </div>
          
          {/* Right side icons and profile */}
          <div className="flex items-center space-x-4">
            <button className="text-orange-500 hover:text-orange-400 p-1 rounded-full">
              <Bell className="h-6 w-6" />
            </button>
            <button className="text-orange-500 hover:text-orange-400 p-1 rounded-full">
              <Settings className="h-6 w-6" />
            </button>
            
            {/* Profile dropdown */}
            <div className="relative">
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer">
                  <div className="bg-gray-800 p-2 rounded-full text-orange-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-2 hidden md:block">
                    <div className="text-sm font-medium text-orange-500">{user?.name || user?.email}</div>
                    <div className="text-xs text-orange-400">Superadmin</div>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="ml-4 text-orange-500 hover:text-red-500"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add the LogoutConfirmationPopup */}
          <LogoutConfirmationPopup
            isOpen={isLogoutPopupOpen}
            onClose={() => setIsLogoutPopupOpen(false)}
            onConfirm={handleLogoutConfirm}
          />
        </div>
      </div>
    </header>
  );
};

export default SuperadminHeader;