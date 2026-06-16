# Quik Shopping - Application Logic Documentation

## Complete Technical Reference for Data Handling, Page Logic, and Feature Implementation

---

## Table of Contents

1. [State Management Architecture](#state-management-architecture)
2. [Data Flow Patterns](#data-flow-patterns)
3. [Context Providers Deep Dive](#context-providers-deep-dive)
4. [Page-by-Page Logic Breakdown](#page-by-page-logic-breakdown)
5. [Data Storage & Persistence](#data-storage--persistence)
6. [Real-Time Synchronization](#real-time-synchronization)
7. [Validation & Error Handling](#validation--error-handling)
8. [Security Logic](#security-logic)
9. [Transaction Processing](#transaction-processing)
10. [Activity Logging System](#activity-logging-system)

---

## State Management Architecture

### Overview

The application uses **React Context API** with custom providers to manage global state. Each context handles a specific domain:

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP STATE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  QueryClientProvider                     │   │
│  │                  (TanStack Query)                        │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              ThemeProvider                       │    │   │
│  │  │  ┌─────────────────────────────────────────┐    │    │   │
│  │  │  │           AuthProvider                   │    │    │   │
│  │  │  │  ┌─────────────────────────────────┐    │    │    │   │
│  │  │  │  │        StoreProvider             │    │    │    │   │
│  │  │  │  │  ┌─────────────────────────┐    │    │    │    │   │
│  │  │  │  │  │      AdminProvider       │    │    │    │    │   │
│  │  │  │  │  │  ┌─────────────────┐    │    │    │    │    │   │
│  │  │  │  │  │  │ ProductProvider │    │    │    │    │    │   │
│  │  │  │  │  │  │  ┌─────────┐   │    │    │    │    │    │   │
│  │  │  │  │  │  │  │CartProv │   │    │    │    │    │    │   │
│  │  │  │  │  │  │  └─────────┘   │    │    │    │    │    │   │
│  │  │  │  │  │  └─────────────────┘    │    │    │    │    │   │
│  │  │  │  │  └─────────────────────────┘    │    │    │    │   │
│  │  │  │  └─────────────────────────────────┘    │    │    │   │
│  │  │  └─────────────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Provider Hierarchy and Dependencies

| Provider            | Depends On                | Provides                           |
| ------------------- | ------------------------- | ---------------------------------- |
| QueryClientProvider | None                      | Server state caching               |
| ThemeProvider       | None                      | Theme state                        |
| AuthProvider        | Supabase                  | User authentication                |
| StoreProvider       | AuthProvider              | Multi-store management             |
| AdminProvider       | AuthProvider              | Admin mode, settings               |
| ProductProvider     | AuthProvider, CartContext | Products, categories, transactions |
| CartProvider        | None                      | Shopping cart state                |

---

## Data Flow Patterns

### 1. Optimistic Updates

The application uses optimistic updates for better perceived performance:

```
User Action → Update UI Immediately → API Call → Success/Revert
```

**Example: Adding a Product**

```typescript
// Step 1: Add temp product to UI immediately
const tempProduct = { ...product, id: `temp_${Date.now()}` };
setAuthenticatedState(prev => ({
  ...prev,
  products: [...prev.products, tempProduct]
}));

// Step 2: Make API call
const { data, error } = await supabase
  .from('products')
  .insert({ ... })
  .select()
  .single();

// Step 3: On success, replace temp with real
if (!error) {
  setAuthenticatedState(prev => ({
    ...prev,
    products: prev.products.map(p =>
      p.id === tempProduct.id ? { ...realProduct } : p
    )
  }));
}

// Step 4: On error, revert
if (error) {
  setAuthenticatedState(prev => ({
    ...prev,
    products: prev.products.filter(p => p.id !== tempProduct.id)
  }));
}
```

### 2. Dual-State Pattern (Demo vs Authenticated)

The application maintains separate states for demo and authenticated modes:

```typescript
// Two separate state objects
const [demoState, setDemoState] = useState<ProductState>({
  products: demoProducts, // Pre-populated demo data
  categories: demoCategories,
  transactions: [],
  activityLogs: [],
  loading: false,
});

const [authenticatedState, setAuthenticatedState] = useState<ProductState>({
  products: [], // Empty, loaded from Supabase
  categories: [],
  transactions: [],
  activityLogs: [],
  loading: false,
});

// Dynamic selection based on auth state
const currentState = user ? authenticatedState : demoState;
const setCurrentState = user ? setAuthenticatedState : setDemoState;
```

### 3. Reducer Pattern for Cart

The cart uses `useReducer` for complex state updates:

```typescript
type CartAction =
  | { type: "ADD_ITEM"; payload: { cartId: string; product: Product } }
  | { type: "REMOVE_ITEM"; payload: { cartId: string; itemId: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { cartId: string; itemId: string; quantity: number };
    }
  | { type: "CLEAR_CART"; payload: string }
  | { type: "CREATE_CART"; payload: Cart }
  | { type: "SWITCH_CART"; payload: string }
  | { type: "CLOSE_CART"; payload: string }
  | { type: "LOAD_CARTS"; payload: MultiCartState }
  | { type: "VALIDATE_CARTS"; payload: Product[] };

const [state, dispatch] = useReducer(cartReducer, initialState);
```

---

## Context Providers Deep Dive

### 1. SupabaseAuthContext

**File:** `src/contexts/SupabaseAuthContext.tsx`

**Purpose:** Manages user authentication state and session

**State:**

```typescript
interface AuthState {
  user: User | null; // Current authenticated user
  loading: boolean; // Auth operation in progress
  session: Session | null; // Session tokens
}
```

**Key Functions:**

| Function                               | Purpose        | Logic                                                          |
| -------------------------------------- | -------------- | -------------------------------------------------------------- |
| `login(email, password)`               | Sign in user   | Calls `supabase.auth.signInWithPassword()`, updates user state |
| `signup(email, password, displayName)` | Register user  | Calls `supabase.auth.signUp()`, sets user metadata             |
| `logout()`                             | Sign out       | Calls `supabase.auth.signOut()`, clears state                  |
| `resetPassword(email)`                 | Password reset | Sends reset email via Supabase                                 |

**Session Persistence:**

- Uses `localStorage` for session persistence
- `autoRefreshToken: true` automatically refreshes tokens
- Listens to `onAuthStateChange` for session updates

**Data Stored:**

- `user.id` - Unique user identifier
- `user.email` - User email
- `user.user_metadata.display_name` - Display name
- Session tokens in localStorage

---

### 2. StoreContext

**File:** `src/contexts/StoreContext.tsx` (213 lines)

**Purpose:** Multi-store management and role-based access control

**State:**

```typescript
interface StoreContextState {
  activeStore: Store | null; // Currently selected store
  userRole: "owner" | "manager" | "cashier" | null;
  stores: Store[]; // All user's stores
  userRoles: UserRole[]; // User's roles across stores
  loading: boolean;
}
```

**Permission System:**

```typescript
type Permission =
  | "products:view"
  | "products:write"
  | "sales:write"
  | "reports:view"
  | "inventory:manage"
  | "team:manage"
  | "settings:manage";

// Permission matrix
const rolePermissions = {
  owner: [
    "products:view",
    "products:write",
    "sales:write",
    "reports:view",
    "inventory:manage",
    "team:manage",
    "settings:manage",
  ],
  manager: [
    "products:view",
    "products:write",
    "sales:write",
    "reports:view",
    "inventory:manage",
  ],
  cashier: ["products:view", "sales:write"],
};
```

**Key Functions:**

| Function                    | Purpose       | Logic                                                    |
| --------------------------- | ------------- | -------------------------------------------------------- |
| `setActiveStore(storeId)`   | Switch store  | Updates activeStore, fetches user role for store         |
| `hasPermission(permission)` | Check access  | Returns `rolePermissions[userRole].includes(permission)` |
| `refreshStores()`           | Reload stores | Fetches all stores from Supabase                         |

---

### 3. AdminContext

**File:** `src/contexts/AdminContext.tsx` (577 lines)

**Purpose:** Admin PIN authentication, security, and admin-level settings

**State:**

```typescript
interface AdminState {
  isAdminMode: boolean; // Currently in admin mode
  adminSettings: AdminSettings | null;
  sessionToken: string | null; // Admin session token
  expiresAt: string | null; // Session expiry
  loading: boolean;
  cachedCashierNames: string[]; // Recently used cashier names
  managedCashiers: string[]; // Approved cashier list
  cashierSignInMode: "dropdown" | "freetext";
}

interface AdminSettings {
  id: string;
  ownerUserId: string;
  adminEmail: string;
  whatsappNumber?: string;
  deviceCacheEnabled: boolean;
  disableCashierDialog: boolean;
  requireAdminForProductActions: boolean;
  hasSecurityQuestion: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Admin Authentication Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN SIGN-IN FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Enters PIN                                            │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────┐                                        │
│  │ signInAdmin()   │──────────────────────────────────┐     │
│  └────────┬────────┘                                  │     │
│           │                                           │     │
│           ▼                                           │     │
│  ┌─────────────────────────────────────┐              │     │
│  │ supabase.functions.invoke(          │              │     │
│  │   'admin-verify',                   │              │     │
│  │   { body: { pin } }                 │              │     │
│  │ )                                   │              │     │
│  └────────┬────────────────────────────┘              │     │
│           │                                           │     │
│           ▼                                           │     │
│  Edge Function verifies PIN hash                      │     │
│           │                                           │     │
│           ├── Success ────────────────────────────┐   │     │
│           │                                       │   │     │
│           ▼                                       ▼   │     │
│  ┌───────────────────────┐      ┌───────────────────┐│     │
│  │ Return:               │      │ setState({        ││     │
│  │ - sessionToken        │─────▶│   isAdminMode:    ││     │
│  │ - expiresAt           │      │     true,         ││     │
│  │ - adminSettings       │      │   sessionToken,   ││     │
│  └───────────────────────┘      │   expiresAt       ││     │
│                                 │ })                 ││     │
│                                 └───────────────────┘│     │
│                                                      │     │
│           ├── Failure ───────────────────────────────┘     │
│           │                                                 │
│           ▼                                                 │
│  Show error toast: "Invalid PIN"                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Session Validation:**

```typescript
const isSessionValid = () => {
  if (!state.expiresAt) return false;
  return new Date() < new Date(state.expiresAt);
};

// Auto-signout on session expiry (checked every minute)
useEffect(() => {
  const interval = setInterval(() => {
    if (state.isAdminMode && !isSessionValid()) {
      signOutAdmin();
    }
  }, 60000);
  return () => clearInterval(interval);
}, [state.isAdminMode, state.expiresAt]);
```

**Key Functions:**

| Function                                 | Purpose             | Logic                                                           |
| ---------------------------------------- | ------------------- | --------------------------------------------------------------- |
| `setupAdmin(...)`                        | Initial admin setup | Calls `admin-setup` edge function with email, PIN, security Q&A |
| `signInAdmin(pin)`                       | Authenticate admin  | Verifies PIN via edge function, sets session                    |
| `signOutAdmin()`                         | Exit admin mode     | Clears session, logs activity                                   |
| `resetPin(newPin, confirmPin)`           | Change PIN          | Validates match, calls `admin-reset-pin` edge function          |
| `toggleCashierDialogDisabled(disabled)`  | Toggle setting      | Updates `disable_cashier_dialog` in database                    |
| `toggleAdminProductRequirement(require)` | Toggle setting      | Updates `require_admin_for_product_actions` in database         |
| `addManagedCashier(name)`                | Add cashier         | Appends to `managed_cashiers` array in database                 |
| `removeManagedCashier(name)`             | Remove cashier      | Filters from `managed_cashiers` array                           |
| `setCashierSignInMode(mode)`             | Set mode            | Updates `cashier_signin_mode` in database                       |

---

### 4. SupabaseProductContext

**File:** `src/contexts/SupabaseProductContext.tsx` (1,283 lines)

**Purpose:** Core business data - products, categories, transactions, activities

**State:**

```typescript
interface ProductState {
  products: Product[];
  categories: Category[];
  transactions: any[];
  activityLogs: ActivityLog[];
  loading: boolean;
  categoriesLoading: boolean;
  productsLoading: boolean;
  isSyncing: boolean; // Shows sync indicator
}
```

**Data Loading Logic:**

```
User Logs In
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│                 INITIALIZATION SEQUENCE                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. loadCategories()                                       │
│     │                                                      │
│     ├── Query: SELECT * FROM categories WHERE user_id = ? │
│     ├── Ensure "Other" category exists (create if not)    │
│     └── Set categories in state                           │
│                                                            │
│  2. After categories loaded → loadProducts()              │
│     │                                                      │
│     ├── Query: SELECT * FROM products WHERE user_id = ?   │
│     ├── Map category_id → category name using loaded cats │
│     └── Set products in state                             │
│                                                            │
│  3. Parallel: loadTransactions()                          │
│     │                                                      │
│     ├── Query: SELECT * FROM transactions ORDER BY        │
│     │          created_at DESC                             │
│     └── Transform and set in state                        │
│                                                            │
│  4. Parallel: loadActivities()                            │
│     │                                                      │
│     ├── Query: SELECT * FROM activities ORDER BY          │
│     │          created_at DESC                             │
│     └── Set in state                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Product CRUD Operations:**

**Add Product:**

```typescript
const addProduct = async (
  product: Omit<Product, "id">,
  cashierName?: string
) => {
  // 1. Create temp product for optimistic UI
  const tempProduct = { ...product, id: `temp_${Date.now()}` };
  setAuthenticatedState((prev) => ({
    ...prev,
    products: [...prev.products, tempProduct],
  }));

  // 2. Find category ID from name
  const category = authenticatedState.categories.find(
    (cat) => cat.name === product.category
  );

  // 3. Insert into Supabase
  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category_id: category?.id,
      image_url: product.imageUrl,
      description: product.description,
    })
    .select()
    .single();

  // 4. Replace temp with real product
  if (!error) {
    setAuthenticatedState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === tempProduct.id ? { ...realProduct } : p
      ),
    }));

    // 5. Log activity
    await logActivity({
      type: "product_added",
      description: `Product added: ${product.name}`,
      details: { productName, price, quantity, category, cashierName },
    });
  }
};
```

**Update Product:**

```typescript
const updateProduct = async (
  id: string,
  product: Partial<Product>,
  cashierName?: string
) => {
  // 1. Store original for potential revert
  const originalProduct = authenticatedState.products.find((p) => p.id === id);

  // 2. Optimistic update
  setAuthenticatedState((prev) => ({
    ...prev,
    products: prev.products.map((p) =>
      p.id === id ? { ...p, ...product } : p
    ),
  }));

  // 3. Update in database
  const updateData = {};
  if (product.name !== undefined) updateData.name = product.name;
  if (product.price !== undefined) updateData.price = product.price;
  // ... etc

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  // 4. Track changes for activity log
  const changes = [];
  if (product.name !== originalProduct?.name) {
    changes.push(`Name: ${originalProduct?.name} → ${product.name}`);
  }
  // ... etc

  // 5. Log activity with changes
  if (changes.length > 0) {
    await logActivity({
      type: "product_edited",
      description: `Product edited: ${originalProduct?.name}`,
      details: { productName, changes, cashierName },
    });
  }
};
```

**Delete Product:**

```typescript
const deleteProduct = async (id: string, cashierName?: string) => {
  // 1. Store for potential revert
  const productToDelete = authenticatedState.products.find((p) => p.id === id);

  // 2. Optimistic removal
  setAuthenticatedState((prev) => ({
    ...prev,
    products: prev.products.filter((p) => p.id !== id),
  }));

  // 3. Delete from database
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  // 4. Log activity
  if (productToDelete) {
    await logActivity({
      type: "product_deleted",
      description: `Product deleted: ${productToDelete.name}`,
      details: { productName, price, quantity, category, cashierName },
    });
  }
};
```

**Image Upload:**

```typescript
const uploadProductImage = async (file: File, productId?: string) => {
  if (!user) {
    // Demo mode: return blob URL
    return URL.createObjectURL(file);
  }

  // 1. Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${productId || "temp"}_${Date.now()}.${fileExt}`;

  // 2. Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("products")
    .upload(fileName, file);

  // 3. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(data.path);

  return publicUrl;
};
```

**Transaction Recording:**

```typescript
const addTransaction = async (transaction: any) => {
  // 1. Insert into database
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      items: transaction.items,
      total: transaction.total,
      payment_method: transaction.paymentMethod,
      cashier_name: transaction.cashierName,
      customer: transaction.customer,
    })
    .select()
    .single();

  // 2. Add to local state
  const newTransaction = {
    id: data.id,
    items: transaction.items,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    cashierName: transaction.cashierName,
    customer: transaction.customer,
    timestamp: new Date(data.created_at),
  };

  setAuthenticatedState((prev) => ({
    ...prev,
    transactions: [newTransaction, ...prev.transactions],
  }));

  // 3. Log activity
  await logActivity({
    type: "sale_completed",
    description: `Sale completed: ₦${transaction.total.toLocaleString()}`,
    details: {
      total,
      paymentMethod,
      items: transaction.items.map((item) => `${item.name} x${item.quantity}`),
      cashierName,
      customer,
    },
  });
};
```

---

### 5. CartContext

**File:** `src/contexts/CartContext.tsx` (404 lines)

**Purpose:** Multi-cart shopping system with validation

**State:**

```typescript
interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  status: "active" | "minimized";
}

interface MultiCartState {
  carts: Cart[];
  activeCartId: string | null;
}
```

**Cart Limits:**

```typescript
const STORAGE_KEY = "quik-shopping-carts";
const MAX_CARTS = 10;
```

**Reducer Actions:**

| Action            | Logic                                                        |
| ----------------- | ------------------------------------------------------------ |
| `CREATE_CART`     | Add new cart if under MAX_CARTS, set as active               |
| `SWITCH_CART`     | Update activeCartId                                          |
| `CLOSE_CART`      | Remove cart, switch to first remaining if active was closed  |
| `ADD_ITEM`        | Find cart, add item or increment quantity, recalculate total |
| `REMOVE_ITEM`     | Filter out item, recalculate total                           |
| `UPDATE_QUANTITY` | Update quantity (or remove if ≤0), recalculate total         |
| `CLEAR_CART`      | Set items to [], total to 0                                  |
| `VALIDATE_CARTS`  | Adjust quantities to match product availability              |

**Total Calculation:**

```typescript
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```

**Validation Functions:**

```typescript
// Check if cart items are still available
const validateCartItems = (products: Product[]) => {
  if (!activeCart) return { errors: [], isValid: true };

  const errors = [];
  for (const item of activeCart.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      errors.push({
        productName: item.name,
        requested: item.quantity,
        available: 0,
      });
    } else if (item.quantity > product.quantity) {
      errors.push({
        productName: item.name,
        requested: item.quantity,
        available: product.quantity,
      });
    }
  }

  return { errors, isValid: errors.length === 0 };
};

// Auto-adjust cart quantities when stock changes
const validateAndAdjustCarts = (products: Product[]) => {
  const adjustedItems = [];

  state.carts.forEach((cart) => {
    cart.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || item.quantity > product.quantity) {
        const newQuantity = product ? product.quantity : 0;
        if (newQuantity !== item.quantity) {
          adjustedItems.push({
            cartName: cart.name,
            productName: item.name,
            oldQuantity: item.quantity,
            newQuantity,
          });
        }
      }
    });
  });

  if (adjustedItems.length > 0) {
    dispatch({ type: "VALIDATE_CARTS", payload: products });
  }

  return { adjusted: adjustedItems.length > 0, adjustedItems };
};
```

**LocalStorage Persistence:**

```typescript
// Load from localStorage on init
const [state, dispatch] = useReducer(
  cartReducer,
  { carts: [], activeCartId: null },
  (initial) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const carts = parsed.carts.map((cart: any) => ({
          ...cart,
          createdAt: new Date(cart.createdAt),
        }));
        return { ...parsed, carts };
      }
    } catch (error) {
      console.error("Failed to load carts from localStorage:", error);
    }

    // Create initial cart if none exists
    return {
      carts: [
        {
          id: `cart-${Date.now()}`,
          name: "Cart 1",
          items: [],
          total: 0,
          createdAt: new Date(),
          status: "active",
        },
      ],
      activeCartId: initialCart.id,
    };
  }
);

// Save to localStorage on every state change
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save carts to localStorage:", error);
  }
}, [state]);
```

---

## Page-by-Page Logic Breakdown

### 1. Home Page (`/`)

**File:** `src/pages/Home.tsx`

**Data Used:**

- `products` from ProductContext
- `isAdminMode`, `adminSettings` from AdminContext
- `addItem` from CartContext

**Core Logic:**

**Product Filtering:**

```typescript
const filteredProducts = products.filter((product) => {
  // Category filter
  const matchesCategory =
    selectedCategory === "All" || product.category === selectedCategory;

  // Search filter (name, category, or barcode)
  const matchesSearch =
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchQuery));

  return matchesCategory && matchesSearch;
});
```

**Barcode Scan Handler:**

```typescript
const handleBarcodeScan = (barcode: string) => {
  // Auto-fill search
  setSearchQuery(barcode);

  // Find matching product
  const product = products.find((p) => p.barcode === barcode);
  if (product) {
    // Optionally auto-add to cart
    addItem(product);
    toast({ title: `Added ${product.name} to cart` });
  } else {
    toast({ title: "Product not found", variant: "destructive" });
  }

  setShowScanner(false);
};
```

**Admin Gating Logic:**

```typescript
// Show lock if admin mode required but not active
const showLock = adminSettings?.requireAdminForProductActions && !isAdminMode;

// Add Product button
{
  showLock ? (
    <Button disabled>
      <Lock className="w-4 h-4" />
      Admin Only
    </Button>
  ) : (
    <Link to="/add-product">
      <Button>
        <Plus className="w-4 h-4" />
        Add Product
      </Button>
    </Link>
  );
}
```

**Pull to Refresh:**

```typescript
const handleRefresh = async () => {
  await loadProducts(true); // force reload
};

<PullToRefresh onRefresh={handleRefresh}>{/* content */}</PullToRefresh>;
```

---

### 2. Cart Page (`/cart`)

**File:** `src/pages/Cart.tsx` (782 lines)

**Data Used:**

- `carts`, `activeCart`, `activeCartId` from CartContext
- `products`, `addTransaction`, `updateProductQuantity` from ProductContext

**Core Logic:**

**Real-Time Cart Validation:**

```typescript
// Runs whenever products change
useEffect(() => {
  if (products.length > 0) {
    const result = validateAndAdjustCarts(products);

    if (result.adjusted && result.adjustedItems.length > 0) {
      // Show notification for adjusted items
      toast({
        title: "🔄 Cart Updated",
        description: (
          <div>
            <p>Product quantities adjusted due to stock changes:</p>
            {result.adjustedItems.map((item, idx) => (
              <p key={idx}>
                • {item.productName}: {item.oldQuantity} → {item.newQuantity}
              </p>
            ))}
          </div>
        ),
      });
    }
  }
}, [products]);
```

**Quantity Change Handler:**

```typescript
const handleQuantityChange = (itemId: string, newQuantity: number) => {
  if (!activeCart) return;

  const cartItem = activeCart.items.find((item) => item.id === itemId);
  if (!cartItem) return;

  if (newQuantity <= 0) {
    removeItem(itemId); // Remove if zero or negative
  } else {
    // Check stock availability
    const product = products.find((p) => p.id === cartItem.productId);
    const quantityDiff = newQuantity - cartItem.quantity;

    if (product && quantityDiff > 0 && product.quantity < quantityDiff) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.quantity} items available`,
        variant: "destructive",
      });
      return;
    }

    updateQuantity(itemId, newQuantity);
  }
};
```

**Checkout Flow:**

```
┌──────────────────────────────────────────────────────────────┐
│                    CHECKOUT FLOW                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: SELECT PAYMENT METHOD                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Cash]  [POS]  [Transfer]                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│          ┌───────────────┴───────────────┐                  │
│          │                               │                   │
│          ▼                               ▼                   │
│    If "Transfer"               If "Cash" or "POS"           │
│          │                               │                   │
│          ▼                               │                   │
│  Step 2: CUSTOMER INFO                   │                   │
│  ┌─────────────────────┐                 │                   │
│  │  Name: [________]   │                 │                   │
│  │  Phone: [________]  │                 │                   │
│  │  [Continue]         │                 │                   │
│  └─────────────────────┘                 │                   │
│          │                               │                   │
│          └───────────────┬───────────────┘                  │
│                          ▼                                   │
│  Step 3: CASHIER + SUMMARY                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Cashier: [________]                                   │ │
│  │  ─────────────────                                     │ │
│  │  Items: 5                                              │ │
│  │  Payment: Transfer                                     │ │
│  │  Customer: John Doe                                    │ │
│  │  Total: ₦45,000                                        │ │
│  │  [Complete Sale]                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  handleFinalSubmit()                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Final Submit Logic:**

```typescript
const handleFinalSubmit = async () => {
  if (!activeCart || !activeCartId) return;

  // 1. Pre-sale validation
  const validation = validateCartItems(products);
  if (!validation.isValid) {
    toast({
      title: "❌ Cannot Complete Sale",
      description: (
        <div>
          <p>The following items are no longer available:</p>
          {validation.errors.map((error, idx) => (
            <p key={idx}>
              • {error.productName}: Requested {error.requested}, Available{" "}
              {error.available}
            </p>
          ))}
        </div>
      ),
      variant: "destructive",
    });
    return;
  }

  setIsCompletingSale(true);
  try {
    // 2. Deduct stock for each item
    for (const cartItem of activeCart.items) {
      await updateProductQuantity(cartItem.productId, -cartItem.quantity, true);
    }

    // 3. Record transaction
    const transaction = {
      items: activeCart.items,
      total: activeCart.total,
      paymentMethod: formData.paymentMethod,
      cashierName: formData.cashierName,
      customer: formData.customer,
      timestamp: new Date(),
    };

    await addTransaction(transaction);

    // 4. Close the cart
    closeCart(activeCartId);

    // 5. Reset form state
    setShowPaymentModal(false);
    setPaymentStep("method");
    setFormData({
      paymentMethod: "cash",
      cashierName: "",
      customer: undefined,
    });
  } catch (error) {
    toast({ title: "Error completing sale", variant: "destructive" });
  } finally {
    setIsCompletingSale(false);
  }
};
```

**Customer Validation:**

```typescript
const validateCustomerName = (name: string) => {
  if (!name.trim()) return "Name is required";
  if (!/^[a-zA-Z\s]+$/.test(name))
    return "Name should contain only letters and spaces";
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return "Please enter your full name (first and last).";
  return undefined;
};

const validateCustomerPhone = (phone: string) => {
  if (!phone.trim()) return "Phone number is required";
  if (!validatePhoneNumber(phone))
    return "Please enter a valid Nigerian phone number";
  return undefined;
};
```

---

### 3. Add Product Page (`/add-product`)

**File:** `src/pages/AddProduct.tsx`

**Data Used:**

- `addProduct`, `categories`, `uploadProductImage` from ProductContext
- `isAdminMode`, `adminSettings` from AdminContext

**Form State:**

```typescript
const [formData, setFormData] = useState({
  name: "",
  price: "",
  quantity: "",
  category: "",
  description: "",
  barcode: "",
});
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>("");
```

**Submit Logic:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setIsSubmitting(true);
  try {
    // 1. Upload image if provided
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile);
    }

    // 2. Create product object
    const product = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      category: formData.category,
      description: formData.description.trim(),
      barcode: formData.barcode.trim(),
      imageUrl,
    };

    // 3. Add product (may trigger cashier dialog based on settings)
    await addProduct(product, cashierName);

    // 4. Navigate back
    navigate("/");
  } catch (error) {
    toast({ title: "Error adding product", variant: "destructive" });
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### 4. Settings Page (`/settings`)

**File:** `src/pages/Settings.tsx` (850 lines)

**Data Used:**

- Multiple contexts: Auth, Admin, Products, Theme

**Key State:**

```typescript
const [showCashierDialog, setShowCashierDialog] = useState(false);
const [showAdminSignIn, setShowAdminSignIn] = useState(false);
const [showForgotPin, setShowForgotPin] = useState(false);
const [showWalkthrough, setShowWalkthrough] = useState(false);
const [showSecurityDialog, setShowSecurityDialog] = useState(false);
const [showClearDataDialog, setShowClearDataDialog] = useState(false);
const [deferredPrompt, setDeferredPrompt] =
  useState<BeforeInstallPromptEvent | null>(null);
const [isInstalled, setIsInstalled] = useState(false);
```

**PWA Install Logic:**

```typescript
useEffect(() => {
  // Check if already installed
  const checkInstalled = () => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  const isAlreadyInstalled = checkInstalled();

  if (!isAlreadyInstalled) {
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }
}, []);

const handleInstallApp = async () => {
  if (!deferredPrompt) return;

  await deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;

  if (choiceResult.outcome === "accepted") {
    setIsInstalled(true);
  }
  setDeferredPrompt(null);
};
```

**Store Overview Calculations:**

```typescript
// Today's sales
const todaysSales = transactions
  .filter((t) => {
    const today = new Date();
    const txDate = new Date(t.timestamp);
    return txDate.toDateString() === today.toDateString();
  })
  .reduce((sum, t) => sum + t.total, 0);

// Low stock products
const lowStockCount = products.filter((p) => p.quantity <= 10).length;
```

---

### 5. Reports Page (`/reports`)

**File:** `src/pages/Reports.tsx` (500 lines)

**Date Filtering:**

```typescript
const [dateFilter, setDateFilter] = useState<
  "today" | "yesterday" | "week" | "month" | "all"
>("today");

const getFilteredTransactions = () => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  switch (dateFilter) {
    case "today":
      return transactions.filter((t) => new Date(t.timestamp) >= startOfToday);

    case "yesterday":
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      return transactions.filter((t) => {
        const date = new Date(t.timestamp);
        return date >= startOfYesterday && date < startOfToday;
      });

    case "week":
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      return transactions.filter((t) => new Date(t.timestamp) >= startOfWeek);

    case "month":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return transactions.filter((t) => new Date(t.timestamp) >= startOfMonth);

    case "all":
    default:
      return transactions;
  }
};
```

**PDF Generation:**

```typescript
const generatePDF = () => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("Sales Report", 14, 22);
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
  doc.text(`Period: ${dateFilter}`, 14, 40);

  // Summary
  doc.text(`Total Sales: ₦${totalSales.toLocaleString()}`, 14, 52);
  doc.text(`Transactions: ${filteredTransactions.length}`, 14, 60);

  // Transactions table
  autoTable(doc, {
    startY: 70,
    head: [["Date", "Items", "Payment", "Cashier", "Total"]],
    body: filteredTransactions.map((t) => [
      new Date(t.timestamp).toLocaleDateString(),
      t.items.length,
      t.paymentMethod,
      t.cashierName,
      `₦${t.total.toLocaleString()}`,
    ]),
  });

  doc.save(`sales-report-${dateFilter}.pdf`);
};
```

---

### 6. History Page (`/history`)

**File:** `src/pages/History.tsx`

**Tab Logic:**

```typescript
const [activeTab, setActiveTab] = useState<"transactions" | "activities">(
  "transactions"
);
```

**Transaction Display:**

```typescript
transactions.map((tx) => (
  <Card key={tx.id}>
    <div className="flex justify-between">
      <div>
        <p className="font-bold">Sale #{tx.id.slice(-6)}</p>
        <p className="text-sm">
          {tx.paymentMethod} • {tx.cashierName}
        </p>
        <p className="text-xs">{formatDate(tx.timestamp)}</p>
      </div>
      <p className="font-bold text-lg">₦{tx.total.toLocaleString()}</p>
    </div>

    {/* Expandable items list */}
    <Collapsible>
      {tx.items.map((item) => (
        <div key={item.id}>
          {item.name} x{item.quantity} = ₦
          {(item.price * item.quantity).toLocaleString()}
        </div>
      ))}
    </Collapsible>
  </Card>
));
```

---

## Data Storage & Persistence

### 1. Server Storage (Supabase PostgreSQL)

| Table            | Data Stored                                                         | Sync Type |
| ---------------- | ------------------------------------------------------------------- | --------- |
| `products`       | name, price, quantity, category_id, image_url, description, barcode | Real-time |
| `categories`     | name                                                                | On-demand |
| `transactions`   | items (JSON), total, payment_method, cashier_name, customer (JSON)  | Real-time |
| `activities`     | type, description, details (JSON)                                   | Real-time |
| `admin_settings` | PIN hash, email, WhatsApp, security Q&A, toggles                    | On-demand |
| `stores`         | name, owner_id                                                      | On-demand |
| `user_roles`     | store_id, user_id, role                                             | On-demand |

### 2. Client Storage (localStorage)

| Key                     | Data              | Purpose                       |
| ----------------------- | ----------------- | ----------------------------- |
| `quik-shopping-carts`   | Cart state (JSON) | Persist carts across sessions |
| `theme`                 | 'light' \| 'dark' | User theme preference         |
| `walkthrough-completed` | boolean           | Skip intro walkthrough        |
| `sb-xxx-auth-token`     | Session token     | Supabase auth persistence     |

### 3. File Storage (Supabase Storage)

| Bucket     | Contents       | Access      |
| ---------- | -------------- | ----------- |
| `products` | Product images | Public URLs |

---

## Real-Time Synchronization

### Supabase Realtime Subscriptions

```typescript
// Products channel
const productsChannel = supabase
  .channel("public:products")
  .on(
    "postgres_changes",
    {
      event: "*", // INSERT, UPDATE, DELETE
      schema: "public",
      table: "products",
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      handleRealtimeProductUpdate(payload);
    }
  )
  .subscribe();

// Realtime handler
const handleRealtimeProductUpdate = (payload: any) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;

  // Show syncing indicator
  setAuthenticatedState((prev) => ({ ...prev, isSyncing: true }));
  setTimeout(() => {
    setAuthenticatedState((prev) => ({ ...prev, isSyncing: false }));
  }, 1000);

  setAuthenticatedState((prev) => {
    let updatedProducts = [...prev.products];

    if (eventType === "INSERT") {
      // Add new product
      updatedProducts.push(transformProduct(newRecord));
      updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (eventType === "UPDATE") {
      // Update existing product
      const index = updatedProducts.findIndex((p) => p.id === newRecord.id);
      if (index !== -1) {
        updatedProducts[index] = transformProduct(newRecord);
      }
    } else if (eventType === "DELETE") {
      // Remove product
      updatedProducts = updatedProducts.filter((p) => p.id !== oldRecord.id);
    }

    return { ...prev, products: updatedProducts };
  });
};
```

### Visibility Change Handler

```typescript
// Refresh data when app regains focus
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      Promise.all([
        loadCategories(),
        loadTransactions(),
        loadActivities(),
      ]).catch(console.error);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [user]);
```

---

## Validation & Error Handling

### Form Validation

**Nigerian Phone Number:**

```typescript
const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");

  // Nigerian formats: 08012345678, +2348012345678, 2348012345678
  const patterns = [
    /^0[789][01]\d{8}$/, // Local format
    /^\+234[789][01]\d{8}$/, // International with +
    /^234[789][01]\d{8}$/, // International without +
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
};

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, "");

  if (cleaned.startsWith("0")) {
    return "+234" + cleaned.slice(1);
  }
  if (cleaned.startsWith("234")) {
    return "+" + cleaned;
  }
  return cleaned;
};
```

**PIN Validation:**

```typescript
if (pin !== confirmPin) {
  throw new Error("PINs do not match");
}

if (!/^\d{4,}$/.test(pin)) {
  throw new Error("PIN must be at least 4 digits");
}
```

### Error Recovery

**Retry Logic for Products:**

```typescript
const loadProducts = async (force = false, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    // Success handling...
  } catch (error) {
    console.error(
      `Error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`,
      error
    );

    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      return loadProducts(force, retryCount + 1);
    }

    // Max retries reached
    toast({
      title: "Error loading products",
      description: "Pull to refresh to try again.",
      variant: "destructive",
    });
  }
};
```

---

## Security Logic

### Row Level Security (RLS)

All tables enforce user isolation via RLS policies:

```sql
-- Products can only be accessed by owner
CREATE POLICY "Users can only see own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own products"
ON products FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete own products"
ON products FOR DELETE
USING (auth.uid() = user_id);
```

### Admin PIN Hashing

PIN is never stored in plain text:

- Hashed on the server via `admin-setup` edge function
- Verification done via `admin-verify` edge function
- Reset via `admin-reset-pin` with security question verification

### Session Management

```typescript
// Admin session has expiry
interface AdminState {
  sessionToken: string | null;
  expiresAt: string | null;
}

// Auto-expire check
const isSessionValid = () => {
  if (!state.expiresAt) return false;
  return new Date() < new Date(state.expiresAt);
};
```

---

## Transaction Processing

### Complete Sale Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRANSACTION PROCESSING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PRE-VALIDATION                                              │
│     ├── Check each cart item against current product stock      │
│     ├── If any item unavailable → Show error, abort             │
│     └── All items valid → Proceed                               │
│                                                                 │
│  2. STOCK DEDUCTION                                             │
│     For each item in cart:                                      │
│       └── updateProductQuantity(productId, -quantity, silent)   │
│           ├── Optimistic UI update                              │
│           ├── Supabase UPDATE products SET quantity -= ?        │
│           └── Realtime broadcast to other clients               │
│                                                                 │
│  3. TRANSACTION RECORDING                                       │
│     └── addTransaction({                                        │
│           items: [...],                                         │
│           total: 45000,                                         │
│           paymentMethod: 'transfer',                            │
│           cashierName: 'John',                                  │
│           customer: { name: 'Jane', phone: '+234...' }          │
│         })                                                      │
│         ├── INSERT INTO transactions                            │
│         ├── Add to local state                                  │
│         └── Realtime broadcast                                  │
│                                                                 │
│  4. ACTIVITY LOGGING                                            │
│     └── logActivity({                                           │
│           type: 'sale_completed',                               │
│           description: 'Sale completed: ₦45,000',               │
│           details: { items, cashierName, customer, ... }        │
│         })                                                      │
│                                                                 │
│  5. CLEANUP                                                     │
│     ├── closeCart(activeCartId)  // Remove cart                 │
│     ├── Reset form state                                        │
│     └── Show success toast                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Race Condition Prevention

**Problem:** Multiple cashiers might sell the same product simultaneously.

**Solution:** Two-layer validation:

1. **Real-time adjustment:** When products update via Supabase Realtime, cart quantities are automatically adjusted down if they exceed available stock.

2. **Pre-sale validation:** Right before completing a sale, re-check all items against current stock. If any item is unavailable, show error and abort.

```typescript
// Layer 1: Real-time cart adjustment
useEffect(() => {
  if (products.length > 0) {
    const result = validateAndAdjustCarts(products);
    if (result.adjusted) {
      toast({ title: "Cart Updated", description: "..." });
    }
  }
}, [products]);

// Layer 2: Pre-sale validation
const handleFinalSubmit = async () => {
  const validation = validateCartItems(products);
  if (!validation.isValid) {
    toast({ title: "Cannot Complete Sale", variant: "destructive" });
    return;
  }
  // Proceed with sale...
};
```

---

## Activity Logging System

### Activity Types

| Type                     | Trigger                | Details Logged                                       |
| ------------------------ | ---------------------- | ---------------------------------------------------- |
| `product_added`          | addProduct()           | productName, price, quantity, category, cashierName  |
| `product_edited`         | updateProduct()        | productName, changes[], cashierName                  |
| `product_deleted`        | deleteProduct()        | productName, price, quantity, category, cashierName  |
| `category_added`         | addCategory()          | categoryName, cashierName                            |
| `category_edited`        | editCategory()         | oldName, newName, cashierName                        |
| `category_deleted`       | deleteCategory()       | categoryName, productsAffected, cashierName          |
| `sale_completed`         | addTransaction()       | total, paymentMethod, items[], cashierName, customer |
| `admin_settings_changed` | toggleSettings()       | settingChanged, newValue, changedBy                  |
| `cashier_added`          | addManagedCashier()    | cashierName, addedBy                                 |
| `cashier_removed`        | removeManagedCashier() | cashierName, removedBy                               |
| `admin_signout`          | signOutAdmin()         | signoutTime, sessionToken                            |

### Log Structure

```typescript
interface ActivityLog {
  id: string;
  type: string;
  description: string;
  details: Record<string, any>;  // JSON object
  timestamp: Date;
}

// Example logged activity
{
  id: 'act_abc123',
  type: 'sale_completed',
  description: 'Sale completed: ₦45,000',
  details: {
    total: '₦45,000',
    paymentMethod: 'transfer',
    items: ['Product A x2', 'Product B x1'],
    cashierName: 'John Doe',
    customer: { name: 'Jane Smith', phone: '+2348012345678' }
  },
  timestamp: new Date('2025-12-30T14:30:00Z')
}
```

---

## Summary

This documentation covers the complete logic of the Quik Shopping POS application:

1. **State Management:** React Context with dual demo/authenticated states
2. **Data Flow:** Optimistic updates with server sync
3. **Contexts:** 5 major providers handling auth, admin, products, cart, and theme
4. **Pages:** Detailed logic for all 12+ pages
5. **Persistence:** Supabase PostgreSQL + localStorage hybrid
6. **Real-time:** Supabase Realtime for multi-device sync
7. **Validation:** Form, stock, and transaction validation
8. **Security:** RLS, PIN hashing, session management
9. **Transactions:** Complete sale flow with race condition prevention
10. **Logging:** Comprehensive activity audit trail
