import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber, validatePhoneNumber, displayPhoneNumber } from '@/lib/phoneUtils';

interface WhatsAppNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onComplete?: () => void;
  title?: string;
  description?: string;
}

const WhatsAppNumberDialog: React.FC<WhatsAppNumberDialogProps> = ({
  open,
  onOpenChange,
  onBack,
  onComplete,
  title = "Add WhatsApp Number",
  description = "Add your WhatsApp number for PIN reset verification"
}) => {
  const { adminSettings, loadAdminSettings } = useAdmin();
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState(adminSettings?.whatsappNumber || '');
  const [displayNumber, setDisplayNumber] = useState(adminSettings?.whatsappNumber ? displayPhoneNumber(adminSettings.whatsappNumber) : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!whatsappNumber.trim()) {
      setError('WhatsApp number is required');
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(whatsappNumber)) {
      setError('Please enter a valid WhatsApp number (e.g., 09012345678 or +2349012345678)');
      setLoading(false);
      return;
    }

    const formattedNumber = formatPhoneNumber(whatsappNumber);

    try {
      // Use a function to update WhatsApp number
      const { data, error: updateError } = await supabase.functions.invoke('update-whatsapp-number', {
        body: { whatsappNumber: formattedNumber }
      });

      if (updateError) throw updateError;

      // Log the activity
      await supabase.from('activities').insert({
        user_id: adminSettings?.ownerUserId,
        type: 'whatsapp_number_updated',
        description: 'WhatsApp number configured for admin account',
        details: {
          whatsappNumber: formattedNumber,
          updatedAt: new Date().toISOString()
        }
      });

      // Reload admin settings to get the updated number
      await loadAdminSettings();

      toast({
        title: "WhatsApp number saved",
        description: "Your WhatsApp number has been configured for PIN reset.",
      });

      handleClose();
      onComplete?.();
    } catch (error: any) {
      console.error('Error updating WhatsApp number:', error);
      setError(error.message || 'Failed to save WhatsApp number');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWhatsappNumber(adminSettings?.whatsappNumber || '');
    setDisplayNumber(adminSettings?.whatsappNumber ? displayPhoneNumber(adminSettings.whatsappNumber) : '');
    setError('');
    onOpenChange(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWhatsappNumber(value);
    setDisplayNumber(value);
  };

  const handleBackClick = () => {
    if (onBack) {
      handleClose();
      onBack();
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
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
            <Label htmlFor="whatsappNumber" className="text-foreground flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>WhatsApp Number</span>
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={displayNumber}
              onChange={handleNumberChange}
              placeholder="09012345678 or +2349012345678"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter your WhatsApp number (e.g., 09012345678). We'll send verification codes here.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="default"
              className="flex-1"
              disabled={loading || !whatsappNumber.trim()}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Number'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppNumberDialog;