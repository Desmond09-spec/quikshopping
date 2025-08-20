import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ForgotPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

const ForgotPinDialog: React.FC<ForgotPinDialogProps> = ({
  open,
  onOpenChange,
  onBack
}) => {
  const { adminSettings, resetPin, loading } = useAdmin();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [formData, setFormData] = useState({
    email: adminSettings?.adminEmail || '',
    otp: '',
    newPin: '',
    confirmPin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) throw error;

      setStep('otp');
      toast({
        title: "OTP sent",
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'email'
      });

      if (error) throw error;

      setStep('reset');
      toast({
        title: "Email verified",
        description: "You can now set a new PIN.",
      });
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!/^\d{4,}$/.test(formData.newPin)) {
      setError('PIN must be at least 4 digits (numbers only)');
      return;
    }

    try {
      await resetPin(formData.newPin, formData.confirmPin);
      handleOpenChange(false);
    } catch (error: any) {
      setError(error.message || 'Failed to reset PIN');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('email');
      setFormData({
        email: adminSettings?.adminEmail || '',
        otp: '',
        newPin: '',
        confirmPin: ''
      });
      setError('');
      setShowPin(false);
      setShowConfirmPin(false);
    }
    onOpenChange(newOpen);
  };

  const handleBack = () => {
    if (step === 'email') {
      handleOpenChange(false);
      onBack();
    } else if (step === 'otp') {
      setStep('email');
      setError('');
    } else {
      setStep('otp');
      setError('');
    }
  };

  const getPinStrength = () => {
    const pin = formData.newPin;
    if (pin.length < 4) return { strength: 'weak', color: 'text-red-400' };
    if (pin.length < 6) return { strength: 'medium', color: 'text-yellow-400' };
    return { strength: 'strong', color: 'text-green-400' };
  };

  const { strength, color } = getPinStrength();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-foreground">
                {step === 'email' && 'Reset PIN'}
                {step === 'otp' && 'Verify Email'}
                {step === 'reset' && 'Set New PIN'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === 'email' && "We'll send a verification code to your email"}
                {step === 'otp' && 'Enter the code sent to your email'}
                {step === 'reset' && 'Choose a new PIN for admin access'}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Admin Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
                required
                autoFocus
                disabled={!!adminSettings?.adminEmail}
              />
              {adminSettings?.adminEmail && (
                <p className="text-xs text-muted-foreground">
                  OTP will be sent to your registered admin email
                </p>
              )}
            </div>

            <Button 
              type="submit"
              variant="default"
              className="w-full"
              disabled={otpLoading || !formData.email}
            >
              {otpLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Verification code sent to</p>
              <p className="text-sm text-foreground font-medium">{formData.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            <Button 
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading || !formData.otp}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>
        )}

        {/* Step 3: Reset PIN */}
        {step === 'reset' && (
          <form onSubmit={handleResetPin} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPin" className="text-foreground">New PIN</Label>
              <div className="relative">
                <Input
                  id="newPin"
                  type={showPin ? "text" : "password"}
                  value={formData.newPin}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPin: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Enter new 4+ digit PIN"
                  maxLength={8}
                  required
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {formData.newPin && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${formData.newPin.length >= 4 ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${formData.newPin.length >= 6 ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${formData.newPin.length >= 8 ? 'bg-green-400' : 'bg-gray-300'}`} />
                  </div>
                  <span className={`text-xs ${color} capitalize`}>{strength}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin" className="text-foreground">Confirm New PIN</Label>
              <div className="relative">
                <Input
                  id="confirmPin"
                  type={showConfirmPin ? "text" : "password"}
                  value={formData.confirmPin}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Confirm your PIN"
                  maxLength={8}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {formData.confirmPin && (
                <div className="flex items-center space-x-2">
                  {formData.newPin === formData.confirmPin ? (
                    <div className="flex items-center space-x-1 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-xs">PINs match</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-xs">PINs don't match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading || formData.newPin !== formData.confirmPin || formData.newPin.length < 4}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Resetting PIN...</span>
                </div>
              ) : (
                'Reset PIN'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPinDialog;