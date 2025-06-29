import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import Loading from './common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean; // Whether route requires complete profile
}

/**
 * ProtectedRoute component to protect routes that require authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = true 
}) => {
  const { isAuthenticated, user, loading, checkingProfile } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    hasUser: !!user,
    loading,
    checkingProfile,
    requireProfile,
    path: location.pathname
  });

  // Show loading while auth is being checked
  if (loading || checkingProfile) {
    console.log('⏳ Still loading...');
    return <Loading />;
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to setup if user authenticated but no profile
  if (requireProfile && !user) {
    console.log('👤 Authenticated but no profile, redirecting to setup');
    return <Navigate to="/setup" replace />;
  }

  console.log('✅ Access granted');
  // Render children if all conditions are met
  return <>{children}</>;
};

export default ProtectedRoute;
