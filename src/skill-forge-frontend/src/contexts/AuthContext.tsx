import React, { ReactNode, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { AuthContextType, UserProfile } from '../types';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        await authService.init();
        const authenticated = authService.isAuthenticated();
        console.log('🔐 Authentication status:', authenticated);
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const principal = authService.getPrincipalText();
          console.log('👤 Principal:', principal);
          await loadUserProfile();
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Load user profile from backend first, then fallback to storage
   */
  const loadUserProfile = async (): Promise<void> => {
    setCheckingProfile(true);
    try {
      const principal = authService.getPrincipalText();
      console.log('📋 Loading profile for principal:', principal);
      if (principal) {
        // Try to get user profile from backend first
        const profile = await authService.getUserProfile(principal);
        console.log('👤 Profile loaded:', profile);
        setUser(profile);
      }
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  /**
   * Login with Internet Identity
   */
  const login = async (): Promise<boolean> => {
    try {
      const success = await authService.login();
      if (success) {
        setIsAuthenticated(true);
        await loadUserProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  /**
   * Logout and clear state
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * Update user profile
   */
  const updateUser = async (updatedData: Partial<UserProfile>): Promise<void> => {
    try {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const principal = authService.getPrincipalText();
      if (!principal) {
        throw new Error('No principal found');
      }

      // If we have existing user, merge the data
      if (user) {
        const updatedUser: UserProfile = {
          ...user,
          ...updatedData,
          principal // Keep the original principal
        };
        
        // Save to localStorage and backend
        await authService.saveUserProfileToStorage(principal, updatedUser);
        setUser(updatedUser);
      } else {
        // If no existing user, this is a new profile creation
        const newUser = updatedData as UserProfile;
        await authService.saveUserProfileToStorage(principal, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };


  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    loading,
    checkingProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};