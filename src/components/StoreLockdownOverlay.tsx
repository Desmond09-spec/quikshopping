import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, ShieldAlert, ArrowRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const StoreLockdownOverlay: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { stores, loading: storeLoading } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not show if still loading, not authenticated, or on auth pages
  if (!mounted || authLoading || storeLoading || !user) {
    return null;
  }

  const isAuthPage = location.pathname.startsWith('/auth') || location.pathname === '/signin' || location.pathname === '/signup';
  if (isAuthPage) {
    return null;
  }

  // If user has stores, no lockdown
  if (stores && stores.length > 0) {
    return null;
  }
  
  // Don't show overlay on create-store page so they can actually create the store!
  if (location.pathname === '/create-store') {
    return null;
  }

  // Don't block the invitation acceptance flow — user needs to accept before they have a store
  if (location.pathname.startsWith('/accept-invite')) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-primary/5">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Access Locked</CardTitle>
          <CardDescription className="text-base">
            You need to create or join a store to access QuikShopping features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10">
            <div className="flex items-start space-x-3">
              <Store className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Enterprise Multi-Tenant</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  QuikShopping has upgraded to a multi-tenant infrastructure. Every user must now be associated with a dedicated store workspace.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button 
            className="w-full text-md h-12 font-medium" 
            size="lg"
            onClick={() => {
              navigate('/create-store');
            }}
          >
            Create Your Store <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 w-4 h-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StoreLockdownOverlay;
