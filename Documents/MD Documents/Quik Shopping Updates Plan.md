# Quik Shopping — Development Roadmap

*Last updated: June 2026*

---

## Overview

This document tracks what has been built, what is being built, and what comes after Version 1 ships.

Quik Shopping is being developed in two major versions that build on each other. Version 1 is a mobile-first POS for stores and their teams. Version 2 is a customer-facing layer that enables self-checkout and queue elimination. Both versions share the same codebase, the same pricing model, and the same database — they are one platform, not two separate products.

---

## Version 1 — Mobile-First Store POS

### Status: In active development, approaching release

### What's built and working

**Authentication & Onboarding**
- Google OAuth sign-in
- New user store creation flow (`/create-store`)
- Store selection and switching for users in multiple stores
- Protected routes and auth-aware navigation

**Team Management**
- Three roles: Owner, Manager, Cashier
- Role-based permission enforcement in both the UI and the database
- Team invitation via one-time secure links (Golden Ticket system)
- Invite link sharing via copy or WhatsApp
- Remove team members, cancel pending invitations
- Full pending invite list with expiry display

**Core POS**
- Product catalog with categories, images, search, and barcode scanner
- Shopping cart with quantity management and discounts
- Payment types: Cash, POS terminal, Bank Transfer
- PDF receipt generation
- Pull-to-refresh on mobile

**Inventory & Categories**
- Add, edit, delete products with image upload
- Category management
- Products inventory view with bulk operations

**Reporting & History**
- Full transaction history with date filter and drill-down
- Sales summary by date range and payment method
- Top products view
- Per-cashier attribution on every transaction

**Activity & Audit**
- Every action in the system is logged (product changes, transactions, team changes)
- Activity details page with full breakdown

**Security**
- Row-Level Security on all database tables — users cannot see other stores' data
- Admin PIN for sensitive operations
- Security question and answer for PIN recovery
- Rate-limited PIN reset attempts
- Single-use invitation tokens with 7-day expiry

**Demo Mode**
- Fully interactive without signing up
- All features work against in-memory state only — nothing written to the database
- Showcases the full experience before a store commits to signing up

### What remains before V1 launch

**Payment provider integration**
- Integrate Paystack or Monnify virtual account (temporary account) feature for transfer payments
- Replace the current hardcoded store account approach
- One-time virtual account generated per transfer transaction
- Payment provider confirms receipt; transaction auto-completes
- Fee: 1% capped at ₦300 (passed through to provider), Quik Shopping retains 0.5% capped at ₦200

**Final QA and polish**
- End-to-end testing of invite, acceptance, and team management flows
- Mobile browser and Android WebView testing
- Edge cases: expired invites, removed team members attempting access, store deletion

---

## Version 2 — Queue Elimination & Customer Platform

### Status: Planned — development begins immediately after V1 launch

### The problem it solves

In Nigerian supermarkets (and globally), customers queue to pay. Long queues cause stores to lose customers. People walk out. Sales are lost. This is a solvable problem.

### The solution

Customers scan a product barcode (or a QR code on the shelf or wall), are taken to Quik Shopping in their browser or the Android app, build their cart, pay, receive a digital receipt, and walk out. No cashier. No queue. Two minutes from pickup to exit.

### Customer-facing features to build

**Store & Product Discovery**
- Location-based store finder — find Quik Shopping stores near you
- Browse a store's product catalog before visiting
- Real-time stock availability
- Price comparison across multiple stores for the same product

**Self-Checkout Flow**
- Scan product barcode with phone camera
- Add items to cart, adjust quantities
- Choose payment method (card, transfer via virtual account, wallet)
- Pay in-app
- App generates a digital receipt with a verification code

**Exit Verification**
- Receipt displays a large, clear QR or verification code
- Store security scans or checks the code at exit
- Prevents exit without payment verification

**Customer Account**
- Purchase history across all stores
- Saved receipts
- Preferred stores

### Store-side additions for Version 2

- Toggle to enable/disable self-checkout for the store
- Real-time inventory sync — stock levels update instantly when a self-checkout purchase completes
- Self-checkout transaction logs visible in the existing History and Reports screens
- Store discovery profile — name, address, opening hours, product categories

### Why Version 1 is the funnel into Version 2

A store must be running Quik Shopping as their POS to be eligible for Version 2 self-checkout. This is intentional. The POS relationship gives Quik Shopping real-time inventory data, which is what makes the self-checkout experience trustworthy. A customer scanning a barcode needs to know the item is actually in stock and at the price shown.

Stores already using Version 1 upgrade to Version 2 at no additional cost.

---

## Future Considerations (Post-V2)

These are possibilities, not commitments:

- **Loyalty programs** — cross-store points and rewards
- **Advanced analytics** — AI-assisted demand forecasting, inventory optimization suggestions
- **CSV/Excel export** — for stores that want to pull data into accounting software
- **Returns processing** — dedicated return flow with inventory restock
- **Supplier management** — purchase orders and stock-in workflows
- **Multi-currency** — as Quik Shopping expands beyond Nigeria
- **White-label** — for franchises or large retail chains that want Quik Shopping under their own brand

---

*This document is updated as the project evolves. For current implementation status, see COMPLETION_STATUS.md.*