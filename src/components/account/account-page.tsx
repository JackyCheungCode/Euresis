"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { acceptAuthRedirect, currentUser, getSession, signIn, signOut, signUp, resetPassword, updatePassword, type AuthUser } from "@/src/lib/supabase/client";
import { addAddress, addVehicle, createEnquiry, createServiceCase, loadAccount, removeAddress, removeVehicle, savePreferences, saveProfile, setDefaultAddress, type Address, type Enquiry, type Order, type Preferences, type Profile, type ServiceCase, type Vehicle } from "@/src/features/account/api/account";

const navItems = [
  ["overview", "Overview", "01"], ["profile", "Personal information", "02"], ["vehicles", "My vehicles", "03"],
  ["addresses", "Shipping addresses", "04"], ["preferences", "Preferences", "05"], ["inquiries", "My enquiries", "06"],
  ["aftersales", "After-sales", "07"], ["orders", "Orders & delivery", "08"],
] as const;
type Section = (typeof navItems)[number][0];
type Data = Awaited<ReturnType<typeof loadAccount>>;
type IconName = "user" | "car" | "pin" | "sliders" | "message" | "tool" | "box" | "plus" | "arrow" | "logout";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    car: "m5 11 1.5-5h11L19 11M3 11h18l1 7H2l1-7Zm2 7v2m14-2v2M6 14h.01M18 14h.01",
    pin: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    sliders: "M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4",
    message: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z",
    tool: "m14.7 6.3 3 3M4 20l7.5-7.5m2.5-9a5 5 0 0 0 6.5 6.5L13 17.5 8.5 13 15 6.5A5 5 0 0 0 8.5 0",
    box: "m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v10",
    plus: "M12 5v14m-7-7h14",
    arrow: "M5 12h14m-7-7 7 7-7 7",
    logout: "M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7",
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
function dateLabel(value: string) { return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
function statusLabel(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function Field({ label, value, onChange, required = false, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <label>{label}<input type={type} required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}
function Heading({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: ReactNode }) {
  return <div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function AccountPage() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [vehicleForm, setVehicleForm] = useState(false);
  const [addressForm, setAddressForm] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState({ make: "", model: "", model_year: "", trim: "", notes: "" });
  const [addressDraft, setAddressDraft] = useState({ label: "Home", recipient: "", phone: "", country: "", region: "", city: "", postal_code: "", line1: "", line2: "" });
  const [enquiryDraft, setEnquiryDraft] = useState({ subject: "", message: "" });
  const [serviceDraft, setServiceDraft] = useState({ subject: "", description: "" });

  const refresh = useCallback(async (customerId: string) => {
    const next = await loadAccount(customerId);
    setData(next);
  }, []);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const recoveryLink = window.location.hash.includes("type=recovery");
        acceptAuthRedirect();
        const session = await getSession();
        const customer = session ? await currentUser() : null;
        if (!active) return;
        setUser(customer);
        setResetMode(recoveryLink);
        if (customer) {
          setAuthEmail(customer.email);
          await refresh(customer.id);
        }
      } catch (error) {
        if (active) setAuthError(error instanceof Error ? error.message : "Unable to load your account.");
      } finally { if (active) setReady(true); }
    })();
    return () => { active = false; };
  }, [refresh]);

  const firstName = useMemo(() => (data?.profile.full_name || user?.user_metadata?.full_name || "Customer").trim().split(/\s+/)[0], [data, user]);
  const saveNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };
  const run = async (task: () => Promise<unknown>, success: string, reload = true) => {
    if (!user) return;
    setBusy(true); setAuthError("");
    try { await task(); if (reload) await refresh(user.id); saveNotice(success); }
    catch (error) { setAuthError(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setAuthError("");
    try {
      if (authMode === "reset") {
        await resetPassword(authEmail.trim());
        saveNotice("Password reset email sent. Check your inbox.");
        setAuthMode("login");
      } else if (resetMode) {
        await updatePassword(newPassword);
        setResetMode(false); setAuthMode("login"); setAuthPassword("");
        saveNotice("Password updated. You can now sign in.");
      } else if (authMode === "register") {
        if (authName.trim().length < 2) throw new Error("Enter your full name.");
        const result = await signUp(authEmail.trim(), authPassword, authName.trim());
        if (result.access_token) {
          const customer = await currentUser();
          if (customer) { setUser(customer); await refresh(customer.id); }
        } else {
          saveNotice("Registration received. Confirm your email using the link we sent, then return here to sign in.");
        }
      } else {
        await signIn(authEmail.trim(), authPassword);
        const customer = await currentUser();
        if (!customer) throw new Error("Sign-in succeeded but the customer session could not be loaded.");
        setUser(customer); await refresh(customer.id);
      }
    } catch (error) { setAuthError(error instanceof Error ? error.message : "Authentication failed."); }
    finally { setBusy(false); }
  };
  const handleSignOut = async () => { await signOut(); setUser(null); setData(null); setSection("overview"); setAuthPassword(""); setNotice(""); };
  const updateProfile = (key: keyof Profile, value: string) => setData((current) => current ? ({ ...current, profile: { ...current.profile, [key]: value } }) : current);
  const updatePreferences = (key: keyof Preferences, value: string | boolean) => setData((current) => current ? ({ ...current, preferences: { ...current.preferences, [key]: value } }) : current);

  if (!ready) return <main className="account-page"><div className="account-loading">Loading your account…</div></main>;

  if (resetMode || !user || !data) return (
    <main className="account-auth">
      <div className="account-auth__visual"><div className="account-auth__visual-copy"><span className="account-kicker">EURESIS / CUSTOMER PORTAL</span><h1>Your ownership.<br />In one place.</h1><p>Manage your vehicles, enquiries and orders with a secure Euresis account.</p></div><span className="account-auth__visual-index">PRECISION PERFORMANCE / 01—08</span></div>
      <section className="account-auth__panel"><a className="account-auth__back" href="/">← Back to Euresis</a><div className="account-auth__form-wrap">
        <span className="account-kicker">CUSTOMER ACCOUNT</span>
        <h2>{resetMode ? "Choose a new password." : authMode === "login" ? "Welcome back." : authMode === "register" ? "Create your account." : "Reset your password."}</h2>
        <p className="account-muted">{resetMode ? "Set a new password for your Euresis account." : authMode === "login" ? "Sign in to access your personal garage and orders." : authMode === "register" ? "Create a secure customer profile." : "We will email you a secure password reset link."}</p>
        {!resetMode && <div className="account-auth__switch"><button className={authMode === "login" ? "is-active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Sign in</button><button className={authMode === "register" ? "is-active" : ""} onClick={() => { setAuthMode("register"); setAuthError(""); }}>Create account</button></div>}
        <form className="account-form" onSubmit={handleAuth}>
          {authMode === "register" && <Field label="Full name" value={authName} onChange={setAuthName} required placeholder="Your full name" />}
          {!resetMode && authMode !== "reset" && <Field label="Password" type="password" value={authPassword} onChange={setAuthPassword} required placeholder="At least 8 characters" />}
          {resetMode && <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} required placeholder="At least 8 characters" />}
          {authMode !== "reset" && <Field label="Email address" type="email" value={authEmail} onChange={setAuthEmail} required placeholder="name@example.com" />}
          {authMode === "reset" && <Field label="Email address" type="email" value={authEmail} onChange={setAuthEmail} required placeholder="name@example.com" />}
          {authError && <p className="account-form__error" role="alert">{authError}</p>}
          <button className="account-button account-button--dark" type="submit" disabled={busy}>{busy ? "Please wait…" : resetMode ? "Update password" : authMode === "login" ? "Sign in" : authMode === "register" ? "Create account" : "Send reset link"} <Icon name="arrow" /></button>
        </form>
        {!resetMode && authMode === "login" && <button className="account-text-link" onClick={() => { setAuthMode("reset"); setAuthError(""); }}>Forgot password?</button>}
        {authMode === "reset" && <button className="account-text-link" onClick={() => setAuthMode("login")}>Back to sign in</button>}
        <p className="account-auth__disclaimer">Your password is handled by Supabase Auth. Customer records are stored securely and isolated by database row-level security.</p>
      </div></section>
    </main>
  );

  const { profile, vehicles, addresses, preferences, enquiries, cases, orders } = data;
  const statusPill = (status: string) => <span className="account-status">{statusLabel(status)}</span>;
  const vehicleAction = <button className="account-button account-button--dark" onClick={() => setVehicleForm(!vehicleForm)}><Icon name="plus" /> Add vehicle</button>;
  const addressAction = <button className="account-button account-button--dark" onClick={() => setAddressForm(!addressForm)}><Icon name="plus" /> Add address</button>;

  return <main className="account-page"><div className="account-shell">
    <aside className="account-sidebar">
      <div className="account-sidebar__heading"><span className="account-kicker">MY EURESIS</span><h2>Account</h2></div>
      <div className="account-user"><div className="account-user__avatar">{firstName.slice(0, 1).toUpperCase()}</div><div><strong>{profile.full_name || user.email}</strong><span>{user.email}</span></div></div>
      <nav className="account-nav" aria-label="Account navigation">{navItems.map(([id, label, number]) => <button key={id} className={section === id ? "is-active" : ""} onClick={() => setSection(id)}><span className="account-nav__number">{number}</span><span>{label}</span><span className="account-nav__arrow">↗</span></button>)}</nav>
      <button className="account-signout" onClick={handleSignOut}><Icon name="logout" /> Sign out</button>
    </aside>
    <section className="account-content">
      <div className="account-content__top"><span className="account-kicker">CUSTOMER PORTAL / {navItems.find(([id]) => id === section)?.[1].toUpperCase()}</span><span className="account-content__secure"><i /> SECURE ACCOUNT</span></div>
      {notice && <div className="account-notice" role="status">{notice}</div>}
      {authError && <p className="account-form__error" role="alert">{authError}</p>}

      {section === "overview" && <>
        <div className="account-page-heading"><div><span className="account-kicker">YOUR EURESIS</span><h1>Good to see you,<br />{firstName}.</h1><p>Your vehicles, conversations and purchases, connected to one account.</p></div><span className="account-heading-mark">E.</span></div>
        <div className="account-stat-grid"><button onClick={() => setSection("vehicles")}><span>MY VEHICLES</span><strong>{vehicles.length.toString().padStart(2, "0")}</strong><small>Saved vehicles <b>↗</b></small></button><button onClick={() => setSection("inquiries")}><span>OPEN ENQUIRIES</span><strong>{enquiries.filter((item) => !["closed"].includes(item.status)).length.toString().padStart(2, "0")}</strong><small>Customer conversations <b>↗</b></small></button><button onClick={() => setSection("orders")}><span>ACTIVE ORDERS</span><strong>{orders.filter((item) => !["delivered", "cancelled"].includes(item.status)).length.toString().padStart(2, "0")}</strong><small>Orders in progress <b>↗</b></small></button></div>
        <div className="account-overview-grid">
          <section className="account-card"><div className="account-card__heading"><div><span className="account-kicker">GARAGE</span><h2>Your vehicles</h2></div><button className="account-text-link" onClick={() => setSection("vehicles")}>View all ↗</button></div>
            {vehicles.slice(0, 2).map((vehicle) => <div className="account-vehicle-row" key={vehicle.id}><div className="account-vehicle-mark"><Icon name="car" /></div><div><strong>{vehicle.model_year} {vehicle.make} {vehicle.model}</strong><span>{vehicle.trim || "Vehicle profile"}</span></div><span className="account-row-arrow">↗</span></div>)}
            {!vehicles.length && <p className="account-empty">Your garage is ready. Add your first vehicle.</p>}
            <button className="account-inline-add" onClick={() => { setSection("vehicles"); setVehicleForm(true); }}><Icon name="plus" /> Add a vehicle</button>
          </section>
          <section className="account-card"><div className="account-card__heading"><div><span className="account-kicker">RECENT ACTIVITY</span><h2>Enquiries</h2></div><button className="account-text-link" onClick={() => setSection("inquiries")}>View all ↗</button></div>
            {enquiries.slice(0, 3).map((item) => <div className="account-activity-row" key={item.id}><div><strong>{item.subject}</strong><span>{item.reference} · {dateLabel(item.created_at)}</span></div>{statusPill(item.status)}</div>)}
            {!enquiries.length && <p className="account-empty">No enquiries yet.</p>}
          </section>
        </div>
        <section className="account-card account-order-card"><div className="account-card__heading"><div><span className="account-kicker">ORDER TRACKING</span><h2>Latest order</h2></div><button className="account-text-link" onClick={() => setSection("orders")}>View orders ↗</button></div>
          {orders[0] ? <div className="account-order-summary"><div><span className="account-kicker">{orders[0].order_number}</span><h3>{orders[0].customer_order_items?.map((item) => item.product_name).join(", ") || "Euresis order"}</h3><p>Placed {dateLabel(orders[0].created_at)}</p></div>{statusPill(orders[0].status)}</div> : <p className="account-empty">Your confirmed orders will appear here.</p>}
        </section>
      </>}

      {section === "profile" && <><Heading kicker="PROFILE / 02" title="Personal information." description="Maintain the contact details used for quotations and customer support."/><section className="account-card account-edit-card"><div className="account-card__heading"><div><span className="account-kicker">YOUR DETAILS</span><h2>Contact information</h2></div></div><div className="account-form-grid">
        <Field label="Full name" value={profile.full_name} onChange={(v) => updateProfile("full_name", v)} required/>
        <label>Email address<input type="email" value={user.email} disabled/><span className="account-field-hint">Change email through account security settings.</span></label>
        <Field label="Phone number" value={profile.phone} onChange={(v) => updateProfile("phone", v)}/>
        <Field label="Company" value={profile.company} onChange={(v) => updateProfile("company", v)}/>
        <Field label="Country / region" value={profile.country} onChange={(v) => updateProfile("country", v)}/>
      </div><div className="account-card__footer"><span>Saved to your secure customer profile.</span><button className="account-button account-button--dark" disabled={busy} onClick={() => run(() => saveProfile(profile), "Personal information saved.")}>Save changes <Icon name="arrow"/></button></div></section></>}

      {section === "vehicles" && <><Heading kicker="GARAGE / 03" title="Your vehicles." description="Save your vehicles to make wheel fitment enquiries faster and more precise." action={vehicleAction}/>
        {vehicleForm && <form className="account-card account-entry-form" onSubmit={(event) => { event.preventDefault(); run(async () => { await addVehicle(user.id, vehicleDraft); setVehicleDraft({ make: "", model: "", model_year: "", trim: "", notes: "" }); setVehicleForm(false); }, "Vehicle added to your garage."); }}><div className="account-card__heading"><h2>New vehicle</h2><button type="button" className="account-text-link" onClick={() => setVehicleForm(false)}>Cancel</button></div><div className="account-form-grid"><Field label="Make" value={vehicleDraft.make} onChange={(v) => setVehicleDraft((x) => ({...x,make:v}))} required/><Field label="Model" value={vehicleDraft.model} onChange={(v) => setVehicleDraft((x) => ({...x,model:v}))} required/><Field label="Model year" value={vehicleDraft.model_year} onChange={(v) => setVehicleDraft((x) => ({...x,model_year:v}))}/><Field label="Generation / trim" value={vehicleDraft.trim} onChange={(v) => setVehicleDraft((x) => ({...x,trim:v}))}/><Field label="Notes" value={vehicleDraft.notes} onChange={(v) => setVehicleDraft((x) => ({...x,notes:v}))}/></div><button className="account-button account-button--dark" disabled={busy}>Save vehicle <Icon name="arrow"/></button></form>}
        <div className="account-list-stack">{vehicles.map((vehicle) => <article className="account-card account-vehicle-card" key={vehicle.id}><div className="account-vehicle-card__visual"><Icon name="car"/><span>VEHICLE PROFILE</span></div><div className="account-vehicle-card__body"><span className="account-kicker">{vehicle.model_year || "YEAR NOT SET"} / {vehicle.trim || "GENERATION NOT SET"}</span><h2>{vehicle.make} {vehicle.model}</h2><p>{vehicle.notes || "No additional notes"}</p><button className="account-text-link account-danger-link" disabled={busy} onClick={() => run(() => removeVehicle(vehicle.id), "Vehicle removed.")}>Remove vehicle</button></div></article>)}{!vehicles.length && <div className="account-card account-empty">No vehicles saved yet. Add a vehicle to start your garage.</div>}</div>
      </>}

      {section === "addresses" && <><Heading kicker="DELIVERY / 04" title="Shipping addresses." description="Manage the destinations used for quotations, orders and delivery." action={addressAction}/>
        {addressForm && <form className="account-card account-entry-form" onSubmit={(event) => { event.preventDefault(); run(async () => { await addAddress(user.id, {...addressDraft,is_default:addresses.length===0}); setAddressForm(false); setAddressDraft({label:"Home",recipient:"",phone:"",country:"",region:"",city:"",postal_code:"",line1:"",line2:""}); }, "Shipping address saved."); }}><div className="account-card__heading"><h2>New address</h2><button type="button" className="account-text-link" onClick={() => setAddressForm(false)}>Cancel</button></div><div className="account-form-grid">
          <Field label="Address label" value={addressDraft.label} onChange={(v)=>setAddressDraft(x=>({...x,label:v}))}/><Field label="Recipient" value={addressDraft.recipient} onChange={(v)=>setAddressDraft(x=>({...x,recipient:v}))} required/><Field label="Phone" value={addressDraft.phone} onChange={(v)=>setAddressDraft(x=>({...x,phone:v}))}/><Field label="Country" value={addressDraft.country} onChange={(v)=>setAddressDraft(x=>({...x,country:v}))} required/><Field label="State / region" value={addressDraft.region} onChange={(v)=>setAddressDraft(x=>({...x,region:v}))}/><Field label="City" value={addressDraft.city} onChange={(v)=>setAddressDraft(x=>({...x,city:v}))} required/><Field label="Postal code" value={addressDraft.postal_code} onChange={(v)=>setAddressDraft(x=>({...x,postal_code:v}))}/><Field label="Address line 1" value={addressDraft.line1} onChange={(v)=>setAddressDraft(x=>({...x,line1:v}))} required/><Field label="Address line 2" value={addressDraft.line2} onChange={(v)=>setAddressDraft(x=>({...x,line2:v}))}/></div><button className="account-button account-button--dark" disabled={busy}>Save address <Icon name="arrow"/></button></form>}
        <div className="account-address-grid">{addresses.map((address) => <article className="account-card account-address-card" key={address.id}><div className="account-card__heading"><span className="account-kicker">{address.label.toUpperCase()}</span>{address.is_default && <span className="account-default">DEFAULT</span>}</div><h2>{address.recipient}</h2><p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br/>{address.city}, {address.region} {address.postal_code}<br/>{address.country}</p><span>{address.phone}</span><div className="account-address-actions">{!address.is_default && <button className="account-text-link" onClick={() => run(() => setDefaultAddress(address.id), "Default shipping address updated.")}>Set as default</button>}<button className="account-text-link account-danger-link" onClick={() => run(() => removeAddress(address.id), "Address removed.")}>Remove address</button></div></article>)}{!addresses.length && <div className="account-card account-empty">No shipping addresses saved.</div>}</div>
      </>}

      {section === "preferences" && <><Heading kicker="SETTINGS / 05" title="Your preferences." description="Choose how Euresis communicates and presents product information."/><section className="account-card account-preferences">
        {([["language","Preferred language","Language for account communication",["English","简体中文","繁體中文","日本語","Deutsch"]],["currency","Display currency","Currency for quotations and estimates",["USD","EUR","GBP","JPY","CNY","TWD"]],["units","Specification units","Preferred units for wheel dimensions",["Metric (mm)","Imperial (inch)"]],["contact_method","Preferred contact method","How our team should contact you",["Email","Phone","WhatsApp"]]] as const).map(([key,title,description,options])=><div className="account-preference-row" key={key}><div><strong>{title}</strong><span>{description}</span></div><select value={preferences[key]} onChange={(event)=>updatePreferences(key,event.target.value)}>{options.map((option)=><option key={option}>{option}</option>)}</select></div>)}
        <div className="account-preference-row"><div><strong>Product and engineering updates</strong><span>Receive new collections and technical updates</span></div><label className="account-toggle"><input type="checkbox" checked={preferences.product_updates} onChange={(event)=>updatePreferences("product_updates",event.target.checked)}/><span/></label></div>
        <div className="account-card__footer"><span>Preferences are saved to your customer profile.</span><button className="account-button account-button--dark" disabled={busy} onClick={()=>run(()=>savePreferences(preferences),"Preferences saved.")}>Save preferences <Icon name="arrow"/></button></div>
      </section></>}

      {section === "inquiries" && <><Heading kicker="COMMUNICATION / 06" title="My enquiries." description="Review product questions, fitment requests and conversations with our team." action={<button className="account-button account-button--dark" onClick={()=>setEnquiryForm(!enquiryForm)}><Icon name="plus"/> New enquiry</button>}/>
        {enquiryForm && <form className="account-card account-entry-form" onSubmit={(event)=>{event.preventDefault();run(async()=>{await createEnquiry(user.id,enquiryDraft.subject,enquiryDraft.message);setEnquiryForm(false);setEnquiryDraft({subject:"",message:""});},"Enquiry submitted.");}}><div className="account-form-grid"><Field label="Subject" value={enquiryDraft.subject} onChange={(v)=>setEnquiryDraft(x=>({...x,subject:v}))} required/></div><label>Message<textarea required rows={4} value={enquiryDraft.message} onChange={(e)=>setEnquiryDraft(x=>({...x,message:e.target.value}))}/></label><button className="account-button account-button--dark" disabled={busy}>Submit enquiry <Icon name="arrow"/></button></form>}
        <div className="account-table">{enquiries.map((item: Enquiry)=><article key={item.id}><div><span className="account-kicker">{item.reference} · {dateLabel(item.created_at)}</span><h2>{item.subject}</h2><p>{item.message}</p></div>{statusPill(item.status)}</article>)}{!enquiries.length && <div className="account-card account-empty">No enquiries have been submitted from this account yet.</div>}</div>
      </>}

      {section === "aftersales" && <><Heading kicker="OWNERSHIP SUPPORT / 07" title="After-sales service." description="Submit and track warranty reviews and product support cases." action={<button className="account-button account-button--dark" onClick={()=>setServiceForm(!serviceForm)}><Icon name="plus"/> Request support</button>}/>
        {serviceForm && <form className="account-card account-entry-form" onSubmit={(event)=>{event.preventDefault();run(async()=>{await createServiceCase(user.id,serviceDraft.subject,serviceDraft.description);setServiceForm(false);setServiceDraft({subject:"",description:""});},"Support request submitted.");}}><Field label="Subject" value={serviceDraft.subject} onChange={(v)=>setServiceDraft(x=>({...x,subject:v}))} required/><label>Describe the issue<textarea required rows={4} value={serviceDraft.description} onChange={(e)=>setServiceDraft(x=>({...x,description:e.target.value}))}/></label><button className="account-button account-button--dark" disabled={busy}>Submit request <Icon name="arrow"/></button></form>}
        <div className="account-table">{cases.map((item: ServiceCase)=><article key={item.id}><div><span className="account-kicker">{item.reference} · {dateLabel(item.created_at)}</span><h2>{item.subject}</h2><p>{item.description}</p></div>{statusPill(item.status)}</article>)}{!cases.length && <div className="account-card account-empty">No after-sales requests have been submitted.</div>}</div>
        <div className="account-support-note"><span className="account-kicker">EURESIS CUSTOMER CARE</span><h2>We are here to help.</h2><p>For fitment, finish or product support, contact our team with your vehicle and order reference.</p><a href="/wheels#inquiry">Contact Euresis ↗</a></div>
      </>}

      {section === "orders" && <><Heading kicker="PURCHASES / 08" title="Orders & delivery." description="Follow order progress from confirmation through dispatch and delivery."/>
        {orders.map((order: Order)=><section className="account-card account-order-detail" key={order.id}><div className="account-card__heading"><div><span className="account-kicker">ORDER REFERENCE / {order.order_number}</span><h2>{order.customer_order_items?.map((item)=>item.product_name).join(", ") || "Euresis order"}</h2></div>{statusPill(order.status)}</div><p>Order placed {dateLabel(order.created_at)}</p>{order.customer_order_items?.map((item,index)=><p key={index}>{item.product_name} · {item.specification} · Qty {item.quantity}</p>)}<div className="account-timeline">{["confirmed","in_production","quality_check","dispatched","delivered"].map((step,index)=>{const current=["confirmed","in_production","quality_check","dispatched","delivered"].indexOf(order.status);return <div className={index<current?"is-done":index===current?"is-current":""} key={step}><i/><span>{statusLabel(step)}</span></div>;})}</div>
          <div className="account-shipping-note"><Icon name="box"/><div><strong>{order.tracking_number ? `${order.carrier || "Carrier"} · ${order.tracking_number}` : "Shipment tracking"}</strong><span>{order.tracking_number ? "Use the tracking reference with the carrier for the latest delivery scan." : "Carrier and tracking details will appear after dispatch."}</span></div></div>
          {order.customer_order_events?.length>0 && <div className="account-activity-list">{order.customer_order_events.map((event,index)=><p key={index}><strong>{statusLabel(event.status)}</strong> · {event.description} · {dateLabel(event.occurred_at)}</p>)}</div>}
        </section>)}{!orders.length && <div className="account-card account-empty">Orders linked to this customer account will appear here once confirmed by Euresis.</div>}
      </>}
    </section>
  </div></main>;
}
