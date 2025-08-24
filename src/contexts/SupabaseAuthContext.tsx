import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticatedUser: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticatedUser: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string, signInName?: string) => Promise<void>;
  verifyAccount: (email: string, password: string) => Promise<void>;
  completeCashierAuth: (cashierName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticatedUser: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only clear cashier authentication on explicit sign out
        // Don't clear on SIGNED_IN as this is triggered by token refreshes and app focus
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('cashier_authenticated');
        }
        
        const isFullyAuthenticated = session?.user && localStorage.getItem('cashier_authenticated') === 'true';
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isAuthenticatedUser: !!isFullyAuthenticated
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isFullyAuthenticated = session?.user && localStorage.getItem('cashier_authenticated') === 'true';
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        isAuthenticatedUser: !!isFullyAuthenticated
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;

      // Check if user was actually created (data.user will be null if email already exists)
      if (!data.user) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        throw new Error("Account already exists");
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });
    } catch (error: any) {
      // Only show error toast if it's not the "Account already exists" error
      if (error.message !== "Account already exists") {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const verifyAccount = async (email: string, password: string) => {
    try {
      // Clear any previous cashier authentication BEFORE signing in
      localStorage.removeItem('cashier_authenticated');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Account verified",
        description: "Please select your cashier identity to complete sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeCashierAuth = async (cashierName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No authenticated session found');
      }

      // Log sign-in activity with cashier name
      await supabase
        .from('activities')
        .insert({
          user_id: session.user.id,
          type: 'sign_in',
          description: `${cashierName} signed in`,
          details: {
            userName: cashierName,
            email: session.user.email
          }
        });

      // Mark as fully authenticated
      localStorage.setItem('cashier_authenticated', 'true');
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticatedUser: true
      }));

      toast({
        title: "Welcome back",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string, signInName?: string) => {
    try {
      await verifyAccount(email, password);
      if (signInName) {
        await completeCashierAuth(signInName);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Get user name from stored activities before signing out
      let userName = 'Unknown User';
      if (authState.session?.user) {
        const { data: activities } = await supabase
          .from('activities')
          .select('details')
          .eq('user_id', authState.session.user.id)
          .eq('type', 'sign_in')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (activities && activities.length > 0 && activities[0].details && 
            typeof activities[0].details === 'object' && 
            'userName' in activities[0].details) {
          userName = (activities[0].details as any).userName;
        }

        // Log sign-out activity
        await supabase
          .from('activities')
          .insert({
            user_id: authState.session.user.id,
            type: 'sign_out',
            description: `${userName} signed out`,
            details: {
              userName: userName
            }
          });
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Clear all user-specific data from localStorage/sessionStorage
      localStorage.removeItem('cashier_authenticated');
      localStorage.clear();
      sessionStorage.clear();

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      session: authState.session,
      loading: authState.loading,
      isAuthenticatedUser: authState.isAuthenticatedUser,
      signUp,
      signIn,
      verifyAccount,
      completeCashierAuth,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};