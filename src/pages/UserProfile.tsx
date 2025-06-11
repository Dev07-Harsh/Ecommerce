import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Address {
  address_id: number;
  user_id: number;
  user_email: string;
  contact_name: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state_province: string;
  postal_code: string;
  country_code: string;
  address_type: 'shipping' | 'billing';
  is_default_shipping: boolean;
  is_default_billing: boolean;
  full_address_str: string;
  created_at: string;
  updated_at: string;
}

interface UserInfo {
  fullName: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  country: string;
  state: string;
  zipCode: string;
  authProvider: 'local' | 'google';
}

const AVATAR_OPTIONS = [
  {
    label: 'Colorful Blob',
    render: () => (
      <svg width="64" height="64" viewBox="0 0 64 64" className="animate-pulse">
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="#ff5e62" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="28" ry="28" fill="url(#grad1)" />
      </svg>
    )
  },
  {
    label: 'Animated Face',
    render: () => (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="#6EE7B7" />
        <circle cx="24" cy="28" r="4" fill="#fff" className="animate-bounce" />
        <circle cx="40" cy="28" r="4" fill="#fff" className="animate-bounce" />
        <ellipse cx="32" cy="40" rx="10" ry="4" fill="#fff" className="animate-pulse" />
      </svg>
    )
  },
  {
    label: 'Star',
    render: () => (
      <svg width="64" height="64" viewBox="0 0 64 64" className="animate-spin-slow">
        <polygon points="32,8 39,26 58,26 42,38 48,56 32,45 16,56 22,38 6,26 25,26" fill="#facc15" />
      </svg>
    )
  },
  {
    label: 'Minimal',
    render: () => (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="#a5b4fc" />
        <rect x="20" y="40" width="24" height="8" rx="4" fill="#fff" />
      </svg>
    )
  },
];

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  
  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    country: '',
    state: '',
    zipCode: '',
    authProvider: 'local'
  });

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile image states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const profileImageUrl = profileImage ? URL.createObjectURL(profileImage) : null;

  // Add a fade/scale-in animation class
  const popoverAnim = "transition-all duration-200 ease-out transform opacity-100 scale-100 animate-fade-in";

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) {
      toast.error('Please sign in to access your profile');
      navigate('/signin');
      return;
    }
  }, [user, navigate]);

  // Fetch user addresses and extract user info
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const baseUrl = API_BASE_URL.replace(/\/+$/, '');
      const url = `${baseUrl}/api/user-address?user_id=${user?.id}`;
      console.log('Fetching addresses from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch addresses: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Addresses data:', data);
      setAddresses(data.addresses);

      // Extract user info from the first address
      if (data.addresses && data.addresses.length > 0) {
        const firstAddress = data.addresses[0];
        setUserInfo(prev => ({
          ...prev,
          fullName: firstAddress.contact_name || '',
          email: firstAddress.user_email || '',
          phone: firstAddress.contact_phone || '',
          country: firstAddress.country_code || '',
          state: firstAddress.state_province || '',
          zipCode: firstAddress.postal_code || '',
          authProvider: 'local'
        }));
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
      toast.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const baseUrl = API_BASE_URL.replace(/\/+$/, '');
      const url = `${baseUrl}/api/user-address/${addressId}?user_id=${user?.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete address: ${response.status} ${errorText}`);
      }

      // Remove the deleted address from the list
      setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteAddress:', error);
      toast.error('Failed to delete address');
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (addressId: number, addressType: 'shipping' | 'billing') => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const baseUrl = API_BASE_URL.replace(/\/+$/, '');
      const url = `${baseUrl}/api/user-address/${addressId}/default/${addressType}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: user?.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to set default address: ${response.status} ${errorText}`);
      }

      // Refresh addresses after setting default
      fetchAddresses();
      toast.success(`Default ${addressType} address updated successfully`);
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const baseUrl = API_BASE_URL.replace(/\/+$/, '');
      const url = `${baseUrl}/api/users/change-password`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to change password: ${response.status} ${errorText}`);
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
      toast.error('Failed to change password');
    }
  };

  // Initial fetch of addresses
  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Profile Image/Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-2">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 shadow"
            />
          ) : (
            <button
              type="button"
              className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 border-4 border-orange-200 shadow text-gray-400 text-5xl hover:bg-gray-200"
              onClick={() => setShowAvatarPicker(v => !v)}
              title="Click to choose avatar"
            >
              {AVATAR_OPTIONS[avatarIndex].render()}
            </button>
          )}
          {profileImageUrl && (
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-red-500 hover:bg-red-100"
              onClick={() => {
                setProfileImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              title="Remove image"
            >
              &times;
            </button>
          )}
          {/* Avatar Picker Popover */}
          {showAvatarPicker && !profileImageUrl && (
            <>
              {/* Overlay to close popover on outside click */}
              <div
                className="fixed inset-0 z-10 bg-transparent"
                onClick={() => setShowAvatarPicker(false)}
              />
              <div className={`absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-2xl px-6 pt-4 pb-3 flex flex-col items-center ${popoverAnim}`} style={{ minWidth: 220 }}>
                {/* Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden">
                  <div className="w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 shadow-md"></div>
                </div>
                <div className="grid grid-cols-2 gap-5 mb-2">
                  {AVATAR_OPTIONS.map((opt, idx) => (
                    <button
                      key={opt.label}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${avatarIndex === idx ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent'} bg-gray-50 hover:bg-orange-100 transition`}
                      onClick={() => { setAvatarIndex(idx); setShowAvatarPicker(false); }}
                      title={opt.label}
                      aria-label={opt.label}
                    >
                      {opt.render()}
                    </button>
                  ))}
                </div>
                <button
                  className="text-xs text-gray-500 hover:text-orange-500 mt-1 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onClick={() => setShowAvatarPicker(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          id="profile-image-upload"
          className="hidden"
          ref={fileInputRef}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              setProfileImage(e.target.files[0]);
            }
          }}
        />
        <label
          htmlFor="profile-image-upload"
          className="cursor-pointer text-orange-500 hover:text-orange-600 text-sm font-medium"
        >
          {profileImage ? 'Change Image' : 'Upload Image'}
        </label>
        {!profileImage && (
          <div className="text-xs text-gray-400 mt-1">or click avatar to choose style</div>
        )}
      </div>
      {/* User Info */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
              value={userInfo.fullName} 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
              value={userInfo.email} 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
              value={userInfo.phone} 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country/Region</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
              value={userInfo.country} 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
              value={userInfo.state} 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
              value={userInfo.zipCode} 
              readOnly 
            />
          </div>
        </div>
      </div>
      <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium mb-8">Save Changes</button>

      {/* Saved Addresses */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Saved Addresses</h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            <p>{error}</p>
            <button 
              onClick={fetchAddresses}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-2 mb-2">
            {addresses.map((address) => (
              <div key={address.address_id} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md border">
                <div className="flex-1">
                  <p className="text-sm">{address.full_address_str}</p>
                  <div className="flex gap-2 mt-1">
                    {!address.is_default_shipping && (
                      <button 
                        onClick={() => handleSetDefaultAddress(address.address_id, 'shipping')}
                        className="text-xs text-orange-500 hover:text-orange-600"
                      >
                        Set as default shipping
                      </button>
                    )}
                    {!address.is_default_billing && (
                      <button 
                        onClick={() => handleSetDefaultAddress(address.address_id, 'billing')}
                        className="text-xs text-orange-500 hover:text-orange-600"
                      >
                        Set as default billing
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-x-2">
                  <button className="bg-gray-200 px-3 py-1 rounded-md text-sm font-medium">Edit</button>
                  <button 
                    onClick={() => handleDeleteAddress(address.address_id)}
                    className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="bg-orange-500 text-white px-4 py-1 rounded-md font-medium flex items-center">
          <span className="mr-1">+</span> Add New
        </button>
      </div>

      {/* Payment Methods */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Payment Methods</h2>
        <div className="space-y-2 mb-2">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md border">
            <span>Visa ending in 2045</span>
            <span>14/24</span>
            <div className="space-x-2">
              <button className="bg-gray-200 px-3 py-1 rounded-md text-sm font-medium">Edit</button>
              <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium">Delete</button>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md border">
            <span>Mastercard ending in 5678</span>
            <span>11/23</span>
            <span>CVV</span>
            <div className="space-x-2">
              <button className="bg-gray-200 px-3 py-1 rounded-md text-sm font-medium">Edit</button>
              <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <select className="border border-gray-300 rounded-md px-3 py-1">
            <option>mm</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-1">
            <option>yy</option>
          </select>
        </div>
        <button className="bg-orange-500 text-white px-4 py-1 rounded-md font-medium flex items-center"><span className="mr-1">+</span> Add New</button>
      </div>

      {/* Notification Settings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Notification Settings</h2>
        <div className="grid grid-cols-2 gap-4 items-center mb-2 max-w-md">
          <div className="space-y-8">
            <div className="flex items-center">
              <span className="text-base">Email Notification</span>
            </div>
            <div className="flex items-center">
              <span className="text-base">PUSH Notification</span>
            </div>
          </div>
          <div className="space-y-8 flex flex-col items-end">
            <button
              type="button"
              aria-pressed={emailNotif}
              onClick={() => setEmailNotif(v => !v)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${emailNotif ? 'bg-black' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${emailNotif ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
            <button
              type="button"
              aria-pressed={pushNotif}
              onClick={() => setPushNotif(v => !v)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${pushNotif ? 'bg-black' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${pushNotif ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
        <button className="bg-orange-500 text-white px-4 py-1 rounded-md font-medium flex items-center mt-2"><span className="mr-1">+</span> Add New</button>
      </div>

      {/* Change Password Section - Only show for local auth users */}
      {userInfo.authProvider === 'local' && (
        <div className="bg-white border rounded-md p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2" 
                  onClick={() => setShowCurrentPassword(v => !v)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                  placeholder="8+ characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2" 
                  onClick={() => setShowNewPassword(v => !v)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2" 
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            <button 
              type="submit" 
              className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium w-full"
            >
              Change Password
            </button>
          </form>
        </div>
      )}

      {/* Google Auth Message */}
      {userInfo.authProvider === 'google' && (
        <div className="bg-white border rounded-md p-6">
          <h2 className="text-lg font-semibold mb-4">Password Management</h2>
          <p className="text-gray-600">
            Since you're signed in with Google, you can manage your password through your Google account settings.
          </p>
          <a 
            href="https://myaccount.google.com/security" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600 mt-2 inline-block"
          >
            Manage Google Account Security
          </a>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 