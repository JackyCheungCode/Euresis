import { request } from "@/src/lib/supabase/client";

export type Profile = { id: string; full_name: string; phone: string; company: string; country: string };
export type Vehicle = { id: string; make: string; model: string; model_year: string; trim: string; notes: string };
export type Address = { id: string; label: string; recipient: string; phone: string; country: string; region: string; city: string; postal_code: string; line1: string; line2: string; is_default: boolean };
export type Preferences = { user_id: string; language: string; currency: string; units: string; contact_method: string; product_updates: boolean };
export type Enquiry = { id: string; reference: string; subject: string; message: string; status: string; created_at: string };
export type ServiceCase = { id: string; reference: string; subject: string; description: string; status: string; created_at: string };
export type WheelInquiry = { id: string; reference: string; product_name: string; product_code: string; vehicle: Record<string, string>; wheel_configurations: Record<string, string>[]; fitment_status: string; requirements: string; status: string; created_at: string };
export type Order = { id: string; order_number: string; status: string; carrier: string; tracking_number: string; estimated_dispatch_at: string | null; created_at: string; customer_order_items: { product_name: string; specification: string; quantity: number }[]; customer_order_events: { status: string; description: string; occurred_at: string }[] };

const one = <T,>(rows: T[] | null, fallback: T): T => rows?.[0] ?? fallback;
export async function loadAccount(userId: string) {
  const [profiles, vehicles, addresses, preferences, enquiries, wheelInquiries, cases, orders] = await Promise.all([
    request<Profile[]>("customer_profiles", { query: `select=*&id=eq.${userId}&limit=1` }),
    request<Vehicle[]>("customer_vehicles", { query: "select=*&order=created_at.desc" }),
    request<Address[]>("customer_addresses", { query: "select=*&order=is_default.desc,created_at.desc" }),
    request<Preferences[]>("customer_preferences", { query: "select=*&limit=1" }),
    request<Enquiry[]>("customer_enquiries", { query: "select=*&order=created_at.desc" }),
    request<WheelInquiry[]>("wheel_inquiries", { query: "select=*&order=created_at.desc" }),
    request<ServiceCase[]>("customer_after_sales_cases", { query: "select=*&order=created_at.desc" }),
    request<Order[]>("customer_orders", { query: "select=*,customer_order_items(product_name,specification,quantity),customer_order_events(status,description,occurred_at)&order=created_at.desc" }),
  ]);
  return {
    profile: one(profiles, { id: userId, full_name: "", phone: "", company: "", country: "" }),
    vehicles, addresses,
    preferences: one(preferences, { user_id: userId, language: "English", currency: "USD", units: "Metric (mm)", contact_method: "Email", product_updates: true }),
    enquiries, wheelInquiries, cases, orders,
  };
}
export async function saveProfile(profile: Profile) {
  return request<Profile[]>("customer_profiles", { method: "POST", query: "on_conflict=id", body: profile, prefer: "resolution=merge-duplicates,return=representation" });
}
export async function addVehicle(userId: string, vehicle: Omit<Vehicle, "id">) {
  return request<Vehicle[]>("customer_vehicles", { method: "POST", query: "select=*", body: { ...vehicle, user_id: userId }, prefer: "return=representation" });
}
export async function updateVehicle(id: string, vehicle: Omit<Vehicle, "id">) {
  return request<Vehicle[]>("customer_vehicles", { method: "PATCH", query: `id=eq.${id}&select=*`, body: vehicle, prefer: "return=representation" });
}
export async function removeVehicle(id: string) {
  return request<null>("customer_vehicles", { method: "DELETE", query: `id=eq.${id}` });
}
export async function addAddress(userId: string, address: Omit<Address, "id">) {
  if (address.is_default) await request<null>("customer_addresses", { method: "PATCH", query: "is_default=eq.true", body: { is_default: false } });
  return request<Address[]>("customer_addresses", { method: "POST", query: "select=*", body: { ...address, user_id: userId }, prefer: "return=representation" });
}
export async function updateAddress(id: string, address: Omit<Address, "id">) {
  if (address.is_default) await request<null>("customer_addresses", { method: "PATCH", query: "is_default=eq.true", body: { is_default: false } });
  return request<Address[]>("customer_addresses", { method: "PATCH", query: `id=eq.${id}&select=*`, body: address, prefer: "return=representation" });
}
export async function setDefaultAddress(id: string) {
  await request<null>("customer_addresses", { method: "PATCH", query: "is_default=eq.true", body: { is_default: false } });
  return request<Address[]>("customer_addresses", { method: "PATCH", query: `id=eq.${id}&select=*`, body: { is_default: true }, prefer: "return=representation" });
}
export async function removeAddress(id: string) {
  return request<null>("customer_addresses", { method: "DELETE", query: `id=eq.${id}` });
}
export async function savePreferences(preferences: Preferences) {
  return request<Preferences[]>("customer_preferences", { method: "POST", query: "on_conflict=user_id", body: preferences, prefer: "resolution=merge-duplicates,return=representation" });
}
export async function createEnquiry(userId: string, subject: string, message: string) {
  return request<Enquiry[]>("customer_enquiries", { method: "POST", query: "select=*", body: { user_id: userId, subject, message }, prefer: "return=representation" });
}
export async function createServiceCase(userId: string, subject: string, description: string) {
  return request<ServiceCase[]>("customer_after_sales_cases", { method: "POST", query: "select=*", body: { user_id: userId, subject, description }, prefer: "return=representation" });
}
