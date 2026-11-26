"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { currentUser, request, type AuthUser } from "@/src/lib/supabase/client";

type Inquiry = {
  id: string;
  reference: string;
  user_id: string | null;
  product_name: string;
  product_code: string;
  manufacturing: string;
  customer_name: string;
  company: string;
  contact_email: string;
  contact_phone: string;
  country: string;
  vehicle: Record<string, string>;
  wheel_configurations: Record<string, string>[];
  fitment_status: "verified" | "potential" | "pending_verification" | "unverified" | "not_applicable";
  requirements: string;
  status: "received" | "in_review" | "replied" | "closed";
  admin_reply: string;
  reviewed_at: string | null;
  created_at: string;
};
type Note = { inquiry_id: string; admin_notes: string };
const statuses = ["received", "in_review", "replied", "closed"] as const;
const fitments = ["pending_verification", "verified", "potential", "unverified", "not_applicable"] as const;
const labels: Record<string, string> = {
  received: "Received", in_review: "In review", replied: "Replied", closed: "Closed",
  pending_verification: "Pending verification", verified: "Verified", potential: "Potential fitment",
  unverified: "Unverified", not_applicable: "Not applicable",
};
const vehicleFields: [string, string][] = [
  ["make", "Make"], ["model", "Model"], ["generation", "Generation / chassis"],
  ["year", "Model year"], ["trim", "Trim / version"], ["originalWheel", "Current wheel"],
  ["brakeNotes", "Brake / clearance notes"],
];
const specFields: [string, string][] = [
  ["diameter", "Diameter"], ["width", "Width"], ["pcd", "PCD"], ["offset", "Offset (ET)"],
  ["centerBore", "Center bore"], ["boltSpec", "Bolt specification"], ["loadRating", "Load rating"],
  ["finish", "Finish"], ["quantity", "Quantity"],
];

function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function Field({ label, value }: { label: string; value: string | undefined }) {
  return <div className="admin-inquiry-detail-field"><span>{label}</span><strong>{value?.trim() || "Not provided"}</strong></div>;
}

export function AdminInquiriesPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<Inquiry["status"]>("received");
  const [fitment, setFitment] = useState<Inquiry["fitment_status"]>("pending_verification");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const selected = inquiries.find((item) => item.id === selectedId) ?? null;
  const load = useCallback(async () => {
    const rows = await request<Inquiry[]>("wheel_inquiries", {
      query: "select=*&order=created_at.desc",
    });
    setInquiries(rows);
    setSelectedId((current) => current && rows.some((row) => row.id === current) ? current : rows[0]?.id ?? "");
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const customer = await currentUser();
        if (!customer) {
          if (active) setError("Sign in with an authorized administrator account to continue.");
          return;
        }
        if (customer.app_metadata?.role !== "admin") {
          if (active) setError("Access denied. This account does not have the administrator role.");
          return;
        }
        if (active) setUser(customer);
        await load();
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load inquiry records.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setFitment(selected.fitment_status);
    setReply(selected.admin_reply || "");
    setNotes("");
    let active = true;
    request<Note[]>("wheel_inquiry_admin_notes", {
      query: "select=inquiry_id,admin_notes&inquiry_id=eq." + selected.id + "&limit=1",
    }).then((rows) => {
      if (active) setNotes(rows[0]?.admin_notes || "");
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to load internal notes.");
    });
    return () => { active = false; };
  }, [selectedId, selected?.id]);

  const filtered = useMemo(() => inquiries.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesTerm = !term || [item.reference, item.product_name, item.product_code, item.customer_name, item.contact_email, item.company].some((value) => value?.toLowerCase().includes(term));
    return matchesTerm && (filter === "all" || item.status === filter);
  }), [inquiries, search, filter]);

  const save = async () => {
    if (!selected || !user || saving) return;
    setSaving(true);
    setError("");
    try {
      await request<Inquiry[]>("wheel_inquiries", {
        method: "PATCH",
        query: "id=eq." + selected.id,
        body: {
          status, fitment_status: fitment, admin_reply: reply.trim(),
          reviewed_by: user.id, reviewed_at: new Date().toISOString(),
        },
        prefer: "return=representation",
      });
      await request<Note[]>("wheel_inquiry_admin_notes", {
        method: "POST",
        query: "on_conflict=inquiry_id",
        body: { inquiry_id: selected.id, admin_notes: notes, updated_by: user.id },
        prefer: "resolution=merge-duplicates,return=representation",
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the inquiry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="admin-inquiries"><div className="admin-inquiries-loading">Loading inquiry management…</div></main>;
  if (!user || error && !inquiries.length) return <main className="admin-inquiries"><section className="admin-inquiries-gate"><span>EURESIS / ADMINISTRATION</span><h1>RESTRICTED ACCESS.</h1><p>{error || "Administrator sign-in required."}</p><a href="/account">Go to customer sign in ↗</a></section></main>;

  const vehicle = selected?.vehicle || {};
  return <main className="admin-inquiries">
    <header className="admin-inquiries-header">
      <div><span>EURESIS / OPERATIONS</span><h1>INQUIRY MANAGEMENT.</h1><p>Review customer wheel specifications, verify fitment and manage responses.</p></div>
      <div className="admin-inquiries-header__user"><span>ADMINISTRATOR</span><strong>{user.email}</strong><a href="/">View storefront ↗</a></div>
    </header>
    <section className="admin-inquiries-workspace">
      <aside className="admin-inquiries-list">
        <div className="admin-inquiries-list__heading"><div><span>INBOX</span><h2>{inquiries.length} INQUIRIES</h2></div><button onClick={() => load()} type="button">REFRESH ↻</button></div>
        <input aria-label="Search inquiries" placeholder="Search reference, customer, product…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by status" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
        </select>
        <div className="admin-inquiries-list__items">
          {filtered.map((item) => <button key={item.id} type="button" className={item.id === selectedId ? "is-selected" : ""} onClick={() => setSelectedId(item.id)}>
            <span className="admin-inquiries-list__ref">{item.reference}</span><strong>{item.customer_name || item.contact_email || "Guest customer"}</strong>
            <span>{item.product_name}</span><small>{displayDate(item.created_at)}</small><em>{labels[item.status]}</em>
          </button>)}
          {!filtered.length && <p className="admin-inquiries-empty">No inquiries match this filter.</p>}
        </div>
      </aside>
      <section className="admin-inquiries-detail">
        {!selected ? <div className="admin-inquiries-empty">Select an inquiry to review.</div> : <>
          <div className="admin-inquiries-detail__top"><div><span>{selected.reference}</span><h2>{selected.product_name}</h2><p>Submitted {displayDate(selected.created_at)}</p></div><a href="/wheels">Product catalogue ↗</a></div>
          <section className="admin-inquiries-detail__section"><h3>01 / CUSTOMER CONTACT</h3><div className="admin-inquiry-detail-grid">
            <Field label="Contact" value={selected.customer_name}/><Field label="Company" value={selected.company}/>
            <Field label="Email" value={selected.contact_email}/><Field label="Phone" value={selected.contact_phone}/>
            <Field label="Country / region" value={selected.country}/><Field label="Customer account" value={selected.user_id || "Guest inquiry"}/>
          </div></section>
          <section className="admin-inquiries-detail__section"><h3>02 / VEHICLE DETAILS</h3><div className="admin-inquiry-detail-grid">{vehicleFields.map(([key,label]) => <Field key={key} label={label} value={vehicle[key]}/>)}</div></section>
          <section className="admin-inquiries-detail__section"><h3>03 / REQUESTED WHEEL CONFIGURATIONS</h3>
            <div className="admin-inquiry-configs">{(selected.wheel_configurations || []).map((config,index) => <article key={index}><strong>CONFIGURATION {index+1}</strong><div className="admin-inquiry-detail-grid">{specFields.map(([key,label]) => <Field key={key} label={label} value={config[key]}/>)}</div></article>)}
              {!selected.wheel_configurations?.length && <p>No exact dimensions supplied.</p>}</div>
            <p className="admin-inquiries-warning">Customer-entered dimensions are requested specifications, not confirmed production variants or verified fitments.</p>
          </section>
          <section className="admin-inquiries-detail__section"><h3>04 / CUSTOMER REQUIREMENTS</h3><p className="admin-inquiries-requirements">{selected.requirements || "No additional requirements provided."}</p></section>
          <section className="admin-inquiries-detail__section admin-inquiries-review"><h3>05 / REVIEW & CUSTOMER RESPONSE</h3>
            <label>Inquiry status<select value={status} onChange={(event) => setStatus(event.target.value as Inquiry["status"])}>{statuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
            <label>Fitment assessment<select value={fitment} onChange={(event) => setFitment(event.target.value as Inquiry["fitment_status"])}>{fitments.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
            <p className="admin-inquiries-warning">Only choose “Verified” after technical review of PCD, offset, center bore, brake clearance, load rating and the exact vehicle configuration.</p>
            <label>Customer-visible response<textarea rows={5} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write the response that the customer can see in their account inquiry history." /></label>
            <label>Internal notes (administrator only)<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Private technical review notes. Not visible to customers." /></label>
            <button className="admin-inquiries-save" type="button" disabled={saving} onClick={save}>{saving ? "SAVING…" : "SAVE REVIEW & RESPONSE ↗"}</button>
            {selected.reviewed_at && <small className="admin-inquiries-reviewed">Last reviewed {displayDate(selected.reviewed_at)}</small>}
          </section>
        </>}
      </section>
    </section>
    {error && <p className="admin-inquiries-error" role="alert">{error}</p>}
  </main>;
}
