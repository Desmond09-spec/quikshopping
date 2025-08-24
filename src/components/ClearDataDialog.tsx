import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ClearDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClearDataDialog: React.FC<ClearDataDialogProps> = ({ open, onOpenChange }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [confirmation, setConfirmation] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const expectedConfirmation = 'DELETE ALL MY DATA';

  const handleClearData = async () => {
    if (!user || confirmation !== expectedConfirmation) return;

    setIsClearing(true);
    try {
      // Call the clear_user_data function
      const { data, error } = await supabase.rpc('clear_user_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Data cleared successfully",
        description: "All your data has been permanently deleted. You will be signed out.",
      });

      // Sign out the user after clearing data
      setTimeout(async () => {
        await logout();
      }, 2000);

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClose = () => {
    if (!isClearing) {
      setConfirmation('');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-card border-border max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>Clear All Data</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="text-muted-foreground">
              This action will permanently delete ALL of your data from QuikShopping, including:
            </p>
            
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="font-medium">All products and categories</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="font-medium">All sales transactions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="font-medium">All activity history</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="font-medium">Admin settings and configurations</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="font-medium">All cashier management data</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-600 font-medium text-sm">
                ⚠️ This action cannot be undone. All data will be permanently lost.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-sm font-medium">
                Type <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{expectedConfirmation}</code> to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type the confirmation text exactly as shown"
                className="font-mono text-sm"
                disabled={isClearing}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="space-x-2">
          <AlertDialogCancel 
            onClick={handleClose}
            disabled={isClearing}
            className="border-border"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleClearData}
            disabled={confirmation !== expectedConfirmation || isClearing}
            variant="destructive"
            className="min-w-[120px]"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearDataDialog;