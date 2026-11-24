# ZLIT Supabase integration

## Client configuration
The local `.env` file is configured with the publishable key supplied in chat and the previously supplied 20-character project reference (`mvkzcfhaaijspmgeonbw`). The latest project reference sent in chat had 21 characters, so confirm the reference in Supabase Project Settings if the configured URL is not your active project.

## Database setup
The existing 20-table schema is assumed to already be installed in Supabase. Run the additional migration in:

`supabase/migrations/20261124_zlit_frontend_integration.sql`

It adds:
- `place_zlit_order`: creates orders and order-item snapshots using prices read from PostgreSQL, not browser-submitted prices.
- `update_zlit_order_status`: admin-only order status changes.
- The public `product-images` Storage bucket and admin-only upload/update/delete policies.

## Storage
Product uploads use the `product-images` bucket. Run the migration before trying to upload product photos.

## Run locally
```bash
npm install
npm run dev
```

## Important
- The frontend uses only the Supabase publishable key. Never put a service-role key in Vite or any browser code.
- Orders are recorded as unpaid. The website does not collect online payments; seller and customer arrange payment and delivery directly.
- Stock is checked when an order is placed and deducted when an admin confirms the order. Cancelling a confirmed order restores its stock. Test these transitions against your live project before production.
- Supabase calls require the base schema, RLS policies, and this migration to be installed in the same project.
