# Glamour — Online Cosmetic Store

A full-featured e-commerce platform for beauty and cosmetic products, built with Next.js. Glamour provides a polished shopping experience with an AI-powered beauty advisor, loyalty rewards, subscriptions, and a comprehensive admin dashboard.

## Business Model

Direct-to-consumer (D2C) online retail for cosmetics. Revenue is generated through product sales, with recurring revenue via the Subscribe & Save programme. Customer retention is driven by a 4-tier loyalty rewards system (Bronze → Silver → Gold → Diamond) where members earn points on every purchase redeemable for discounts.

## Tech Stack

| Layer             | Technology                                |
| ----------------- | ----------------------------------------- |
| **Framework**     | Next.js 16 (App Router, Turbopack)        |
| **Language**      | TypeScript                                |
| **Database**      | PostgreSQL + Drizzle ORM                  |
| **Auth**          | NextAuth 5 (beta)                         |
| **Styling**       | Tailwind CSS 4 + Class Variance Authority |
| **State**         | Zustand                                   |
| **Animations**    | Framer Motion                             |
| **Validation**    | Zod                                       |
| **Payments**      | PayPal, Bakong KHQR (ABA PayWay)          |
| **Email**         | Nodemailer / Resend                       |
| **AI / Chat**     | AI SDK (Vercel) + OpenAI                  |
| **Icons**         | Lucide React                              |
| **Testing**       | Vitest + MSW + Testing Library            |
| **UI Primitives** | Base UI React, shadcn                     |

## Features

### Storefront

| Feature                | Description                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Product Catalog**    | Responsive grid with category tabs (Lips, Skincare, Perfume, Eyes, Face), product cards with brand/name/shades/rating/price/badges, detail modal with shade picker |
| **Search & Filter**    | Real-time search with 300ms debounce, category tabs, 5 sort options (Featured, Price, Top Rated, Newest), zero-results suggestions                                 |
| **Cart & Checkout**    | Slide-in drawer with live count badge, quantity controls, coupon input, real-time totals (subtotal, discount, shipping, grand total)                               |
| **Wishlist**           | Heart toggle on product cards, toast notifications, session-persisted                                                                                              |
| **Customer Reviews**   | Aggregate score + star distribution bar chart, individual review cards with verified-buyer badges, helpful voting                                                  |
| **Discount System**    | Strikethrough pricing with -X% savings pills, automatic free shipping at $50, promo banner                                                                         |
| **Coupon Codes**       | Tap-to-copy coupon bar, cart input with validation, multiple tiers (GLAM20, BEAUTY10)                                                                              |
| **Payment**            | PayPal, Cash on Delivery, 3x instalment, KHQR (Cambodian QR), SSL security badge                                                                                   |
| **Loyalty & Rewards**  | 4-tier programme (Bronze/Silver/Gold/Diamond), points-per-dollar earning, redeemable at checkout, tier upgrade notifications                                       |
| **Subscribe & Save**   | Recurring delivery with up to 15% discount, frequency selector (2/4/6/8 weeks), manage from account dashboard                                                      |
| **Beauty Advisor**     | AI-powered chat for product recommendations and skin-type guidance, operating hours, email capture after hours                                                     |
| **Delivery & Returns** | Free shipping over $50, express option, 30-day return window, prepaid return labels                                                                                |

### Admin Dashboard (`/admin`)

| Feature                          | Description                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Roles & Permissions**          | 8 roles (Super Admin to Beauty Advisor), enforced on UI and API, 2FA, account suspension                            |
| **Product Management**           | CRUD with variants/shades, media upload, stock tracking, SEO fields, bulk actions, draft/published workflow         |
| **Order Management**             | Paginated list, detail view, status workflow, fulfilment (tracking/PDF), refunds (full/partial), CSV export         |
| **Customer Management**          | 360-degree profiles, order history, loyalty adjustment, segmentation tags, Diamond tier invitation, GDPR data tools |
| **Discount & Coupon Management** | Discount rules, bulk code generation, bundle deals, flash sales with countdown timer                                |
| **Content Management (CMS)**     | Static pages, banners/hero scheduling with A/B testing, blog, email templates with merge tags, navigation manager   |
| **Media Library**                | Grid view with search/filter, bulk upload, auto-thumbnails, usage tracking, folder organisation                     |
| **Analytics & Reporting**        | Revenue dashboard, sales/customer/product reports, CSV/PDF export, scheduled email reports                          |
| **Settings & Configuration**     | Store info, shipping zones, tax rules, notification preferences, integrations, maintenance mode                     |
| **Audit Log**                    | Immutable record of all admin actions with field-level diffs, filterable/searchable, CSV export                     |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
npm run db:push

# Seed sample data
npm run seed

# Start development server
npm run dev
```

## Scripts

| Script                  | Description                     |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Start development server        |
| `npm run build`         | Production build                |
| `npm run test`          | Run tests                       |
| `npm run test:coverage` | Run tests with coverage         |
| `npm run seed`          | Seed database with sample data  |
| `npm run db:push`       | Push Drizzle schema to database |
| `npm run lint`          | Lint code                       |
| `npm run format`        | Format code with Prettier       |

## Architecture

- **App Router**: All routes server-rendered by default with client components where interactivity is needed
- **Data Access Layer**: `lib/data-access/` modules encapsulate all database queries
- **Server Actions**: `app/actions/` handle mutations (cart, orders, reviews, subscriptions)
- **State Management**: Zustand store for client-side cart, wishlist, and coupon state
- **AI Agent**: Vercel AI SDK with tool-calling for the beauty advisor chat
- **Database**: PostgreSQL via Drizzle ORM with schema in `lib/db/schema.ts`
