import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Loading from './common/Loading';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: string; // Redirect ke mana jika sudah authenticated
}

/**
 * PublicRoute component untuk routes yang hanya bisa diakses sebelum authentication
 * Contoh: /setup (setup profile) tidak boleh diakses jika user sudah punya profile
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectIfAuthenticated = '/dashboard' 
}) => {
  const { isAuthenticated, user, loading, checkingProfile } = useAuth();

  // Tampilkan loading saat auth masih di-check
  if (loading || checkingProfile) {
    return <Loading />;
  }

  // Redirect ke dashboard jika user sudah authenticated dan punya profile
  if (isAuthenticated && user) {
    return <Navigate to={redirectIfAuthenticated} replace />;
  }

  // Render children jika kondisi terpenuhi
  return <>{children}</>;
};

export default PublicRoute;
