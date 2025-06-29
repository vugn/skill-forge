import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Loading from './common/Loading';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: string; // Where to redirect if already authenticated
}

/**
 * PublicRoute component for routes that can only be accessed before authentication
 * Example: /setup (profile setup) should not be accessible if user already has profile
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectIfAuthenticated = '/dashboard' 
}) => {
  const { isAuthenticated, user, loading, checkingProfile } = useAuth();

  // Show loading while auth is being checked
  if (loading || checkingProfile) {
    return <Loading />;
  }

  // Redirect to dashboard if user is already authenticated and has profile
  if (isAuthenticated && user) {
    return <Navigate to={redirectIfAuthenticated} replace />;
  }

  // Render children if conditions are met
  return <>{children}</>;
};

export default PublicRoute;
