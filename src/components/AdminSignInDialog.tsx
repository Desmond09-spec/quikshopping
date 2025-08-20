import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface AdminSignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForgotPin: () => void;
}

const AdminSignInDialog: React.FC<AdminSignInDialogProps> = ({
  open,
  onOpenChange,
  onForgotPin
}) => {
  const { signInAdmin, loading, adminSettings } = useAdmin();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin) {
      setError('PIN is required');
      return;
    }

    if (!/^\d{4,}$/.test(pin)) {
      setError('Invalid PIN format');
      return;
    }

    try {
      await signInAdmin(pin);
      setPin('');
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPin('');
      setError('');
      setShowPin(false);
    }
    onOpenChange(newOpen);
  };

  const handleForgotPin = () => {
    handleOpenChange(false);
    onForgotPin();
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
              <DialogTitle className="text-foreground">Admin Sign In</DialogTitle>
              <p className="text-sm text-muted-foreground">Enter your PIN to access admin mode</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {adminSettings && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Admin Email</p>
              <p className="text-sm text-foreground font-medium">{adminSettings.adminEmail}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-foreground">Admin PIN</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your PIN"
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

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleForgotPin}
              className="text-primary hover:text-primary-hover"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Forgot PIN?
            </Button>
          </div>

          <div className="flex space-x-3">
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
              disabled={loading || !pin}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSignInDialog;