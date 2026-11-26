# Euresis administrator access

## Inquiry management

The internal inquiry desk is available at:

- `/admin/inquiries`

It supports inquiry search and filtering, customer and vehicle review, requested wheel specification review, fitment assessment, customer-visible responses, and private administrator notes.

## Grant the administrator role

Administrator authorization uses Supabase Auth `app_metadata`, which customers cannot edit themselves. Do not put authorization roles in `user_metadata`.

1. Open the [Euresis Supabase Auth users](https://supabase.com/dashboard/project/phkqazqhjbzxehgieenn/auth/users).
2. Select the account that should administer Euresis.
3. In the user's **Raw App Meta Data** editor, preserve any existing fields and add:
   ```json
   { "role": "admin" }
   ```
4. Save the user.
5. Sign out of Euresis and sign back in so the access token receives the updated trusted metadata.
6. Open `https://euresis.xg-y.workers.dev/admin/inquiries`.

To revoke access, remove the `role` field (or change it to a non-admin role) in Raw App Meta Data and have the user sign in again.

## Data security

- RLS grants administrators access to all wheel inquiries only when the signed JWT has `app_metadata.role = admin`.
- Customers retain access only to their own inquiry rows.
- Customer-visible replies are stored on the inquiry.
- Private administrator notes are stored in a separate RLS-protected table and are not readable by customers.
- The frontend uses only the Supabase publishable key. No service-role or secret key is included in the browser bundle.
- Do not mark a fitment as verified until the exact vehicle and wheel configuration have been technically checked.

## Operational limitations

The admin interface records status and responses; it does not send outbound email yet. The operator can respond through the existing customer communication channel. No paid messaging, PDF, or workflow service is required.
