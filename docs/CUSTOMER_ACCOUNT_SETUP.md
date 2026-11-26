# Customer account backend setup

## Supabase project

- Project: Euresis
- Region: Asia Pacific (Tokyo)
- Project ref: `phkqazqhjbzxehgieenn`
- API URL: `https://phkqazqhjbzxehgieenn.supabase.co`
- Browser key: publishable key only; never expose a service-role key in the site bundle.
- Hosting: existing Cloudflare Worker; no additional paid infrastructure was introduced.

## Auth URL configuration

In Supabase Dashboard → Authentication → URL Configuration:

1. The connected Cloudflare account currently has no custom Worker domain or zone route attached to `euresis`; its available Worker subdomain is `https://euresis.xg-y.workers.dev`.
2. Set Site URL to `https://euresis.xg-y.workers.dev`.
3. Add `https://euresis.xg-y.workers.dev/account` to Redirect URLs.
4. Add local development `http://localhost:3001/account` if local testing is required.
5. If a branded domain is attached to the Worker later, add its `/account` URL to Redirect URLs and update Site URL.
4. Keep email confirmation enabled for production.
5. Configure SMTP before production launch if the default Auth email delivery limits are insufficient. Do not upgrade the project without explicit approval.

The account UI supports signup confirmation links, password sign-in, sign-out and password reset. The reset flow returns to `/account` and consumes the Supabase recovery access-token fragment.

## Data model and access control

The migration `supabase/migrations/202611260001_customer_account_core.sql` creates the customer profile, vehicle, address, preference, enquiry, after-sales, order, order item and order event tables.

- Every customer-owned table is protected by RLS and binds rows to `auth.uid()`.
- Customers can create and manage their own vehicles and addresses.
- Customers can read and update their own profile and preferences.
- Customers can submit enquiries and after-sales cases, but cannot write internal workflow status fields.
- Customers can read only their own orders, items and tracking events. Order creation/status changes must come from the trusted order-management integration.
- No service-role key is shipped to the browser.

## First-use verification

1. Open `/account` and register with a real email address.
2. Confirm the email and return to `/account`.
3. Sign in, update profile details, add a vehicle and a shipping address.
4. Refresh the page and confirm the records persist.
5. Submit an enquiry and an after-sales request; verify they appear in their respective lists.
6. Sign out and sign in with another account; confirm no records from the first account are visible.
7. Use password reset and set a new password from the email link.

## Current integration boundary

The portal is connected to live customer tables. Orders and logistics are read-only until the Euresis commerce/order-management system writes trusted order records. The account UI does not fabricate sample enquiries, service cases or orders.
