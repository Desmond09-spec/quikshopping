export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  description?: string;
  barcode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  details?: any;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  cashierName: string;
  customer?: Customer;
  timestamp: Date;
}

export type PaymentMethod = 'cash' | 'pos' | 'transfer';

export interface TransactionFormData {
  paymentMethod: PaymentMethod;
  cashierName: string;
  customer?: Customer;
}

export const PRODUCT_CATEGORIES = [
  'All',
  'Drinks',
  'Groceries',
  'Essentials',
  'Snacks',
  'Personal Care',
  'Household',
  'Electronics',
  'Other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];