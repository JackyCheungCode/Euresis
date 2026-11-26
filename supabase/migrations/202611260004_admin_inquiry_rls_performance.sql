-- Consolidate inquiry SELECT authorization and cache JWT evaluation in RLS.
drop policy "Customers can read own wheel inquiries" on public.wheel_inquiries;
drop policy "Administrators can read all wheel inquiries" on public.wheel_inquiries;
create policy "Customers and administrators can read wheel inquiries"
  on public.wheel_inquiries for select to authenticated
  using (
    (select auth.uid()) = user_id
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );
drop policy "Administrators can update wheel inquiries" on public.wheel_inquiries;
create policy "Administrators can update wheel inquiries"
  on public.wheel_inquiries for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
drop policy "Administrators can manage private inquiry notes" on public.wheel_inquiry_admin_notes;
create policy "Administrators can manage private inquiry notes"
  on public.wheel_inquiry_admin_notes for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create index wheel_inquiries_reviewed_by_idx on public.wheel_inquiries(reviewed_by);
create index wheel_inquiry_admin_notes_updated_by_idx on public.wheel_inquiry_admin_notes(updated_by);
