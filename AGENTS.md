# POS System — Agent Instructions

## Project Overview
This is a Point of Sale (POS) web application for a retail client in Pakistan.
It is NOT a SaaS platform. Every decision must be made with POS use case in mind.

## Tech Stack (do not change these without instruction)
- Framework: Next.js 16 (App Router, not Pages Router)
- Language: TypeScript (strict mode — no `any` types allowed)
- Styling: Tailwind CSS v4
- Database & Auth: Supabase
- Server state: TanStack Query v5
- Client state (cart only): Zustand
- Forms: react-hook-form + @hookform/resolvers/zod
- Validation: Zod
- Linting + Formatting: Biome (NOT ESLint, NOT Prettier)
- Icons: lucide-react (already installed)
- Charts: recharts (already installed)
- Toasts: react-hot-toast
- Currency: PKR (Pakistani Rupee)
- Tax rate: 17% (GST Pakistan)

## Folder Structure (strictly follow this)
```
src/
  app/
    (auth)/
      login/page.tsx
    (pos)/
      layout.tsx          ← shared sidebar + topbar
      dashboard/page.tsx
      pos/page.tsx        ← main cashier terminal
      orders/page.tsx
      inventory/page.tsx
      customers/page.tsx
      reports/page.tsx
      settings/page.tsx
  components/
    ui/                   ← reusable: Button, Input, Modal, Badge, Table
    pos/                  ← CartPanel, ProductGrid, PaymentModal, ReceiptModal
    layout/               ← Sidebar, Topbar
    providers/
      query-provider.tsx
  lib/
    supabase/
      client.ts           ← browser client
      server.ts           ← server client
    hooks/
      useCart.ts          ← Zustand cart store
      useProducts.ts      ← TanStack Query
      useOrders.ts
      useCustomers.ts
    utils/
      currency.ts         ← formatCurrency(amount) → "PKR 1,500.00"
      tax.ts              ← calculateTax(amount) → amount * 0.17
      receipt.ts
  types/
    index.ts              ← all interfaces
  lib/
    constants.ts
```

## Design System (match existing UI style)
- Primary color: #702bf0 (purple)
- Active sidebar item: gradient from #702bf0 to #511ae8, rounded-[24px]
- Background: #f0f4fc (light blue-gray)
- Cards: white, rounded-[24px], shadow-sm
- Font: Inter
- All currency values: prefix with "PKR" and use toLocaleString("en-PK")
- No negative number inputs anywhere
- Confirm dialog required before: delete, void, refund

## Database Tables (Supabase PostgreSQL)
- products: id, name, sku, barcode, price, cost, category_id, stock_qty, image_url, is_active, created_at
- categories: id, name, color
- orders: id, order_number, cashier_id, customer_id, subtotal, tax, discount, total, status, payment_method, notes, created_at
- order_items: id, order_id, product_id, product_name, quantity, unit_price, discount, subtotal
- customers: id, name, phone, email, loyalty_points, total_spent, created_at
- users: id, name, email, role, pin_hash, active, created_at
- payments: id, order_id, method, amount, reference, status, created_at
- audit_logs: id, user_id, action, table_name, record_id, old_value, new_value, created_at

## Auth Rules
- Admin login: email + password via Supabase Auth
- Cashier login: 4-digit PIN (verified against pin_hash in users table)
- Row Level Security enabled on ALL tables
- Only admin role can: void orders, give discount > 10%, access reports, change settings
- Cashier max discount: 10%
- Session timeout: 30 minutes idle for cashier

## POS Terminal Screen Rules (most important screen)
- Left panel: product search bar + category filter tabs + product grid (3 columns)
- Right panel: cart items list + customer selector + discount field + tax display + total + Charge button
- Barcode scanner support: text input that auto-focuses and triggers product lookup on Enter
- Payment methods: Cash, Card, Bank Transfer
- Split payment: allow multiple payment methods on one order
- After payment: show receipt modal with print button

## What Agents Must Never Do
- Never use localStorage or sessionStorage
- Never call Supabase directly from a component — always use hooks in /lib/hooks
- Never use `any` type in TypeScript
- Never skip loading and error states in any data-fetching component
- Never remove the Biome config or re-add ESLint
- Never hardcode prices, tax rates, or currency — always use constants.ts
- Never create a pages/ directory — App Router only
- Never use default Tailwind colors for brand colors — always use the hex values above

## Environment Variables Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_NAME=POS System
NEXT_PUBLIC_CURRENCY=PKR
NEXT_PUBLIC_TAX_RATE=0.17

## Current State of the Project
The project has one working dashboard UI in app/page.tsx.
It was generated from Google AI Studio as a SaaS template.
The visual style (purple sidebar, white cards, recharts charts) must be KEPT.
The sidebar navigation items and all content must be replaced with POS equivalents.
No backend is connected yet. All data is currently hardcoded/static.

## First Task for Agent (do this first, nothing else)
Read this file fully. Then replace the sidebar navigation in app/page.tsx
with POS navigation items in this exact order:
Dashboard, POS Terminal, Orders, Inventory, Customers, Reports, Settings.
Use these lucide-react icons:
- Dashboard → LayoutGrid
- POS Terminal → ShoppingCart
- Orders → Receipt
- Inventory → Package
- Customers → Users
- Reports → BarChart2
- Settings → Settings

Keep the exact same SidebarItem component, same purple active style,
same rounded-[24px] design. Set Dashboard as the active item.
Do not touch charts, cards, or any other part of the file.
Do not add any backend logic.
