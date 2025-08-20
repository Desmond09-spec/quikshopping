import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminSettings {
  id: string;
  ownerUserId: string;
  adminEmail: string;
  deviceCacheEnabled: boolean;
  disableCashierDialog: boolean;
  requireAdminForProductActions: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  isAdminMode: boolean;
  adminSettings: AdminSettings | null;
  sessionToken: string | null;
  expiresAt: string | null;
  loading: boolean;
  cachedCashierNames: string[];
}

interface AdminContextType extends AdminState {
  setupAdmin: (adminEmail: string, pin: string, confirmPin: string) => Promise<void>;
  signInAdmin: (pin: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPin: (newPin: string, confirmPin: string) => Promise<void>;
  toggleCashierDialogDisabled: (disabled: boolean) => Promise<void>;
  toggleAdminProductRequirement: (require: boolean) => Promise<void>;
  addCachedCashierName: (name: string) => void;
  clearCachedCashierNames: () => void;
  isSessionValid: () => boolean;
  loadAdminSettings: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<AdminState>({
    isAdminMode: false,
    adminSettings: null,
    sessionToken: null,
    expiresAt: null,
    loading: false,
    cachedCashierNames: []
  });

  // Load admin settings when user changes
  useEffect(() => {
    if (user) {
      loadAdminSettings();
    } else {
      // Clear admin state when user logs out
      setState(prev => ({
        ...prev,
        isAdminMode: false,
        adminSettings: null,
        sessionToken: null,
        expiresAt: null,
        cachedCashierNames: []
      }));
    }
  }, [user]);

  // Check session validity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isAdminMode && !isSessionValid()) {
        signOutAdmin();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAdminMode, state.expiresAt]);

  const loadAdminSettings = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Query admin_settings table directly (with type assertion for now)
      const { data, error } = await (supabase as any)
        .from('admin_settings')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Admin settings not found, will need to be set up');
        setState(prev => ({ ...prev, adminSettings: null, loading: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        adminSettings: data ? {
          id: data.id,
          ownerUserId: data.owner_user_id,
          adminEmail: data.admin_email,
          deviceCacheEnabled: data.device_cache_enabled,
          disableCashierDialog: data.disable_cashier_dialog || false,
          requireAdminForProductActions: data.require_admin_for_product_actions || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } : null,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error loading admin settings:', error);
      setState(prev => ({ ...prev, adminSettings: null, loading: false }));
    }
  };

  const setupAdmin = async (adminEmail: string, pin: string, confirmPin: string) => {
    if (!user) throw new Error('User not authenticated');
    
    if (pin !== confirmPin) {
      throw new Error('PINs do not match');
    }

    if (!/^\d{4,}$/.test(pin)) {
      throw new Error('PIN must be at least 4 digits');
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.functions.invoke('admin-setup', {
        body: { adminEmail, pin }
      });

      if (error) throw error;

      toast({
        title: "Admin setup complete",
        description: "Admin settings have been configured successfully.",
      });

      // Reload admin settings
      await loadAdminSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup admin",
        variant: "destructive",
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signInAdmin = async (pin: string) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { pin }
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isAdminMode: true,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt,
        adminSettings: prev.adminSettings ? {
          ...prev.adminSettings,
          disableCashierDialog: data.adminSettings.disableCashierDialog || false,
          requireAdminForProductActions: data.adminSettings.requireAdminForProductActions || false,
          deviceCacheEnabled: data.adminSettings.deviceCacheEnabled
        } : prev.adminSettings,
        loading: false
      }));

      toast({
        title: "Admin mode activated",
        description: "You are now in admin mode.",
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Error",
        description: error.message || "Failed to sign in as admin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOutAdmin = async () => {
    if (!user || !state.sessionToken) return;

    try {
      // Log admin signout
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'admin_signout',
        description: 'Admin signed out',
        details: {
          signoutTime: new Date().toISOString(),
          sessionToken: state.sessionToken
        }
      });
    } catch (error) {
      console.error('Error logging admin signout:', error);
    }

    setState(prev => ({
      ...prev,
      isAdminMode: false,
      sessionToken: null,
      expiresAt: null,
      cachedCashierNames: [] // Clear cached names on signout
    }));

    toast({
      title: "Admin mode deactivated",
      description: "You have been signed out of admin mode.",
    });
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) throw error;

      toast({
        title: "OTP sent",
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPin = async (newPin: string, confirmPin: string) => {
    if (!user) throw new Error('User not authenticated');
    
    if (newPin !== confirmPin) {
      throw new Error('PINs do not match');
    }

    if (!/^\d{4,}$/.test(newPin)) {
      throw new Error('PIN must be at least 4 digits');
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-pin', {
        body: { newPin }
      });

      if (error) throw error;

      toast({
        title: "PIN reset successfully",
        description: "Your admin PIN has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset PIN",
        variant: "destructive",
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const toggleCashierDialogDisabled = async (disabled: boolean) => {
    if (!user || !state.adminSettings) return;

    try {
      // Update admin settings directly (with type assertion for now)
      const { error } = await (supabase as any)
        .from('admin_settings')
        .update({ disable_cashier_dialog: disabled })
        .eq('owner_user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        adminSettings: prev.adminSettings ? {
          ...prev.adminSettings,
          disableCashierDialog: disabled
        } : null
      }));

      // Log the toggle change
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'admin_settings_changed',
        description: `Cashier dialog ${disabled ? 'disabled' : 'enabled'}`,
        details: {
          settingChanged: 'disable_cashier_dialog',
          newValue: disabled,
          changedBy: state.adminSettings?.adminEmail || 'Admin'
        }
      });

      toast({
        title: "Settings updated",
        description: `Cashier dialog modal ${disabled ? 'disabled' : 'enabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const toggleAdminProductRequirement = async (require: boolean) => {
    if (!user || !state.adminSettings) return;

    try {
      // Update admin settings directly (with type assertion for now)
      const { error } = await (supabase as any)
        .from('admin_settings')
        .update({ require_admin_for_product_actions: require })
        .eq('owner_user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        adminSettings: prev.adminSettings ? {
          ...prev.adminSettings,
          requireAdminForProductActions: require
        } : null
      }));

      // Log the toggle change
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'admin_settings_changed',
        description: `Admin product requirement ${require ? 'enabled' : 'disabled'}`,
        details: {
          settingChanged: 'require_admin_for_product_actions',
          newValue: require,
          changedBy: state.adminSettings?.adminEmail || 'Admin'
        }
      });

      toast({
        title: "Settings updated",
        description: `Admin requirement for product actions ${require ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const addCachedCashierName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName && !state.cachedCashierNames.includes(trimmedName)) {
      setState(prev => ({
        ...prev,
        cachedCashierNames: [trimmedName, ...prev.cachedCashierNames.slice(0, 4)] // Keep max 5 names
      }));
    }
  };

  const clearCachedCashierNames = () => {
    setState(prev => ({
      ...prev,
      cachedCashierNames: []
    }));
  };

  const isSessionValid = () => {
    if (!state.expiresAt) return false;
    return new Date() < new Date(state.expiresAt);
  };

  return (
    <AdminContext.Provider value={{
      ...state,
      setupAdmin,
      signInAdmin,
      signOutAdmin,
      requestPasswordReset,
      resetPin,
      toggleCashierDialogDisabled,
      toggleAdminProductRequirement,
      addCachedCashierName,
      clearCachedCashierNames,
      isSessionValid,
      loadAdminSettings
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};