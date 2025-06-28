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
        await authService.init();
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          await loadUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Load user profile from storage
   */
  const loadUserProfile = async (): Promise<void> => {
    setCheckingProfile(true);
    try {
      const principal = authService.getPrincipalText();
      if (principal) {
        const profile = await authService.loadUserProfileFromStorage(principal);
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
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
      if (!user || !isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const principal = authService.getPrincipalText();
      if (!principal) {
        throw new Error('No principal found');
      }

      // Merge updated data with existing user data
      const updatedUser: UserProfile = {
        ...user,
        ...updatedData,
        principal // Keep the original principal
      };

      // Save to localStorage
      await authService.saveUserProfileToStorage(principal, updatedUser);

      // Update local state
      setUser(updatedUser);
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