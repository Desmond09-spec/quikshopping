# Quik Shopping

Quik Shopping is a secure, multi-tenant Point of Sale (POS) application built for retail stores and small businesses. It combines inventory management, cashier tracking, transaction recording, and team role management with a focus on internal fraud prevention, store-level access control, and audit-ready transaction history.

## What this project is

This repository contains the Quik Shopping POS frontend and application logic for a React + Capacitor app that uses Supabase for authentication, data storage, real-time sync, and server-side functions.

The implementation is designed to support:

- Multi-tenant stores with `owner`, `manager`, and `cashier` roles
- Store invitations and email-based team onboarding
- Product inventory management and categories
- Cart and transaction workflows for cash, POS, and transfer payments
- Transaction history, reporting, and activity logging
- Role-based access control with Supabase Row-Level Security (RLS)
- Cross-platform deployment via Capacitor

## Key product goals

The app is built as a fraud-resistant POS and store operations platform, with these goals:

- Prevent internal fraud through cashier accountability and audit data
- Support teams with role-based permissions and store switching
- Provide a mobile-responsive POS experience for quick sales and inventory updates
- Use Supabase and Capacitor for a fast, cloud-native, and low-cost implementation

## Problem it solves

Quik Shopping is designed to solve the real pain faced by small retail businesses:

- Internal theft, hidden cash discrepancies, and cashier-level fraud
- Poor transaction reconciliation between cash, card/POS, and bank transfers
- Manual inventory tracking and unsafe product change history
- Lack of team-based access control, store-level permissions, and audit-ready accountability
- Dependence on expensive and complex POS hardware

## Core features

- Multi-store tenant support
- User authentication with Supabase Auth
- Role-based permissions: owner, manager, cashier
- Store invitations and acceptance flow
- Inventory CRUD for products and categories
- Shopping cart and transaction processing
- Detailed sale activity logging and history
- Store and team management UI
- Dark/light theme toggle
- PDF receipt generation and export support

## Architecture & stack

- Frontend: React + TypeScript
- Mobile/desktop wrapper: Capacitor
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- Serverless logic: Supabase Edge Functions
- State & data fetching: React Context + TanStack Query
- UI primitives: Radix UI + Tailwind CSS

## Current implementation status

Based on repository documentation, the project is largely complete and focused on a multi-tenant POS experience with strong store and cashier security.

Completed areas include:

- Supabase schema support for stores, user roles, invitations, products, transactions, and activities
- Authentication and protected routing
- Multi-store and role-aware context providers
- Invite workflow via email tokens
- Team management interface
- Core POS workflows and reporting

Known gap:

- Email invitation delivery requires a configured email provider in Supabase (e.g. Resend or Mailgun)

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the app in development:

```bash
npm run dev
```

3. For Capacitor mobile/desktop builds:

```bash
npm run mobile:build
```

## Notes for developers

- `src/App.tsx` defines the app router and lazy-loaded pages
- `src/contexts` contains authentication, store, product, cart, admin, and theme providers
- `src/pages` contains the main app screens, including home, cart, history, settings, admin setup, and reports
- Supabase Edge Functions live under `supabase/functions`
- Database and security schema details are documented in `schema.md` and `COMPLETION_STATUS.md`

## Important repository documents

- `COMPLETION_STATUS.md` — implementation readiness and feature status
- `blueprint.md` — product strategy, fraud-prevention positioning, and architecture rationale
- `APPLICATION_LOGIC_DOCUMENTATION.md` — app logic and context flow details
- `ADMIN_SETUP.md` — Supabase admin setup instructions

## License

This repository does not include a license file. Add one if you want to publish or share this project publicly.
