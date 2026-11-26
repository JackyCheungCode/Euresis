"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PHeading, PText } from "@porsche-design-system/components-react/ssr";
import { wheelProducts } from "@/src/data/wheels";
import { currentUser, request, submitWheelInquiry } from "@/src/lib/supabase/client";

type WheelConfiguration = {
  variantId: string;
  variantLabel: string;
  diameter: string;
  width: string;
  pcd: string;
  offset: string;
  centerBore: string;
  boltSpec: string;
  loadRating: string;
  finish: string;
  quantity: string;
};

type VehicleDetails = {
  make: string;
  model: string;
  generation: string;
  year: string;
  trim: string;
  originalWheel: string;
  brakeNotes: string;
};

const hasVehicleData = (vehicle: VehicleDetails) =>
  Object.values(vehicle).some((value) => value.trim().length > 0);

const makeReference = () => {
  const date = new Date();
  const stamp = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase();
  return "ER-" + stamp + "-" + suffix;
};

function TextField({
  label, value, onChange, placeholder = "", type = "text",
}: {
  label: string; value: string; onChange: (value: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label className="wheel-inquiry-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function WheelsProductDetail({ slug }: { slug: string }) {
  const product = wheelProducts.find((item) => item.slug === slug);
  const [vehicle, setVehicle] = useState<VehicleDetails>({
    make: "", model: "", generation: "", year: "", trim: "", originalWheel: "", brakeNotes: "",
  });
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState("4");
  const [configurations, setConfigurations] = useState<WheelConfiguration[]>([]);
  const [customer, setCustomer] = useState({ name: "", company: "", email: "", phone: "", country: "" });
  const [requirements, setRequirements] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await currentUser();
        if (!active || !user) return;
        setCustomer((current) => ({
          ...current,
          name: current.name || String(user.user_metadata?.full_name || ""),
          email: current.email || String(user.email || ""),
        }));
        const profiles = await request<Array<{ full_name: string; phone: string; company: string; country: string }>>(
          "customer_profiles", { query: "select=*&id=eq." + user.id + "&limit=1" },
        );
        if (!active || !profiles[0]) return;
        const profile = profiles[0];
        setCustomer((current) => ({
          ...current,
          name: current.name || profile.full_name || "",
          phone: current.phone || profile.phone || "",
          company: current.company || profile.company || "",
          country: current.country || profile.country || "",
        }));
      } catch {
        // Guests can complete the same inquiry form manually.
      }
    })();
    return () => { active = false; };
  }, []);

  if (!product) {
    return <main className="wheel-detail wheel-detail--not-found"><p className="wheels-eyebrow">EURESIS / PRODUCT CATALOGUE</p><PHeading tag="h1" size="2xl">MODEL NOT FOUND.</PHeading><a className="wheel-detail__back-link" href="/wheels">Back to wheels</a></main>;
  }

  const suffix = product.manufacturing === "FORGED" ? "F" : "C";
  const updateVehicle = (key: keyof VehicleDetails, value: string) =>
    setVehicle((current) => ({ ...current, [key]: value }));
  const updateCustomer = (key: keyof typeof customer, value: string) =>
    setCustomer((current) => ({ ...current, [key]: value }));
  const productVariants = product.variants ?? [];
  const selectedVariant = productVariants.find((variant) => variant.id === selectedVariantId);
  const formatVariant = (variant: typeof productVariants[number]) => [
    variant.diameterInches ? variant.diameterInches + " in" : "",
    variant.widthInches ? variant.widthInches + "J" : "",
    variant.pcd || "",
    variant.offsetMm !== undefined ? "ET" + variant.offsetMm : "",
    variant.centerBoreMm !== undefined ? "CB " + variant.centerBoreMm + " mm" : "",
    variant.finish || "",
  ].filter(Boolean).join(" · ");

  const addConfiguration = () => {
    if (!selectedVariant) {
      setError("Please select one of the published product specifications.");
      return;
    }
    const snapshot: WheelConfiguration = {
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label || formatVariant(selectedVariant) || selectedVariant.id,
      diameter: selectedVariant.diameterInches?.toString() || "",
      width: selectedVariant.widthInches?.toString() || "",
      pcd: selectedVariant.pcd || "",
      offset: selectedVariant.offsetMm !== undefined ? "ET" + selectedVariant.offsetMm : "",
      centerBore: selectedVariant.centerBoreMm?.toString() || "",
      boltSpec: selectedVariant.boltSpec || "",
      loadRating: selectedVariant.loadRatingKg?.toString() || "",
      finish: selectedVariant.finish || "",
      quantity: String(Math.max(1, Number.parseInt(quantity, 10) || 1)),
    };
    setConfigurations((current) => [...current, snapshot]);
    setQuantity("4");
    setError("");
  };

  const createPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!customer.email.trim() && !customer.phone.trim()) {
      setError("Please provide at least one contact method: email or phone.");
      return;
    }
    setReference(makeReference());
    setPreviewOpen(true);
    window.setTimeout(() => document.getElementById("wheel-inquiry-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const submitInquiry = async () => {
    if (submitted || busy) return;
    setBusy(true);
    setError("");
    try {
      if (productVariants.length > 0 && configurations.length === 0) throw new Error("Add at least one published product specification before submitting.");
      await submitWheelInquiry({
        reference,
        product_slug: product.slug,
        product_code: product.code,
        product_name: product.collection + "-" + suffix + " " + product.model,
        manufacturing: product.manufacturing,
        customer_name: customer.name.trim(),
        company: customer.company.trim(),
        contact_email: customer.email.trim(),
        contact_phone: customer.phone.trim(),
        country: customer.country.trim(),
        vehicle,
        wheel_configurations: configurations,
        fitment_status: hasVehicleData(vehicle) ? "pending_verification" : "unverified",
        requirements: requirements.trim(),
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="wheel-detail">
      <div className="wheel-detail__breadcrumb"><a href="/wheels">WHEELS</a><span>/</span><span>{product.manufacturing}</span><span>/</span><span>{product.collection}</span></div>
      <section className="wheel-detail__hero">
        <div className="wheel-detail__image"><img src={product.image} alt={product.imageAlt} /><span>SAMPLE / REFERENCE IMAGE</span></div>
        <div className="wheel-detail__content">
          <p className="wheels-eyebrow">EURESIS / {product.manufacturing}</p>
          <PHeading tag="h1" size="2xl">{product.collection}-{suffix}</PHeading>
          <h2>{product.model}</h2>
          <p>{product.description}</p>
          <div className="wheel-detail__tags"><span>{product.manufacturing}</span><span>{product.collection}</span><span>SAMPLE MODEL</span></div>
          <a className="wheel-detail__quote-link" href="#wheel-inquiry">Create inquiry sheet</a>
          <small>Demonstration product. Production specifications, pricing, stock and vehicle fitment require confirmation.</small>
        </div>
      </section>

      <section className="wheel-detail__specs">
        <div><p className="wheels-eyebrow">DESIGN INFORMATION</p><PHeading tag="h2" size="xl">MODEL OVERVIEW.</PHeading></div>
        <dl>
          <div><dt>Collection</dt><dd>{product.collection}</dd></div>
          <div><dt>Manufacturing</dt><dd>{product.manufacturing}</dd></div>
          <div><dt>Design concept</dt><dd>{product.design}</dd></div>
          <div><dt>Diameter concept</dt><dd>{product.diameterRange}</dd></div>
          <div><dt>Finish concepts</dt><dd>{product.finishCount}</dd></div>
          <div><dt>Fitment status</dt><dd>Requires Confirmation</dd></div>
        </dl>
        <PText color="contrast-high">All dimensions, materials, offsets, bolt patterns, center bores, load ratings and brake clearances require validation against a real production specification. This sample model does not claim vehicle compatibility.</PText>
      </section>

      <section className="wheel-inquiry-builder" id="wheel-inquiry">
        <div className="wheel-inquiry-builder__intro">
          <p className="wheels-eyebrow">PRODUCT CONFIGURATION / INQUIRY</p>
          <h2>SPECIFY YOUR<br />REQUIREMENTS.</h2>
          <p>Select a published product specification, add your vehicle details and prepare a professional, price-free inquiry document.</p>
          <span className="wheel-inquiry-builder__note">NO PRICING · NO PAYMENT DETAILS · SUBJECT TO TECHNICAL VERIFICATION</span>
        </div>

        <form className="wheel-inquiry-form" onSubmit={createPreview}>
          <div className="wheel-inquiry-form__section">
            <div className="wheel-inquiry-form__heading"><span>01 / PRODUCT SPECIFICATION</span><strong>Select an available specification.</strong></div>
            {productVariants.length > 0 ? (
              <>
                <label className="wheel-inquiry-field">
                  <span>Product variant / specification</span>
                  <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} required>
                    <option value="">Select a published specification</option>
                    {productVariants.filter((variant) => variant.available !== false).map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {(variant.label || formatVariant(variant) || variant.id) + " · " + variant.id}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedVariant && (
                  <div className="wheel-inquiry-variant-summary">
                    <span>SELECTED PRODUCT SPECIFICATION</span>
                    <strong>{selectedVariant.label || formatVariant(selectedVariant) || selectedVariant.id}</strong>
                    <p>{formatVariant(selectedVariant) || "Additional technical details are not published."}</p>
                    <small>Variant ID: {selectedVariant.id}</small>
                  </div>
                )}
                <div className="wheel-inquiry-fields wheel-inquiry-fields--variant">
                  <TextField label="Quantity" type="number" value={quantity} onChange={setQuantity} placeholder="4" />
                  <div className="wheel-inquiry-field wheel-inquiry-field--action">
                    <button type="button" className="wheel-inquiry-secondary" onClick={addConfiguration} disabled={!selectedVariant}>ADD SELECTED SPECIFICATION +</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="wheel-inquiry-no-variants" role="status">
                <strong>Production specifications are not published yet.</strong>
                <p>This is a demonstration model. We have not received verified size, PCD, offset or centre-bore combinations for this product, so no selectable variants are shown. You can still submit a product enquiry and ask our team to confirm the available specifications.</p>
              </div>
            )}
            <p className="wheel-inquiry-help">Only specifications explicitly published for this product can be selected. The diameter concept shown above is a design range, not a list of confirmed variants.</p>
            {configurations.length > 0 && <div className="wheel-inquiry-config-list">
              <strong>ADDED PRODUCT SPECIFICATIONS ({configurations.length})</strong>
              {configurations.map((item, index) => (
                <article key={item.variantId + "-" + index}>
                  <div><b>{item.variantLabel}</b><span>{formatConfiguration(item)}</span><small>Variant {item.variantId} · Qty {item.quantity}</small></div>
                  <button type="button" aria-label={"Remove specification " + (index + 1)} onClick={() => setConfigurations((current) => current.filter((_, itemIndex) => itemIndex !== index))}>REMOVE</button>
                </article>
              ))}
            </div>}
          </div>

          <div className="wheel-inquiry-form__section">
            <div className="wheel-inquiry-form__heading"><span>02 / CUSTOMER DETAILS</span><strong>How can we contact you?</strong></div>
            <div className="wheel-inquiry-fields">
              <TextField label="Contact name" value={customer.name} onChange={(value) => updateCustomer("name", value)} placeholder="Your name" />
              <TextField label="Company" value={customer.company} onChange={(value) => updateCustomer("company", value)} placeholder="Optional" />
              <TextField label="Email address" type="email" value={customer.email} onChange={(value) => updateCustomer("email", value)} placeholder="name@example.com" />
              <TextField label="Phone / WhatsApp" value={customer.phone} onChange={(value) => updateCustomer("phone", value)} placeholder="Country code + number" />
              <TextField label="Country / region" value={customer.country} onChange={(value) => updateCustomer("country", value)} placeholder="Optional" />
            </div>
            <p className="wheel-inquiry-help">At least one contact method (email or phone) is required. If you are signed in, saved customer details are prefilled where available.</p>
          </div>

          <div className="wheel-inquiry-form__section">
            <div className="wheel-inquiry-form__heading"><span>03 / REQUIREMENTS</span><strong>Additional information</strong></div>
            <label className="wheel-inquiry-field"><span>Requirements / notes</span><textarea rows={4} value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Custom finish, intended use, destination, packaging or other requirements" /></label>
          </div>

          {error && <p className="wheel-inquiry-error" role="alert">{error}</p>}
          {submitted && <p className="wheel-inquiry-success" role="status">Inquiry {reference} has been submitted and saved.</p>}
          <button className="wheel-inquiry-primary" type="submit">PREVIEW INQUIRY DOCUMENT ↗</button>
        </form>
      </section>

      {previewOpen && <section className="wheel-inquiry-preview" id="wheel-inquiry-preview">
        <div className="wheel-inquiry-preview__toolbar">
          <div><p className="wheels-eyebrow">DOCUMENT PREVIEW</p><h2>Review your inquiry sheet.</h2><p>Export the document as PDF or submit it securely to Euresis.</p></div>
          <div className="wheel-inquiry-preview__actions">
            <button type="button" className="wheel-inquiry-secondary" onClick={() => window.print()}>EXPORT PDF / PRINT</button>
            <button type="button" className="wheel-inquiry-primary" onClick={submitInquiry} disabled={busy || submitted}>{submitted ? "INQUIRY SUBMITTED" : busy ? "SUBMITTING…" : "SUBMIT INQUIRY"}</button>
          </div>
        </div>
        <article className="wheel-inquiry-document">
          <header className="wheel-inquiry-document__header">
            <div><strong className="wheel-inquiry-document__brand">EURESIS</strong><span>AUTOMOTIVE WHEEL SPECIALIST</span></div>
            <div><b>WHEEL SPECIFICATION</b><b>& INQUIRY SHEET</b><small>NON-COMMERCIAL · NO PRICING</small></div>
          </header>
          <div className="wheel-inquiry-document__meta"><span>INQUIRY REFERENCE <b>{reference}</b></span><span>ISSUED <b>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}</b></span></div>
          <section><h3>01 / CUSTOMER INFORMATION</h3><div className="wheel-inquiry-document__grid">
            <div><small>CONTACT NAME</small><b>{customer.name || "Not provided"}</b></div>
            <div><small>COMPANY</small><b>{customer.company || "Not provided"}</b></div>
            <div><small>EMAIL</small><b>{customer.email || "Not provided"}</b></div>
            <div><small>PHONE / WHATSAPP</small><b>{customer.phone || "Not provided"}</b></div>
            <div><small>COUNTRY / REGION</small><b>{customer.country || "Not provided"}</b></div>
          </div></section>
          <section><h3>02 / VEHICLE INFORMATION</h3><div className="wheel-inquiry-document__grid">
            {([["MAKE", vehicle.make], ["MODEL", vehicle.model], ["GENERATION / CHASSIS", vehicle.generation], ["MODEL YEAR", vehicle.year], ["TRIM / VERSION", vehicle.trim], ["CURRENT WHEEL SPEC", vehicle.originalWheel], ["BRAKE / CLEARANCE NOTES", vehicle.brakeNotes]] as [string, string][]).map(([label, value]) => <div key={label}><small>{label}</small><b>{value || "Not provided"}</b></div>)}
          </div><p className="wheel-inquiry-document__status">FITMENT STATUS: {hasVehicleData(vehicle) ? "PENDING VERIFICATION" : "UNVERIFIED — VEHICLE DETAILS NOT PROVIDED"}</p></section>
          <section><h3>03 / PRODUCT INFORMATION</h3><div className="wheel-inquiry-document__product"><img src={product.image} alt={product.imageAlt}/><div><small>PRODUCT / MODEL</small><b>{product.collection}-{suffix} {product.model}</b><span>Product code: {product.code}</span><span>Manufacturing: {product.manufacturing}</span><span>Design: {product.design}</span></div></div></section>
          <section><h3>04 / WHEEL CONFIGURATIONS</h3>{configurations.length ? <table><thead><tr><th>VARIANT ID</th><th>SPECIFICATION</th><th>DIAMETER</th><th>WIDTH</th><th>PCD</th><th>ET</th><th>CB</th><th>FINISH</th><th>QTY</th></tr></thead><tbody>{configurations.map((item, index) => <tr key={index}><td>{item.variantId}</td><td>{item.variantLabel}</td><td>{item.diameter || "—"}</td><td>{item.width || "—"}</td><td>{item.pcd || "—"}</td><td>{item.offset || "—"}</td><td>{item.centerBore || "—"}</td><td>{item.finish || "—"}</td><td>{item.quantity || "—"}</td></tr>)}</tbody></table> : <p>No exact wheel configuration specified. Please confirm the required specification with Euresis.</p>}
            {configurations.some((item) => item.boltSpec || item.loadRating) && <div className="wheel-inquiry-document__extra">{configurations.map((item, index) => <p key={index}>Configuration {index + 1}: Bolt specification — {item.boltSpec || "Not provided"} · Load rating — {item.loadRating || "Not provided"} kg</p>)}</div>}
          </section>
          <section><h3>05 / CUSTOMER REQUIREMENTS</h3><p className="wheel-inquiry-document__notes">{requirements || "No additional requirements provided."}</p></section>
          <footer className="wheel-inquiry-document__footer"><b>EURESIS / WHEEL SPECIFICATION & INQUIRY DOCUMENT</b><p>This document records customer-provided requirements only. It is not a quotation, commercial invoice, order confirmation or fitment certification. All specifications and vehicle compatibility are subject to technical review and written confirmation by Euresis.</p><span>NO PRICING · NO PAYMENT TERMS · NO COMMERCIAL VALUE</span></footer>
        </article>
        {error && <p className="wheel-inquiry-error" role="alert">{error}</p>}
        {submitted && <p className="wheel-inquiry-success" role="status">Thank you. Your inquiry reference is {reference}. You can print or save this document as PDF for your records.</p>}
      </section>}
    </main>
  );
}
