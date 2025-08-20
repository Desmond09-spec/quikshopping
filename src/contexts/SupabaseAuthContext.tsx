import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string, signInName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
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

      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email to verify your account.",
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get the session after successful sign in
      const { data: { session } } = await supabase.auth.getSession();

      // Log sign-in activity
      if (signInName && session?.user) {
        await supabase
          .from('activities')
          .insert({
            user_id: session.user.id,
            type: 'sign_in',
            description: `${signInName} signed in`,
            details: {
              userName: signInName,
              email: email
            }
          });
      }

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
      signUp,
      signIn,
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