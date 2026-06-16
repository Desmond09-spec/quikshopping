import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';
import { useStore } from './StoreContext';
import { useCart } from './CartContext';
import { useToast } from '@/hooks/use-toast';
import { Product, Category, ActivityLog } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  transactions: any[];
  activityLogs: ActivityLog[];
  loading: boolean;
  categoriesLoading: boolean;
  productsLoading: boolean;
  isSyncing: boolean;
}

interface ProductContextType extends ProductState {
  addProduct: (product: Omit<Product, 'id'>, cashierName?: string) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>, cashierName?: string) => Promise<void>;
  deleteProduct: (id: string, cashierName?: string) => Promise<void>;
  updateProductQuantity: (id: string, change: number, silent?: boolean) => Promise<void>;
  addTransaction: (transaction: any) => Promise<void>;
  addCategory: (name: string, cashierName?: string) => Promise<void>;
  editCategory: (id: string, name: string, cashierName?: string) => Promise<void>;
  deleteCategory: (id: string, cashierName?: string) => Promise<void>;
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
  uploadProductImage: (file: File, productId?: string) => Promise<string>;
  loadProducts: (force?: boolean) => Promise<void>;
  loadTransactions: (force?: boolean) => Promise<void>;
  loadActivities: (force?: boolean) => Promise<void>;
  isInitialLoading: boolean;
}

// Demo data (same as before for unauthenticated users)
const demoCategories: Category[] = [
  { id: '1', name: 'Drinks' },
  { id: '2', name: 'Groceries' },
  { id: '3', name: 'Essentials' },
  { id: '4', name: 'Snacks' },
  { id: '5', name: 'Personal Care' },
  { id: '6', name: 'Household' },
  { id: '7', name: 'Electronics' },
  { id: '8', name: 'Other' }
];

const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone',
    price: 599.99,
    quantity: 25,
    category: 'Electronics',
    imageUrl: '',
    description: 'Latest model smartphone with advanced features'
  },
  {
    id: '2',
    name: 'Laptop',
    price: 999.99,
    quantity: 15,
    category: 'Electronics',
    imageUrl: '',
    description: 'High-performance laptop for work and gaming'
  },
  {
    id: '3',
    name: 'T-Shirt',
    price: 19.99,
    quantity: 50,
    category: 'Clothing',
    imageUrl: '',
    description: 'Comfortable cotton t-shirt'
  },
  {
    id: '4',
    name: 'Jeans',
    price: 49.99,
    quantity: 30,
    category: 'Clothing',
    imageUrl: '',
    description: 'Premium denim jeans'
  },
  {
    id: '5',
    name: 'Coffee Maker',
    price: 79.99,
    quantity: 20,
    category: 'Home & Garden',
    imageUrl: '',
    description: 'Automatic drip coffee maker'
  },
  {
    id: '6',
    name: 'Garden Hose',
    price: 29.99,
    quantity: 15,
    category: 'Home & Garden',
    imageUrl: '',
    description: 'Flexible garden hose'
  }
];

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { activeStore } = useStore();
  const { toast } = useToast();

  // Separate state for demo mode and authenticated mode
  const [demoState, setDemoState] = useState<ProductState>({
    products: demoProducts,
    categories: demoCategories,
    transactions: [],
    activityLogs: [],
    loading: false,
    categoriesLoading: false,
    productsLoading: false,
    isSyncing: false
  });

  const [authenticatedState, setAuthenticatedState] = useState<ProductState>({
    products: [],
    categories: [],
    transactions: [],
    activityLogs: [],
    loading: false,
    categoriesLoading: false,
    productsLoading: false,
    isSyncing: false
  });

  // Determine which state to use
  const currentState = user ? authenticatedState : demoState;
  const setCurrentState = user ? setAuthenticatedState : setDemoState;

  // Computed loading state - true if either categories or products are loading on initial load
  const isInitialLoading = user && (currentState.categoriesLoading || currentState.productsLoading);

  // App focus/visibility change handler for data refresh
  useEffect(() => {
    if (!user || !activeStore?.id) return;

    // Initial load
    loadProducts();

    // Subscribe to realtime changes for products
    const productsChannel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `store_id=eq.${activeStore?.id}`
        },
        (payload) => {
          console.log('🔄 Realtime products update:', payload);
          handleRealtimeProductUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to realtime changes for transactions
    const transactionsChannel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `store_id=eq.${activeStore?.id}`
        },
        (payload) => {
          console.log('🔄 Realtime transactions update:', payload);
          handleRealtimeTransactionUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to realtime changes for activities
    const activitiesChannel = supabase
      .channel('public:activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `store_id=eq.${activeStore?.id}`
        },
        (payload) => {
          console.log('🔄 Realtime activities update:', payload);
          handleRealtimeActivityUpdate(payload);
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App regained focus - refresh all data to keep it in sync
        Promise.all([
          loadCategories(),
          // Products are handled by realtime, but we can force refresh if needed
          currentState.transactions.length > 0 ? loadTransactions() : Promise.resolve(),
          currentState.activityLogs.length > 0 ? loadActivities() : Promise.resolve()
        ]).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [user]);

  const handleRealtimeProductUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Show syncing indicator
    setAuthenticatedState(prev => ({ ...prev, isSyncing: true }));

    // Hide after delay
    setTimeout(() => {
      setAuthenticatedState(prev => ({ ...prev, isSyncing: false }));
    }, 1000);

    setAuthenticatedState(prev => {
      let updatedProducts = [...prev.products];

      if (eventType === 'INSERT') {
        const categoryName = prev.categories.find(c => c.id === newRecord.category_id)?.name || 'Uncategorized';
        const newProduct: Product = {
          id: newRecord.id,
          name: newRecord.name,
          price: Number(newRecord.price),
          quantity: newRecord.quantity,
          category: categoryName,
          imageUrl: newRecord.image_url || '',
          description: newRecord.description || '',
          barcode: newRecord.barcode || ''
        };
        updatedProducts.push(newProduct);
        updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
      } else if (eventType === 'UPDATE') {
        const index = updatedProducts.findIndex(p => p.id === newRecord.id);
        if (index !== -1) {
          const categoryName = prev.categories.find(c => c.id === newRecord.category_id)?.name || 'Uncategorized';
          updatedProducts[index] = {
            ...updatedProducts[index],
            name: newRecord.name,
            price: Number(newRecord.price),
            quantity: newRecord.quantity,
            category: categoryName,
            imageUrl: newRecord.image_url || '',
            description: newRecord.description || '',
            barcode: newRecord.barcode || ''
          };
        }
      } else if (eventType === 'DELETE') {
        updatedProducts = updatedProducts.filter(p => p.id !== oldRecord.id);
      }

      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const handleRealtimeTransactionUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Show syncing indicator
    setAuthenticatedState(prev => ({ ...prev, isSyncing: true }));

    setTimeout(() => {
      setAuthenticatedState(prev => ({ ...prev, isSyncing: false }));
    }, 1000);

    setAuthenticatedState(prev => {
      let updatedTransactions = [...prev.transactions];

      if (eventType === 'INSERT') {
        const newTransaction = {
          id: newRecord.id,
          items: newRecord.items,
          total: Number(newRecord.total),
          paymentMethod: newRecord.payment_method,
          cashierName: newRecord.cashier_name,
          customer: newRecord.customer,
          timestamp: new Date(newRecord.created_at)
        };
        updatedTransactions.unshift(newTransaction); // Add to beginning
      } else if (eventType === 'DELETE') {
        updatedTransactions = updatedTransactions.filter(t => t.id !== oldRecord.id);
      }

      return {
        ...prev,
        transactions: updatedTransactions
      };
    });
  };

  const handleRealtimeActivityUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Show syncing indicator
    setAuthenticatedState(prev => ({ ...prev, isSyncing: true }));

    setTimeout(() => {
      setAuthenticatedState(prev => ({ ...prev, isSyncing: false }));
    }, 1000);

    setAuthenticatedState(prev => {
      let updatedActivities = [...prev.activityLogs];

      if (eventType === 'INSERT') {
        const newActivity = {
          id: newRecord.id,
          type: newRecord.type,
          description: newRecord.description,
          metadata: newRecord.metadata,
          timestamp: new Date(newRecord.created_at)
        };
        updatedActivities.unshift(newActivity); // Add to beginning
      } else if (eventType === 'DELETE') {
        updatedActivities = updatedActivities.filter(a => a.id !== oldRecord.id);
      }

      return {
        ...prev,
        activityLogs: updatedActivities
      };
    });
  };

  // Reset and initialize state when user changes (account switching)
  useEffect(() => {
    if (user && !authLoading) {
      // Reset authenticated state when switching accounts
      setAuthenticatedState({
        products: [],
        categories: [],
        transactions: [],
        activityLogs: [],
        loading: true,
        categoriesLoading: true,
        productsLoading: false,
        isSyncing: false
      });

      // Load categories first, then products (which depend on categories)
      // This prevents products from getting 'Uncategorized' due to race condition
      loadCategories().then(() => {
        // Only load products after categories are ready
        return Promise.all([
          loadProducts(),      // Products now have correct categories
          loadTransactions(), // Always load transaction history
          loadActivities()    // Always load activity history
        ]);
      }).catch(console.error);
    } else if (!user && !authLoading) {
      // User logged out - ensure authenticated state is cleared
      setAuthenticatedState({
        products: [],
        categories: [],
        transactions: [],
        activityLogs: [],
        loading: false,
        categoriesLoading: false,
        productsLoading: false,
        isSyncing: false
      });
    }
  }, [user, authLoading, activeStore?.id]);

  // Load only categories initially
  const loadCategories = async () => {
    if (!user || !activeStore?.id) return;

    setAuthenticatedState(prev => ({ ...prev, categoriesLoading: true }));

    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', activeStore?.id)
        .order('name');

      if (categoriesError) throw categoriesError;

      let transformedCategories: Category[] = categories.map(cat => ({
        id: cat.id,
        name: cat.name
      }));

      // Ensure "Other" category always exists
      const hasOtherCategory = transformedCategories.some(cat => cat.name === 'Other');
      if (!hasOtherCategory) {
        try {
          const { data: otherCategory, error: otherError } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              store_id: activeStore?.id,
              name: 'Other'
            })
            .select()
            .single();

          if (!otherError && otherCategory) {
            transformedCategories.push({
              id: otherCategory.id,
              name: otherCategory.name
            });
          }
        } catch (otherCategoryError) {
          console.warn('Could not create Other category:', otherCategoryError);
        }
      }

      setAuthenticatedState(prev => ({
        ...prev,
        categories: transformedCategories,
        categoriesLoading: false,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error loading categories:', error);
      setAuthenticatedState(prev => ({
        ...prev,
        categoriesLoading: false,
        loading: false
      }));
    }
  };

  // Load products on-demand with retry logic
  const loadProducts = async (force = false, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds base delay

    if (!user || !activeStore?.id) return;

    setAuthenticatedState(prev => ({ ...prev, productsLoading: true, loading: true }));

    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*') // Removed JOIN
        .eq('store_id', activeStore?.id)
        .order('name');

      if (productsError) throw productsError;

      const transformedProducts: Product[] = products.map(prod => ({
        id: prod.id,
        name: prod.name,
        price: Number(prod.price),
        quantity: prod.quantity,
        category: authenticatedState.categories.find(c => c.id === prod.category_id)?.name || 'Uncategorized',
        imageUrl: prod.image_url || '',
        description: prod.description || '',
        barcode: (prod as any).barcode || ''
      }));

      console.log(`✅ Products loaded successfully: ${transformedProducts.length} products`);

      // First, update products array while keeping loading state true
      // This ensures products are in state before we hide the loading spinner
      setAuthenticatedState(prev => ({
        ...prev,
        products: transformedProducts
      }));

      // Then, in a separate update, set loading to false
      // This prevents the brief flash of "No products yet" message
      setAuthenticatedState(prev => ({
        ...prev,
        productsLoading: false,
        loading: false
      }));
    } catch (error: any) {
      console.error(`❌ Error loading products (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`🔄 Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return loadProducts(force, retryCount + 1);
      }

      // Max retries reached, show error to user
      toast({
        title: "Error loading products",
        description: `${error.message}. Please pull to refresh to try again.`,
        variant: "destructive",
      });
      setAuthenticatedState(prev => ({
        ...prev,
        productsLoading: false,
        loading: false
      }));
    }
  };

  // Load transactions on-demand
  const loadTransactions = async (force = false) => {
    if (!user || !activeStore?.id) return;

    try {
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('store_id', activeStore?.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      const transformedTransactions = transactions.map(trans => ({
        id: trans.id,
        items: trans.items,
        total: Number(trans.total),
        paymentMethod: trans.payment_method,
        cashierName: trans.cashier_name,
        customer: trans.customer,
        timestamp: new Date(trans.created_at)
      }));

      setAuthenticatedState(prev => ({
        ...prev,
        transactions: transformedTransactions
      }));
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error loading transactions",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load activities on-demand
  const loadActivities = async (force = false) => {
    if (!user || !activeStore?.id) return;

    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('store_id', activeStore?.id)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      const transformedActivities: ActivityLog[] = activities.map(act => ({
        id: act.id,
        type: act.type,
        description: act.description,
        details: act.details,
        timestamp: new Date(act.created_at)
      }));

      setAuthenticatedState(prev => ({
        ...prev,
        activityLogs: transformedActivities
      }));
    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast({
        title: "Error loading activities",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadProductImage = async (file: File, productId?: string): Promise<string> => {
    if (!user) {
      // In demo mode, return a placeholder URL
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${productId || 'temp'}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>, cashierName?: string) => {
    if (!user) {
      // Demo mode - add to local state
      const newProduct: Product = {
        ...product,
        id: Date.now().toString()
      };
      setDemoState(prev => ({
        ...prev,
        products: [...prev.products, newProduct]
      }));

      toast({
        title: "Product added",
        description: `${product.name} has been added to your inventory (demo mode).`,
      });
      return;
    }

    // If products haven't been loaded yet, load them first to ensure consistency
    if (authenticatedState.products.length === 0 && !authenticatedState.productsLoading) {
      await loadProducts();
    }

    // Use optimistic update pattern for better performance
    const tempProduct: Product = {
      ...product,
      id: `temp_${Date.now()}`
    };

    // Optimistically update UI
    setAuthenticatedState(prev => ({
      ...prev,
      products: [...prev.products, tempProduct]
    }));

    try {
      // Find category ID
      const category = authenticatedState.categories.find(cat => cat.name === product.category);

      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          store_id: activeStore?.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          category_id: category?.id,
          image_url: product.imageUrl,
          description: product.description
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp product with real one
      setAuthenticatedState(prev => ({
        ...prev,
        products: prev.products.map(p =>
          p.id === tempProduct.id
            ? {
              id: data.id,
              name: data.name,
              price: Number(data.price),
              quantity: data.quantity,
              category: category?.name || 'Uncategorized',
              imageUrl: data.image_url || '',
              description: data.description || ''
            }
            : p
        )
      }));

      // Log activity
      await logActivity({
        type: 'product_added',
        description: `Product added: ${product.name}`,
        details: {
          productName: product.name,
          price: `₦${product.price.toLocaleString()}`,
          quantity: product.quantity,
          category: product.category,
          cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown'
        }
      });

      toast({
        title: "Product added",
        description: `${product.name} has been added to your inventory.`,
      });
    } catch (error: any) {
      // Revert optimistic update
      setAuthenticatedState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== tempProduct.id)
      }));

      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>, cashierName?: string) => {
    if (!user) {
      // Demo mode
      setDemoState(prev => ({
        ...prev,
        products: prev.products.map(p =>
          p.id === id ? { ...p, ...product } : p
        )
      }));

      toast({
        title: "Product updated",
        description: "Product has been updated (demo mode).",
      });
      return;
    }

    // Optimistic update
    const originalProduct = authenticatedState.products.find(p => p.id === id);
    if (originalProduct) {
      setAuthenticatedState(prev => ({
        ...prev,
        products: prev.products.map(p =>
          p.id === id ? { ...p, ...product } : p
        )
      }));
    }

    try {
      const category = product.category ?
        authenticatedState.categories.find(cat => cat.name === product.category) : null;

      const updateData: any = {};
      if (product.name !== undefined) updateData.name = product.name;
      if (product.price !== undefined) updateData.price = product.price;
      if (product.quantity !== undefined) updateData.quantity = product.quantity;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.imageUrl !== undefined) updateData.image_url = product.imageUrl;
      if (category) updateData.category_id = category.id;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .eq('store_id', activeStore?.id);

      if (error) throw error;

      // Log activity with changes
      const changes: string[] = [];
      if (product.name !== undefined && originalProduct?.name !== product.name) {
        changes.push(`Name: ${originalProduct?.name} → ${product.name}`);
      }
      if (product.price !== undefined && originalProduct?.price !== product.price) {
        changes.push(`Price: ₦${originalProduct?.price.toLocaleString()} → ₦${product.price.toLocaleString()}`);
      }
      if (product.quantity !== undefined && originalProduct?.quantity !== product.quantity) {
        changes.push(`Quantity: ${originalProduct?.quantity} → ${product.quantity}`);
      }
      if (product.category !== undefined && originalProduct?.category !== product.category) {
        changes.push(`Category: ${originalProduct?.category} → ${product.category}`);
      }
      if (product.description !== undefined && originalProduct?.description !== product.description) {
        changes.push(`Description updated`);
      }

      if (changes.length > 0) {
        await logActivity({
          type: 'product_edited',
          description: `Product edited: ${originalProduct?.name || 'Unknown'}`,
          details: {
            productName: originalProduct?.name || 'Unknown',
            changes,
            cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown'
          }
        });
      }

      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      });
    } catch (error: any) {
      // Revert optimistic update
      if (originalProduct) {
        setAuthenticatedState(prev => ({
          ...prev,
          products: prev.products.map(p =>
            p.id === id ? originalProduct : p
          )
        }));
      }

      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string, cashierName?: string) => {
    if (!user) {
      // Demo mode
      setDemoState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));

      toast({
        title: "Product deleted",
        description: "Product has been deleted (demo mode).",
      });
      return;
    }

    // Optimistic update
    const productToDelete = authenticatedState.products.find(p => p.id === id);
    setAuthenticatedState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('store_id', activeStore?.id);

      if (error) throw error;

      // Log activity
      if (productToDelete) {
        await logActivity({
          type: 'product_deleted',
          description: `Product deleted: ${productToDelete.name}`,
          details: {
            productName: productToDelete.name,
            price: `₦${productToDelete.price.toLocaleString()}`,
            quantity: productToDelete.quantity,
            category: productToDelete.category,
            cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown'
          }
        });
      }

      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
    } catch (error: any) {
      // Revert optimistic update
      if (productToDelete) {
        setAuthenticatedState(prev => ({
          ...prev,
          products: [...prev.products, productToDelete]
        }));
      }

      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProductQuantity = async (id: string, change: number, silent = false) => {
    const product = currentState.products.find(p => p.id === id);
    if (!product) return;

    const newQuantity = Math.max(0, product.quantity + change);

    if (!user) {
      // Demo mode
      setDemoState(prev => ({
        ...prev,
        products: prev.products.map(p =>
          p.id === id ? { ...p, quantity: newQuantity } : p
        )
      }));

      if (!silent) {
        toast({
          title: "Product updated",
          description: "Product quantity has been updated (demo mode).",
        });
      }
      return;
    }

    // Optimistic update for authenticated users
    const originalProduct = authenticatedState.products.find(p => p.id === id);
    if (originalProduct) {
      setAuthenticatedState(prev => ({
        ...prev,
        products: prev.products.map(p =>
          p.id === id ? { ...p, quantity: newQuantity } : p
        )
      }));
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', id)
        .eq('store_id', activeStore?.id);

      if (error) throw error;

      if (!silent) {
        toast({
          title: "Product updated",
          description: "Product quantity has been updated successfully.",
        });
      }
    } catch (error: any) {
      // Revert optimistic update
      if (originalProduct) {
        setAuthenticatedState(prev => ({
          ...prev,
          products: prev.products.map(p =>
            p.id === id ? originalProduct : p
          )
        }));
      }

      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addCategory = async (name: string, cashierName?: string) => {
    if (!user) {
      // Demo mode
      const newCategory: Category = {
        id: Date.now().toString(),
        name
      };
      setDemoState(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }));

      toast({
        title: "Category added",
        description: `${name} category has been added (demo mode).`,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          store_id: activeStore?.id,
          name
        });

      if (error) throw error;

      await loadCategories();

      // Log activity
      await logActivity({
        type: 'category_added',
        description: `Category added: ${name}`,
        details: {
          categoryName: name,
          cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown'
        }
      });

      toast({
        title: "Category added",
        description: `${name} category has been added.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const editCategory = async (id: string, name: string, cashierName?: string) => {
    if (!user) {
      // Demo mode
      setDemoState(prev => ({
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === id ? { ...cat, name } : cat
        )
      }));

      toast({
        title: "Category updated",
        description: "Category has been updated (demo mode).",
      });
      return;
    }

    try {
      const originalCategory = authenticatedState.categories.find(cat => cat.id === id);

      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .eq('store_id', activeStore?.id);

      if (error) throw error;

      await loadCategories();

      // Log activity
      if (originalCategory) {
        await logActivity({
          type: 'category_edited',
          description: `Category edited: ${originalCategory.name} → ${name}`,
          details: {
            oldName: originalCategory.name,
            newName: name,
            cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown'
          }
        });
      }

      toast({
        title: "Category updated",
        description: "Category has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string, cashierName?: string) => {
    if (!user) {
      // Demo mode
      setDemoState(prev => ({
        ...prev,
        categories: prev.categories.filter(cat => cat.id !== id)
      }));

      toast({
        title: "Category deleted",
        description: "Category has been deleted (demo mode).",
      });
      return;
    }

    try {
      const categoryToDelete = authenticatedState.categories.find(cat => cat.id === id);
      const productsInCategory = authenticatedState.products.filter(product => product.category === categoryToDelete?.name);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('store_id', activeStore?.id);

      if (error) throw error;

      await loadCategories();

      // Log activity
      if (categoryToDelete) {
        await logActivity({
          type: 'category_deleted',
          description: `Category deleted: ${categoryToDelete.name}`,
          details: {
            categoryName: categoryToDelete.name,
            productsAffected: productsInCategory.length,
            productsMoved: productsInCategory.map(p => p.name),
            action: productsInCategory.length > 0 ? `${productsInCategory.length} products moved to 'Other' category` : 'No products were affected',
            cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown'
          }
        });
      }

      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addTransaction = async (transaction: any) => {
    if (!user) {
      // Demo mode - add to local state only
      setDemoState(prev => ({
        ...prev,
        transactions: [{ ...transaction, id: Date.now().toString() }, ...prev.transactions]
      }));

      toast({
        title: "Sale completed",
        description: `Transaction of ₦${transaction.total.toLocaleString()} has been recorded (demo mode).`,
      });
      return;
    }

    try {
      // Save to database
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          store_id: activeStore?.id,
          items: transaction.items,
          total: transaction.total,
          payment_method: transaction.paymentMethod,
          cashier_name: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown',
          customer: transaction.customer
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newTransaction = {
        id: data.id,
        items: transaction.items,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod,
        cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown',
        customer: transaction.customer,
        timestamp: new Date(data.created_at)
      };

      setAuthenticatedState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }));

      // Log activity
      await logActivity({
        type: 'sale_completed',
        description: `Sale completed: ₦${transaction.total.toLocaleString()}`,
        details: {
          total: `₦${transaction.total.toLocaleString()}`,
          paymentMethod: transaction.paymentMethod,
          items: transaction.items.map((item: any) => `${item.name} x${item.quantity}`),
          cashierName: user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email || 'Unknown',
          customer: transaction.customer
        }
      });

      toast({
        title: "Sale completed",
        description: `Transaction of ₦${transaction.total.toLocaleString()} has been recorded.`,
      });
    } catch (error: any) {
      toast({
        title: "Error completing sale",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logActivity = async (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    if (!user) {
      // Demo mode - just log to console
      console.log('Activity:', activity);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          store_id: activeStore?.id,
          type: activity.type,
          description: activity.description,
          details: activity.details
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newActivity: ActivityLog = {
        id: data.id,
        type: activity.type,
        description: activity.description,
        details: activity.details,
        timestamp: new Date(data.created_at)
      };

      setAuthenticatedState(prev => ({
        ...prev,
        activityLogs: [newActivity, ...prev.activityLogs]
      }));
    } catch (error: any) {
      console.error('Error logging activity:', error);
      // Don't show toast for activity logging errors as they're not critical
    }
  };

  return (
    <ProductContext.Provider value={{
      ...currentState,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductQuantity,
      addTransaction,
      addCategory,
      editCategory,
      deleteCategory,
      logActivity,
      uploadProductImage,
      loadProducts,
      loadTransactions,
      loadActivities,
      isInitialLoading
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};


