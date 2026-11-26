"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PHeading, PText } from "@/src/components/ui/carbon-primitives";
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
  const [activeTab, setActiveTab] = useState("specs");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fitmentOpen, setFitmentOpen] = useState(false);
  const [fitmentRegion, setFitmentRegion] = useState("jdm");
  const [fitmentMakes, setFitmentMakes] = useState<Array<Record<string, any>>>([]);
  const [fitmentModels, setFitmentModels] = useState<Array<Record<string, any>>>([]);
  const [fitmentYears, setFitmentYears] = useState<Array<Record<string, any>>>([]);
  const [fitmentTrims, setFitmentTrims] = useState<Array<Record<string, any>>>([]);
  const [fitmentMake, setFitmentMake] = useState("");
  const [fitmentModel, setFitmentModel] = useState("");
  const [fitmentYear, setFitmentYear] = useState("");
  const [fitmentTrim, setFitmentTrim] = useState("");
  const [fitmentRows, setFitmentRows] = useState<Array<Record<string, any>>>([]);
  const [fitmentLoading, setFitmentLoading] = useState(false);
  const [fitmentError, setFitmentError] = useState("");

  const loadFitmentResource = async (resource: string, params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params);
    const response = await fetch("/api/wheel-size/" + resource + "?" + query.toString());
    const body: any = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? body?.detail ?? "Wheel fitment service unavailable.");
    return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  };

  useEffect(() => {
    if (!fitmentOpen || fitmentMakes.length) return;
    loadFitmentResource("makes").then(setFitmentMakes).catch((reason) => setFitmentError(reason instanceof Error ? reason.message : "Unable to load vehicle makes."));
  }, [fitmentOpen]);

  useEffect(() => {
    if (!fitmentMake) { setFitmentModels([]); return; }
    loadFitmentResource("models", { make: fitmentMake, region: fitmentRegion }).then(setFitmentModels).catch((reason) => setFitmentError(reason instanceof Error ? reason.message : "Unable to load vehicle models."));
    setFitmentModel(""); setFitmentYear(""); setFitmentTrim(""); setFitmentYears([]); setFitmentTrims([]); setFitmentRows([]);
  }, [fitmentMake, fitmentRegion]);

  useEffect(() => {
    if (!fitmentMake || !fitmentModel) { setFitmentYears([]); return; }
    loadFitmentResource("years", { make: fitmentMake, model: fitmentModel, region: fitmentRegion }).then(setFitmentYears).catch((reason) => setFitmentError(reason instanceof Error ? reason.message : "Unable to load model years."));
    setFitmentYear(""); setFitmentTrim(""); setFitmentTrims([]); setFitmentRows([]);
  }, [fitmentMake, fitmentModel, fitmentRegion]);

  useEffect(() => {
    if (!fitmentMake || !fitmentModel || !fitmentYear) { setFitmentTrims([]); return; }
    loadFitmentResource("modifications", { make: fitmentMake, model: fitmentModel, year: fitmentYear, region: fitmentRegion }).then(setFitmentTrims).catch((reason) => setFitmentError(reason instanceof Error ? reason.message : "Unable to load vehicle trims."));
    setFitmentTrim(""); setFitmentRows([]);
  }, [fitmentMake, fitmentModel, fitmentYear, fitmentRegion]);

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
  const productVariants = (product.variants ?? []).filter((variant) => variant.available !== false);
  const selectedVariant = productVariants.find((variant) => variant.id === selectedVariantId);
  const formatVariant = (variant: typeof productVariants[number]) => [
    variant.diameterInches ? variant.diameterInches + " in" : "",
    variant.widthInches ? variant.widthInches + "J" : "",
    variant.pcd || "",
    variant.offsetMm !== undefined ? "ET" + variant.offsetMm : "",
    variant.centerBoreMm !== undefined ? "CB " + variant.centerBoreMm + " mm" : "",
    variant.finish || "",
  ].filter(Boolean).join(" · ");
  const formatConfiguration = (item: WheelConfiguration) => [item.diameter ? item.diameter + " in" : "", item.width ? item.width + "J" : "", item.pcd, item.offset, item.centerBore ? "CB " + item.centerBore + " mm" : "", item.finish].filter(Boolean).join(" · ") || "Technical details pending";

  const fitmentOption = (item: Record<string, any>) => ({
    value: String(item.slug ?? item.id ?? item.name ?? item.title ?? item.year ?? item.trim ?? ""),
    label: String(item.name ?? item.title ?? item.trim ?? item.year ?? item.slug ?? ""),
  });
  const compareFitment = (vehicleRows: Array<Record<string, any>>) => {
    if (!selectedVariant) return vehicleRows.map((row) => ({ ...row, status: "PENDING", reason: "Select a published product variant before comparing dimensions." }));
    const normalizePcd = (value: unknown) => String(value ?? "").toLowerCase().replace(/[×*]/g, "x").replace(/[^0-9x]/g, "");
    const number = (value: unknown) => {
      const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.+-]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    };
    return vehicleRows.map((row) => {
      const front = row.front ?? row;
      const pcd = front.bolt_pattern ?? front.pcd ?? front.bolt_pattern_full ?? row.bolt_pattern ?? row.pcd ?? "";
      const diameter = number(front.rim_diameter ?? front.rim?.diameter ?? front.diameter);
      const width = number(front.rim_width ?? front.rim?.width ?? front.width);
      const offset = number(front.rim_offset ?? front.rim?.offset ?? front.offset);
      const productPcd = normalizePcd(selectedVariant.pcd);
      const vehiclePcd = normalizePcd(pcd);
      if (productPcd && vehiclePcd && productPcd !== vehiclePcd) {
        return { ...row, status: "NOT COMPATIBLE", reason: "Bolt pattern differs from the vehicle reference specification." };
      }
      const diameterDelta = diameter === null ? null : Math.abs(diameter - (selectedVariant.diameterInches ?? 0));
      const widthDelta = width === null ? null : Math.abs(width - (selectedVariant.widthInches ?? 0));
      const offsetDelta = offset === null ? null : Math.abs(offset - (selectedVariant.offsetMm ?? 0));
      const dimensionsClose = (diameterDelta === null || diameterDelta <= 1) &&
        (widthDelta === null || widthDelta <= 1.5) && (offsetDelta === null || offsetDelta <= 15);
      if (productPcd && vehiclePcd && productPcd === vehiclePcd && dimensionsClose) {
        return { ...row, status: "POTENTIAL MATCH", reason: "Reference dimensions are broadly comparable. Hub bore, brake clearance, load rating, fasteners and actual clearance still require technical verification." };
      }
      return { ...row, status: "REVIEW REQUIRED", reason: "Available reference data is insufficient to confirm compatibility. Technical review is required." };
    });
  };

  const searchVehicleFitment = async () => {
    if (!fitmentMake || !fitmentModel || !fitmentYear || !fitmentTrim) {
      setFitmentError("Select make, model, year and modification first.");
      return;
    }
    setFitmentLoading(true);
    setFitmentError("");
    setFitmentRows([]);
    try {
      const vehicles = await loadFitmentResource("search", {
        make: fitmentMake, model: fitmentModel, year: fitmentYear,
        modification: fitmentTrim, region: fitmentRegion, limit: "100",
      });
      const wheels: Array<Record<string, any>> = [];
      vehicles.forEach((entry: Record<string, any>) => {
        (Array.isArray(entry.wheels) ? entry.wheels : []).forEach((wheel: Record<string, any>, index: number) => {
          wheels.push({ ...wheel, _vehicle: entry, _id: String(entry.modification?.slug ?? fitmentTrim) + "-" + index });
        });
      });
      if (!wheels.length) setFitmentError("No wheel reference data was returned for this vehicle. Try another trim or market.");
      setFitmentRows(compareFitment(wheels));
      setVehicle((current) => ({
        ...current,
        make: fitmentMake, model: fitmentModel, year: fitmentYear,
        trim: fitmentTrim, generation: current.generation || "",
        originalWheel: wheels[0] ? String(wheels[0].front?.rim_full ?? wheels[0].front?.rim ?? wheels[0].rim_full ?? "Wheel-Size reference retrieved") : current.originalWheel,
      }));
    } catch (reason) {
      setFitmentError(reason instanceof Error ? reason.message : "Unable to retrieve vehicle wheel data.");
    } finally {
      setFitmentLoading(false);
    }
  };

  const openInquiryWithSelection = () => {
    if (selectedVariant) addConfiguration();
    setActiveTab("inquiry");
    window.setTimeout(() => document.getElementById("wheel-detail-tabs-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

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
      <div className="wheel-detail__breadcrumb"><a href="/wheels">WHEELS</a><span>/</span><span>{product.manufacturing}</span><span>/</span><span>{product.collection}</span><span>/</span><span>{product.model}</span></div>

      <section className="wheel-detail-banner" aria-label="Product campaign">
        <img src={product.image} alt={product.imageAlt} />
        <div className="wheel-detail-banner__shade" />
        <div className="wheel-detail-banner__copy">
          <p className="wheels-eyebrow">EURESIS / {product.collection} COLLECTION</p>
          <h1>ENGINEERED<br />TO DEFINE MOTION.</h1>
          <p>{product.description}</p>
          <button type="button" onClick={openInquiryWithSelection}>CONFIGURE YOUR WHEEL ↗</button>
        </div>
        <span className="wheel-detail-banner__caption">SAMPLE / REFERENCE IMAGE · PRODUCTION PHOTOGRAPHY PENDING</span>
      </section>

      <section className="wheel-product-overview" aria-labelledby="wheel-product-title">
        <div className="wheel-product-gallery">
          <div className="wheel-product-gallery__main">
            {galleryIndex === 0 || product.galleryImages?.[galleryIndex] ? (
              <img src={product.galleryImages?.[galleryIndex] ?? product.image} alt={product.imageAlt} />
            ) : (
              <div className="wheel-product-gallery__placeholder"><span>PRODUCTION IMAGE PENDING</span><strong>{["", "SIDE PROFILE", "SPOKE DETAIL", "REAR / BARREL VIEW"][galleryIndex]}</strong></div>
            )}
            <span>0{galleryIndex + 1} / 04</span>
          </div>
          <div className="wheel-product-gallery__thumbs" aria-label="Product image gallery">
            {["MAIN VIEW", "SIDE PROFILE", "SPOKE DETAIL", "REAR VIEW"].map((label, index) => (
              <button type="button" key={label} className={galleryIndex === index ? "is-active" : ""} onClick={() => setGalleryIndex(index)} aria-label={"Show " + label.toLowerCase()}>
                {index === 0 || product.galleryImages?.[index] ? <img src={product.galleryImages?.[index] ?? product.image} alt="" /> : <span>{label}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="wheel-product-summary">
          <p className="wheels-eyebrow">{product.manufacturing} / {product.collection} SERIES</p>
          <h2 id="wheel-product-title">{product.model}</h2>
          <p className="wheel-product-summary__code">PRODUCT CODE / {product.code}</p>
          <p className="wheel-product-summary__description">{product.description}</p>
          <div className="wheel-product-tags"><span>{product.manufacturing} CONSTRUCTION</span><span>{product.design.toUpperCase()}</span></div>
          <div className="wheel-product-attributes">
            <div className="wheel-product-attributes__heading"><span>01 / CONFIGURATION</span><strong>Select product specification</strong></div>
            {productVariants.length ? (
              <label className="wheel-inquiry-field"><span>Wheel size / variant</span>
                <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)}>
                  <option value="">Choose an available specification</option>
                  {productVariants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label || formatVariant(variant) || variant.id} · {variant.id}</option>)}
                </select>
              </label>
            ) : (
              <div className="wheel-product-attributes__empty"><strong>Specifications are being prepared.</strong><p>This sample model has no published production variants yet. Selectable sizes will appear here when confirmed product data is available.</p></div>
            )}
            {selectedVariant && <dl className="wheel-product-attributes__selected">
              <div><dt>DIAMETER</dt><dd>{selectedVariant.diameterInches ? selectedVariant.diameterInches + " in" : "—"}</dd></div>
              <div><dt>WIDTH</dt><dd>{selectedVariant.widthInches ? selectedVariant.widthInches + "J" : "—"}</dd></div>
              <div><dt>PCD</dt><dd>{selectedVariant.pcd || "—"}</dd></div>
              <div><dt>OFFSET</dt><dd>{selectedVariant.offsetMm !== undefined ? "ET" + selectedVariant.offsetMm : "—"}</dd></div>
              <div><dt>CENTRE BORE</dt><dd>{selectedVariant.centerBoreMm !== undefined ? selectedVariant.centerBoreMm + " mm" : "—"}</dd></div>
              <div><dt>FINISH</dt><dd>{selectedVariant.finish || "—"}</dd></div>
            </dl>}
            <label className="wheel-inquiry-field wheel-product-quantity"><span>Quantity</span><input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
          </div>
          <div className="wheel-product-actions">
            <button type="button" className="wheel-product-actions__primary" onClick={openInquiryWithSelection}>CREATE AN INQUIRY ↗</button>
            <button type="button" className="wheel-product-actions__secondary" onClick={() => { setFitmentError(""); setFitmentOpen(true); }}>CHECK VEHICLE FITMENT</button>
          </div>
          <p className="wheel-product-summary__disclaimer">Fitment is preliminary until all dimensions, hub bore, brake clearance, fasteners and load requirements are technically verified.</p>
        </div>
      </section>

      <nav className="wheel-detail-tabs" aria-label="Product details">
        {[
          ["specs", "SPECIFICATIONS"], ["details", "WHEEL DETAILS"], ["installations", "ON VEHICLE"], ["inquiry", "INQUIRY"], ["ordering", "ORDERING"],
        ].map(([id, label]) => <button type="button" key={id} className={activeTab === id ? "is-active" : ""} aria-current={activeTab === id ? "page" : undefined} onClick={() => setActiveTab(id)}>{label}</button>)}
      </nav>
      <div className="wheel-detail-tabs__panel" id="wheel-detail-tabs-panel">
        {activeTab === "specs" && <section className="wheel-tab-specs">
          <div><p className="wheels-eyebrow">TECHNICAL DATA / 01</p><h2>PRODUCT<br />SPECIFICATIONS.</h2><p>Published design information is shown separately from production-certified dimensions.</p></div>
          <div className="wheel-tab-specs__table"><dl>
            <div><dt>Model</dt><dd>{product.model}</dd></div><div><dt>Product code</dt><dd>{product.code}</dd></div>
            <div><dt>Collection</dt><dd>{product.collection}</dd></div><div><dt>Construction</dt><dd>{product.manufacturing}</dd></div>
            <div><dt>Design</dt><dd>{product.design}</dd></div><div><dt>Diameter concept</dt><dd>{product.diameterRange}</dd></div>
            <div><dt>Finish concepts</dt><dd>{product.finishCount}</dd></div><div><dt>Production variants</dt><dd>{productVariants.length || "Not published"}</dd></div>
            {selectedVariant && <><div><dt>Variant ID</dt><dd>{selectedVariant.id}</dd></div><div><dt>PCD</dt><dd>{selectedVariant.pcd || "Not provided"}</dd></div><div><dt>Offset</dt><dd>{selectedVariant.offsetMm !== undefined ? "ET" + selectedVariant.offsetMm : "Not provided"}</dd></div><div><dt>Centre bore</dt><dd>{selectedVariant.centerBoreMm !== undefined ? selectedVariant.centerBoreMm + " mm" : "Not provided"}</dd></div></>}
          </dl><p className="wheel-tab-specs__note">All product data must be checked against the final production specification. The sample catalogue does not represent a confirmed product or certified vehicle fitment.</p></div>
        </section>}

        {activeTab === "details" && <section className="wheel-tab-gallery">
          <div className="wheel-tab-heading"><p className="wheels-eyebrow">DESIGN / 02</p><h2>FORM FOLLOWS<br />FUNCTION.</h2><p>{product.design} · {product.manufacturing.toLowerCase()} wheel concept</p></div>
          <div className="wheel-tab-gallery__grid">
            {["FACE GEOMETRY", "SPOKE PROFILE", "CENTRE DETAIL", "BARREL / REAR"].map((label, index) => <figure key={label}>
              {product.galleryImages?.[index] ? <img src={product.galleryImages[index]} alt={label} /> : index === 0 ? <img src={product.image} alt={product.imageAlt} /> : <div className="wheel-tab-gallery__placeholder">PRODUCTION DETAIL IMAGE PENDING</div>}
              <figcaption>0{index + 1} / {label}</figcaption>
            </figure>)}
          </div>
        </section>}

        {activeTab === "installations" && <section className="wheel-tab-installations">
          <p className="wheels-eyebrow">REAL WORLD / 03</p><h2>BUILT FOR<br />THE ROAD.</h2>
          <div className="wheel-tab-installations__empty"><span>VEHICLE GALLERY</span><strong>Installation photography will be published after production validation.</strong><p>We do not use unrelated vehicle images as proof of product fitment. Ask our team to review your vehicle and selected wheel specification.</p><button type="button" onClick={() => setFitmentOpen(true)}>CHECK MY VEHICLE ↗</button></div>
        </section>}

        {activeTab === "inquiry" && <div className="wheel-inquiry-tab">
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
        </div>}

        {activeTab === "ordering" && <section className="wheel-tab-ordering">
          <p className="wheels-eyebrow">HOW TO ORDER / 05</p><h2>FROM SPECIFICATION<br />TO DELIVERY.</h2>
          <ol>
            <li><span>01</span><div><strong>Select your wheel specification</strong><p>Choose a published product variant. If a specification is not yet listed, send an inquiry and request confirmation.</p></div></li>
            <li><span>02</span><div><strong>Check vehicle compatibility</strong><p>Submit your vehicle details. Our technical team reviews PCD, offset, centre bore, load rating, brake clearance and fastener requirements.</p></div></li>
            <li><span>03</span><div><strong>Submit your inquiry</strong><p>Review the pre-filled inquiry sheet and send it to Euresis. No payment or price is collected at this stage.</p></div></li>
            <li><span>04</span><div><strong>Technical confirmation and quotation</strong><p>We confirm the final specification, availability, pricing and lead time in a separate written quotation.</p></div></li>
            <li><span>05</span><div><strong>Production, dispatch and delivery</strong><p>After order confirmation, production and shipping milestones are communicated through your customer account.</p></div></li>
          </ol>
        </section>}
      </div>

      {fitmentOpen && <div className="wheel-fitment-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFitmentOpen(false); }}>
        <section className="wheel-fitment-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="wheel-fitment-modal-title">
          <header><div><p className="wheels-eyebrow">VEHICLE / WHEEL SIZE CHECK</p><h2 id="wheel-fitment-modal-title">CHECK YOUR<br />FITMENT.</h2></div><button type="button" aria-label="Close fitment check" onClick={() => setFitmentOpen(false)}>×</button></header>
          <p className="wheel-fitment-modal__intro">Select your exact vehicle. We compare its published original wheel data with the selected Euresis variant. This is a preliminary screening, not a fitment certification.</p>
          <div className="wheel-fitment-modal__fields">
            <label className="wheel-inquiry-field"><span>Market</span><select value={fitmentRegion} onChange={(event) => setFitmentRegion(event.target.value)}>{[["jdm","Japan"],["eudm","Europe"],["usdm","USA"],["audm","Oceania"],["sam","Southeast Asia"],["chdm","China"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="wheel-inquiry-field"><span>Make</span><select value={fitmentMake} onChange={(event) => setFitmentMake(event.target.value)}><option value="">Select make</option>{fitmentMakes.map((item) => { const option=fitmentOption(item); return <option key={option.value} value={option.value}>{option.label}</option>; })}</select></label>
            <label className="wheel-inquiry-field"><span>Model</span><select value={fitmentModel} onChange={(event) => setFitmentModel(event.target.value)} disabled={!fitmentMake}><option value="">Select model</option>{fitmentModels.map((item) => { const option=fitmentOption(item); return <option key={option.value} value={option.value}>{option.label}</option>; })}</select></label>
            <label className="wheel-inquiry-field"><span>Year</span><select value={fitmentYear} onChange={(event) => setFitmentYear(event.target.value)} disabled={!fitmentModel}><option value="">Select year</option>{fitmentYears.map((item) => { const option=fitmentOption(item); return <option key={option.value} value={option.value}>{option.label}</option>; })}</select></label>
            <label className="wheel-inquiry-field"><span>Trim / modification</span><select value={fitmentTrim} onChange={(event) => setFitmentTrim(event.target.value)} disabled={!fitmentYear}><option value="">Select trim</option>{fitmentTrims.map((item) => { const option=fitmentOption(item); return <option key={option.value} value={option.value}>{option.label}</option>; })}</select></label>
          </div>
          {fitmentError && <p className="wheel-inquiry-error" role="alert">{fitmentError}</p>}
          <div className="wheel-fitment-modal__actions"><button type="button" className="wheel-inquiry-secondary" onClick={() => setFitmentOpen(false)}>CANCEL</button><button type="button" className="wheel-inquiry-primary" disabled={!fitmentMake || !fitmentModel || !fitmentYear || !fitmentTrim || fitmentLoading} onClick={searchVehicleFitment}>{fitmentLoading ? "CHECKING…" : "CHECK WHEEL SIZE"}</button></div>
          {fitmentRows.length > 0 && <div className="wheel-fitment-modal__results"><h3>PRELIMINARY COMPARISON</h3>{fitmentRows.map((row, index) => {
            const front = row.front ?? row;
            const wheelSize = [front.rim_width ?? front.rim?.width, "J ×", front.rim_diameter ?? front.rim?.diameter].filter(Boolean).join(" ");
            const pcd = front.bolt_pattern ?? front.pcd ?? row.bolt_pattern ?? row.pcd ?? "Not provided";
            return <article key={row._id ?? index}><div><strong>{row.type ?? "OE"} / {wheelSize || "Wheel dimensions unavailable"}</strong><span>Vehicle PCD: {pcd} · Product PCD: {selectedVariant?.pcd ?? "Not published"}</span><p>{row.reason}</p></div><b className={row.status === "NOT COMPATIBLE" ? "is-negative" : row.status === "POTENTIAL MATCH" ? "is-potential" : ""}>{row.status}</b></article>;
          })}<p className="wheel-fitment-modal__disclaimer">A potential match is not a guarantee. Centre bore, brake clearance, load rating, fastener seat, caliper clearance, tyre envelope and vehicle-specific restrictions must be checked by a technician.</p><button type="button" className="wheel-inquiry-primary" onClick={() => { setFitmentOpen(false); setActiveTab("inquiry"); window.setTimeout(() => document.getElementById("wheel-detail-tabs-panel")?.scrollIntoView({ behavior: "smooth" }), 60); }}>CONTINUE TO CREATE INQUIRY ↗</button></div>}
        </section>
      </div>}

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
