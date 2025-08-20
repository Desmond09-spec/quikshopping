import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';
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
  loadProducts: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadActivities: () => Promise<void>;
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
  const { toast } = useToast();
  
  // Separate state for demo mode and authenticated mode
  const [demoState, setDemoState] = useState<ProductState>({
    products: demoProducts,
    categories: demoCategories,
    transactions: [],
    activityLogs: [],
    loading: false,
    categoriesLoading: false,
    productsLoading: false
  });

  const [authenticatedState, setAuthenticatedState] = useState<ProductState>({
    products: [],
    categories: [],
    transactions: [],
    activityLogs: [],
    loading: false,
    categoriesLoading: false,
    productsLoading: false
  });

  // Determine which state to use
  const currentState = user ? authenticatedState : demoState;
  const setCurrentState = user ? setAuthenticatedState : setDemoState;

  // Computed loading state - true if either categories or products are loading on initial load
  const isInitialLoading = user && (currentState.categoriesLoading || currentState.productsLoading);

  // App focus/visibility change handler for data refresh
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App regained focus - refresh all data to keep it in sync
        Promise.all([
          loadCategories(),
          currentState.products.length > 0 ? loadProducts() : Promise.resolve(),
          currentState.transactions.length > 0 ? loadTransactions() : Promise.resolve(),
          currentState.activityLogs.length > 0 ? loadActivities() : Promise.resolve()
        ]).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, currentState.products.length, currentState.transactions.length, currentState.activityLogs.length]);

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
        productsLoading: false
      });
      
      // Load all initial data including transaction history
      Promise.all([
        loadCategories(),
        loadTransactions(), // Always load transaction history
        loadActivities()    // Always load activity history
      ]).catch(console.error);
    } else if (!user && !authLoading) {
      // User logged out - ensure authenticated state is cleared
      setAuthenticatedState({
        products: [],
        categories: [],
        transactions: [],
        activityLogs: [],
        loading: false,
        categoriesLoading: false,
        productsLoading: false
      });
    }
  }, [user, authLoading]);

  // Load only categories initially
  const loadCategories = async () => {
    if (!user) return;

    setAuthenticatedState(prev => ({ ...prev, categoriesLoading: true }));

    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (categoriesError) throw categoriesError;

      const transformedCategories: Category[] = categories.map(cat => ({
        id: cat.id,
        name: cat.name
      }));

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

  // Load products on-demand
  const loadProducts = async () => {
    if (!user) return;

    setAuthenticatedState(prev => ({ ...prev, productsLoading: true, loading: true }));

    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', user.id)
        .order('name');

      if (productsError) throw productsError;

      const transformedProducts: Product[] = products.map(prod => ({
        id: prod.id,
        name: prod.name,
        price: Number(prod.price),
        quantity: prod.quantity,
        category: prod.categories?.name || 'Uncategorized',
        imageUrl: prod.image_url || '',
        description: prod.description || ''
      }));

      setAuthenticatedState(prev => ({
        ...prev,
        products: transformedProducts,
        productsLoading: false,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: "Error loading products",
        description: error.message,
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
  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
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
  const loadActivities = async () => {
    if (!user) return;

    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
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
          cashierName: cashierName || 'Unknown'
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
        .eq('user_id', user.id);

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
            cashierName: cashierName || 'Unknown'
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
        .eq('user_id', user.id);

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
            cashierName: cashierName || 'Unknown'
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
        .eq('user_id', user.id);

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
          cashierName: cashierName || 'Unknown'
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
        .eq('user_id', user.id);

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
            cashierName: cashierName || 'Unknown'
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
        .eq('user_id', user.id);

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
            cashierName: cashierName || 'Unknown'
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
          items: transaction.items,
          total: transaction.total,
          payment_method: transaction.paymentMethod,
          cashier_name: transaction.cashierName,
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
        cashierName: transaction.cashierName,
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
          cashierName: transaction.cashierName || 'Unknown',
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