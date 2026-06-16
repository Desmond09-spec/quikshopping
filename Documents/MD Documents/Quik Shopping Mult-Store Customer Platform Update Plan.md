# Quik Shopping — Version 2 Platform Specification

*Queue Elimination & Customer Self-Checkout*
*Last updated: June 2026*
*Status: Planned — development begins immediately after Version 1 launch*

---

## The Problem

In Nigerian supermarkets — and in many countries — customers must wait in queues to pay for what they've already picked up. Long queues cause stores to lose customers. People get tired, frustrated, and walk out without buying. Sales are lost. Customer loyalty is damaged.

This is not a technology problem. It's a friction problem. And friction can be removed.

---

## The Vision

A customer walks into a store. They pick up a product. They scan the barcode on the packaging — or a QR code posted on the shelf or wall. Their phone opens Quik Shopping. They add items to their cart as they shop. When they're done, they pay in the app. The app generates a receipt with a verification code. They show it to security at the exit and walk out.

**No cashier. No queue. Two minutes from first item to exit.**

Before they even leave home, they can:
- Find stores near them that use Quik Shopping
- Browse product catalogs and compare prices across stores
- Know what they'll spend and where to spend it

---

## How It Connects to Version 1

Version 2 is not a separate product. It is a customer-facing layer built on top of the same platform that stores are already using for their POS.

For a store to offer self-checkout to customers, it must be running Quik Shopping as its POS system. This is the mechanism: the POS relationship gives Quik Shopping real-time inventory data, which makes the self-checkout experience accurate and trustworthy. A customer cannot scan and "buy" an item that isn't in stock at the price shown, because the inventory data is live.

**This means Version 1 adoption directly drives Version 2 capability.** The more stores on Version 1, the bigger the self-checkout network in Version 2.

Stores on Version 1 upgrade to Version 2 at no additional cost.

---

## Pricing

The same **1.5% per transaction (capped at ₦500)** applies to Version 2 transactions. From the store's perspective, a self-checkout sale is just another sale. It appears in their transaction history, updates their inventory, and generates the same audit trail as a cashier-processed sale.

There is no separate fee tier for Version 2.

---

## Customer Experience

### Before Shopping

**Store Discovery**
- Location-based map of participating stores
- Browse a store's product catalog before visiting
- Real-time product availability
- Price comparison for the same product across multiple nearby stores
- Store hours and contact information

**Planning**
- Build a shopping list and know the total before leaving home
- Receive price drop alerts for saved items
- See which stores currently have what you need in stock

### In-Store Self-Checkout

**Scanning**
- Open Quik Shopping (browser or Android app)
- Point the camera at any product barcode or shelf QR code
- Item is identified and added to cart
- Multiple items can be scanned in sequence
- Quantity adjustable at any point

**Cart**
- Running total visible throughout shopping
- Items can be removed before checkout
- Discounts applied automatically where the store has configured them

**Payment**
- Pay by card, bank transfer (virtual account), or mobile wallet
- Transfer payments use one-time virtual account numbers — same as the store-side POS
- Payment confirmed before receipt is generated

**Receipt & Exit**
- Digital receipt generated immediately after payment
- Receipt contains a large, scannable verification code
- Customer shows receipt to security personnel at exit
- Security can scan or visually verify the code
- Exit permitted

### After Shopping

- Receipt saved in purchase history
- Full itemized breakdown available
- Easy reference for returns

---

## Store Experience

### Enabling Self-Checkout

Store owners can toggle self-checkout on or off from Settings. When enabled:
- The store appears in the customer-facing store discovery map
- Their product catalog becomes browsable by customers
- Self-checkout transactions begin flowing in alongside cashier-processed ones

### Inventory Sync

Every self-checkout purchase immediately reduces the product's stock count in the store's inventory — exactly the same as a cashier sale. There is no delay and no reconciliation step required.

### Transaction Visibility

Self-checkout transactions appear in the existing History and Reports screens. They are attributed differently from cashier transactions (marked as "Customer Self-Checkout") but are otherwise treated identically for reporting and audit purposes.

### Security Verification

Quik Shopping provides:
- A receipt verification interface for security personnel (accessible on any device)
- Visual verification code that can be checked without scanning hardware
- Audit trail of every verified exit

---

## Technical Approach

### Barcode & QR Scanning
- Customer uses the device camera (no app download required for web)
- Supports UPC, EAN-13, EAN-8, Code 128, QR codes
- QR codes on shelves or walls can encode a specific product or an entire store landing page

### Payment Infrastructure
- Paystack or Monnify virtual accounts for transfer payments (same as V1)
- Card payment via Paystack Checkout or equivalent
- Receipt generated only after payment confirmation — no optimistic completion

### Receipt Verification
- Verification codes are short-lived (expire after a reasonable exit window)
- Codes are cryptographically tied to the transaction
- Cannot be reused across multiple exits

### Real-Time Inventory
- Self-checkout purchases update inventory via the same database writes as cashier sales
- Store owners see live inventory regardless of whether the sale was cashier or self-checkout

---

## What This Means for the Market

Stores that adopt self-checkout through Quik Shopping gain a real competitive advantage:
- Customers who previously left due to queue frustration now stay and buy
- Higher throughput during peak hours without needing more cashiers
- Visibility on the customer-facing map attracts new shoppers

Customers who discover a store through the Quik Shopping app and have a fast, frictionless experience are likely to return — and to check the app before shopping elsewhere.

The long-term effect is a two-sided network: more stores make the customer app more useful, and a larger customer base makes joining the store network more attractive for new stores.

---

## Development Sequence (Post-V1 Launch)

1. Customer-facing store discovery and product browse
2. Barcode scan-to-cart flow
3. In-app payment (transfer via virtual account)
4. Digital receipt generation and exit verification
5. Customer account and purchase history
6. Price comparison across stores
7. Pre-shopping planning tools (wishlist, budget calculator)

---

*This document will be updated as Version 2 development progresses.*