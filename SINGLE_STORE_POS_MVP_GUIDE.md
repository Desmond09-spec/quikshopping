# Single-Store POS MVP Implementation Guide

## Complete Blueprint for Building a Point of Sale Application

> **Context:** This guide assumes a single store is already authenticated. All features described are for that one store's owner and cashiers.

---

## Table of Contents

1. [Application Shell & Layout](#1-application-shell--layout)
2. [Navigation System](#2-navigation-system)
3. [Products Page (Home)](#3-products-page-home)
4. [Cart Page](#4-cart-page)
5. [Add Product Page](#5-add-product-page)
6. [Edit Product Page](#6-edit-product-page)
7. [History Page](#7-history-page)
8. [Reports Page](#8-reports-page)
9. [Settings Page](#9-settings-page)
10. [Products Inventory Page](#10-products-inventory-page)
11. [Admin System](#11-admin-system)
12. [Cashier Management](#12-cashier-management)
13. [Category Management](#13-category-management)
14. [Transaction System](#14-transaction-system)
15. [Real-Time Features](#15-real-time-features)
16. [PWA & Mobile Features](#16-pwa--mobile-features)

---

## 1. Application Shell & Layout

### 1.1 Overall Structure

The app uses a **sandwich layout** with fixed header, scrollable content, and fixed bottom navigation:

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (sticky top, z-50)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Logo] Store Name                         [₦12,500]     │ │
│ │        Welcome, User                      Cart Total    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    SCROLLABLE CONTENT                       │
│                                                             │
│                    (padding-bottom: 80px)                   │
│                    to clear bottom nav                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ BOTTOM NAV (fixed bottom, z-50)                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Products] [Cart] [Add] [History] [Settings]            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Header Details

**Left Side:**

- **Logo**: 32×32px rounded square image
- **App Name**: Bold title "Quik Shopping"
- **Sync Indicator**: Spinning refresh icon appears during data sync
- **Welcome Message**: Shows user display name or email

**Right Side:**

- **Cart Total Badge**: Pill-shaped container showing current cart value
- Format: `₦12,500` (Nigerian Naira symbol + formatted number)
- Only visible when cart has items and total > 0
- Visual: Semi-transparent background with primary border

**Header Styling:**

- `backdrop-blur-sm` for glassmorphism effect
- Semi-transparent background (95% opacity)
- Bottom border for separation
- Stays visible when scrolling (sticky position)

### 1.3 Main Content Area

- Full height minus header
- Bottom padding of 80px to prevent content hiding behind nav
- Scrollable overflow
- Each page wraps content in this container

---

## 2. Navigation System

### 2.1 Bottom Navigation Bar

**Position:** Fixed at viewport bottom, full width, high z-index

**5 Navigation Items:**

| Icon        | Label       | Route          | Purpose                     |
| ----------- | ----------- | -------------- | --------------------------- |
| Package     | Products    | `/`            | Home - product catalog      |
| ShoppingBag | Cart        | `/cart`        | Shopping cart & checkout    |
| Plus        | Add Product | `/add-product` | Create new product          |
| Clock       | History     | `/history`     | Transaction & activity logs |
| Settings    | Settings    | `/settings`    | Configuration hub           |

**Item Layout:**

```
┌─────────────┐
│   [Icon]    │ ← 20×20px, optional badge overlay
│   Label     │ ← 12px text below
└─────────────┘
```

**Touch Target:** Minimum 48×48px with padding `px-3 py-2`

### 2.2 Navigation States

**Inactive:**

- Muted foreground text/icon
- Transparent background
- Hover: Slight background tint

**Active:**

- Primary text/icon
- Light primary background (10% opacity)
- Indicates current page

### 2.3 Cart Badge

**Position:** On Cart icon, top-right offset (`-top-2 -right-2`)
**Shape:** Circle, 20×20px
**Content:** Item count (capped at "9+" for 10+)
**Calculation:** Sum of all item quantities in active cart
**Visibility:** Only when cart has items

### 2.4 Settings as Navigation Hub

Settings page contains buttons/cards that navigate to secondary pages:

- `/reports` - Full analytics
- `/products-inventory` - Inventory table
- `/edit-product/:id` - Product editing
- `/admin-setup` - First-time admin config

---

## 3. Products Page (Home)

**Route:** `/`
**Purpose:** Browse products, add to cart, search, filter by category

### 3.1 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🔍 Search products...]                        [📷 Scan]│ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [All] [Drinks] [Groceries] [Snacks] [Electronics] →        │
│ ← Horizontal scroll for categories                          │
├─────────────────────────────────────────────────────────────┤
│ Products                                    [+ Add Product] │
│ 24 products in Drinks                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │ [Image] │ │ [Image] │ │ [Image] │                        │
│ │ Name    │ │ Name    │ │ Name    │                        │
│ │ ₦500    │ │ ₦1,200  │ │ ₦350    │                        │
│ │ 25 left │ │ 8 left  │ │ 100 left│                        │
│ │ [+ Add] │ │ [+ Add] │ │ [+ Add] │                        │
│ └─────────┘ └─────────┘ └─────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Search Bar

**Position:** Top of page, full width
**Elements:**

- Text input with search icon prefix
- Placeholder: "Search products..."
- Barcode scanner button on right side

**Search Logic:**

- Filters by product name (case-insensitive)
- Filters by category name
- Filters by barcode (exact match)
- Instant filtering as user types

### 3.3 Barcode Scanner

**Trigger:** Camera icon button in search bar
**UI:** Full-screen modal overlay with camera viewfinder
**Logic:**

1. Opens device camera
2. Scans for barcode
3. On detection, fills search with barcode value
4. If product found, optionally auto-add to cart
5. Closes scanner modal

### 3.4 Category Filter

**Layout:** Horizontal scrolling chip/pill buttons
**Items:** "All" + all store categories
**Behavior:**

- Single selection
- "All" shows all products
- Selecting category filters grid
- Works with search (combined filter)

### 3.5 Product Count Header

**Shows:** "X products in [Category]"
**Add Button:** Right-aligned, links to `/add-product`
**Admin Gating:** If admin required for products and not in admin mode, shows lock icon and "Admin Only"

### 3.6 Product Grid

**Layout:** Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
**Gap:** 16px between cards

### 3.7 Product Card

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │         Product Image           │ │
│ │         (or placeholder)        │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Product Name                        │
│ Category                            │
│                                     │
│ ₦1,500                   [+ Add]    │
│ 25 in stock                         │
│                                     │
│ ⚠️ Low stock (if quantity ≤ 10)     │
└─────────────────────────────────────┘
```

**Card Elements:**

- **Image**: Aspect ratio container, object-fit cover, placeholder if none
- **Name**: Bold, truncate if long
- **Category**: Muted small text
- **Price**: Large, primary color, formatted with ₦
- **Stock**: Small text showing quantity
- **Low Stock Badge**: Warning indicator when ≤10 items
- **Add Button**: Adds 1 to cart, disabled if out of stock

**Add to Cart Logic:**

1. Check if product in stock
2. Check if already at max quantity in cart
3. If valid, add to active cart
4. Show toast confirmation
5. Update header cart total

### 3.8 Pull-to-Refresh

**Gesture:** Pull down from top of page
**Action:** Force reload products from server
**Indicator:** Loading spinner during refresh

### 3.9 Empty State

When no products exist:

```
┌─────────────────────────────────────┐
│         [Package Icon]              │
│                                     │
│     No products yet                 │
│     Add your first product          │
│                                     │
│     [+ Add Product Button]          │
└─────────────────────────────────────┘
```

---

## 4. Cart Page

**Route:** `/cart`
**Purpose:** Manage cart items, adjust quantities, complete sales

### 4.1 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ CART TABS                                                   │
│ ┌────────────┐ ┌────────────┐ ┌─────────────┐              │
│ │ Cart 1 ✓  │ │ Cart 2     │ │ + New Cart  │              │
│ │ 3 items   │ │ 1 item     │ │             │              │
│ └────────────┘ └────────────┘ └─────────────┘              │
├─────────────────────────────────────────────────────────────┤
│ Cart 1                                    [🗑️ Clear]       │
│ 3 items                                                     │
├─────────────────────────────────────────────────────────────┤
│ CART ITEMS                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Icon] Product Name                          ₦1,500     │ │
│ │        Category                                         │ │
│ │        [−] 2 [+]                      Subtotal: ₦3,000 │ │
│ │                                                   [🗑️] │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FIXED BOTTOM SUMMARY                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Total Amount                              ₦12,500       │ │
│ │ 5 items                                                 │ │
│ │                    [Complete Sale]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Multi-Cart System

**Purpose:** Handle multiple customers simultaneously
**Limit:** Maximum 10 carts
**Tab Bar:** Horizontal scroll of cart tabs

**Each Tab Shows:**

- Cart name (Cart 1, Cart 2, etc.)
- Item count
- Close button (×) if more than one cart

**New Cart Button:**

- Dashed border styling
- Creates new cart and switches to it
- Disabled at 10 carts

**Cart Switching:**

- Click tab to switch active cart
- Active cart highlighted with primary color
- Cart state persists in localStorage

### 4.3 Cart Item Card

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Icon]  Product Name                              ₦1,500   │
│         Category                                            │
│                                                             │
│         [−]  2  [+]                               [🗑️]     │
│                                                             │
│         ─────────────────────────────────                  │
│         Subtotal                              ₦3,000       │
└─────────────────────────────────────────────────────────────┘
```

**Quantity Controls:**

- Decrement (−): Reduce by 1, removes at 0
- Display: Current quantity
- Increment (+): Increase by 1
- Disabled when at max stock

**Stock Validation:**

- Cannot exceed available stock
- Shows "Low Stock" badge when near limit
- Real-time adjustment if stock changes

**Remove Button:** Instant removal, no confirmation

### 4.4 Real-Time Cart Validation

**When products update (from another device/session):**

1. Compare cart quantities against current stock
2. If any item exceeds stock, auto-adjust down
3. If product out of stock, remove from cart
4. Show toast notification listing adjustments

### 4.5 Fixed Bottom Summary

**Position:** Fixed at bottom (above nav bar on mobile)
**Mobile:** Shows total + amount, checkout icon button in header
**Desktop:** Full summary with "Complete Sale" button

### 4.6 Empty Cart State

```
┌─────────────────────────────────────┐
│       [Shopping Bag Icon]           │
│                                     │
│     Your cart is empty              │
│     Start adding products           │
│                                     │
│     [Browse Products Button]        │
└─────────────────────────────────────┘
```

### 4.7 Checkout Flow

**Step 1: Payment Method Selection**

```
┌─────────────────────────────────────┐
│        Payment Method               │
├─────────────────────────────────────┤
│ ○ Cash                              │
│   Physical cash payment             │
│                                     │
│ ○ POS                               │
│   Card payment via terminal         │
│                                     │
│ ○ Transfer                          │
│   Bank transfer                     │
└─────────────────────────────────────┘
```

**Step 2: Customer Info (Transfer only)**

```
┌─────────────────────────────────────┐
│        Customer Details             │
├─────────────────────────────────────┤
│ Customer Name *                     │
│ [First Last________________]        │
│                                     │
│ Phone Number *                      │
│ [08012345678_______________]        │
│                                     │
│         [Continue]                  │
└─────────────────────────────────────┘
```

**Validation:**

- Name: Required, letters only, at least 2 words
- Phone: Required, valid Nigerian format

**Step 3: Cashier + Summary**

```
┌─────────────────────────────────────┐
│        Cashier Details              │
├─────────────────────────────────────┤
│ Cashier Name *                      │
│ [____________________]              │
│ (or dropdown if configured)         │
├─────────────────────────────────────┤
│ Summary                             │
│ Items: 5                            │
│ Payment: Transfer                   │
│ Customer: John Doe                  │
│ ─────────────────────               │
│ Total: ₦45,000                      │
│                                     │
│      [Complete Sale]                │
└─────────────────────────────────────┘
```

### 4.8 Transaction Completion Logic

1. **Pre-validation:** Re-check all items against current stock
2. **Stock Deduction:** Subtract quantities from inventory
3. **Transaction Record:** Save to database with all details
4. **Activity Log:** Record sale completion
5. **Cart Cleanup:** Close/clear the cart
6. **Feedback:** Success toast notification

---

## 5. Add Product Page

**Route:** `/add-product`
**Purpose:** Create new products in inventory

### 5.1 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                              Add New Product         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              [📷 Upload Image]                          │ │
│ │              Click to upload                            │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Product Name *                                              │
│ [____________________________________]                      │
│                                                             │
│ Price (₦) *                                                 │
│ [____________________________________]                      │
│                                                             │
│ Quantity *                                                  │
│ [____________________________________]                      │
│                                                             │
│ Category *                                                  │
│ [▼ Select category________________]                         │
│                                                             │
│ Barcode (Optional)                                          │
│ [______________________________] [📷 Scan]                  │
│                                                             │
│ Description (Optional)                                      │
│ [____________________________________]                      │
│ [____________________________________]                      │
│                                                             │
│                    [Add Product]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Form Fields

| Field       | Type        | Required | Validation                      |
| ----------- | ----------- | -------- | ------------------------------- |
| Image       | File Upload | No       | Image types only, preview shown |
| Name        | Text        | Yes      | Non-empty, trimmed              |
| Price       | Number      | Yes      | Positive number                 |
| Quantity    | Integer     | Yes      | Non-negative                    |
| Category    | Select      | Yes      | From category list              |
| Barcode     | Text        | No       | Any format                      |
| Description | Textarea    | No       | Max 500 chars                   |

### 5.3 Image Upload

**Flow:**

1. Click upload area
2. File picker opens (images only)
3. Preview displayed immediately
4. On form submit, uploads to storage
5. URL stored with product

### 5.4 Barcode Scanning

**Button:** Next to barcode input
**Action:** Opens camera scanner
**Result:** Fills barcode field with scanned value

### 5.5 Submit Logic

1. Validate all required fields
2. Upload image if provided
3. Create product object
4. Trigger cashier dialog (if enabled)
5. Save to database
6. Log activity
7. Navigate back to home

### 5.6 Admin Gating

If "Require Admin for Product Actions" is enabled:

- Page shows locked state
- Form fields disabled
- Message: "Admin sign-in required"

---

## 6. Edit Product Page

**Route:** `/edit-product/:id`
**Purpose:** Modify existing product details

### 6.1 Layout

Same as Add Product, but:

- Pre-filled with existing data
- Image shows current with "Replace" option
- Submit button says "Save Changes"
- Optional "Delete" button

### 6.2 Data Loading

1. Extract product ID from URL
2. Find product in state
3. Populate form fields
4. Show loading state while fetching

### 6.3 Change Tracking

System tracks what changed for activity logging:

- Name changes
- Price changes
- Quantity changes
- Category changes
- Description updates

---

## 7. History Page

**Route:** `/history`
**Purpose:** View transaction history and activity audit logs

### 7.1 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ History                                                     │
│ View transaction history and activity                       │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┬───────────────────────────────────┐│
│ │    Transactions      │        Activity Logs              ││
│ │    ─────────────     │                                   ││
│ └──────────────────────┴───────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛒 Sale #abc123                              ₦15,500    │ │
│ │    Cash • John Doe                                      │ │
│ │    Dec 30, 2025 at 2:30 PM                   [View →]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛒 Sale #def456                              ₦8,200     │ │
│ │    Transfer • Jane Smith                                │ │
│ │    Dec 30, 2025 at 1:15 PM                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Tab Navigation

**Transactions Tab:**

- List of completed sales
- Sorted by date (newest first)

**Activity Logs Tab:**

- Audit trail of all actions
- Product changes, admin actions, etc.

### 7.3 Transaction Card

**Shows:**

- Transaction ID (last 6 chars)
- Total amount
- Payment method icon
- Cashier name
- Timestamp
- Expandable item list

**Expanded View:**

```
├── Product A × 2 = ₦3,000
├── Product B × 1 = ₦12,500
└── Total: ₦15,500
```

### 7.4 Activity Log Types

| Type             | Icon | Description            |
| ---------------- | ---- | ---------------------- |
| sale_completed   | 🛒   | Transaction completed  |
| product_added    | ➕   | New product created    |
| product_edited   | ✏️   | Product modified       |
| product_deleted  | 🗑️   | Product removed        |
| category_added   | 🏷️   | New category           |
| admin_signin     | 🔐   | Admin mode activated   |
| settings_changed | ⚙️   | Configuration modified |

---

## 8. Reports Page

**Route:** `/reports`
**Purpose:** Analytics, summaries, and PDF export

### 8.1 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Reports                                                  │
│ Analyze your business performance                           │
├─────────────────────────────────────────────────────────────┤
│ Date Range:                                                 │
│ [Today] [Yesterday] [This Week] [This Month] [All Time]    │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────────────┐ ┌────────────────────────┐      │
│ │   Total Sales          │ │   Transactions         │      │
│ │   ₦125,500             │ │   47                   │      │
│ └────────────────────────┘ └────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│ Payment Method Breakdown                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Cash      ████████████████████  65%   ₦81,575          │ │
│ │ POS       ████████              25%   ₦31,375          │ │
│ │ Transfer  ████                  10%   ₦12,550          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   [📥 Download PDF Report]                  │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Date Filters

| Filter     | Range                 |
| ---------- | --------------------- |
| Today      | Start of today to now |
| Yesterday  | Full previous day     |
| This Week  | Last 7 days           |
| This Month | Start of month to now |
| All Time   | All transactions      |

### 8.3 Metrics Calculated

- **Total Sales:** Sum of transaction totals
- **Transaction Count:** Number of sales
- **Average Transaction:** Total / Count
- **Payment Breakdown:** Percentage and amount by method
- **Top Products:** Best sellers by quantity

### 8.4 PDF Export

**Content:**

- Header with store name and date range
- Summary statistics
- Transaction table
- Payment breakdown
- Generated timestamp

---

## 9. Settings Page

**Route:** `/settings`
**Purpose:** Central configuration hub

### 9.1 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                                 │
│ Manage your account and store                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ ACCOUNT ─────────────────────────────────────────────┐  │
│ │ Signed in as: owner@store.com                         │  │
│ │ [Sign Out]                                            │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ STORE OVERVIEW ──────────────────────────────────────┐  │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐               │  │
│ │ │ Today's  │ │ Profit/  │ │ Low      │               │  │
│ │ │ Sales    │ │ Loss     │ │ Stock    │               │  │
│ │ │ ₦15,500  │ │ ₦0       │ │ 5        │               │  │
│ │ └──────────┘ └──────────┘ └──────────┘               │  │
│ │ [View Full Reports →]                                 │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ APP SETTINGS ────────────────────────────────────────┐  │
│ │ [🌙 Switch to Dark/Light Mode]                        │  │
│ │ [📲 Install App]                                      │  │
│ │ [❓ View App Walkthrough]                             │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ ADMIN SETTINGS ──────────────────────────────────────┐  │
│ │ [Setup Admin Access] / [Sign In as Admin]             │  │
│ │ ─── When in admin mode: ───                           │  │
│ │ [Toggle] Disable Cashier Dialog                       │  │
│ │ [Toggle] Require Admin for Products                   │  │
│ │ [🛡️ Security Question]                                │  │
│ │ [🗑️ Clear All Data]                                   │  │
│ │ [Sign Out of Admin Mode]                              │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ CASHIER MANAGEMENT ──────────────────────────────────┐  │
│ │ (See Section 12)                                      │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ CATEGORY MANAGER ────────────────────────────────────┐  │
│ │ (See Section 13)                                      │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ PRODUCT MANAGEMENT ──────────────────────────────────┐  │
│ │ X products in inventory                               │  │
│ │ [Add Product] [View Inventory]                        │  │
│ │ Quick edit/delete list...                             │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ FAQ ─────────────────────────────────────────────────┐  │
│ │ Accordion-style help content                          │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Store Overview Card

**Quick Metrics:**

- Today's sales total
- Profit/loss (placeholder if no cost data)
- Low stock product count (≤10 items)

**Navigation:** "View Full Reports" → `/reports`

### 9.3 App Settings

- **Theme Toggle:** Switch dark/light mode
- **Install App:** PWA install prompt (if available)
- **Walkthrough:** Re-show app introduction

### 9.4 Product Management

- Product count display
- Quick action buttons (Add, View Inventory)
- Inline product list with edit/delete

---

## 10. Products Inventory Page

**Route:** `/products-inventory`
**Purpose:** Full inventory management table view

### 10.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 Inventory                                                │
│ Manage all products                                         │
├─────────────────────────────────────────────────────────────┤
│ [Search...]                                 [Filter ▼]      │
├─────────────────────────────────────────────────────────────┤
│ │ Name       │ Price   │ Stock │ Category   │ Actions    │ │
│ ├────────────┼─────────┼───────┼────────────┼────────────┤ │
│ │ Product A  │ ₦5,500  │ 25    │ Drinks     │ [✏️] [🗑️] │ │
│ │ Product B  │ ₦12,000 │ 8 ⚠️  │ Electronics│ [✏️] [🗑️] │ │
│ │ Product C  │ ₦800    │ 0 🔴  │ Groceries  │ [✏️] [🗑️] │ │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Features

- **Search:** Filter by name
- **Filter:** By category, stock status
- **Stock Indicators:** ⚠️ Low (≤10), 🔴 Out (0)
- **Actions:** Edit → `/edit-product/:id`, Delete with confirmation

---

## 11. Admin System

### 11.1 Purpose

Separate security layer beyond user authentication. Protects sensitive operations with PIN.

### 11.2 Admin Setup (First Time)

**Route:** `/admin-setup`
**Fields:**

- Admin email
- WhatsApp number (for recovery)
- 4-6 digit PIN
- Confirm PIN
- Security question
- Security answer

### 11.3 Admin Sign-In

**Trigger:** "Sign In as Admin" button in Settings
**UI:** Modal with PIN input (4-6 digits)
**On Success:**

- `isAdminMode = true`
- Session token generated
- Expiry time set
- Toast: "Admin mode activated"

### 11.4 Admin Session

- **Expiry:** Auto-reviewed periodically
- **Manual Sign-Out:** Button in Settings
- **On Expiry:** Auto sign-out, toast notification

### 11.5 Admin-Only Features

When `requireAdminForProductActions` enabled:

- Add/Edit/Delete products locked
- Shows lock icon and "Admin Only" message
- Must sign in as admin first

### 11.6 PIN Recovery

**Flow:**

1. Click "Forgot PIN"
2. Answer security question, OR
3. Receive OTP via WhatsApp
4. Verify answer/OTP
5. Set new PIN

---

## 12. Cashier Management

### 12.1 Location

Settings page → Cashier Management card

### 12.2 Features

**Managed Cashiers List:**

- Add approved cashier names
- Remove cashiers
- Stored in database

**Sign-In Mode:**

- **Dropdown:** Cashiers select from approved list
- **Freetext:** Cashiers type any name

### 12.3 Cashier Dialog

When completing sale or product action:

- Modal asks for cashier name
- Uses dropdown or freetext based on setting
- Name logged with transaction/activity

**Disable Option:** Admin can disable to skip dialog

---

## 13. Category Management

### 13.1 Location

Settings page → Category Manager card

### 13.2 Features

**Category List:**

- Shows all categories with product count
- Edit button → rename
- Delete button → removes (moves products to "Other")

**Add Category:**

- Input field + "Add" button
- Validates non-empty, unique name

**Protected Category:**

- "Other" cannot be deleted
- Auto-created if missing

### 13.3 Product Reassignment

When deleting category with products:

1. Find all products in category
2. Move them to "Other" category
3. Delete original category
4. Log activity with affected products

---

## 14. Transaction System

### 14.1 Transaction Data Structure

```typescript
{
  id: string;
  items: [
    { productId, name, price, quantity, category }
  ];
  total: number;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  cashierName: string;
  customer?: { name, phone };  // For transfers
  timestamp: Date;
}
```

### 14.2 Payment Methods

| Method   | Customer Info | Description           |
| -------- | ------------- | --------------------- |
| Cash     | Not required  | Physical cash payment |
| POS      | Not required  | Card via terminal     |
| Transfer | Required      | Bank transfer         |

### 14.3 Stock Deduction

On transaction complete:

```
For each cart item:
  product.quantity -= item.quantity
  Save to database
```

### 14.4 Activity Logging

Every transaction creates activity log:

- Type: `sale_completed`
- Details: total, items, cashier, customer

---

## 15. Real-Time Features

### 15.1 Sync Indicator

**Location:** Header, next to app name
**Visual:** Spinning refresh icon
**Triggers:**

- Data loading
- Realtime update received
- Duration: 1 second after update

### 15.2 Multi-Device Sync

When product updated on another device:

1. Realtime subscription receives event
2. Local state updated immediately
3. Sync indicator shown briefly
4. Cart quantities validated/adjusted

### 15.3 Visibility Change Handling

When app regains focus (tab switch, screen on):

- Refresh critical data
- Ensure local state is current

---

## 16. PWA & Mobile Features

### 16.1 Install Prompt

**Location:** Settings → App Settings
**Availability:** When browser supports PWA install
**Flow:**

1. Check for `beforeinstallprompt` event
2. Show "Install App" button
3. On click, trigger native install prompt
4. On success, show "App Installed" badge

### 16.2 Offline Capability

- Service worker caches static assets
- Cart persists in localStorage
- Works offline for browsing (no server features)

### 16.3 Mobile Optimizations

- Touch targets: Minimum 44×44px
- Pull-to-refresh on list pages
- Fixed bottom nav for thumb reach
- Responsive grids (1→2→3 columns)

### 16.4 Barcode Scanning

Uses device camera via Capacitor/ML Kit:

- Opens camera overlay
- Real-time barcode detection
- Returns scanned value to app

---

## Summary

This guide covers every aspect of the single-store POS:

1. **Shell/Layout:** Header with cart total, scrollable content, fixed bottom nav
2. **Navigation:** 5-item bottom bar + Settings hub for secondary pages
3. **Products:** Search, filter, grid, add-to-cart with stock validation
4. **Cart:** Multi-cart tabs, quantity controls, checkout flow
5. **Product CRUD:** Add/Edit forms with image upload and barcode
6. **History:** Transactions and activity logs with filtering
7. **Reports:** Date-filtered analytics with PDF export
8. **Settings:** Central hub for all configuration
9. **Inventory:** Table view for bulk management
10. **Admin:** PIN-protected elevated permissions
11. **Cashiers:** Managed list or freetext input
12. **Categories:** CRUD with product reassignment
13. **Transactions:** Complete sale flow with validation
14. **Real-time:** Multi-device sync and indicators
15. **PWA:** Install, offline, mobile optimization

Use this as your complete blueprint for building an MVP replica.
