import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.ts';
import { AuthContextType } from '../types';

/**
 * Custom hook for accessing auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
