"use client";

import { useEffect, useMemo, useState } from "react";

type Customer = {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
};
type Vehicle = { id: number; make: string; model: string; year: string; trim: string; notes: string };
type Address = { id: number; label: string; recipient: string; phone: string; country: string; region: string; city: string; postal: string; line1: string; line2: string; isDefault: boolean };
type AccountData = { customer: Customer; vehicles: Vehicle[]; addresses: Address[]; preferences: { currency: string; language: string; contact: string; updates: boolean; units: string } };

const STORAGE_KEY = "euresis-customer-account-v1";
const initialData: AccountData = {
  customer: { name: "Alex Morgan", email: "alex.morgan@example.com", phone: "+1 415 555 0138", company: "Morgan Automotive", country: "United States" },
  vehicles: [
    { id: 1, make: "Porsche", model: "911 Carrera GTS", year: "2024", trim: "992.1", notes: "Daily driver · factory PCCB" },
    { id: 2, make: "BMW", model: "M3 Competition", year: "2023", trim: "G80", notes: "Track setup" },
  ],
  addresses: [
    { id: 1, label: "Business", recipient: "Alex Morgan", phone: "+1 415 555 0138", country: "United States", region: "California", city: "San Francisco", postal: "94103", line1: "410 Townsend Street", line2: "Suite 300", isDefault: true },
  ],
  preferences: { currency: "USD", language: "English", contact: "Email", updates: true, units: "Metric (mm)" },
};

const navItems = [
  ["overview", "Overview", "01"], ["profile", "Personal information", "02"], ["vehicles", "My vehicles", "03"],
  ["addresses", "Shipping addresses", "04"], ["preferences", "Preferences", "05"], ["inquiries", "My enquiries", "06"],
  ["aftersales", "After-sales", "07"], ["orders", "Orders & delivery", "08"],
] as const;
type Section = (typeof navItems)[number][0];

const inquiries = [
  { id: "ENQ-260184", title: "FORGED / F-01 · 21-inch fitment", date: "18 Nov 2026", status: "In review", tone: "progress" },
  { id: "ENQ-260102", title: "Custom finish consultation", date: "02 Nov 2026", status: "Replied", tone: "complete" },
];
const serviceCases = [
  { id: "AS-260031", title: "Finish inspection · F-01 Satin Graphite", date: "12 Nov 2026", status: "Awaiting review", tone: "progress" },
];
const orders = [
  { id: "EU-2026-00842", title: "FORGED / F-01 · 21 × 9.5 / 21 × 11", date: "04 Nov 2026", status: "In production", step: 2 },
];

function Icon({ name }: { name: "grid" | "user" | "car" | "pin" | "sliders" | "message" | "tool" | "box" | "plus" | "arrow" | "logout" }) {
  const paths: Record<string, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
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

export function AccountPage() {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<AccountData>(initialData);
  const [signedIn, setSignedIn] = useState(false);
  const [section, setSection] = useState<Section>("overview");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [vehicleForm, setVehicleForm] = useState(false);
  const [addressForm, setAddressForm] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState({ make: "", model: "", year: "", trim: "", notes: "" });
  const [addressDraft, setAddressDraft] = useState({ label: "Home", recipient: "", phone: "", country: "", region: "", city: "", postal: "", line1: "", line2: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { account?: AccountData; signedIn?: boolean };
        if (parsed.account) setAccount(parsed.account);
        if (parsed.signedIn) setSignedIn(true);
      }
    } catch { /* Ignore malformed local demo data. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ account, signedIn }));
  }, [account, signedIn, ready]);

  const firstName = useMemo(() => account.customer.name.trim().split(/\s+/)[0] || "Customer", [account.customer.name]);
  const saveNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const signIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authEmail.includes("@") || authPassword.length < 6) {
      setAuthError("Enter a valid email address and a password of at least 6 characters.");
      return;
    }
    if (authMode === "register") {
      if (authName.trim().length < 2) { setAuthError("Please enter your full name."); return; }
      setAccount((current) => ({ ...current, customer: { ...current.customer, name: authName.trim(), email: authEmail.trim() } }));
    } else {
      setAccount((current) => ({ ...current, customer: { ...current.customer, email: authEmail.trim() } }));
    }
    setAuthError("");
    setSignedIn(true);
  };
  const signOut = () => { setSignedIn(false); setSection("overview"); setAuthPassword(""); };
  const updateCustomer = (key: keyof Customer, value: string) => setAccount((current) => ({ ...current, customer: { ...current.customer, [key]: value } }));
  const addVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleDraft.make.trim() || !vehicleDraft.model.trim()) return;
    setAccount((current) => ({ ...current, vehicles: [...current.vehicles, { ...vehicleDraft, id: Date.now() }] }));
    setVehicleDraft({ make: "", model: "", year: "", trim: "", notes: "" }); setVehicleForm(false); saveNotice("Vehicle added to your garage.");
  };
  const addAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressDraft.recipient.trim() || !addressDraft.line1.trim() || !addressDraft.city.trim()) return;
    setAccount((current) => ({ ...current, addresses: [...current.addresses, { ...addressDraft, id: Date.now(), isDefault: current.addresses.length === 0 }] }));
    setAddressForm(false); setAddressDraft({ label: "Home", recipient: "", phone: "", country: "", region: "", city: "", postal: "", line1: "", line2: "" }); saveNotice("Shipping address saved.");
  };

  if (!ready) return <main className="account-page"><div className="account-loading">Loading your account…</div></main>;

  if (!signedIn) return (
    <main className="account-auth">
      <div className="account-auth__visual">
        <div className="account-auth__visual-copy"><span className="account-kicker">EURESIS / CUSTOMER PORTAL</span><h1>Your ownership.<br />In one place.</h1><p>Manage your vehicles, enquiries and orders with a single Euresis account.</p></div>
        <span className="account-auth__visual-index">PRECISION PERFORMANCE / 01—08</span>
      </div>
      <section className="account-auth__panel">
        <a className="account-auth__back" href="/">← Back to Euresis</a>
        <div className="account-auth__form-wrap">
          <span className="account-kicker">CUSTOMER ACCOUNT</span>
          <h2>{authMode === "login" ? "Welcome back." : "Create your account."}</h2>
          <p className="account-muted">{authMode === "login" ? "Sign in to access your personal garage and orders." : "Set up your Euresis customer profile."}</p>
          <div className="account-auth__switch"><button className={authMode === "login" ? "is-active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Sign in</button><button className={authMode === "register" ? "is-active" : ""} onClick={() => { setAuthMode("register"); setAuthError(""); }}>Create account</button></div>
          <form className="account-form" onSubmit={signIn}>
            {authMode === "register" && <label>Full name<input required autoComplete="name" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your full name" /></label>}
            <label>Email address<input required type="email" autoComplete="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="name@example.com" /></label>
            <label>Password<input required type="password" minLength={6} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="At least 6 characters" /></label>
            {authError && <p className="account-form__error" role="alert">{authError}</p>}
            <button className="account-button account-button--dark" type="submit">{authMode === "login" ? "Sign in" : "Create account"} <Icon name="arrow" /></button>
          </form>
          <p className="account-auth__disclaimer">Frontend preview only. Account details are stored locally in this browser; secure authentication and password recovery will be connected with the backend phase.</p>
        </div>
      </section>
    </main>
  );

  return (
    <main className="account-page">
      <div className="account-shell">
        <aside className="account-sidebar">
          <div className="account-sidebar__heading"><span className="account-kicker">MY EURESIS</span><h2>Account</h2></div>
          <div className="account-user"><div className="account-user__avatar">{firstName.slice(0, 1).toUpperCase()}</div><div><strong>{account.customer.name}</strong><span>{account.customer.email}</span></div></div>
          <nav className="account-nav" aria-label="Account navigation">
            {navItems.map(([id, label, number]) => <button key={id} className={section === id ? "is-active" : ""} onClick={() => setSection(id)}><span className="account-nav__number">{number}</span><span>{label}</span><span className="account-nav__arrow">↗</span></button>)}
          </nav>
          <button className="account-signout" onClick={signOut}><Icon name="logout" /> Sign out</button>
        </aside>

        <section className="account-content">
          <div className="account-content__top"><span className="account-kicker">CUSTOMER PORTAL / {navItems.find(([id]) => id === section)?.[1].toUpperCase()}</span><span className="account-content__secure"><i /> PERSONAL SPACE</span></div>
          {notice && <div className="account-notice" role="status">{notice}</div>}

          {section === "overview" && <>
            <div className="account-page-heading"><div><span className="account-kicker">YOUR EURESIS</span><h1>Good to see you,<br />{firstName}.</h1><p>Everything connected to your Euresis experience, in one place.</p></div><span className="account-heading-mark">E.</span></div>
            <div className="account-stat-grid">
              <button onClick={() => setSection("vehicles")}><span>MY VEHICLES</span><strong>{account.vehicles.length.toString().padStart(2, "0")}</strong><small>Vehicles in your garage <b>↗</b></small></button>
              <button onClick={() => setSection("inquiries")}><span>OPEN ENQUIRIES</span><strong>02</strong><small>One response received <b>↗</b></small></button>
              <button onClick={() => setSection("orders")}><span>ACTIVE ORDERS</span><strong>01</strong><small>Currently in production <b>↗</b></small></button>
            </div>
            <div className="account-overview-grid">
              <section className="account-card"><div className="account-card__heading"><div><span className="account-kicker">GARAGE</span><h2>Your vehicles</h2></div><button className="account-text-link" onClick={() => setSection("vehicles")}>View all ↗</button></div>
                {account.vehicles.slice(0, 2).map((vehicle) => <div className="account-vehicle-row" key={vehicle.id}><div className="account-vehicle-mark"><Icon name="car" /></div><div><strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong><span>{vehicle.trim || "Vehicle profile"}</span></div><span className="account-row-arrow">↗</span></div>)}
                {account.vehicles.length === 0 && <p className="account-empty">Your garage is ready. Add your first vehicle to save fitment details.</p>}
                <button className="account-inline-add" onClick={() => { setSection("vehicles"); setVehicleForm(true); }}><Icon name="plus" /> Add a vehicle</button>
              </section>
              <section className="account-card"><div className="account-card__heading"><div><span className="account-kicker">RECENT ACTIVITY</span><h2>Enquiries</h2></div><button className="account-text-link" onClick={() => setSection("inquiries")}>View all ↗</button></div>
                {inquiries.slice(0, 2).map((item) => <div className="account-activity-row" key={item.id}><div><strong>{item.title}</strong><span>{item.id} · {item.date}</span></div><span className="account-status">{item.status}</span></div>)}
              </section>
            </div>
            <section className="account-card account-order-card"><div className="account-card__heading"><div><span className="account-kicker">ORDER TRACKING</span><h2>Latest order</h2></div><button className="account-text-link" onClick={() => setSection("orders")}>Track order ↗</button></div><div className="account-order-summary"><div><span className="account-kicker">{orders[0].id}</span><h3>{orders[0].title}</h3><p>Placed {orders[0].date} · Estimated dispatch subject to production schedule</p></div><span className="account-status account-status--dark">{orders[0].status}</span></div><div className="account-progress"><span className="is-done">Order confirmed</span><span className="is-done">In production</span><span>Quality inspection</span><span>Dispatched</span></div></section>
          </>}

          {section === "profile" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">PROFILE / 02</span><h1>Personal information.</h1><p>Keep your contact details up to date for a seamless ownership experience.</p></div></div><section className="account-card account-edit-card"><div className="account-card__heading"><div><span className="account-kicker">YOUR DETAILS</span><h2>Contact information</h2></div></div><div className="account-form-grid">{([["name","Full name"],["email","Email address"],["phone","Phone number"],["company","Company"],["country","Country / region"]] as const).map(([key,label]) => <label key={key}>{label}<input value={account.customer[key]} onChange={(e) => updateCustomer(key, e.target.value)} /></label>)}</div><div className="account-card__footer"><span>Changes are saved automatically in this browser preview.</span><button className="account-button account-button--dark" onClick={() => saveNotice("Personal information saved.")}>Save changes <Icon name="arrow" /></button></div></section></>}

          {section === "vehicles" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">GARAGE / 03</span><h1>Your vehicles.</h1><p>Save your vehicles to make wheel fitment enquiries faster and more precise.</p></div><button className="account-button account-button--dark" onClick={() => setVehicleForm(!vehicleForm)}><Icon name="plus" /> Add vehicle</button></div>
            {vehicleForm && <form className="account-card account-entry-form" onSubmit={addVehicle}><div className="account-card__heading"><h2>New vehicle</h2><button type="button" className="account-text-link" onClick={() => setVehicleForm(false)}>Cancel</button></div><div className="account-form-grid">{([["make","Make"],["model","Model"],["year","Model year"],["trim","Generation / trim"],["notes","Notes"]] as const).map(([key,label]) => <label key={key}>{label}<input required={key === "make" || key === "model"} value={vehicleDraft[key]} onChange={(e) => setVehicleDraft((v) => ({ ...v, [key]: e.target.value }))} placeholder={label} /></label>)}</div><button className="account-button account-button--dark" type="submit">Save vehicle <Icon name="arrow" /></button></form>}
            <div className="account-list-stack">{account.vehicles.map((vehicle) => <article className="account-card account-vehicle-card" key={vehicle.id}><div className="account-vehicle-card__visual"><Icon name="car" /><span>VEHICLE PROFILE</span></div><div className="account-vehicle-card__body"><span className="account-kicker">{vehicle.year || "YEAR NOT SET"} / {vehicle.trim || "GENERATION NOT SET"}</span><h2>{vehicle.make} {vehicle.model}</h2><p>{vehicle.notes || "No additional notes"}</p><button className="account-text-link account-danger-link" onClick={() => { setAccount((current) => ({ ...current, vehicles: current.vehicles.filter((v) => v.id !== vehicle.id) })); saveNotice("Vehicle removed."); }}>Remove vehicle</button></div></article>)}{account.vehicles.length === 0 && <div className="account-card account-empty">No vehicles saved yet. Add a vehicle to start building your garage.</div>}</div>
          </>}

          {section === "addresses" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">DELIVERY / 04</span><h1>Shipping addresses.</h1><p>Manage the destinations used for quotations, orders and delivery.</p></div><button className="account-button account-button--dark" onClick={() => setAddressForm(!addressForm)}><Icon name="plus" /> Add address</button></div>
            {addressForm && <form className="account-card account-entry-form" onSubmit={addAddress}><div className="account-card__heading"><h2>New address</h2><button type="button" className="account-text-link" onClick={() => setAddressForm(false)}>Cancel</button></div><div className="account-form-grid">{([["label","Address label"],["recipient","Recipient"],["phone","Phone"],["country","Country"],["region","State / region"],["city","City"],["postal","Postal code"],["line1","Address line 1"],["line2","Address line 2"]] as const).map(([key,label]) => <label key={key}>{label}<input required={["recipient","city","line1","country"].includes(key)} value={addressDraft[key]} onChange={(e) => setAddressDraft((v) => ({ ...v, [key]: e.target.value }))} /></label>)}</div><button className="account-button account-button--dark" type="submit">Save address <Icon name="arrow" /></button></form>}
            <div className="account-address-grid">{account.addresses.map((address) => <article className="account-card account-address-card" key={address.id}><div className="account-card__heading"><span className="account-kicker">{address.label.toUpperCase()}</span>{address.isDefault && <span className="account-default">DEFAULT</span>}</div><h2>{address.recipient}</h2><p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.region} {address.postal}<br />{address.country}</p><span>{address.phone}</span><button className="account-text-link account-danger-link" onClick={() => setAccount((current) => ({ ...current, addresses: current.addresses.filter((a) => a.id !== address.id) }))}>Remove address</button></article>)}{account.addresses.length === 0 && <div className="account-card account-empty">No shipping addresses saved.</div>}</div>
          </>}

          {section === "preferences" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">SETTINGS / 05</span><h1>Your preferences.</h1><p>Set how Euresis communicates and presents product information.</p></div></div><section className="account-card account-preferences"><div className="account-preference-row"><div><strong>Preferred language</strong><span>Language for account communication</span></div><select value={account.preferences.language} onChange={(e) => setAccount((c) => ({ ...c, preferences: { ...c.preferences, language: e.target.value } }))}><option>English</option><option>简体中文</option><option>繁體中文</option><option>日本語</option><option>Deutsch</option></select></div><div className="account-preference-row"><div><strong>Display currency</strong><span>Currency for quotations and estimates</span></div><select value={account.preferences.currency} onChange={(e) => setAccount((c) => ({ ...c, preferences: { ...c.preferences, currency: e.target.value } }))}><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>CNY</option></select></div><div className="account-preference-row"><div><strong>Specification units</strong><span>Preferred units for wheel dimensions</span></div><select value={account.preferences.units} onChange={(e) => setAccount((c) => ({ ...c, preferences: { ...c.preferences, units: e.target.value } }))}><option>Metric (mm)</option><option>Imperial (inch)</option></select></div><div className="account-preference-row"><div><strong>Preferred contact method</strong><span>How our team should contact you</span></div><select value={account.preferences.contact} onChange={(e) => setAccount((c) => ({ ...c, preferences: { ...c.preferences, contact: e.target.value } }))}><option>Email</option><option>Phone</option><option>WhatsApp</option></select></div><div className="account-preference-row"><div><strong>Product and engineering updates</strong><span>Receive new collections, product and technical updates</span></div><label className="account-toggle"><input type="checkbox" checked={account.preferences.updates} onChange={(e) => setAccount((c) => ({ ...c, preferences: { ...c.preferences, updates: e.target.checked } }))} /><span /></label></div><div className="account-card__footer"><span>Preferences save automatically in this browser preview.</span><button className="account-button account-button--dark" onClick={() => saveNotice("Preferences saved.")}>Save preferences <Icon name="arrow" /></button></div></section></>}

          {section === "inquiries" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">COMMUNICATION / 06</span><h1>My enquiries.</h1><p>Review product questions, fitment requests and conversations with our team.</p></div><a className="account-button account-button--dark" href="/wheels#inquiry">New enquiry <Icon name="arrow" /></a></div><div className="account-table">{inquiries.map((item) => <article key={item.id}><div><span className="account-kicker">{item.id} · {item.date}</span><h2>{item.title}</h2></div><span className="account-status">{item.status}</span><button className="account-text-link" onClick={() => saveNotice(`Enquiry ${item.id} selected. Detailed message history will be connected to the backend.`)}>View details ↗</button></article>)}</div><p className="account-footnote">Enquiry history shown here is demonstration content. Live messages will appear when the customer service backend is connected.</p></>}

          {section === "aftersales" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">OWNERSHIP SUPPORT / 07</span><h1>After-sales service.</h1><p>Track service requests, warranty reviews and product support cases.</p></div><button className="account-button account-button--dark" onClick={() => saveNotice("Service request form will be connected in the backend phase.")}>Request support <Icon name="arrow" /></button></div><div className="account-table">{serviceCases.map((item) => <article key={item.id}><div><span className="account-kicker">{item.id} · {item.date}</span><h2>{item.title}</h2></div><span className="account-status">{item.status}</span><button className="account-text-link" onClick={() => saveNotice(`Case ${item.id} selected. Case documents and messages will be connected later.`)}>View case ↗</button></article>)}</div><div className="account-support-note"><span className="account-kicker">EURESIS CUSTOMER CARE</span><h2>We are here to help.</h2><p>For fitment, finish or product support, contact our team with your vehicle and order reference.</p><a href="/wheels#inquiry">Contact Euresis ↗</a></div></>}

          {section === "orders" && <><div className="account-page-heading account-page-heading--compact"><div><span className="account-kicker">PURCHASES / 08</span><h1>Orders & delivery.</h1><p>Follow order progress from confirmation through dispatch and delivery.</p></div></div>{orders.map((order) => <section className="account-card account-order-detail" key={order.id}><div className="account-card__heading"><div><span className="account-kicker">ORDER REFERENCE / {order.id}</span><h2>{order.title}</h2></div><span className="account-status account-status--dark">{order.status}</span></div><p>Order placed {order.date}</p><div className="account-timeline">{["Order confirmed","In production","Quality inspection","Dispatched","Delivered"].map((step, index) => <div className={index < order.step ? "is-done" : index === order.step ? "is-current" : ""} key={step}><i /><span>{step}</span></div>)}</div><div className="account-shipping-note"><Icon name="box" /><div><strong>Shipment tracking</strong><span>Tracking number and carrier updates will be displayed here once the order is dispatched.</span></div></div></section>)}<p className="account-footnote">Order and logistics information is sample data for the frontend preview. Live order status will be integrated after backend development.</p></>}
        </section>
      </div>
    </main>
  );
}
