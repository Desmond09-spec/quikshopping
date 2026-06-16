import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStore } from '@/contexts/StoreContext';

const AuthCallback: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { stores, loading: storesLoading } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for auth and stores to load
        if (authLoading || storesLoading) return;

        if (user) {
            // Always redirect to home after successful authentication
            // Users can create a store later from settings if needed
            window.location.href = '/';
        } else {
            // If no user found after loading, go back to auth
            navigate('/auth');
        }
    }, [user, authLoading, stores, storesLoading, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
