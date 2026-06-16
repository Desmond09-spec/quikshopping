import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStore } from '@/contexts/StoreContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { activeStore, loading: storeLoading } = useStore();
  const location = useLocation();

  const loading = authLoading || storeLoading;

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

  // Redirect to auth if not signed in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow access to /create-store even without an active store
  const isCreatingStore = location.pathname === '/create-store';

  // Only require active store for non-create-store pages
  if (!activeStore && !isCreatingStore) {
    return <Navigate to="/create-store" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;