import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cashierName: string) => void;
  title: string;
  description: string;
  loading?: boolean;
}

const CashierDialog: React.FC<CashierDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false
}) => {
  const [cashierName, setCashierName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashierName.trim()) {
      onConfirm(cashierName.trim());
      setCashierName('');
    }
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
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <Label htmlFor="cashierName" className="text-foreground">Cashier Name</Label>
            <Input
              id="cashierName"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="Enter cashier name"
              className="mt-1"
              required
              autoFocus
            />
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

export default CashierDialog;