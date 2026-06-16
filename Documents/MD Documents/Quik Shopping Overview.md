# Quik Shopping — Product Overview

*Complete Product Overview & Vision Document*
*Last updated: June 2026*

---

## The Origin Story

Quik Shopping was born from a real problem in Nigerian retail.

A supermarket owner wanted his employees to be able to check out customers using their phones — not a desktop terminal bolted to a counter. He wanted mobility. He wanted to know, from anywhere on his phone, who sold what, when, and how much. Most existing POS systems in Nigeria were desktop-only, and the mobile ones that existed had poor UI and were hard to use.

That was the first vision: **give stores a mobile-first POS with full accountability and audit trails, at a price that makes sense.**

---

## The Two Visions

### Version 1 — Mobile-First POS for Stores

A complete point of sale system that runs on any phone, tablet, or computer. Store owners invite their employees as cashiers or managers, each with defined permissions. Every transaction is logged with who did it and when. Owners can monitor their entire store's activity in real time, from anywhere.

This is what is being built and shipped now.

**What Version 1 solves:**
- Replaces pen-and-paper book logging and desktop-only POS systems
- Gives store owners full visibility into employee activity
- Prevents internal fraud through cashier accountability and payment verification
- Works on any device — no hardware investment required
- Supports multiple stores and multiple team members per store

### Version 2 — The Queue Elimination Platform

Once Version 1 is established and stores are running on Quik Shopping, Version 2 launches the customer-facing layer.

In Nigeria — and in many countries — customers wait in queues to pay for their groceries. Long queues cause stores to lose customers out of frustration. People walk out. Sales are lost.

Version 2 solves this by enabling self-checkout for customers:

1. A customer walks into a store
2. They pick up a product and scan its barcode (or scan a QR code on the shelf or wall)
3. They are taken to Quik Shopping — in the browser or in the Android app
4. They add items to their cart and pay instantly
5. The app generates a receipt
6. They show the receipt to security personnel at the exit and walk out

No cashier. No queue. Two minutes from pickup to exit.

**Version 2 also enables pre-shopping intelligence:**
- Discover stores around you
- Compare prices across stores before leaving the house
- Know exactly what you'll spend and where to go
- View real-time stock availability

**The two visions are not separate — they are a funnel.** Any store that wants to offer queue-free shopping to their customers must be running Quik Shopping as their POS. Version 1 is what gets stores on the platform. Version 2 is what makes customers *demand* stores that use it.

Stores already on Version 1 can upgrade to Version 2 at no additional cost.

---

## Pricing Model

Quik Shopping uses a **transaction-based pricing model** — no monthly subscription, no setup fees, no hardware costs.

### How it works

| Payment | Structure |
|---|---|
| Total transaction fee | **1.5% of transaction value** |
| Cap per transaction | **₦500** |
| Goes to payment provider (Paystack or Monnify) | **1%**, capped at **₦300** |
| Goes to Quik Shopping | **0.5%**, capped at **₦200** |

### The payment provider role

Transfer payments in Quik Shopping will be handled by **Paystack or Monnify** via their virtual account (temporary account) feature. When a customer wants to pay by bank transfer, the app generates a **one-time digital account number** specific to that transaction. The customer transfers the exact amount to that account. The payment provider confirms receipt and closes the transaction.

This replaces the current hardcoded store account number approach, which creates a significant internal fraud risk — an employee could redirect transfers to their personal account. The virtual account system eliminates this entirely.

The payment provider's fee for this service is approximately 1% capped at ₦300 per transaction, which is passed directly through.

### Why this model works

- **Stores only pay when they earn.** No monthly fee means zero risk for stores during slow periods
- **Predictable max cost.** At ₦500 cap, a store selling a ₦100,000 item pays ₦500 max — not ₦1,500
- **No hardware investment.** Any staff member's phone becomes a POS terminal
- **Zero onboarding friction.** Stores can start immediately without a sales process or contract

---

## Competitive Position

| | Quik Shopping | Traditional Nigerian POS |
|---|---|---|
| Monthly cost | ₦0 | ₦200,000–₦300,000 |
| Setup/hardware | ₦0 | ₦50,000–₦650,000 |
| Mobile-first | ✅ | ❌ |
| Real-time owner visibility | ✅ | ❌ |
| Multi-employee support | ✅ | ❌ |
| Queue elimination (V2) | ✅ | ❌ |
| Works on any device | ✅ | ❌ |

---

## Current Features (Version 1)

### Core POS
- Product inventory management with categories, images, and search
- Shopping cart with quantity management and discounts
- Payment methods: Cash, POS terminal, Bank Transfer (→ moving to virtual accounts)
- PDF receipt generation
- Barcode scanner integration

### Team & Access Control
- Multi-store support — one account can own or belong to multiple stores
- Three roles: **Owner**, **Manager**, **Cashier**
- Role-based permissions — cashiers cannot edit products or view reports
- Team invitations via secure one-time links (Golden Ticket system)
- Owners can remove team members at any time

### Reporting & Accountability
- Full transaction history with per-cashier attribution
- Sales reports by date range and payment method
- Activity log for every action in the system
- Real-time owner visibility from any device

### Security
- Google OAuth authentication — no passwords to manage
- Row-Level Security in the database — users cannot see other stores' data
- Admin PIN for sensitive actions
- Security question for PIN recovery
- Single-use invitation tokens

### Demo Mode
- Fully interactive without signing up
- All features work against local in-memory state
- No data is written to the database

---

## Technology Stack

- **Frontend:** React 18 + TypeScript, Vite
- **UI:** Radix UI components, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Mobile:** Capacitor (Android/iOS wrapper)
- **Deployment:** Vercel (currently ranking on Google's first page for "quik shopping")

---

## Roadmap

### Now — Version 1 completion
- Paystack/Monnify virtual account integration for transfer payments
- Polish and production-ready QA
- Public launch

### Next — Version 2 development (immediately after V1 launch)
- Customer-facing self-checkout flow
- QR code and barcode scan-to-cart
- Store discovery and price comparison
- Customer receipt verification system
- Payment processing for end-customers

---

*Quik Shopping — giving stores the mobility they need, and giving customers the time they deserve.*