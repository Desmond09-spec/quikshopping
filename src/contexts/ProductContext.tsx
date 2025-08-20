import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProductState {
  products: Product[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  categories: string[];
  loading: boolean;
}

interface ActivityLog {
  id: string;
  type: 'product_added' | 'product_edited' | 'product_deleted' | 'sale_completed' | 'user_signin' | 'user_signout' | 'category_deleted';
  description: string;
  details?: any;
  timestamp: Date;
}

interface ProductContextType {
  products: Product[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  categories: string[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addCategory: (category: string) => void;
  editCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProductState>({
    products: [],
    transactions: [],
    activityLogs: [],
    categories: ['Drinks', 'Groceries', 'Essentials', 'Snacks', 'Personal Care', 'Household', 'Electronics', 'Other'],
    loading: true
  });
  const { toast } = useToast();

  // Initialize with mock data
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Coca Cola 350ml',
        price: 300,
        quantity: 24,
        category: 'Drinks',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Indomie Noodles',
        price: 150,
        quantity: 50,
        category: 'Groceries',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Peak Milk 400g',
        price: 800,
        quantity: 12,
        category: 'Groceries',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Gala Sausage Roll',
        price: 200,
        quantity: 30,
        category: 'Snacks',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Dettol Soap',
        price: 400,
        quantity: 3,
        category: 'Personal Care',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Groundnut Oil 1L',
        price: 1200,
        quantity: 0,
        category: 'Groceries',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        products: mockProducts,
        loading: false
      }));
    }, 1000);
  }, []);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));

    toast({
      title: "Product added",
      description: `${newProduct.name} has been added to inventory.`,
    });

    logActivity({
      type: 'product_added',
      description: `Added product: ${newProduct.name}`,
      details: {
        productName: newProduct.name,
        price: `₦${newProduct.price.toLocaleString()}`,
        quantity: newProduct.quantity,
        category: newProduct.category
      }
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const product = state.products.find(p => p.id === id);
    const oldValues = { ...product };
    
    setState(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === id
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      )
    }));

    toast({
      title: "Product updated",
      description: "Product has been updated successfully.",
    });

    if (product) {
      const changes = [];
      if (oldValues.name !== updates.name) changes.push(`Name: "${oldValues.name}" → "${updates.name}"`);
      if (oldValues.price !== updates.price) changes.push(`Price: ₦${oldValues.price?.toLocaleString()} → ₦${updates.price?.toLocaleString()}`);
      if (oldValues.quantity !== updates.quantity) changes.push(`Quantity: ${oldValues.quantity} → ${updates.quantity}`);
      if (oldValues.category !== updates.category) changes.push(`Category: ${oldValues.category} → ${updates.category}`);
      
      logActivity({
        type: 'product_edited',
        description: `Edited product: ${product.name}`,
        details: {
          productName: product.name,
          changes: changes.length > 0 ? changes : ['Minor updates']
        }
      });
    }
  };

  const deleteProduct = (id: string) => {
    const product = state.products.find(p => p.id === id);
    setState(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== id)
    }));

    if (product) {
      toast({
        title: "Product deleted",
        description: `${product.name} has been removed from inventory.`,
      });

      logActivity({
        type: 'product_deleted',
        description: `Deleted product: ${product.name}`,
        details: {
          productName: product.name,
          price: `₦${product.price.toLocaleString()}`,
          quantity: product.quantity,
          category: product.category
        }
      });
    }
  };

  const updateProductQuantity = (id: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === id
          ? { ...product, quantity: Math.max(0, quantity), updatedAt: new Date() }
          : product
      )
    }));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString()
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));

    // Product quantities are already updated by cart context, no need to update again

    toast({
      title: "Transaction recorded",
      description: `Sale of ₦${transactionData.total.toLocaleString()} has been recorded.`,
    });

    logActivity({
      type: 'sale_completed',
      description: `Completed sale: ₦${transactionData.total.toLocaleString()}`,
      details: {
        total: `₦${transactionData.total.toLocaleString()}`,
        itemCount: transactionData.items.length,
        paymentMethod: transactionData.paymentMethod,
        items: transactionData.items.map(item => {
          const product = state.products.find(p => p.id === item.productId);
          return `${product?.name} (${item.quantity}x ₦${item.price.toLocaleString()})`;
        })
      }
    });
  };

  const addCategory = (category: string) => {
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
    
    toast({
      title: "Category added",
      description: `${category} category has been added.`,
    });
  };

  const editCategory = (oldCategory: string, newCategory: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => cat === oldCategory ? newCategory : cat),
      products: prev.products.map(product => 
        product.category === oldCategory 
          ? { ...product, category: newCategory, updatedAt: new Date() }
          : product
      )
    }));
    
    toast({
      title: "Category updated",
      description: `Category renamed from ${oldCategory} to ${newCategory}.`,
    });
  };

  const deleteCategory = (category: string) => {
    const productsInCategory = state.products.filter(p => p.category === category);
    
    // Move products to 'Other' category
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== category),
      products: prev.products.map(product => 
        product.category === category 
          ? { ...product, category: 'Other', updatedAt: new Date() }
          : product
      )
    }));
    
    toast({
      title: "Category deleted",
      description: `${category} category has been removed. Products moved to 'Other'.`,
    });

    // Log category deletion activity
    logActivity({
      type: 'category_deleted',
      description: `Deleted category: ${category}`,
      details: {
        categoryName: category,
        productsAffected: productsInCategory.length,
        productsMoved: productsInCategory.map(p => p.name),
        action: 'Category deletion - products moved to Other'
      }
    });
  };

  const logActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      activityLogs: [newActivity, ...prev.activityLogs]
    }));
  };

  return (
    <ProductContext.Provider value={{
      products: state.products,
      transactions: state.transactions,
      activityLogs: state.activityLogs,
      categories: state.categories,
      loading: state.loading,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductQuantity,
      addTransaction,
      addCategory,
      editCategory,
      deleteCategory,
      logActivity
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