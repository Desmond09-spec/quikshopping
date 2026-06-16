# Quik Shopping - Navigation & Pages Comprehensive Guide

## Complete Documentation of UI Structure, Page Concepts, and Navigation Flow

---

## Table of Contents

1. [Navigation Architecture Overview](#navigation-architecture-overview)
2. [Layout System](#layout-system)
3. [Bottom Navigation Bar](#bottom-navigation-bar)
4. [Page Concepts & Detailed Breakdown](#page-concepts--detailed-breakdown)
5. [Settings as Navigation Hub](#settings-as-navigation-hub)
6. [Navigation Flow Diagrams](#navigation-flow-diagrams)
7. [UI Positioning & Glow Effects](#ui-positioning--glow-effects)
8. [Route Protection & Access Control](#route-protection--access-control)
9. [Page Integration Patterns](#page-integration-patterns)

---

## Navigation Architecture Overview

Quik Shopping implements a **two-tier navigation system** designed for mobile-first usage:

### Tier 1: Primary Navigation (Bottom Nav Bar)

A fixed bottom navigation bar provides instant access to the 5 most frequently used destinations:

- **Products** (Home)
- **Cart**
- **Add Product**
- **History**
- **Settings**

### Tier 2: Secondary Navigation (Settings Hub)

The Settings page acts as a central hub, containing cards and buttons that redirect to:

- Reports & Analytics
- Admin Setup
- Product Inventory
- Authentication
- Individual Product Editing

This architecture follows the principle: **"Frequent actions in nav bar, advanced features through Settings."**

---

## Layout System

### File Reference

`src/components/Layout.tsx` (153 lines)

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Logo] App Name                        [Cart Total] │   │
│  │        Welcome Message                              │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                     MAIN CONTENT                            │
│                   (Scrollable Area)                         │
│                                                             │
│                   Page children render here                 │
│                                                             │
│                   Bottom padding: pb-20                     │
│                   (Clears nav bar height)                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    BOTTOM NAVIGATION                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Products │  Cart  │ Add Product │ History │ Settings│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Header Component

**Positioning:** `sticky top-0 z-50`

- Stays fixed at top during scroll
- High z-index ensures it overlays content

**Visual Effects:**

- `backdrop-blur-sm` - Glassmorphism blur effect
- Semi-transparent background (`bg-card/95`)
- Bottom border for visual separation

**Content Elements:**

1. **Logo** - 32x32px rounded image
2. **App Title** - "Quik Shopping" with sync indicator
3. **Welcome Message** - Shows user email or "Demo Mode"
4. **Cart Total Badge** - Pill-shaped, shows current cart value

**Sync Indicator:**
When data is syncing with Supabase, a spinning refresh icon appears next to the title:

```
Quik Shopping [↻ spinning]
```

### Main Content Area

**Purpose:** Container for page-specific content

**Styling:**

- `pb-20` - 80px bottom padding to prevent content from hiding behind the fixed nav bar
- Full height minus header
- Scrollable overflow

**Integration:**
All pages are wrapped in this Layout component, ensuring consistent structure:

```tsx
<Layout>
  <PageContent />
</Layout>
```

---

## Bottom Navigation Bar

### Positioning

**CSS Properties:**

```
position: fixed
bottom: 0
left: 0
right: 0
z-index: 50
```

This creates a navigation bar that:

- Is always visible regardless of scroll position
- Spans the full width of the viewport
- Overlays any content that scrolls beneath it

### Navigation Items

| Order | Name        | Icon          | Route          | Description                    |
| ----- | ----------- | ------------- | -------------- | ------------------------------ |
| 1     | Products    | `Package`     | `/`            | Home page with product catalog |
| 2     | Cart        | `ShoppingBag` | `/cart`        | Shopping cart and checkout     |
| 3     | Add Product | `Plus`        | `/add-product` | Create new product form        |
| 4     | History     | `History`     | `/history`     | Transaction and activity logs  |
| 5     | Settings    | `Settings`    | `/settings`    | App configuration and admin    |

### Item Layout

**Container:**

- `flex items-center justify-around` - Evenly distributed items
- `py-2` - Vertical padding for comfortable touch targets
- `container mx-auto px-2` - Centered with horizontal padding

**Individual Item:**

```
┌─────────────┐
│    [Icon]   │  <- 20x20px icon with optional badge
│   Label     │  <- Text label below icon
└─────────────┘
```

**Touch Target:**

- `px-3 py-2` - Generous padding for mobile touch
- `rounded-lg` - Rounded corners for visual softness
- Minimum touch target approximately 48x48px

### Active vs Inactive States

**Inactive State:**

- Text/icon in muted foreground
- Transparent background
- On hover: slight background tint, foreground text

**Active State:**

- Primary tinted background (`bg-primary/10`)
- Primary text/icon
- Visual indication of current location

### Transition Effects

All navigation items use smooth transitions:

- `transition-smooth` custom class for state changes
- Hover states animate smoothly
- Active state changes are immediate for responsiveness

### Cart Badge

**Purpose:** Shows total item quantity in cart

**Positioning:**

```
position: absolute
top: -8px (−0.5rem)
right: -8px (−0.5rem)
```

**Visual Design:**

- Circular shape: `rounded-full w-5 h-5`
- Centered content: `flex items-center justify-center`
- Small text: `text-xs font-medium`
- Caps at "9+" for numbers above 9

**Calculation:**
Badge shows total quantity across all items:

```typescript
activeCart.items.reduce((sum, item) => sum + item.quantity, 0);
```

---

## Page Concepts & Detailed Breakdown

### 1. Home Page (Products)

**Route:** `/`
**File:** `src/pages/Home.tsx` (210 lines)
**Purpose:** Primary product browsing and shopping interface

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Search Bar]                                    [Scan 📷] │
├─────────────────────────────────────────────────────────────┤
│  [All] [Drinks] [Groceries] [Snacks] [Electronics] ...     │
│  ← Horizontally scrollable category chips →                 │
├─────────────────────────────────────────────────────────────┤
│  Products                              [+ Add Product]      │
│  X products in Category                                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │ Product │ │ Product │ │ Product │                       │
│  │  Card   │ │  Card   │ │  Card   │                       │
│  │         │ │         │ │         │                       │
│  │ [Add]   │ │ [Add]   │ │ [Add]   │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │ Product │ │ Product │ │ Product │                       │
│  │  Card   │ │  Card   │ │  Card   │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

#### Components Used

1. **SearchBar** - Text input with barcode scanner trigger
2. **CategoryFilter** - Horizontal chip selector
3. **ProductCard** - Individual product display with add-to-cart
4. **BarcodeScanner** - Modal overlay for camera scanning
5. **PullToRefresh** - Gesture-based data refresh

#### Functionality

**Search:**

- Filters products by name, category, or barcode
- Instant filtering as user types
- Barcode scan auto-fills search

**Category Filtering:**

- "All" shows complete catalog
- Selecting category filters products
- Combined with search for precise results

**Product Cards:**

- Display: name, price, stock quantity, image
- Add to cart button (quantity validation)
- Respects admin product action restrictions

**Admin Gating:**
When `requireAdminForProductActions` is enabled:

- "Add Product" button shows lock icon
- Displays "Admin Only" instead of action
- Clicking shows toast notification

#### Data Loading

- Products lazy-load on mount
- Auto-retry after 3 seconds if empty
- Pull-to-refresh forces reload
- Real-time updates via Supabase subscription

#### Navigation Connections

| Action                            | Destination                         |
| --------------------------------- | ----------------------------------- |
| Click "Add Product"               | `/add-product`                      |
| Click product edit (if available) | `/edit-product/:id`                 |
| Add item to cart                  | Stays on page, updates cart context |
| Bottom nav Cart                   | `/cart`                             |

---

### 2. Cart Page

**Route:** `/cart`
**File:** `src/pages/Cart.tsx` (782 lines)
**Purpose:** Shopping cart management and transaction processing

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Cart                                                       │
│  Manage your shopping cart                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Cart 1] [Cart 2] [Cart 3]  [+ New Cart]           │   │
│  │  ← Tab navigation for multiple carts →               │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Item Name                                    Price │   │
│  │  [−] Quantity [+]                      ₦ Subtotal  │   │
│  │                                              [🗑️]  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Item Name                                    Price │   │
│  │  [−] Quantity [+]                      ₦ Subtotal  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Subtotal                                    ₦ XX,XXX      │
│  Total                                       ₦ XX,XXX      │
├─────────────────────────────────────────────────────────────┤
│                    [Complete Sale]                          │
└─────────────────────────────────────────────────────────────┘
```

#### Multi-Cart System

**Concept:** Users can create up to 10 simultaneous carts

**Use Cases:**

- Multiple customers checking out
- Holding items while browsing
- Separating business and personal purchases

**Cart Tabs:**

- Horizontally scrollable tab bar
- Active cart highlighted
- "+" button creates new cart
- "×" button closes/deletes cart

#### Cart Item Management

**Quantity Controls:**

- Decrement button (−) - Reduces by 1
- Quantity display - Current count
- Increment button (+) - Increases by 1

**Validation:**

- Cannot exceed available stock
- Cannot go below 0 (removes item)
- Real-time stock checking
- Shows warning if stock changed

**Remove Item:**

- Trash icon button
- Removes entire line item
- Confirmation not required (instant)

#### Checkout Flow

**Step 1: Initiate Checkout**

- Click "Complete Sale" button
- Opens payment method modal

**Step 2: Select Payment Method**

```
┌─────────────────────────────────────────┐
│        Select Payment Method            │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Cash   │ │   POS   │ │Transfer │   │
│  │   💵    │ │   💳    │ │   🏦    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

**Step 3: Cashier Identification**

- Enter cashier name (if not disabled)
- Dropdown or freetext based on settings

**Step 4: Customer Details (Transfer only)**

```
┌─────────────────────────────────────────┐
│       Customer Information              │
├─────────────────────────────────────────┤
│  Customer Name: [___________________]   │
│  Phone Number:  [___________________]   │
│                                         │
│             [Submit]                    │
└─────────────────────────────────────────┘
```

**Step 5: Transaction Completion**

- Stock deducted from inventory
- Transaction recorded in database
- Activity logged
- Cart cleared
- Success toast displayed

#### Pre-Sale Validation

Before completing sale, the system:

1. Re-checks current stock levels
2. Compares against cart quantities
3. Adjusts or warns if stock changed
4. Prevents overselling via race conditions

#### Navigation Connections

| Action                | Destination                       |
| --------------------- | --------------------------------- |
| Continue Shopping     | `/` (Products)                    |
| Complete Sale         | Stays on page, shows confirmation |
| After successful sale | Cart cleared, stays on page       |

---

### 3. Add Product Page

**Route:** `/add-product`
**File:** `src/pages/AddProduct.tsx` (390 lines)
**Purpose:** Create new products in inventory

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                          Add New Product            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    [Upload Image]                    │   │
│  │                    ┌───────────┐                     │   │
│  │                    │   📷      │                     │   │
│  │                    │  Upload   │                     │   │
│  │                    └───────────┘                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Product Name *                                             │
│  [_________________________________________________]       │
│                                                             │
│  Price (₦) *                                                │
│  [_________________________________________________]       │
│                                                             │
│  Quantity *                                                 │
│  [_________________________________________________]       │
│                                                             │
│  Category *                                                 │
│  [▼ Select Category________________________]               │
│                                                             │
│  Barcode (Optional)                                         │
│  [_________________________________] [Scan]                 │
│                                                             │
│  Description (Optional)                                     │
│  [_________________________________________________]       │
│  [_________________________________________________]       │
│                                                             │
│                    [Add Product]                            │
└─────────────────────────────────────────────────────────────┘
```

#### Form Fields

| Field       | Type        | Required | Validation         |
| ----------- | ----------- | -------- | ------------------ |
| Image       | File upload | No       | Image types only   |
| Name        | Text        | Yes      | Non-empty          |
| Price       | Number      | Yes      | Positive number    |
| Quantity    | Integer     | Yes      | Non-negative       |
| Category    | Select      | Yes      | From category list |
| Barcode     | Text        | No       | Any format         |
| Description | Textarea    | No       | Max 500 chars      |

#### Image Upload

**Process:**

1. User clicks upload area
2. File picker opens (images only)
3. Preview displayed immediately
4. On submit, uploads to Supabase Storage
5. URL stored with product

**Storage Location:**
`products` bucket in Supabase Storage

#### Cashier Dialog Integration

If cashier dialog is enabled:

1. User fills form and clicks "Add Product"
2. Cashier selection modal appears
3. User selects/enters cashier name
4. Product created with cashier attribution
5. Activity logged with cashier name

If disabled:

- Skips cashier dialog
- Uses "admin" as default attribution

#### Admin Gating

When `requireAdminForProductActions` is enabled:

- Non-admin users see locked state
- Form fields disabled
- Message explains requirement
- Must sign in as admin first

#### Navigation Connections

| Action              | Destination                 |
| ------------------- | --------------------------- |
| Back button         | Previous page (usually `/`) |
| Successful creation | `/` (Products)              |
| Cancel              | `/` (Products)              |

---

### 4. History Page

**Route:** `/history`
**File:** `src/pages/History.tsx` (720 lines)
**Purpose:** View transaction history and activity audit logs

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  History                                                    │
│  View your transaction history and activity                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │     [Transactions]          [Activity Logs]         │   │
│  │     ─────────────                                   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🛒 Sale #12345                        ₦ 15,500    │   │
│  │     Cash • John Doe                                 │   │
│  │     Dec 30, 2025 at 2:30 PM                        │   │
│  │                                         [View →]   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🛒 Sale #12344                        ₦ 8,200     │   │
│  │     Transfer • Jane Smith                           │   │
│  │     Dec 30, 2025 at 1:15 PM                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🛒 Sale #12343                        ₦ 3,750     │   │
│  │     POS • Mike Johnson                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Tab Navigation

**Transactions Tab:**

- Lists all completed sales
- Shows: amount, payment method, cashier, timestamp
- Expandable for item details

**Activity Logs Tab:**

- System-wide audit trail
- Includes: product changes, admin actions, sign-ins
- Links to detailed activity view

#### Transaction Details

Each transaction card shows:

1. **Amount** - Total sale value
2. **Payment Method** - Cash/POS/Transfer icon
3. **Cashier** - Who processed the sale
4. **Timestamp** - When it occurred
5. **Items** - Expandable list of products

#### Activity Types

| Type               | Description            | Icon |
| ------------------ | ---------------------- | ---- |
| `sale`             | Transaction completed  | 🛒   |
| `product_added`    | New product created    | ➕   |
| `product_updated`  | Product modified       | ✏️   |
| `product_deleted`  | Product removed        | 🗑️   |
| `admin_signin`     | Admin mode activated   | 🔐   |
| `admin_signout`    | Admin mode deactivated | 🔓   |
| `settings_changed` | Configuration modified | ⚙️   |

#### Filtering & Search

**Date Filtering:**

- Today
- Yesterday
- This Week
- This Month
- Custom Range

**Search:**

- By transaction ID
- By cashier name
- By customer name (for transfers)

#### Navigation Connections

| Action             | Destination             |
| ------------------ | ----------------------- |
| Click transaction  | Expands details inline  |
| Click activity log | `/activity/:activityId` |
| Pull to refresh    | Reloads data            |

---

### 5. Settings Page (Navigation Hub)

**Route:** `/settings`
**File:** `src/pages/Settings.tsx` (850 lines)
**Purpose:** Central configuration hub and secondary navigation

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                │
│  Manage your account and store                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 ACCOUNT                                          │   │
│  │    Signed in as: user@email.com                     │   │
│  │    [Sign Out]                                        │   │
│  │    ── or ──                                          │   │
│  │    [Sign In / Sign Up] → Navigates to /auth         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📊 STORE OVERVIEW                                   │   │
│  │    ┌──────────┬──────────┬──────────┐               │   │
│  │    │ Today's  │ Profit/  │ Low      │               │   │
│  │    │ Sales    │ Loss     │ Stock    │               │   │
│  │    │ ₦15,500  │ ₦0       │ 5        │               │   │
│  │    └──────────┴──────────┴──────────┘               │   │
│  │    [View Full Reports →] → Navigates to /reports    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎨 APP SETTINGS                                     │   │
│  │    [🌙 Switch to Dark/Light Mode]                   │   │
│  │    [📲 Install App] (PWA)                           │   │
│  │    [❓ View App Walkthrough] → Opens modal          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔐 ADMIN SETTINGS                                   │   │
│  │    [Setup Admin Access] → Navigates to /admin-setup │   │
│  │    [Sign In as Admin] → Opens PIN modal             │   │
│  │    ─── When signed in as admin: ───                 │   │
│  │    [Toggle] Disable Cashier Dialog                  │   │
│  │    [Toggle] Require Admin for Products              │   │
│  │    [🛡️ Manage Security Question] → Opens modal     │   │
│  │    [🗑️ Clear All Data] → Opens confirmation        │   │
│  │    [Sign Out of Admin Mode]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👥 CASHIER MANAGEMENT                               │   │
│  │    Managed cashiers list (inline CRUD)              │   │
│  │    [+ Add Cashier]                                  │   │
│  │    Sign-in mode: [Dropdown ▼] / [Freetext]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🏷️ CATEGORY MANAGER                                 │   │
│  │    Category list with edit/delete (inline)          │   │
│  │    [+ Add Category]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📦 PRODUCT MANAGEMENT                               │   │
│  │    X products in inventory                          │   │
│  │    [Add Product] → Navigates to /add-product        │   │
│  │    [View Inventory] → Navigates to /products-inventory│  │
│  │    ─── Quick Actions ───                            │   │
│  │    Product list with [Edit] [Delete] buttons        │   │
│  │    Edit → Navigates to /edit-product/:id            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ❓ FAQ                                              │   │
│  │    Accordion-style help content                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Card Sections Breakdown

**1. Account Card**

- Shows current authentication status
- Sign in/out functionality
- Navigates to `/auth` for authentication

**2. Store Overview Card** (authenticated only)

- Quick metrics: sales, profit, low stock count
- "View Full Reports" button → `/reports`

**3. App Settings Card**

- Theme toggle (inline action)
- PWA install button (inline action)
- Walkthrough trigger (opens modal)

**4. Admin Settings Card** (authenticated only)

- Setup → `/admin-setup`
- Sign in as admin → opens PIN dialog
- Toggle controls when in admin mode
- Security question → opens modal
- Clear data → opens confirmation dialog

**5. Cashier Management**

- Inline list with add/remove
- No navigation, all actions inline

**6. Category Manager**

- Inline CRUD operations
- No navigation required

**7. Product Management**

- Add Product → `/add-product`
- View Inventory → `/products-inventory`
- Edit buttons → `/edit-product/:id`

**8. FAQ Section**

- Accordion component
- No navigation, expands inline

#### Navigation from Settings

| Button/Action      | Destination Type | Target                |
| ------------------ | ---------------- | --------------------- |
| Sign In/Sign Up    | Page Navigation  | `/auth`               |
| View Full Reports  | Page Navigation  | `/reports`            |
| Setup Admin Access | Page Navigation  | `/admin-setup`        |
| Add Product        | Page Navigation  | `/add-product`        |
| View Inventory     | Page Navigation  | `/products-inventory` |
| Edit Product       | Page Navigation  | `/edit-product/:id`   |
| Sign In as Admin   | Modal            | PIN entry dialog      |
| Theme Toggle       | Inline Action    | Toggles theme         |
| Install App        | Inline Action    | PWA install prompt    |
| View Walkthrough   | Modal            | Walkthrough overlay   |
| Security Question  | Modal            | Security setup dialog |
| Clear All Data     | Modal            | Confirmation dialog   |

---

### 6. Reports Page

**Route:** `/reports`
**File:** `src/pages/Reports.tsx` (500 lines)
**Purpose:** Comprehensive analytics and report generation

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Reports                                                 │
│  Analyze your business performance                          │
├─────────────────────────────────────────────────────────────┤
│  Date Range:                                                │
│  [Today] [Yesterday] [This Week] [This Month] [All Time]   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┬──────────────────────┐           │
│  │    Total Sales       │   Total Transactions │           │
│  │    ₦ 125,500         │   47                 │           │
│  └──────────────────────┴──────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Payment Method Breakdown                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Cash      ████████████████████  65%   ₦81,575     │   │
│  │  POS       ████████              25%   ₦31,375     │   │
│  │  Transfer  ████                  10%   ₦12,550     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Top Selling Products                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Product A          150 sold         ₦45,000    │   │
│  │  2. Product B          120 sold         ₦36,000    │   │
│  │  3. Product C           95 sold         ₦28,500    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    [📥 Download PDF Report]                 │
└─────────────────────────────────────────────────────────────┘
```

#### Date Range Filtering

Filter buttons that recalculate all metrics:

| Filter     | Date Range            |
| ---------- | --------------------- |
| Today      | Start of today to now |
| Yesterday  | Full previous day     |
| This Week  | Start of week to now  |
| This Month | Start of month to now |
| All Time   | All historical data   |

#### Metrics Displayed

1. **Total Sales** - Sum of all transaction totals
2. **Transaction Count** - Number of completed sales
3. **Average Transaction** - Total / Count
4. **Payment Breakdown** - Percentage by method
5. **Top Products** - Best sellers by quantity

#### PDF Generation

Uses `jspdf` and `jspdf-autotable`:

1. Click "Download PDF Report"
2. Generates formatted PDF with:
   - Header with date range
   - Summary statistics
   - Transaction table
   - Payment breakdown
3. Auto-downloads to device

#### Navigation Connections

| Action          | Destination                         |
| --------------- | ----------------------------------- |
| Back navigation | Previous page (usually `/settings`) |
| PDF download    | File download (stays on page)       |

---

### 7. Products Inventory Page

**Route:** `/products-inventory`
**File:** `src/pages/ProductsInventory.tsx` (430 lines)
**Purpose:** Comprehensive inventory management view

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Products Inventory                                      │
│  Manage your complete product catalog                       │
├─────────────────────────────────────────────────────────────┤
│  [Search products...]                          [Filter ▼]  │
├─────────────────────────────────────────────────────────────┤
│  │ Name          │ Price    │ Stock │ Category │ Actions  │ │
│  ├───────────────┼──────────┼───────┼──────────┼──────────┤ │
│  │ Product A     │ ₦5,500   │ 25    │ Drinks   │ [✏️][🗑️]│ │
│  │ Product B     │ ₦12,000  │ 8 ⚠️  │ Electronics│ [✏️][🗑️]│ │
│  │ Product C     │ ₦800     │ 150   │ Groceries│ [✏️][🗑️]│ │
│  │ Product D     │ ₦3,200   │ 0 🔴  │ Snacks   │ [✏️][🗑️]│ │
│  └───────────────┴──────────┴───────┴──────────┴──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Features

**Table View:**

- Sortable columns
- Scrollable on mobile
- Responsive design

**Stock Indicators:**

- Normal: Standard display
- Low (≤10): Warning indicator ⚠️
- Out (0): Alert indicator 🔴

**Actions:**

- Edit → `/edit-product/:id`
- Delete → Confirmation dialog

**Filtering:**

- Search by name
- Filter by category
- Filter by stock status

#### Navigation Connections

| Action      | Destination         |
| ----------- | ------------------- |
| Edit button | `/edit-product/:id` |
| Back        | `/settings`         |

---

### 8. Edit Product Page

**Route:** `/edit-product/:id`
**File:** `src/pages/EditProduct.tsx` (410 lines)
**Purpose:** Modify existing product details

#### Page Structure

Same as Add Product, but pre-filled with existing data.

**Additional Features:**

- Current image preview with replace option
- Delete button for removing image
- All fields pre-populated

#### Data Loading

1. Extract product ID from URL params
2. Fetch product from context/API
3. Pre-fill form fields
4. Enable editing

#### Navigation Connections

| Action                | Destination                  |
| --------------------- | ---------------------------- |
| Save                  | Previous page (history.back) |
| Cancel                | Previous page                |
| Delete (if available) | `/` or `/products-inventory` |

---

### 9. Admin Setup Page

**Route:** `/admin-setup`
**File:** `src/pages/AdminSetup.tsx` (420 lines)
**Purpose:** Initial admin configuration

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🔐 Admin Setup                                             │
│  Configure your administrative access                       │
├─────────────────────────────────────────────────────────────┤
│  Admin Email                                                │
│  [_________________________________________________]       │
│                                                             │
│  WhatsApp Number (for OTP recovery)                         │
│  [_________________________________________________]       │
│                                                             │
│  Create PIN (4-6 digits)                                    │
│  [● ● ● ●]                                                  │
│                                                             │
│  Confirm PIN                                                │
│  [● ● ● ●]                                                  │
│                                                             │
│  Security Question                                          │
│  [▼ Select a question________________________]             │
│                                                             │
│  Security Answer                                            │
│  [_________________________________________________]       │
│                                                             │
│                    [Complete Setup]                         │
└─────────────────────────────────────────────────────────────┘
```

#### Validation

- Email must be valid format
- PIN must be 4-6 digits
- PINs must match
- All fields required

#### Route Protection

Wrapped in `ProtectedRoute`:

- Requires authentication
- Redirects to `/auth` if not signed in

#### Navigation Connections

| Action         | Destination |
| -------------- | ----------- |
| Complete Setup | `/settings` |
| Back           | `/settings` |

---

### 10. Auth Page

**Route:** `/auth`, `/signin`, `/signup`
**File:** `src/pages/Auth.tsx` (290 lines)
**Purpose:** User authentication

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        [Logo]                               │
│                    Quik Shopping                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     [Sign In]              [Sign Up]                │   │
│  │     ─────────                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Email                                                      │
│  [_________________________________________________]       │
│                                                             │
│  Password                                                   │
│  [_________________________________________________]       │
│                                                             │
│  Display Name (Sign Up only)                                │
│  [_________________________________________________]       │
│                                                             │
│                    [Sign In / Sign Up]                      │
│                                                             │
│            Forgot password? | Continue as Demo              │
└─────────────────────────────────────────────────────────────┘
```

#### Modes

**Sign In Mode:**

- Email + Password
- Submit authenticates

**Sign Up Mode:**

- Email + Password + Display Name
- Creates new account

#### Demo Mode

"Continue as Demo" allows browsing without authentication:

- Limited functionality
- Uses demo data
- Navigates to `/`

#### Navigation Connections

| Action          | Destination            |
| --------------- | ---------------------- |
| Successful Auth | `/` or `/create-store` |
| Demo Mode       | `/`                    |
| OAuth Callback  | `/auth/callback`       |

---

### 11. Activity Details Page

**Route:** `/activity/:activityId`
**File:** `src/pages/ActivityDetails.tsx` (1,300 lines)
**Purpose:** Detailed view of a single activity log entry

#### Content

Displays comprehensive information about a logged activity:

- Activity type and description
- Timestamp
- User who performed action
- Full details JSON
- Related entities

#### Navigation Connections

| Action | Destination |
| ------ | ----------- |
| Back   | `/history`  |

---

### 12. Create Store Page

**Route:** `/create-store`
**File:** `src/pages/CreateStore.tsx` (175 lines)
**Purpose:** Set up a new store for first-time users

#### Flow

1. User signs up
2. Redirected to create store
3. Enter store name
4. Store created with user as owner
5. Redirect to home

#### Route Protection

Wrapped in `ProtectedRoute`

---

## Navigation Flow Diagrams

### Primary User Journey

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   Auth   │────▶│  Home    │────▶│   Cart   │
│  /auth   │     │    /     │     │  /cart   │
└──────────┘     └──────────┘     └──────────┘
                      │                 │
                      ▼                 ▼
                ┌──────────┐     ┌──────────┐
                │   Add    │     │ Checkout │
                │ Product  │     │ Complete │
                └──────────┘     └──────────┘
```

### Settings Hub Navigation

```
                         ┌─────────────────────────┐
                         │      /settings          │
                         │   (Navigation Hub)      │
                         └───────────┬─────────────┘
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │    /reports     │   │  /admin-setup   │   │    /auth        │
     │    Analytics    │   │   Admin Config  │   │  Authentication │
     └─────────────────┘   └─────────────────┘   └─────────────────┘
              │
              ▼
     ┌─────────────────┐
     │  /products-     │────▶ /edit-product/:id
     │   inventory     │
     └─────────────────┘
```

### Complete Navigation Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NAVIGATION MAP                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────── BOTTOM NAV BAR ──────────────────┐              │
│   │                                                      │              │
│   │    [Products]  [Cart]  [Add]  [History]  [Settings] │              │
│   │        /        /cart  /add-    /history  /settings │              │
│   │                        product                       │              │
│   └──────────────────────────────────────────────────────┘              │
│                                                                         │
│   ┌─────────────────── SETTINGS SUB-ROUTES ─────────────┐              │
│   │                                                      │              │
│   │    /reports          - Analytics & PDF export        │              │
│   │    /admin-setup      - First-time admin config       │              │
│   │    /products-inventory - Full inventory table        │              │
│   │    /edit-product/:id - Modify existing product       │              │
│   │                                                      │              │
│   └──────────────────────────────────────────────────────┘              │
│                                                                         │
│   ┌─────────────────── AUTH ROUTES ─────────────────────┐              │
│   │                                                      │              │
│   │    /auth             - Sign in / Sign up             │              │
│   │    /signin           - Alias for /auth               │              │
│   │    /signup           - Alias for /auth               │              │
│   │    /auth/callback    - OAuth redirect handler        │              │
│   │    /create-store     - New user store setup          │              │
│   │                                                      │              │
│   └──────────────────────────────────────────────────────┘              │
│                                                                         │
│   ┌─────────────────── DETAIL ROUTES ───────────────────┐              │
│   │                                                      │              │
│   │    /activity/:id     - Activity log details          │              │
│   │                                                      │              │
│   └──────────────────────────────────────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## UI Positioning & Glow Effects

### Z-Index Layering

```
Z-INDEX STACK (Low to High)
─────────────────────────────────
0-10    : Page content, cards
50      : Header (sticky)
50      : Bottom nav (fixed)
100+    : Modals, dialogs, overlays
```

### Fixed Elements

| Element    | Position  | Properties                           |
| ---------- | --------- | ------------------------------------ |
| Header     | Top       | `sticky top-0 z-50`                  |
| Bottom Nav | Bottom    | `fixed bottom-0 left-0 right-0 z-50` |
| Modals     | Center    | Portal with high z-index             |
| Toast      | Top-right | Fixed with auto-dismiss              |

### Glassmorphism Effect

Applied to header and bottom nav:

```css
background: rgba(card-color, 0.95);
backdrop-filter: blur(4px);
```

This creates:

- Semi-transparent background
- Blur effect on content behind
- Modern, premium appearance

### Glow Effects

**Active Navigation Item:**

```css
.nav-item.active {
  background: primary-color/10; /* 10% opacity glow */
  color: primary-color;
}
```

**Cart Badge:**

```css
.cart-badge {
  background: primary-color;
  box-shadow: 0 0 8px primary-color/50; /* Subtle glow */
}
```

**Premium Buttons:**

```css
.shadow-glow {
  box-shadow: 0 0 15px primary-color/30;
}
```

### Transition Animations

**Navigation Items:**

- Smooth state transitions
- `transition-smooth` class (custom timing)
- Hover effects fade in/out

**Page Transitions:**

- React Suspense fallback
- Loading spinner during lazy load
- No hard page jumps

### Responsive Positioning

**Mobile (< 640px):**

- Full-width bottom nav
- Single column layouts
- Touch-optimized targets

**Tablet (640px - 1024px):**

- Centered container
- 2-column grids
- Adjusted padding

**Desktop (> 1024px):**

- Max-width container
- 3-column product grid
- Comfortable spacing

---

## Route Protection & Access Control

### Protected Routes

Routes wrapped in `ProtectedRoute` component:

| Route           | Protection              |
| --------------- | ----------------------- |
| `/create-store` | Requires authentication |
| `/admin-setup`  | Requires authentication |

### Conditional Access

**Admin-Only Features:**

- Product add/edit/delete (when `requireAdminForProductActions` enabled)
- Admin settings panel
- Clear data functionality

**Authenticated Features:**

- Store overview in settings
- Admin settings section
- Data persistence

### Demo Mode

Unauthenticated users can:

- Browse demo products
- Add to cart (session only)
- View app functionality

Cannot:

- Save data persistently
- Access admin features
- View reports

---

## Page Integration Patterns

### Context Provider Usage

Every page accesses shared state through contexts:

```typescript
const { products, addProduct, loading } = useProducts();
const { user, logout } = useAuth();
const { isAdminMode, adminSettings } = useAdmin();
const { activeCart, addItem } = useCart();
const { theme, toggleTheme } = useTheme();
```

### Data Flow

```
User Action
    │
    ▼
Page Component
    │
    ▼
Context Action (e.g., addProduct)
    │
    ▼
Supabase API Call
    │
    ▼
Database Update
    │
    ▼
Real-time Subscription
    │
    ▼
Context State Update
    │
    ▼
UI Re-render
```

### Cross-Page Communication

Pages don't communicate directly. All shared state flows through contexts:

1. **Cart additions on Home** → Update CartContext → Reflected on Cart page
2. **Product edit on Edit page** → Update ProductContext → Reflected everywhere
3. **Admin sign-in on Settings** → Update AdminContext → Affects all admin-gated UI

---

## Summary

The Quik Shopping navigation system is designed around two principles:

1. **Primary actions accessible via bottom nav** - The 5 most common destinations are always one tap away

2. **Settings as command center** - All advanced features, secondary pages, and admin controls are organized within the Settings page

This creates an intuitive hierarchy:

- Casual users navigate via bottom bar
- Power users access advanced features through Settings
- Admin features are gated behind authentication layers

The UI maintains consistency through:

- Shared Layout component
- Fixed header and bottom nav
- Consistent transitions and animations
- Glassmorphism visual language
- Responsive positioning for all devices
