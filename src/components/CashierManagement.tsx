import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Plus, Trash2, Settings } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

const CashierManagement: React.FC = () => {
  const { 
    adminSettings, 
    isAdminMode, 
    managedCashiers,
    cashierSignInMode,
    addManagedCashier,
    removeManagedCashier,
    setCashierSignInMode,
    loading 
  } = useAdmin();

  const [newCashierName, setNewCashierName] = useState('');
  const [addingCashier, setAddingCashier] = useState(false);

  const handleAddCashier = async () => {
    if (!newCashierName.trim()) return;
    
    setAddingCashier(true);
    try {
      await addManagedCashier(newCashierName.trim());
      setNewCashierName('');
    } catch (error) {
      console.error('Error adding cashier:', error);
    } finally {
      setAddingCashier(false);
    }
  };

  const handleRemoveCashier = async (cashierName: string) => {
    try {
      await removeManagedCashier(cashierName);
    } catch (error) {
      console.error('Error removing cashier:', error);
    }
  };

  const handleModeToggle = async (enabled: boolean) => {
    await setCashierSignInMode(enabled ? 'dropdown' : 'freetext');
  };

  if (!isAdminMode || !adminSettings) {
    return (
      <Card className="bg-card border-border opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">Cashier Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Admin access required to manage cashier settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5 text-primary" />
          <span>Cashier Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sign-In Mode Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Secure Sign-In Mode</p>
              <p className="text-xs text-muted-foreground">
                {cashierSignInMode === 'dropdown' 
                  ? 'Cashiers must select from pre-approved list' 
                  : 'Cashiers can enter any name (free text input)'
                }
              </p>
            </div>
            <Switch
              checked={cashierSignInMode === 'dropdown'}
              onCheckedChange={handleModeToggle}
              disabled={loading}
            />
          </div>
          
          {cashierSignInMode === 'dropdown' && managedCashiers.length === 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Secure mode is enabled but no cashiers are configured. Add cashiers below to allow sign-ins.
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Cashier List Management */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground">Approved Cashiers</h3>
            <Badge variant="outline" className="text-xs">
              {managedCashiers.length} cashier{managedCashiers.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Add New Cashier */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                placeholder="Enter cashier name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCashier()}
              />
            </div>
            <Button
              onClick={handleAddCashier}
              disabled={!newCashierName.trim() || addingCashier}
              size="sm"
            >
              {addingCashier ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Cashier List */}
          {managedCashiers.length > 0 ? (
            <div className="space-y-2">
              {managedCashiers.map((cashierName, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{cashierName}</span>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Cashier</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{cashierName}" from the approved cashier list? 
                          They will no longer be able to sign in using the dropdown mode.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveCashier(cashierName)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No cashiers configured yet</p>
              <p className="text-xs text-muted-foreground">Add cashier names above to build your approved list</p>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">How it works:</p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Secure Mode:</strong> Only pre-approved cashiers can sign in via dropdown</li>
                <li>• <strong>Free Text Mode:</strong> Anyone can enter their name manually</li>
                <li>• All sign-ins are tracked in the activity history</li>
                <li>• Switch between modes anytime based on your store's needs</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashierManagement;