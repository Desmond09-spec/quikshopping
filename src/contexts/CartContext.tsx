import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '@/types';

interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  status: 'active' | 'minimized';
}

interface MultiCartState {
  carts: Cart[];
  activeCartId: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { cartId: string; product: Product } }
  | { type: 'REMOVE_ITEM'; payload: { cartId: string; itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { cartId: string; itemId: string; quantity: number } }
  | { type: 'CLEAR_CART'; payload: string }
  | { type: 'CREATE_CART'; payload: Cart }
  | { type: 'SWITCH_CART'; payload: string }
  | { type: 'CLOSE_CART'; payload: string }
  | { type: 'LOAD_CARTS'; payload: MultiCartState }
  | { type: 'VALIDATE_CARTS'; payload: Product[] };

const CartContext = createContext<{
  carts: Cart[];
  activeCart: Cart | null;
  activeCartId: string | null;
  dispatch: React.Dispatch<CartAction>;
  addItem: (product: Product, maxQuantity?: number) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, maxQuantity?: number) => boolean;
  clearCart: () => void;
  createNewCart: (name?: string) => string;
  switchToCart: (cartId: string) => void;
  closeCart: (cartId: string) => void;
  validateCartItems: (products: Product[]) => { errors: Array<{ productName: string; requested: number; available: number }>; isValid: boolean };
  validateAndAdjustCarts: (products: Product[]) => { adjusted: boolean; adjustedItems: Array<{ cartName: string; productName: string; oldQuantity: number; newQuantity: number }> };
} | null>(null);

const STORAGE_KEY = 'quik-shopping-carts';
const MAX_CARTS = 10;

const generateCartName = (existingCarts: Cart[]): string => {
  const cartNumber = existingCarts.length + 1;
  return `Cart ${cartNumber}`;
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const cartReducer = (state: MultiCartState, action: CartAction): MultiCartState => {
  switch (action.type) {
    case 'LOAD_CARTS':
      return action.payload;

    case 'CREATE_CART': {
      if (state.carts.length >= MAX_CARTS) {
        return state;
      }
      const newCarts = [...state.carts, action.payload];
      return {
        carts: newCarts,
        activeCartId: action.payload.id
      };
    }

    case 'SWITCH_CART': {
      return {
        ...state,
        activeCartId: action.payload
      };
    }

    case 'CLOSE_CART': {
      const newCarts = state.carts.filter(cart => cart.id !== action.payload);
      const newActiveCartId = state.activeCartId === action.payload
        ? (newCarts.length > 0 ? newCarts[0].id : null)
        : state.activeCartId;

      return {
        carts: newCarts,
        activeCartId: newActiveCartId
      };
    }

    case 'ADD_ITEM': {
      const { cartId, product } = action.payload;
      const newCarts = state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        const existingItem = cart.items.find(item => item.productId === product.id);
        let newItems: CartItem[];

        if (existingItem) {
          newItems = cart.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category
          };
          newItems = [...cart.items, newItem];
        }

        return {
          ...cart,
          items: newItems,
          total: calculateTotal(newItems)
        };
      });

      return { ...state, carts: newCarts };
    }

    case 'REMOVE_ITEM': {
      const { cartId, itemId } = action.payload;
      const newCarts = state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        const newItems = cart.items.filter(item => item.id !== itemId);
        return {
          ...cart,
          items: newItems,
          total: calculateTotal(newItems)
        };
      });

      return { ...state, carts: newCarts };
    }

    case 'UPDATE_QUANTITY': {
      const { cartId, itemId, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { cartId, itemId } });
      }

      const newCarts = state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        const newItems = cart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        return {
          ...cart,
          items: newItems,
          total: calculateTotal(newItems)
        };
      });

      return { ...state, carts: newCarts };
    }

    case 'CLEAR_CART': {
      const cartId = action.payload;
      const newCarts = state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        return {
          ...cart,
          items: [],
          total: 0
        };
      });

      return { ...state, carts: newCarts };
    }

    case 'VALIDATE_CARTS': {
      const products = action.payload;
      const newCarts = state.carts.map(cart => {
        const newItems = cart.items
          .map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product || product.quantity === 0) {
              // Product doesn't exist or is out of stock - remove from cart
              return null;
            }
            if (item.quantity > product.quantity) {
              // Adjust quantity to match available stock
              return { ...item, quantity: product.quantity };
            }
            return item;
          })
          .filter((item): item is CartItem => item !== null);

        return {
          ...cart,
          items: newItems,
          total: calculateTotal(newItems)
        };
      });

      return { ...state, carts: newCarts };
    }

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with localStorage data or create first cart
  const [state, dispatch] = useReducer(cartReducer, { carts: [], activeCartId: null }, (initial) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const carts = parsed.carts.map((cart: any) => ({
          ...cart,
          createdAt: new Date(cart.createdAt)
        }));
        return { ...parsed, carts };
      }
    } catch (error) {
      console.error('Failed to load carts from localStorage:', error);
    }

    // Create initial cart if none exists
    const initialCart: Cart = {
      id: `cart-${Date.now()}`,
      name: 'Cart 1',
      items: [],
      total: 0,
      createdAt: new Date(),
      status: 'active'
    };

    return {
      carts: [initialCart],
      activeCartId: initialCart.id
    };
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save carts to localStorage:', error);
    }
  }, [state]);

  const activeCart = state.carts.find(cart => cart.id === state.activeCartId) || null;

  const createNewCart = (name?: string): string => {
    if (state.carts.length >= MAX_CARTS) {
      return state.activeCartId || '';
    }

    const newCart: Cart = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || generateCartName(state.carts),
      items: [],
      total: 0,
      createdAt: new Date(),
      status: 'active'
    };

    dispatch({ type: 'CREATE_CART', payload: newCart });
    return newCart.id;
  };

  const switchToCart = (cartId: string) => {
    dispatch({ type: 'SWITCH_CART', payload: cartId });
  };

  const closeCart = (cartId: string) => {
    dispatch({ type: 'CLOSE_CART', payload: cartId });
  };

  const addItem = (product: Product, maxQuantity?: number) => {
    if (!state.activeCartId) {
      createNewCart();
      return false;
    }

    const cart = state.carts.find(c => c.id === state.activeCartId);
    if (!cart) return false;

    const existingItem = cart.items.find(item => item.productId === product.id);
    const currentQuantityInCart = existingItem?.quantity || 0;
    const limit = maxQuantity || product.quantity;

    if (currentQuantityInCart >= limit) {
      return false;
    }

    dispatch({ type: 'ADD_ITEM', payload: { cartId: state.activeCartId, product } });
    return true;
  };

  const removeItem = (id: string) => {
    if (!state.activeCartId) return;
    dispatch({ type: 'REMOVE_ITEM', payload: { cartId: state.activeCartId, itemId: id } });
  };

  const updateQuantity = (id: string, quantity: number, maxQuantity?: number) => {
    if (!state.activeCartId) return false;
    if (maxQuantity && quantity > maxQuantity) {
      return false;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId: state.activeCartId, itemId: id, quantity } });
    return true;
  };

  const clearCart = () => {
    if (!state.activeCartId) return;
    dispatch({ type: 'CLEAR_CART', payload: state.activeCartId });
  };

  const validateCartItems = (products: Product[]) => {
    if (!activeCart) return { errors: [], isValid: true };

    const errors = [];
    for (const item of activeCart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        errors.push({ productName: item.name, requested: item.quantity, available: 0 });
      } else if (item.quantity > product.quantity) {
        errors.push({
          productName: item.name,
          requested: item.quantity,
          available: product.quantity
        });
      }
    }

    return { errors, isValid: errors.length === 0 };
  };

  const validateAndAdjustCarts = (products: Product[]) => {
    const adjustedItems: Array<{ cartName: string; productName: string; oldQuantity: number; newQuantity: number }> = [];

    // Check all carts for items that need adjustment
    state.carts.forEach(cart => {
      cart.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product || item.quantity > product.quantity) {
          const newQuantity = product ? product.quantity : 0;
          if (newQuantity !== item.quantity) {
            adjustedItems.push({
              cartName: cart.name,
              productName: item.name,
              oldQuantity: item.quantity,
              newQuantity
            });
          }
        }
      });
    });

    // If there are adjustments, apply them
    if (adjustedItems.length > 0) {
      dispatch({ type: 'VALIDATE_CARTS', payload: products });
    }

    return { adjusted: adjustedItems.length > 0, adjustedItems };
  };

  return (
    <CartContext.Provider value={{
      carts: state.carts,
      activeCart,
      activeCartId: state.activeCartId,
      dispatch,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      createNewCart,
      switchToCart,
      closeCart,
      validateCartItems,
      validateAndAdjustCarts
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
