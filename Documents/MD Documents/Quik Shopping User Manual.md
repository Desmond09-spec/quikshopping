# Quik Shopping — User Manual

*Version 1 — Store POS*
*Last updated: June 2026*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating a Store](#creating-a-store)
4. [Managing Your Team](#managing-your-team)
5. [Products & Inventory](#products--inventory)
6. [Making a Sale](#making-a-sale)
7. [Transaction History](#transaction-history)
8. [Reports](#reports)
9. [Settings](#settings)
10. [Security](#security)
11. [Demo Mode](#demo-mode)
12. [Roles & Permissions](#roles--permissions)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

Quik Shopping is a mobile-first Point of Sale (POS) system built for Nigerian retail businesses. It runs on any phone, tablet, or computer — no dedicated hardware needed. Every transaction is logged with who processed it and when, giving store owners full visibility and accountability from anywhere.

### Who this manual is for

- **Store Owners** — setting up, managing your team, and reviewing reports
- **Managers** — day-to-day operations, adding and editing products
- **Cashiers** — processing sales and viewing the product catalog

---

## Getting Started

### Sign up

1. Go to the Quik Shopping web app
2. Click **Sign in with Google**
3. Choose your Google account
4. You'll be taken to the store creation screen on your first login

You do not need a separate password. Your Google account is your login.

### Try it first — Demo Mode

If you want to explore the app before signing up, the home screen is fully interactive without an account. You can add products to a cart, process a mock sale, browse the inventory — everything works. No data is saved. Sign in when you're ready to go live.

---

## Creating a Store

After signing in for the first time, you'll be prompted to create your store.

1. Enter your **store name**
2. Optionally add your **store email** and **WhatsApp number**
3. Click **Create Store**

Your store is created and you are assigned the **Owner** role automatically.

If you're joining an existing store (as a cashier or manager), you don't create a store — you follow an invite link instead. See [Managing Your Team](#managing-your-team).

---

## Managing Your Team

### Inviting someone to your store

Only the store **Owner** can invite new team members.

1. Go to **Settings → Team**
2. Click **Invite Member**
3. Select the role: **Cashier** or **Manager**
4. Click **Generate Invite Link**
5. Copy the link or tap **Send via WhatsApp**

The link is a one-time secure token (Golden Ticket). Whoever opens it and signs in with their Google account is added to your store in the selected role. The link expires after 7 days.

You do not need to know the invitee's email address. Just share the link however is easiest — WhatsApp message, text, email, or in person.

### Accepting an invite (as a new team member)

1. Open the invite link on your device
2. You'll see the store name and the role you're being invited as
3. Click **Sign in with Google** and log in
4. You're added to the store automatically
5. You'll be redirected to the store dashboard

The link is single-use. Once accepted, it cannot be used again.

### Removing a team member

1. Go to **Settings → Team**
2. Find the member in the **Active Members** list
3. Tap **Remove**
4. Confirm the action

The removed member loses access immediately. Their past transactions remain in the history.

### Cancelling a pending invite

1. Go to **Settings → Team**
2. Find the pending invite in the **Pending Invites** list
3. Tap **Cancel**

The link is invalidated immediately.

---

## Products & Inventory

### Adding a product

1. Tap the **+** button on the home screen, or go to **Add Product**
2. Fill in:
   - **Product name** (required)
   - **Price** (required)
   - **Category** (optional — helps with filtering)
   - **Quantity** (stock count)
   - **Description** (optional)
   - **Product image** (optional — upload from camera or gallery)
3. Tap **Save Product**

### Editing a product

1. Find the product on the home screen or in **Products Inventory**
2. Tap the edit icon on the product card
3. Make your changes
4. Tap **Save Changes**

### Deleting a product

1. Open the product for editing
2. Scroll to the bottom and tap **Delete Product**
3. Confirm deletion

Deleted products are removed from the catalog but their record remains in completed transactions.

### Managing categories

Go to **Settings → Categories** to:
- Add new categories
- Rename existing ones
- Delete categories (products in deleted categories become uncategorized)

Some default categories are essential and cannot be deleted.

### Searching and filtering products

- Use the **search bar** at the top of the home screen to find products by name
- Use the **category filter** row to show only products in a specific category
- Use the **barcode scanner** button to scan a product's barcode and find it instantly

---

## Making a Sale

### Starting a transaction

1. From the home screen, browse or search for products
2. Tap a product card to add it to the cart
3. The cart button in the top bar shows the current item count — tap it to open the cart

### In the cart

- Tap **+** / **−** to adjust quantities
- Tap the trash icon to remove an item
- Apply a **discount** if applicable (fixed amount or percentage)
- Review the total

### Completing the sale

1. Tap **Checkout**
2. Select the payment method:
   - **Cash** — enter amount received, app calculates change
   - **POS** — confirm the terminal payment
   - **Transfer** — app generates a one-time account number for the customer to transfer to *(requires payment provider integration — coming soon)*
3. Tap **Complete Sale**
4. A receipt is generated — you can download or share it as a PDF

The transaction is immediately saved and attributed to the logged-in cashier.

### Clearing the cart

Tap **Clear Cart** in the cart screen to remove all items and start fresh.

---

## Transaction History

Go to **History** to view all past transactions.

### What you can see

- Date and time of each transaction
- Cashier who processed it
- Items sold, quantities, and prices
- Payment method
- Total amount

### Filtering

Use the date range filter to view transactions from a specific period (today, this week, this month, custom range).

### Transaction details

Tap any transaction to open the full breakdown — all items, the exact amounts, the cashier, and the timestamp.

---

## Reports

Go to **Reports** to see a summary view of your store's performance.

Available reports:
- **Revenue summary** — total sales over a selected period
- **Payment method breakdown** — how much came in via cash, POS, and transfer
- **Top products** — best-selling items by revenue and by quantity
- **Cashier activity** — transactions per team member

Use the date range selector to adjust the reporting period.

---

## Settings

### Store settings
- Edit your store name, contact email, and WhatsApp number

### Team
- View active members and pending invite links
- Invite new members and cancel pending invites
- Remove existing members

### Categories
- Add, rename, and delete product categories

### Admin PIN
- Set or change the admin PIN used for sensitive operations
- The PIN is separate from your Google account login

### Security question
- Set a security question and answer for PIN recovery
- Used when you need to reset the PIN and can answer the question to verify identity

### Appearance
- Toggle between **Dark** and **Light** mode

### Data management
- **Clear data** — permanently removes all products, transactions, categories, and activity logs from your store. This is irreversible. Requires admin PIN confirmation.

---

## Security

### How authentication works

Quik Shopping uses Google OAuth — you sign in with your Google account. There are no separate passwords to manage. Session tokens are handled by Supabase and refresh automatically.

### Admin PIN

The Admin PIN is a secondary layer of protection for actions like:
- Clearing store data
- Changing security settings

The PIN is set during onboarding and can be changed in Settings. If you forget your PIN, you can reset it using your security question.

### Role-based access

Cashiers cannot:
- Add, edit, or delete products
- Access reports
- Manage the team

Managers can:
- Add, edit, and delete products
- Process sales and view history
- View reports

Owners can do everything, including managing the team and changing store settings.

### Data isolation

Your store's data is completely isolated from other stores in the database. Row-Level Security at the database level ensures no user can ever read or write another store's data — even with a direct database query.

---

## Demo Mode

If you visit Quik Shopping without signing in, you're in Demo Mode.

- The app is fully interactive — add products, make sales, browse the inventory
- Everything works exactly as it does in a live store
- No data is saved anywhere — it's all local to your browser session
- When you sign in and create a store, you start fresh

Demo mode is designed to let you experience the full product before committing.

---

## Roles & Permissions

| Action | Owner | Manager | Cashier |
|---|---|---|---|
| View products | ✅ | ✅ | ✅ |
| Add / edit / delete products | ✅ | ✅ | ❌ |
| Process sales | ✅ | ✅ | ✅ |
| View transaction history | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ❌ |
| Manage inventory (stock counts) | ✅ | ✅ | ❌ |
| Invite / remove team members | ✅ | ❌ | ❌ |
| Change store settings | ✅ | ❌ | ❌ |
| Clear store data | ✅ | ❌ | ❌ |

---

## Troubleshooting

### I can't sign in

- Make sure you're using a Google account
- Try a different browser or clear your browser cache
- If you were previously in a store and something changed, contact the store owner

### My invite link doesn't work

- Invite links expire after **7 days** — ask the owner to generate a new one
- Each link is single-use — if it was already accepted, a new one needs to be generated
- Make sure you're signed into the correct Google account before clicking the link

### I can't see some buttons

Your role determines what you can see and do. If you expect access to something but don't see it, check with your store owner — you may need a different role.

### Products aren't showing up

- Pull down to refresh on the home screen
- Check whether a category filter is active — tap "All" to clear it
- Check your internet connection

### The app is slow

- Make sure you have a stable internet connection (minimum 1 Mbps)
- Close other tabs or apps to free up memory
- Try refreshing the page

### I forgot my admin PIN

1. Go to **Settings → Security**
2. Tap **Forgot PIN**
3. Answer your security question
4. Set a new PIN

If you also forgot your security question answer, contact support.

---

*Quik Shopping — Version 1. Version 2 (customer self-checkout) is coming after Version 1 launch.*