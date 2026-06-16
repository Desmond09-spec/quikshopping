import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Store {
  id: string;
  store_name: string;
  store_email: string | null;
  whatsapp_number: string | null;
  owner_user_id: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  store_id: string;
  role: 'owner' | 'manager' | 'cashier';
  is_active: boolean;
}

type Permission =
  | 'products:view'
  | 'products:write'
  | 'sales:write'
  | 'reports:view'
  | 'inventory:manage'
  | 'team:manage'
  | 'settings:manage';

interface StoreContextType {
  activeStore: Store | null;
  userRole: 'owner' | 'manager' | 'cashier' | null;
  stores: Store[];
  userRoles: UserRole[];
  setActiveStore: (storeId: string) => void;
  hasPermission: (permission: Permission) => boolean;
  loading: boolean;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const PERMISSIONS: Record<'owner' | 'manager' | 'cashier', Permission[]> = {
  owner: [
    'products:view',
    'products:write',
    'sales:write',
    'reports:view',
    'inventory:manage',
    'team:manage',
    'settings:manage',
  ],
  manager: [
    'products:view',
    'products:write',
    'sales:write',
    'reports:view',
    'inventory:manage',
  ],
  cashier: [
    'products:view',
    'sales:write',
    'reports:view',
  ],
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeStore, setActiveStoreState] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'manager' | 'cashier' | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!user) {
        setStores([]);
        setUserRoles([]);
        setActiveStoreState(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      setUserRoles(rolesData || []);

      // Get all stores user belongs to
      const storeIds = rolesData?.map(r => r.store_id) || [];

      if (storeIds.length === 0) {
        setStores([]);
        setActiveStoreState(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .in('id', storeIds);

      if (storesError) throw storesError;

      setStores(storesData || []);

      // Set active store from localStorage or default to first store
      const savedStoreId = localStorage.getItem('activeStoreId');
      const storeToActivate = savedStoreId && storesData?.find(s => s.id === savedStoreId)
        ? storesData.find(s => s.id === savedStoreId)
        : storesData?.[0];

      if (storeToActivate) {
        setActiveStoreState(storeToActivate);
        const role = rolesData?.find(r => r.store_id === storeToActivate.id);
        setUserRole(role?.role || null);
        localStorage.setItem('activeStoreId', storeToActivate.id);
      }

    } catch (error: any) {
      console.error('Error loading stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        // If we have a session, load stores. 
        // We pass the session's user to avoid a race condition with getUser()
        if (session?.user) {
          loadStores();
        }
      } else if (event === 'SIGNED_OUT') {
        setStores([]);
        setUserRoles([]);
        setActiveStoreState(null);
        setUserRole(null);
        setCurrentUser(null);
        localStorage.removeItem('activeStoreId');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setActiveStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setActiveStoreState(store);
      const role = userRoles.find(r => r.store_id === storeId);
      setUserRole(role?.role || null);
      localStorage.setItem('activeStoreId', storeId);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    // True demo mode: user is not signed in at all — grant full access
    if (!currentUser) return true;
    // Signed in but no store role assigned yet (e.g., onboarding) — deny
    if (!userRole) return false;
    return PERMISSIONS[userRole].includes(permission);
  };

  const refreshStores = async () => {
    setLoading(true);
    await loadStores();
  };

  return (
    <StoreContext.Provider
      value={{
        activeStore,
        userRole,
        stores,
        userRoles,
        setActiveStore,
        hasPermission,
        loading,
        refreshStores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
