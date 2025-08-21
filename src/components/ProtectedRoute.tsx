import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticatedUser, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has completed step 1 (account verification) but not step 2 (cashier auth)
  // This prevents bypassing the second authentication step
  if (user && !isAuthenticatedUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow demo mode (no user) and fully authenticated users

  return <>{children}</>;
};

export default ProtectedRoute;