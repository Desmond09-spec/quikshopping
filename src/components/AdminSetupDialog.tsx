import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/phoneUtils';

interface AdminSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminSetupDialog: React.FC<AdminSetupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { setupAdmin, loading } = useAdmin();
  const [formData, setFormData] = useState({
    adminEmail: '',
    whatsappNumber: '',
    pin: '',
    confirmPin: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [customQuestion, setCustomQuestion] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalSecurityQuestion = formData.securityQuestion === 'custom' ? customQuestion : formData.securityQuestion;
    
    if (!formData.adminEmail || !formData.whatsappNumber || !formData.pin || !formData.confirmPin || !finalSecurityQuestion || !formData.securityAnswer) {
      setError('All fields are required');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!/^\d{4,}$/.test(formData.pin)) {
      setError('PIN must be at least 4 digits (numbers only)');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePhoneNumber(formData.whatsappNumber)) {
      setError('Please enter a valid WhatsApp number (e.g., 09012345678)');
      return;
    }

    try {
      const formattedNumber = formatPhoneNumber(formData.whatsappNumber);
      await setupAdmin(formData.adminEmail, formattedNumber, formData.pin, formData.confirmPin, finalSecurityQuestion, formData.securityAnswer);
      setFormData({ adminEmail: '', whatsappNumber: '', pin: '', confirmPin: '', securityQuestion: '', securityAnswer: '' });
      setCustomQuestion('');
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || 'Failed to setup admin');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ adminEmail: '', whatsappNumber: '', pin: '', confirmPin: '', securityQuestion: '', securityAnswer: '' });
      setCustomQuestion('');
      setError('');
      setShowPin(false);
      setShowConfirmPin(false);
    }
    onOpenChange(newOpen);
  };

  const getPinStrength = () => {
    const pin = formData.pin;
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
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Setup Admin Access</DialogTitle>
              <p className="text-sm text-muted-foreground">Configure admin email, security question and PIN</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-foreground flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Admin Email</span>
            </Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
              placeholder="admin@example.com"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This email will be used for admin notifications and PIN recovery
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber" className="text-foreground flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>WhatsApp Number</span>
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
              placeholder="09012345678 or +2349012345678"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your WhatsApp number (e.g., 09012345678) for notifications and recovery
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-foreground flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Admin PIN</span>
            </Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={formData.pin}
                onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                placeholder="Enter 4+ digit PIN"
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
            {formData.pin && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full ${formData.pin.length >= 4 ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <div className={`w-2 h-2 rounded-full ${formData.pin.length >= 6 ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <div className={`w-2 h-2 rounded-full ${formData.pin.length >= 8 ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
                <span className={`text-xs ${color} capitalize`}>{strength}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin" className="text-foreground">Confirm PIN</Label>
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
                {formData.pin === formData.confirmPin ? (
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

          <div className="space-y-2">
            <Label htmlFor="securityQuestion" className="text-foreground flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Security Question</span>
            </Label>
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
              disabled={loading || formData.pin !== formData.confirmPin || formData.pin.length < 4 || !formData.whatsappNumber || (!formData.securityQuestion || (formData.securityQuestion === 'custom' && !customQuestion)) || !formData.securityAnswer}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Setting up...</span>
                </div>
              ) : (
                'Setup Admin'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSetupDialog;