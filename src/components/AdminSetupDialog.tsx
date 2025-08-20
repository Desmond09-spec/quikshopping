import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

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
    pin: '',
    confirmPin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.adminEmail || !formData.pin || !formData.confirmPin) {
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

    try {
      await setupAdmin(formData.adminEmail, formData.pin, formData.confirmPin);
      setFormData({ adminEmail: '', pin: '', confirmPin: '' });
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || 'Failed to setup admin');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ adminEmail: '', pin: '', confirmPin: '' });
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
              <p className="text-sm text-muted-foreground">Configure admin email and PIN</p>
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
              <span>Admin Email (for OTP fallback)</span>
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
              This email will be used for password reset via OTP
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
              disabled={loading || formData.pin !== formData.confirmPin || formData.pin.length < 4}
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