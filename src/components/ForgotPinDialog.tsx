import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, HelpCircle } from 'lucide-react';
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
  const [step, setStep] = useState<'email' | 'security' | 'reset'>('email');
  const [formData, setFormData] = useState({
    email: adminSettings?.adminEmail || '',
    securityAnswer: '',
    newPin: '',
    confirmPin: ''
  });
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailLoading(true);

    try {
      // Get admin settings to retrieve security question
      const { data: settings, error } = await supabase
        .from('admin_settings')
        .select('security_question, admin_email')
        .eq('admin_email', formData.email)
        .single();

      if (error || !settings) {
        setError('Admin account not found with this email address');
        return;
      }

      if (!settings.security_question) {
        setError('Security question not configured for this account');
        return;
      }

      setSecurityQuestion(settings.security_question);
      setStep('security');
    } catch (error: any) {
      setError(error.message || 'Failed to verify email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifySecurityAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifyLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-security-answer', {
        body: { 
          adminEmail: formData.email,
          securityAnswer: formData.securityAnswer,
          newPin: formData.newPin
        }
      });

      if (error) throw error;

      toast({
        title: "PIN reset successfully",
        description: "Your admin PIN has been updated.",
      });
      
      handleOpenChange(false);
    } catch (error: any) {
      // Handle specific error messages for better UX
      if (error.message?.includes('Too many failed attempts')) {
        setError(error.message);
      } else if (error.message?.includes('Incorrect security answer')) {
        setError(error.message);
      } else if (error.message?.includes('Admin not configured')) {
        setError('Admin account not found. Please contact support.');
      } else if (error.message?.includes('Email does not match')) {
        setError('Email does not match your admin account.');
      } else {
        setError(error.message || 'Failed to reset PIN');
      }
    } finally {
      setVerifyLoading(false);
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

    // Proceed to verification step
    setStep('reset');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('email');
      setFormData({
        email: adminSettings?.adminEmail || '',
        securityAnswer: '',
        newPin: '',
        confirmPin: ''
      });
      setSecurityQuestion('');
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
    } else if (step === 'security') {
      setStep('email');
      setError('');
    } else {
      setStep('security');
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
              {step === 'email' && <Lock className="w-6 h-6 text-destructive" />}
              {step === 'security' && <HelpCircle className="w-6 h-6 text-primary" />}
              {step === 'reset' && <Lock className="w-6 h-6 text-destructive" />}
            </div>
            <div>
              <DialogTitle className="text-foreground">
                {step === 'email' && 'Reset PIN'}
                {step === 'security' && 'Answer Security Question'}
                {step === 'reset' && 'Set New PIN'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === 'email' && 'Enter your admin email to start the reset process'}
                {step === 'security' && 'Answer your security question to reset your PIN'}
                {step === 'reset' && 'Enter your security answer and new PIN'}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
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
                placeholder="Enter your admin email"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the email address associated with your admin account
              </p>
            </div>

            <Button 
              type="submit"
              variant="default"
              className="w-full"
              disabled={emailLoading || !formData.email}
            >
              {emailLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Security Question */}
        {step === 'security' && (
          <form onSubmit={handleResetPin} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Security question for</p>
              <p className="text-sm text-foreground font-medium">{formData.email}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Security Question</Label>
              <div className="p-3 bg-muted/20 border rounded-lg">
                <p className="text-sm text-foreground">{securityQuestion}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityAnswer" className="text-foreground">Your Answer</Label>
              <Input
                id="securityAnswer"
                type="text"
                value={formData.securityAnswer}
                onChange={(e) => setFormData(prev => ({ ...prev, securityAnswer: e.target.value }))}
                placeholder="Enter your answer"
                required
                autoFocus
              />
            </div>

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
              disabled={!formData.securityAnswer || formData.newPin !== formData.confirmPin || formData.newPin.length < 4}
            >
              Next Step
            </Button>
          </form>
        )}

        {/* Step 3: Reset Confirmation */}
        {step === 'reset' && (
          <form onSubmit={handleVerifySecurityAnswer} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Confirm PIN Reset</h4>
              <p className="text-xs text-muted-foreground mb-2">
                You are about to reset your admin PIN for:
              </p>
              <p className="text-sm font-medium text-foreground">{formData.email}</p>
            </div>

            <div className="p-3 bg-muted/20 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Security Question:</p>
              <p className="text-sm text-foreground">{securityQuestion}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-1">Your Answer:</p>
              <p className="text-sm text-foreground">{formData.securityAnswer}</p>
            </div>

            <div className="p-3 bg-muted/20 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">New PIN:</p>
              <p className="text-sm text-foreground">{'●'.repeat(formData.newPin.length)} ({formData.newPin.length} digits)</p>
            </div>

            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('security')}
                disabled={verifyLoading}
              >
                Back
              </Button>
              <Button 
                type="submit"
                variant="default"
                className="flex-1"
                disabled={verifyLoading}
              >
                {verifyLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </div>
                ) : (
                  'Reset PIN'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPinDialog;