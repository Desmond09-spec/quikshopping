import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface EnhancedCashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cashierName: string) => void;
  title: string;
  description: string;
  loading?: boolean;
}

const EnhancedCashierDialog: React.FC<EnhancedCashierDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false
}) => {
  const { 
    cachedCashierNames, 
    addCachedCashierName, 
    isAdminMode, 
    managedCashiers, 
    cashierSignInMode 
  } = useAdmin();
  const [cashierName, setCashierName] = useState('');

  // Clear input when dialog opens
  useEffect(() => {
    if (open) {
      setCashierName('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashierName.trim()) {
      addCachedCashierName(cashierName.trim());
      onConfirm(cashierName.trim());
      setCashierName('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCashierName(suggestion);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCashierName('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-foreground">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </DialogHeader>
        
        {/* Quick Admin Action - Show when admin is signed in */}
        {isAdminMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <Button
                type="button"
                onClick={() => {
                  addCachedCashierName('admin');
                  onConfirm('admin');
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Continue as Admin</span>
                  </div>
                )}
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="cashierName" className="text-foreground">
              {isAdminMode ? 'Enter Different Name' : 'Cashier Name'}
            </Label>

            {/* Name Tags Section - Show when there are managed cashiers */}
            {managedCashiers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Quick select:</p>
                <div className="grid grid-cols-2 gap-2">
                  {managedCashiers.map((name, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={cashierName === name ? "default" : "outline"}
                      size="sm"
                      className="justify-center h-9"
                      onClick={() => handleSuggestionClick(name)}
                    >
                      <User className="w-3 h-3 mr-1" />
                      <span className="truncate text-xs">{name}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
                  </div>
                </div>
              </div>
            )}

            {/* Text Input - Always available */}
            <Input
              id="cashierName"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="Enter cashier name"
              required
              autoFocus={!isAdminMode && managedCashiers.length === 0}
            />

            {/* Recent names suggestions - only show in free text mode or for admin */}
            {(cashierSignInMode === 'freetext' || isAdminMode) && cachedCashierNames.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Recent names:</p>
                <div className="flex flex-wrap gap-2">
                  {cachedCashierNames.map((name, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                      onClick={() => handleSuggestionClick(name)}
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
              disabled={!cashierName.trim() || loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCashierDialog;