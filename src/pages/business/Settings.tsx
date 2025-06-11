import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

interface ProfileData {
  first_name: string;
  last_name: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Settings: React.FC = () => {
  const { accessToken, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/merchant/profile`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          business_name: data.business_name || '',
          business_email: data.business_email || '',
          business_phone: data.business_phone || '',
          business_address: data.business_address || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/merchant/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/merchant/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (!response.ok) throw new Error('Failed to change password');
      
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4D00]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                value={profileData.first_name}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profileData.last_name}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input
              type="text"
              name="business_name"
              value={profileData.business_name}
              onChange={handleProfileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Business Email</label>
            <input
              type="email"
              name="business_email"
              value={profileData.business_email}
              onChange={handleProfileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Business Phone</label>
            <input
              type="tel"
              name="business_phone"
              value={profileData.business_phone}
              onChange={handleProfileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Business Address</label>
            <textarea
              name="business_address"
              value={profileData.business_address}
              onChange={handleProfileChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FF4D00] hover:bg-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative mt-1">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FF4D00] hover:bg-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00] disabled:opacity-50"
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 