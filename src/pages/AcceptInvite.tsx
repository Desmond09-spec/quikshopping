import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Store, UserCheck, Mail, Calendar, AlertCircle, Fingerprint, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import AccessDeniedPage from './AccessDeniedPage';
import { useStore } from '@/contexts/StoreContext';

interface InvitationDetails {
  email: string;
  role: 'owner' | 'manager' | 'cashier';
  store_name: string;
  invited_by_name: string;
  invited_by_email: string;
  expires_at: string;
  created_at: string;
}

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshStores, setActiveStore } = useStore();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'validate' | 'signin' | 'accept' | 'success'>('validate');

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { action: 'get_details', invitation_token: token },
      });

      if (error || !data || data.error) {
        setError('Invitation not found');
        setLoading(false);
        return;
      }

      if (data.accepted_at) {
        setError('This invitation has already been accepted');
        setLoading(false);
        return;
      }

      const expiresAt = data.expires_at || searchParams.get('expires_at');
      
      if (expiresAt && new Date(expiresAt) < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      setInvitation({
        email: data.email,
        role: data.role || (searchParams.get('role') as 'owner' | 'manager' | 'cashier'),
        store_name: data.stores?.store_name || searchParams.get('store_name') || 'the store',
        invited_by_name: data.invited_by_user?.raw_user_meta_data?.full_name || 'Store Owner',
        invited_by_email: data.invited_by_user?.email,
        expires_at: expiresAt || new Date().toISOString(),
        created_at: data.created_at,
      });

      // Check if user is already signed in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // If it's an email invite, verify emails match. If phone invite (email is null), let them through.
        if (data.email && user.email !== data.email) {
          setError(`This invitation is for ${data.email}. Please sign out and sign in with the correct account.`);
        } else {
          setStep('accept');
        }
      } else {
        setStep('signin');
      }

    } catch (err: any) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/accept-invite/${token}${window.location.search}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

    } catch (err: any) {
      console.error('Error signing in:', err);
      toast({
        title: 'Sign In Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) return;

    setAccepting(true);

    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { action: 'accept', invitation_token: token },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Explicitly set the newly joined store as the active store in localStorage
      // BEFORE refreshing, so loadStores will pick it up and switch the user to it automatically
      if (data && data.store_id) {
        localStorage.setItem('activeStoreId', data.store_id);
      }

      // Refresh the StoreContext to load the newly joined store
      await refreshStores();

      setStep('success');

      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#020303] text-zinc-100 flex items-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
        {/* --- BACKGROUND LAYER --- */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(2,6,23,0.8)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Distant volumetric fog */}
        <div className="absolute top-[10%] right-[10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[150px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite] pointer-events-none" />
        
        {/* Environmental Fog */}
        <div className="absolute inset-0 bg-[#020303]/30 backdrop-blur-[1px] z-0 pointer-events-none" />

        {/* --- MIDGROUND LAYER (Focal Point) --- */}
        <div className="absolute top-1/2 right-[-20%] md:right-[-10%] lg:right-[5%] -translate-y-1/2 w-[150vw] md:w-[80vw] lg:w-[50vw] max-w-[900px] aspect-square animate-[bounce_12s_ease-in-out_infinite] z-10 pointer-events-none">
          
          {/* Intense Volumetric Cyan Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-cyan-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-cyan-500/30 rounded-full blur-[60px] animate-pulse" />

          {/* The Data Sphere */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full bg-[#010304] shadow-[0_0_80px_rgba(6,182,212,0.6),inset_0_0_30px_rgba(6,182,212,0.2)] z-20 flex items-center justify-center border border-cyan-500/10">
             {/* Subtle internal Fingerprint Icon */}
             <Fingerprint className="w-1/3 h-1/3 text-cyan-400/80 drop-shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse" strokeWidth={0.5} />
          </div>

          {/* Swirling Data Energy */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-transparent via-cyan-400/40 to-blue-500/40 blur-[12px] z-10 animate-[spin_8s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-transparent via-cyan-500/30 to-transparent blur-[20px] z-10 animate-[spin_12s_linear_infinite_reverse]" />

          {/* Scanning Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[0.5px] border-cyan-500/20 rounded-full z-0 rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] border-t-[2px] border-cyan-400/30 rounded-full z-0 animate-[spin_15s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] border-[1px] border-dashed border-cyan-500/30 rounded-full z-0 animate-[spin_25s_linear_infinite_reverse]" />
          
          {/* Deep Light Ray */}
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[200%] h-[10px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent rotate-[-15deg] blur-[4px] z-30 opacity-60" />
        </div>

        {/* --- FOREGROUND LAYER (Particles) --- */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-40">
          <div className="absolute top-[30%] left-[20%] w-1 h-1 bg-cyan-200/60 rounded-full blur-[1px] animate-[pulse_3s_ease-in-out_infinite]" />
          <div className="absolute bottom-[40%] left-[45%] w-1.5 h-1.5 bg-cyan-400/40 rounded-full blur-[2px] animate-[pulse_5s_ease-in-out_infinite_1s]" />
        </div>

        {/* --- UI LAYER (Typography & Actions) --- */}
        <div className="relative z-30 w-full max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 grid grid-cols-12 gap-8 items-center h-full">
          {/* Left Third: Text Content */}
          <div className="col-span-12 lg:col-span-5 lg:col-start-1 flex flex-col space-y-10">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-zinc-50 leading-[1.05]">
                Authenticating
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 font-light max-w-md leading-relaxed">
                Establishing secure connection. Verifying invitation credentials through encrypted channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <AccessDeniedPage />;
  }

  if (!invitation) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-12 px-4">
        {step === 'signin' && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">You're Invited!</CardTitle>
              <CardDescription className="text-base mt-2">
                <strong>{invitation.invited_by_name}</strong> has invited you to join{' '}
                <strong>{invitation.store_name}</strong> as a <strong>{invitation.role}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  What you'll be able to do:
                </h3>
                <ul className="space-y-2 ml-7 text-sm">
                  {invitation.role === 'manager' ? (
                    <>
                      <li>✓ Manage products and inventory</li>
                      <li>✓ Process sales transactions</li>
                      <li>✓ View detailed reports</li>
                      <li>✓ Manage team members</li>
                    </>
                  ) : (
                    <>
                      <li>✓ Process customer transactions</li>
                      <li>✓ Scan barcodes (on terminal)</li>
                      <li>✓ View product inventory</li>
                      <li>✓ Access sales reports</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="font-semibold mb-2">Create Your Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To join the store, you need your own secure account. We use Google Sign-In for faster,
                  more secure authentication.
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• No passwords to remember</p>
                  <p>• Your actions are tracked to your account</p>
                  <p>• Enhanced security with Google</p>
                </div>
              </div>

              <Button onClick={handleGoogleSignIn} size="lg" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'accept' && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Finalize Your Invitation</CardTitle>
              <CardDescription className="text-base mt-2">
                You're signed in and ready to join the store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Store</p>
                    <p className="text-sm text-muted-foreground">{invitation.store_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Your Role</p>
                    <p className="text-sm text-muted-foreground capitalize">{invitation.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Invited By</p>
                    <p className="text-sm text-muted-foreground">{invitation.invited_by_name}</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAcceptInvitation} 
                size="lg" 
                className="w-full"
                disabled={accepting}
              >
                {accepting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Accepting...</span>
                  </div>
                ) : (
                  'Accept & Join Store'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-primary">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to {invitation.store_name}!</CardTitle>
              <CardDescription className="text-base mt-2">
                You've successfully joined as a {invitation.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-center text-muted-foreground">
                  Redirecting you to the dashboard...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AcceptInvite;
