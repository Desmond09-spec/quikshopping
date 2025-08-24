import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const SecurityQuestionDialog: React.FC<SecurityQuestionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    currentPin: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [customQuestion, setCustomQuestion] = useState('');
  const [currentSettings, setCurrentSettings] = useState<any>(null);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current admin settings when dialog opens
  useEffect(() => {
    if (open && user) {
      loadCurrentSettings();
    }
  }, [open, user]);

  const loadCurrentSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('admin_settings')
        .select('security_question')
        .eq('owner_user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading admin settings:', error);
        return;
      }

      setCurrentSettings(data);
    } catch (error) {
      console.error('Error loading current settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalSecurityQuestion = formData.securityQuestion === 'custom' ? customQuestion : formData.securityQuestion;
    
    if (!formData.currentPin || !finalSecurityQuestion || !formData.securityAnswer) {
      setError('All fields are required');
      return;
    }

    if (!/^\d{4,}$/.test(formData.currentPin)) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);

    try {
      // Verify current PIN first
      const { error: verifyError } = await supabase.functions.invoke('admin-verify', {
        body: { pin: formData.currentPin }
      });

      if (verifyError) {
        setError('Invalid current PIN');
        setLoading(false);
        return;
      }

      // Update security question
      const { error: updateError } = await supabase.functions.invoke('update-security-question', {
        body: { 
          currentPin: formData.currentPin,
          securityQuestion: finalSecurityQuestion, 
          securityAnswer: formData.securityAnswer 
        }
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Security question updated",
        description: "Your security question has been updated successfully.",
      });

      setFormData({ currentPin: '', securityQuestion: '', securityAnswer: '' });
      setCustomQuestion('');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update security question');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ currentPin: '', securityQuestion: '', securityAnswer: '' });
      setCustomQuestion('');
      setError('');
      setShowPin(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-foreground">
                {currentSettings?.security_question ? 'Update Security Question' : 'Set Security Question'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Configure security question for PIN recovery
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {currentSettings?.security_question && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Security Question</p>
              <p className="text-sm font-medium text-foreground">{currentSettings.security_question}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPin" className="text-foreground">Current Admin PIN</Label>
            <div className="relative">
              <Input
                id="currentPin"
                type={showPin ? "text" : "password"}
                value={formData.currentPin}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPin: e.target.value.replace(/\D/g, '') }))}
                placeholder="Enter your current PIN"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityQuestion" className="text-foreground">Security Question</Label>
            <Select
              value={formData.securityQuestion}
              onValueChange={(value) => setFormData(prev => ({ ...prev, securityQuestion: value }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a security question..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mother_maiden_name">What is your mother's maiden name?</SelectItem>
                <SelectItem value="first_pet_name">What was the name of your first pet?</SelectItem>
                <SelectItem value="elementary_school">What elementary school did you attend?</SelectItem>
                <SelectItem value="childhood_friend">What is the name of your childhood best friend?</SelectItem>
                <SelectItem value="birth_city">What city were you born in?</SelectItem>
                <SelectItem value="favorite_teacher">Who was your favorite teacher?</SelectItem>
                <SelectItem value="business_registration">What year was your business registered?</SelectItem>
                <SelectItem value="custom">Custom question (enter below)</SelectItem>
              </SelectContent>
            </Select>
            {formData.securityQuestion === 'custom' && (
              <Input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Enter your custom security question"
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityAnswer" className="text-foreground">Security Answer</Label>
            <Input
              id="securityAnswer"
              type="text"
              value={formData.securityAnswer}
              onChange={(e) => setFormData(prev => ({ ...prev, securityAnswer: e.target.value }))}
              placeholder="Enter your answer"
              required
            />
            <p className="text-xs text-muted-foreground">
              This answer will be used to verify your identity when resetting your PIN
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="default"
              className="flex-1"
              disabled={loading || !formData.currentPin || (!formData.securityQuestion || (formData.securityQuestion === 'custom' && !customQuestion)) || !formData.securityAnswer}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                currentSettings?.security_question ? 'Update Question' : 'Set Question'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityQuestionDialog;