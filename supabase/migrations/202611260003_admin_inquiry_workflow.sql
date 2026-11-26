-- Administrator workflow for professional wheel inquiries.
-- Authorization is based only on trusted Supabase app_metadata, never user_metadata.
alter table public.wheel_inquiries
  add column admin_reply text not null default '',
  add column reviewed_by uuid references auth.users(id) on delete set null,
  add column reviewed_at timestamptz;

create policy "Administrators can read all wheel inquiries"
  on public.wheel_inquiries
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Administrators can update wheel inquiries"
  on public.wheel_inquiries
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant update (status, fitment_status, admin_reply, reviewed_by, reviewed_at)
  on public.wheel_inquiries to authenticated;

create table public.wheel_inquiry_admin_notes (
  inquiry_id uuid primary key references public.wheel_inquiries(id) on delete cascade,
  admin_notes text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index wheel_inquiry_admin_notes_updated_idx
  on public.wheel_inquiry_admin_notes(updated_at desc);

create trigger wheel_inquiry_admin_notes_set_updated_at
  before update on public.wheel_inquiry_admin_notes
  for each row execute function public.set_updated_at();

alter table public.wheel_inquiry_admin_notes enable row level security;

create policy "Administrators can manage private inquiry notes"
  on public.wheel_inquiry_admin_notes
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select, insert, update, delete on public.wheel_inquiry_admin_notes to authenticated;
