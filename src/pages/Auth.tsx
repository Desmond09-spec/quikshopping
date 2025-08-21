import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ArrowLeft, LogIn, User, Shield } from 'lucide-react';

const Auth: React.FC = () => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'auth' | 'cashier'>('auth');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    signInName: ''
  });

  const { signUp, verifyAccount, completeCashierAuth, isAuthenticatedUser, user, logout } = useAuth();
  const { cashierSignInMode, managedCashiers, cachedCashierNames, addCachedCashierName } = useAdmin();
  const navigate = useNavigate();

  // Redirect if user is fully authenticated
  useEffect(() => {
    if (isAuthenticatedUser) {
      navigate('/');
    }
  }, [isAuthenticatedUser, navigate]);

  // Move to cashier step if account verified but not cashier authenticated
  useEffect(() => {
    if (user && !isAuthenticatedUser && step === 'auth') {
      setStep('cashier');
    }
  }, [user, isAuthenticatedUser, step]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.displayName);
      } else {
        // Always verify account first, then proceed to cashier step
        await verifyAccount(formData.email, formData.password);
        setStep('cashier');
      }
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleCashierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.signInName.trim()) return;

    setLoading(true);
    try {
      addCachedCashierName(formData.signInName.trim());
      await completeCashierAuth(formData.signInName.trim());
      navigate('/');
    } catch (error) {
      console.error('Cashier authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = step === 'auth' 
    ? formData.email && formData.password && (!isSignUp || (formData.displayName && passwordsMatch))
    : formData.signInName.trim().length > 0;

  const handleNameTagClick = (name: string) => {
    setFormData(prev => ({ ...prev, signInName: name }));
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {step === 'cashier' ? 'Select Your Identity' : (isSignUp ? 'Create Account' : 'Sign In')}
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {step === 'cashier' ? (
                  <>
                    <User className="w-5 h-5 text-primary" />
                    <span>Step 2: Cashier Identity</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-primary" />
                    <span>{isSignUp ? 'Sign Up' : 'Step 1: Account Verification'}</span>
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {step === 'cashier' 
                  ? 'Choose your cashier identity to complete sign in'
                  : (isSignUp 
                    ? 'Create a new account to save your products and categories'
                    : 'Enter your credentials to continue'
                  )
                }
              </CardDescription>
              {cashierSignInMode === 'dropdown' && step === 'cashier' && (
                <div className="flex items-center space-x-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Secure Sign-In Mode</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {step === 'auth' ? (
                <>
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {isSignUp ? (
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          placeholder="Enter your display name"
                          required
                        />
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {isSignUp && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {isSignUp && formData.confirmPassword && !passwordsMatch && (
                          <p className="text-sm text-destructive">Passwords do not match</p>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="premium"
                      className="w-full"
                      disabled={loading || !isFormValid}
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          {isSignUp ? 'Create Account' : 'Continue'}
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <Button
                      variant="link"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm"
                      disabled={loading}
                    >
                      {isSignUp 
                        ? 'Already have an account? Sign in'
                        : "Don't have an account? Sign up"
                      }
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleCashierSubmit} className="space-y-4">
                  {/* Name Tags - Show for both modes if cashiers exist */}
                  {managedCashiers.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Select your name:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {managedCashiers.map((name, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant={formData.signInName === name ? "default" : "outline"}
                            className="justify-center h-12"
                            onClick={() => handleNameTagClick(name)}
                          >
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span className="truncate">{name}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                      
                      {cashierSignInMode === 'freetext' && (
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Input - Show in freetext mode or when no managed cashiers */}
                  {(cashierSignInMode === 'freetext' || managedCashiers.length === 0) && (
                    <div className="space-y-2">
                      <Label htmlFor="cashierName" className="text-foreground">
                        {managedCashiers.length > 0 ? 'Or enter different name:' : 'Enter your name:'}
                      </Label>
                      <Input
                        id="cashierName"
                        type="text"
                        placeholder="Enter cashier name"
                        value={formData.signInName}
                        onChange={(e) => handleInputChange('signInName', e.target.value)}
                        required
                        autoFocus={managedCashiers.length === 0}
                        className="bg-background border-border"
                      />
                    </div>
                  )}

                  {/* Recent names suggestions - only in freetext mode */}
                  {cashierSignInMode === 'freetext' && cachedCashierNames.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Recent names:</p>
                      <div className="flex flex-wrap gap-2">
                        {cachedCashierNames.map((name, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs"
                            onClick={() => handleNameTagClick(name)}
                          >
                            {name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning for dropdown mode with no cashiers */}
                  {cashierSignInMode === 'dropdown' && managedCashiers.length === 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚠️ No approved cashiers configured. Contact admin to add cashiers or switch to free text mode.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="premium"
                    disabled={loading || !formData.signInName.trim() || (cashierSignInMode === 'dropdown' && managedCashiers.length === 0)}
                    className="w-full mt-6"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Complete Sign In
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="link"
                      onClick={async () => {
                        try {
                          await logout();
                          setStep('auth');
                        } catch (error) {
                          console.error('Error logging out:', error);
                          setStep('auth');
                        }
                      }}
                      disabled={loading}
                      className="text-sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Account Verification
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;