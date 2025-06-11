import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  businessName: string;
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'merchant' | 'admin';
  isEmailVerified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted';
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  isMerchant: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  isVerifiedMerchant: boolean;
  setAuthState: (state: AuthState) => Promise<boolean>;
  register: (accessToken: string, refreshToken: string, userData?: any) => Promise<boolean>;
  login: (accessToken: string, refreshToken: string, userData?: any) => Promise<boolean>;
  logout: () => void;
  refreshTokenFunc: () => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>; 
  fetchVerificationStatus: () => Promise<void>;
  updateVerificationStatus: (status: User['verificationStatus']) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refresh_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!accessToken;
  const isMerchant = user?.role === 'merchant' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const isEmailVerified = user?.isEmailVerified || false;
  const isVerifiedMerchant = user?.verificationStatus === 'approved';

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    } else {
      localStorage.removeItem('access_token');
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }, [refreshToken]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const setAuthState = async (state: AuthState) => {
    try {
      setAccessToken(state.accessToken);
      setRefreshToken(state.refreshToken);
      setUser(state.user);
      return true;
    } catch (error) {
      console.error('Failed to set auth state:', error);
      return false;
    }
  };

  const fetchVerificationStatus = async () => {
    if (!isMerchant || !accessToken) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/merchant/verification/status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      
      // Update user's verification status
      if (user) {
        setUser({
          ...user,
          verificationStatus: data.status
        });
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const updateVerificationStatus = (status: User['verificationStatus']) => {
    if (user) {
      setUser({
        ...user,
        verificationStatus: status
      });
    }
  };

  const createUserObject = (userData: any): User => {
    // Determine the role with proper handling of admin roles
    let role: 'customer' | 'merchant' | 'admin' = 'customer';
    const userRole = (userData.role || '').toLowerCase();
    
    if (userRole === 'merchant') {
      role = 'merchant';
    } else if (userRole.includes('admin')) {
      // Handle any role that contains 'admin' (admin, super_admin, etc.)
      role = 'admin';
    }
    
    console.log('Original role from backend:', userData.role);
    console.log('Transformed role for frontend:', role);
    
    return {
      id: userData.id,
      email: userData.email,
      name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
      role: role,
      isEmailVerified: userData.is_email_verified || false,
      verificationStatus: userData.verification_status || 'not_submitted',
      businessName: userData.business_name || ''
    };
  };

  const register = async (accessToken: string, refreshToken: string, userData?: any) => {
    try {
      if (userData) {
        // If user data is provided directly from auth response
        const userObj = createUserObject(userData);
        await setAuthState({
          accessToken,
          refreshToken,
          user: userObj
        });
        return true;
      }

      // Fallback to fetching user data if not provided
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const fetchedUserData = await response.json();
      const userObj = createUserObject(fetchedUserData);

      await setAuthState({
        accessToken,
        refreshToken,
        user: userObj
      });

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const login = async (accessToken: string, refreshToken: string, userData?: any) => {
    try {
      // Validate token format
      const tokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      if (!tokenRegex.test(accessToken)) {
        throw new Error('Invalid token format');
      }

      if (userData) {
        // If user data is provided directly from auth response
        const userObj = createUserObject(userData);
        await setAuthState({
          accessToken,
          refreshToken,
          user: userObj
        });
        return true;
      }

      // Fallback to fetching user data if not provided
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const fetchedUserData = await response.json();
      const userObj = createUserObject(fetchedUserData);

      await setAuthState({
        accessToken,
        refreshToken,
        user: userObj
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Update user's email verification status
      if (user) {
        setUser({
          ...user,
          isEmailVerified: true
        });
      }

      // If tokens are provided in the response, update them
      if (data.access_token && data.refresh_token) {
        await login(data.access_token, data.refresh_token);
      }

      return true;
    } catch (error) {
      console.error('Email verification failed:', error);
      return false;
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email/resend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to resend verification email');
      return true;
    } catch (error) {
      console.error('Resend verification email failed:', error);
      return false;
    }
  };



  const logout = () => {
    // If you want to call the logout API endpoint before clearing local state:
    if (refreshToken) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      }).catch(err => console.error('Error during logout:', err));
    }
    
    // Clear local state
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('merchant_profile');
  };

  const refreshTokenFunc = async () => {
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Validate new token format
        const tokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
        if (!tokenRegex.test(data.access_token)) {
          throw new Error('Invalid token format received');
        }
        
        setAccessToken(data.access_token);
        return true;
      } else {
        throw new Error(data.msg || 'Token refresh failed');
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      refreshToken, 
      isAuthenticated,
      user,
      isMerchant,
      isAdmin,
      isEmailVerified,
      isVerifiedMerchant,
      setAuthState,
      register,
      login,
      logout, 
      refreshTokenFunc,
      verifyEmail,
      resendVerificationEmail,
      fetchVerificationStatus,
      updateVerificationStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;

};

