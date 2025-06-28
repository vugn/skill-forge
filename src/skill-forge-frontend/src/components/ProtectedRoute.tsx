import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import Loading from './common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean; // Apakah route memerlukan profile lengkap
}

/**
 * ProtectedRoute component untuk melindungi routes yang memerlukan autentikasi
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

  // Tampilkan loading saat auth masih di-check
  if (loading || checkingProfile) {
    console.log('⏳ Still loading...');
    return <Loading />;
  }

  // Redirect ke home jika tidak authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect ke setup jika user authenticated tapi belum ada profile
  if (requireProfile && !user) {
    console.log('👤 Authenticated but no profile, redirecting to setup');
    return <Navigate to="/setup" replace />;
  }

  console.log('✅ Access granted');
  // Render children jika semua kondisi terpenuhi
  return <>{children}</>;
};

export default ProtectedRoute;
