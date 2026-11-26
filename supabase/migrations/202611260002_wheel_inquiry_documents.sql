-- Professional wheel inquiry documents. Public guests may submit but cannot read records.
create table public.wheel_inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  product_slug text not null,
  product_code text not null default '',
  product_name text not null,
  manufacturing text not null default '',
  customer_name text not null default '',
  company text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  country text not null default '',
  vehicle jsonb not null default '{}'::jsonb,
  wheel_configurations jsonb not null default '[]'::jsonb,
  fitment_status text not null default 'unverified' check (fitment_status in ('verified','potential','pending_verification','unverified','not_applicable')),
  requirements text not null default '',
  status text not null default 'received' check (status in ('received','in_review','replied','closed')),
  created_at timestamptz not null default now(),
  constraint wheel_inquiries_contact_required check (length(trim(contact_email)) > 0 or length(trim(contact_phone)) > 0),
  constraint wheel_inquiries_vehicle_object check (jsonb_typeof(vehicle) = 'object'),
  constraint wheel_inquiries_configs_array check (jsonb_typeof(wheel_configurations) = 'array')
);
create index wheel_inquiries_user_created_idx on public.wheel_inquiries(user_id, created_at desc);
create index wheel_inquiries_reference_idx on public.wheel_inquiries(reference);
alter table public.wheel_inquiries enable row level security;
create policy "Guests can submit wheel inquiries" on public.wheel_inquiries for insert to anon with check (user_id is null);
create policy "Customers can submit own wheel inquiries" on public.wheel_inquiries for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Customers can read own wheel inquiries" on public.wheel_inquiries for select to authenticated using (user_id = (select auth.uid()));
grant usage on schema public to anon, authenticated;
grant insert (reference, user_id, product_slug, product_code, product_name, manufacturing, customer_name, company, contact_email, contact_phone, country, vehicle, wheel_configurations, fitment_status, requirements) on public.wheel_inquiries to anon, authenticated;
grant select on public.wheel_inquiries to authenticated;
