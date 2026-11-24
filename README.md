# ZLIT

ZLIT is a React + Vite streetwear storefront and admin dashboard backed by Supabase.

## Setup

```bash
npm install
npm run dev
```

The Supabase client configuration is in `.env`. The publishable key is intended for browser use; never put a Supabase service-role key in the frontend.

## Database setup

1. In the Supabase SQL Editor, run the original ZLIT database schema that creates the 20 tables, triggers, functions and RLS policies.
2. Then run `supabase/migrations/20261124_zlit_frontend_integration.sql`.
3. In Supabase Authentication settings, configure the local and deployed redirect URLs used by password reset.
4. Create/promote the first administrator account through a trusted SQL Editor session. Do not allow users to choose their own role.

The migration creates the public `product-images` Storage bucket, admin-only upload policies, the secure `place_zlit_order` RPC (database-calculated prices), and the admin-only order status RPC that adjusts stock when an order is confirmed or cancelled.

## Connected features

- Supabase authentication and profile lookup
- Live product and category catalogue
- Admin product create, edit, delete and image upload
- Database-backed collections and lookbook
- Database-backed customer cart and wishlist for signed-in users (guest cart/wishlist are retained locally and migrated on sign-in)
- Secure order placement, customer order history and admin order status management
- Inventory adjustments, customers, reviews, coupons, messages, newsletter subscribers, site settings and activity logs
- Role-protected admin routes and row-level security

## Notes

- The storefront does not collect online payments. Customers and the ZLIT team arrange payment and delivery directly.
- Orders are priced from database product/variant prices. Stock is checked when an order is placed and deducted when an administrator confirms it.
- Configure your own production domain in Supabase Auth URL settings before deployment.
