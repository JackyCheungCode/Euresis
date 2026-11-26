"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PButton,
  PHeading,
  PInputEmail,
  PInputText,
  PSelect,
  PSelectOption,
  PTextarea,
  PText,
} from "@porsche-design-system/components-react/ssr";
import { wheelCollections, wheelProducts } from "@/src/data/wheels";
import { LiveFitment } from "./live-fitment";
import { CountryRegionSelect } from "./country-region-select";

type SelectUpdateEvent = CustomEvent<{ value?: string | number | null }>;

const all = "ALL";

export function WheelsPage() {
  const [manufacturing, setManufacturing] = useState<"ALL" | "FORGED" | "CAST">("ALL");
  const [collection, setCollection] = useState("ALL");
  const [diameter, setDiameter] = useState("ALL");
  const [finish, setFinish] = useState("ALL");
  const [fitmentWidth, setFitmentWidth] = useState("");
  const [fitmentOffset, setFitmentOffset] = useState("");
  const [fitmentPcd, setFitmentPcd] = useState("");
  const [fitmentCenterBore, setFitmentCenterBore] = useState("");
  const [vehicleSummary, setVehicleSummary] = useState("");
  const [country, setCountry] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const products = useMemo(() => wheelProducts.filter((product) => {
    const range = product.diameterRange.match(/\d+/g)?.map(Number) ?? [];
    const diameterMatches = diameter === all || (range.length > 0 && Number(diameter) >= Math.min(...range) && Number(diameter) <= Math.max(...range));
    return (manufacturing === all || product.manufacturing === manufacturing)
      && (collection === all || product.collection === collection)
      && diameterMatches
      && (!fitmentWidth || product.widths?.some((value) => value === fitmentWidth.trim()))
      && (!fitmentOffset || product.offsets?.some((value) => value === fitmentOffset.trim()))
      && (!fitmentPcd || product.pcd?.some((value) => value.replace(/[×x\s]/gi, "").toLowerCase() === fitmentPcd.replace(/[×x\s]/gi, "").toLowerCase()))
      && (!fitmentCenterBore || product.centerBores?.some((value) => value === fitmentCenterBore.trim()))
      && (finish === all || product.finishCount >= Number(finish));
  }), [manufacturing, collection, diameter, fitmentWidth, fitmentOffset, fitmentPcd, fitmentCenterBore, finish]);


  const resetFilters = () => {
    setManufacturing("ALL");
    setCollection("ALL");
    setDiameter("ALL");
    setFinish("ALL");
    setFitmentWidth("");
    setFitmentOffset("");
    setFitmentPcd("");
    setFitmentCenterBore("");
    setVehicleSummary("");
  };

  useEffect(() => {
    const onFitmentSelected = (event: Event) => {
      const detail = (event as CustomEvent).detail ?? {};
      setDiameter(detail.diameter || "ALL");
      setFitmentWidth(detail.width || "");
      setFitmentOffset(detail.offset || "");
      setFitmentPcd(detail.pcd || "");
      setVehicleSummary([detail.year, detail.make, detail.model, detail.trim].filter(Boolean).join(" "));
    };
    window.addEventListener("euresis:fitment-selected", onFitmentSelected);
    return () => window.removeEventListener("euresis:fitment-selected", onFitmentSelected);
  }, []);

  const submitDemoInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="wheels-page">
      <section className="wheels-hero" aria-labelledby="wheels-title">
        <div className="wheels-hero__image" role="img" aria-label="Performance alloy wheel detail" />
        <div className="wheels-hero__content">
          <p className="wheels-eyebrow">EURESIS / PERFORMANCE WHEELS</p>
          <PHeading id="wheels-title" tag="h1" size="3xl" className="wheels-hero__title">
            ENGINEERED<br />FOR MOTION.
          </PHeading>
          <p className="wheels-hero__lead">Two manufacturing disciplines. Six design collections. One uncompromising point of view.</p>
          <div className="wheels-hero__actions">
            <PButton type="button"><a href="#catalogue">Explore the wheels</a></PButton>
            <PButton type="button" variant="secondary"><a href="#vehicle-fitment">Find your vehicle</a></PButton>
          </div>
        </div>
        <span className="wheels-hero__index">01 / PRODUCT CATALOGUE</span>
      </section>

      <section className="wheels-manufacturing" aria-labelledby="manufacturing-title">
        <div className="wheels-section-heading">
          <div>
            <p className="wheels-eyebrow">01 / MANUFACTURING</p>
            <PHeading id="manufacturing-title" tag="h2" size="2xl">TWO WAYS TO<br />DEFINE PERFORMANCE.</PHeading>
          </div>
          <PText color="contrast-high">Explore the Euresis range by manufacturing process, then discover the design collection that fits your direction.</PText>
        </div>
        <div className="wheels-manufacturing__grid">
          <button className={`manufacturing-card ${manufacturing === "FORGED" ? "is-active" : ""}`} type="button" onClick={() => { setManufacturing(manufacturing === "FORGED" ? "ALL" : "FORGED"); document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" }); }}>
            <img src="https://images.pexels.com/photos/41081788/pexels-photo-41081788.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Reference image of a detailed alloy wheel" loading="lazy" />
            <span className="manufacturing-card__number">01 / F</span>
            <span className="manufacturing-card__copy"><strong>FORGED</strong><small>PRECISION · STRENGTH · LIGHTWEIGHT</small></span>
            <span className="manufacturing-card__arrow">↗</span>
          </button>
          <button className={`manufacturing-card ${manufacturing === "CAST" ? "is-active" : ""}`} type="button" onClick={() => { setManufacturing(manufacturing === "CAST" ? "ALL" : "CAST"); document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" }); }}>
            <img src="https://images.pexels.com/photos/32070739/pexels-photo-32070739.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Reference image of a polished alloy wheel" loading="lazy" />
            <span className="manufacturing-card__number">02 / C</span>
            <span className="manufacturing-card__copy"><strong>CAST</strong><small>DESIGN · VERSATILITY · PERFORMANCE</small></span>
            <span className="manufacturing-card__arrow">↗</span>
          </button>
        </div>
      </section>

      <section className="wheels-discovery" id="discovery" aria-labelledby="discovery-title">
        <div className="wheels-section-heading">
          <div><p className="wheels-eyebrow">02 / PRODUCT DISCOVERY</p><PHeading id="discovery-title" tag="h2" size="2xl">TWO WAYS TO<br />FIND YOUR WHEELS.</PHeading></div>
          <PText color="contrast-high">Start with your vehicle and refine the fitment, or start with wheel specifications directly. Both paths lead to the same catalogue.</PText>
        </div>
        <div className="wheels-discovery__grid">
          <a className="wheels-discovery__card" href="#vehicle-fitment"><span>01 / VEHICLE FIRST</span><strong>Find wheels for<br />your vehicle.</strong><small>Make · Model · Year · Modification</small><b>START WITH VEHICLE ↗</b></a>
          <a className="wheels-discovery__card" href="#specification-finder"><span>02 / SPECIFICATION FIRST</span><strong>Know your fitment?<br />Start with the numbers.</strong><small>Collection · Diameter · Width · PCD · Offset</small><b>FILTER BY SPECIFICATION ↗</b></a>
        </div>
      </section>

      <section className="wheels-collections" id="specification-finder" aria-labelledby="collections-title">
        <div className="wheels-section-heading wheels-section-heading--light">
          <div>
            <p className="wheels-eyebrow">03 / SPECIFICATION FINDER</p>
            <PHeading id="collections-title" tag="h2" size="2xl">START WITH<br />YOUR SPECIFICATION.</PHeading>
          </div>
          <div className="wheels-section-heading__statement">
            
            <p>A shared Euresis design philosophy, expressed through six individual motorsport-inspired collections.</p>
          </div>
        </div>
        <div className="wheels-specification-fields" aria-label="Wheel specification filters">
          <PSelect label="Diameter" name="filter-diameter" value={diameter} onChange={(event: SelectUpdateEvent) => setDiameter(String(event.detail.value ?? "ALL"))}>
            <PSelectOption value="ALL">All diameters</PSelectOption>
            {["17","18","19","20","21","22"].map((value) => <PSelectOption key={value} value={value}>{value} inch</PSelectOption>)}
          </PSelect>
          <PInputText label="Width (J)" name="filter-width" value={fitmentWidth} onChange={(event: SelectUpdateEvent) => setFitmentWidth(String(event.detail.value ?? ""))} placeholder="e.g. 8.5" />
          <PInputText label="Offset (ET)" name="filter-offset" value={fitmentOffset} onChange={(event: SelectUpdateEvent) => setFitmentOffset(String(event.detail.value ?? ""))} placeholder="e.g. 35" />
          <PInputText label="Bolt pattern (PCD)" name="filter-pcd" value={fitmentPcd} onChange={(event: SelectUpdateEvent) => setFitmentPcd(String(event.detail.value ?? ""))} placeholder="e.g. 5×112" />
          <PInputText label="Center bore (CB)" name="filter-center-bore" value={fitmentCenterBore} onChange={(event: SelectUpdateEvent) => setFitmentCenterBore(String(event.detail.value ?? ""))} placeholder="e.g. 66.6" />
        </div>
        <p className="wheels-specification-note">All dimensions are catalogue filters. A product appears only when its corresponding verified specification is present; the current sample range has no verified width, offset, PCD or center-bore records, so those filters may return no matches.</p>
        <div className="wheels-collection-list">
          {wheelCollections.map((item, index) => (
            <button className={`wheels-collection-item ${collection === item.id ? "is-active" : ""}`} type="button" key={item.id} onClick={() => { setCollection(collection === item.id ? "ALL" : item.id); document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span className="wheels-collection-item__index">0{index + 1}</span>
              <span className="wheels-collection-item__name">{item.id}</span>
              <span className="wheels-collection-item__subtitle">{item.subtitle}</span>
              <span className="wheels-collection-item__description">{item.description}</span>
              <span className="wheels-collection-item__arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <LiveFitment />

      <section className="wheels-catalogue" id="catalogue" aria-labelledby="catalogue-title">
        <div className="wheels-section-heading">
          <div>
            <p className="wheels-eyebrow">04 / UNIFIED CATALOGUE</p>
            <PHeading id="catalogue-title" tag="h2" size="2xl">THE WHEEL<br />CATALOGUE.</PHeading>
          </div>
          <PText color="contrast-high">Explore the first Euresis sample range. Images are visual references, not photographs of confirmed Euresis production models.</PText>
        </div>
        <div className="wheels-filters" aria-label="Catalogue filters">
          <PSelect label="Manufacturing" name="filter-manufacturing" value={manufacturing} onChange={(event: SelectUpdateEvent) => setManufacturing(String(event.detail.value ?? "") as typeof manufacturing)}>
            <PSelectOption value="ALL">All manufacturing</PSelectOption>
            <PSelectOption value="FORGED">Forged</PSelectOption>
            <PSelectOption value="CAST">Cast</PSelectOption>
          </PSelect>
          <PSelect label="Collection" name="filter-collection" value={collection} onChange={(event: SelectUpdateEvent) => setCollection(String(event.detail.value ?? ""))}>
            <PSelectOption value="ALL">All collections</PSelectOption>
            {wheelCollections.map((item) => <PSelectOption key={item.id} value={item.id}>{item.id}</PSelectOption>)}
          </PSelect>
          <PSelect label="Diameter" name="catalogue-diameter" value={diameter} onChange={(event: SelectUpdateEvent) => setDiameter(String(event.detail.value ?? ""))}>
            <PSelectOption value="ALL">All diameters</PSelectOption>
            {diameter !== "ALL" && !["17","18","19","20","21","22"].includes(diameter) && <PSelectOption value={diameter}>{diameter} inch · API selection</PSelectOption>}
            {["17","18","19","20","21","22"].map((value) => <PSelectOption key={value} value={value}>{value} inch</PSelectOption>)}
          </PSelect>
          <PSelect label="Finish options" name="filter-finish" value={finish} onChange={(event: SelectUpdateEvent) => setFinish(String(event.detail.value ?? ""))}>
            <PSelectOption value="ALL">Any finish count</PSelectOption>
            <PSelectOption value="3">3+ finishes</PSelectOption>
            <PSelectOption value="4">4+ finishes</PSelectOption>
          </PSelect>
          <PInputText label="Width (J)" name="catalogue-width" value={fitmentWidth} onChange={(event: SelectUpdateEvent) => setFitmentWidth(String(event.detail.value ?? ""))} />
          <PInputText label="Offset (ET)" name="catalogue-offset" value={fitmentOffset} onChange={(event: SelectUpdateEvent) => setFitmentOffset(String(event.detail.value ?? ""))} />
          <PInputText label="Bolt pattern (PCD)" name="catalogue-pcd" value={fitmentPcd} onChange={(event: SelectUpdateEvent) => setFitmentPcd(String(event.detail.value ?? ""))} />
          <PInputText label="Center bore (CB)" name="catalogue-center-bore" value={fitmentCenterBore} onChange={(event: SelectUpdateEvent) => setFitmentCenterBore(String(event.detail.value ?? ""))} />
          <PButton type="button" variant="secondary" onClick={resetFilters}>Reset filters</PButton>
        </div>
        <div className="wheels-catalogue__meta"><span>{products.length.toString().padStart(2, "0")} SAMPLE MODELS</span><span>NO PRICING · NO CHECKOUT</span></div>
        {vehicleSummary && <p className="wheels-selected-fitment">Vehicle reference: <strong>{vehicleSummary}</strong> — its selected fitment values have been transferred to the editable specification filters. Sample products do not carry verified technical dimensions yet.</p>}
        {products.length > 0 ? <div className="wheels-product-grid">
          {products.map((product, index) => (
            <article className="wheel-product-card" key={product.slug}>
              <a className="wheel-product-card__image" href={`/wheels/${product.slug}`} aria-label={`View ${product.collection}-${product.manufacturing === "FORGED" ? "F" : "C"} ${product.model}`}>
                <img src={product.image} alt={product.imageAlt} loading="lazy" decoding="async" />
                <span className="wheel-product-card__index">0{index + 1}</span>
                <span className="wheel-product-card__sample">SAMPLE / DEMO</span>
              </a>
              <div className="wheel-product-card__body">
                <div className="wheel-product-card__eyebrow"><span>{product.manufacturing}</span><span>{product.collection}-{product.manufacturing === "FORGED" ? "F" : "C"}</span></div>
                <h3><a href={`/wheels/${product.slug}`}>{product.model}</a></h3>
                <p>{product.description}</p>
                <div className="wheel-product-card__specs"><span>{product.design}</span><span>{product.diameterRange}</span><span>{product.finishCount} finish concepts</span></div>
                <a className="wheel-product-card__link" href={`/wheels/${product.slug}`}>VIEW MODEL <span>↗</span></a>
              </div>
            </article>
          ))}
        </div> : <div className="wheels-empty"><strong>No sample models match these filters.</strong><button type="button" onClick={resetFilters}>Clear filters</button></div>}
        <p className="wheels-image-credit">Reference imagery via Pexels. Each image links to its source; imagery is not a representation of an actual Euresis wheel model.</p>
      </section>

      <section className="wheels-engineering" aria-labelledby="engineering-title">
        <div>
          <p className="wheels-eyebrow">05 / ENGINEERING</p>
          <PHeading id="engineering-title" tag="h2" size="2xl">FORM FOLLOWS<br />FUNCTION.</PHeading>
        </div>
        <div className="wheels-engineering__copy">
          <p>Every production wheel requires its own verified technical specification. Construction method, dimensions, load rating and vehicle clearance are confirmed at product level—not inferred from a collection name.</p>
          <div className="wheels-engineering__labels"><span>MANUFACTURING</span><span>GEOMETRY</span><span>MATERIALS</span><span>FITMENT</span></div>
        </div>
      </section>

      <section className="wheels-inquiry" id="inquiry" aria-labelledby="inquiry-title">
        <div className="wheels-inquiry__intro">
          <p className="wheels-eyebrow">06 / GLOBAL ENQUIRY</p>
          <PHeading id="inquiry-title" tag="h2" size="2xl">LET'S FIND<br />YOUR FIT.</PHeading>
          <p>Tell us which wheel and vehicle you are considering. The current demo form validates the enquiry layout locally; it does not transmit or store personal information.</p>
        </div>
        {submitted ? <div className="wheels-inquiry__success" role="status"><strong>Demo enquiry captured in this session.</strong><p>No message was sent. Connect an enquiry endpoint before accepting real customer requests.</p><PButton type="button" variant="secondary" onClick={() => setSubmitted(false)}>Create another demo enquiry</PButton></div> :
          <form className="wheels-inquiry__form" onSubmit={submitDemoInquiry}>
            <div className="wheels-inquiry__fields">
              <PInputText label="Name" name="name" required />
              <PInputEmail label="Email" name="email" required />
              <CountryRegionSelect value={country} onChange={setCountry} />
              <PInputText label="Vehicle" name="vehicle" value={vehicleSummary} placeholder="Make / Model / Year / Trim" />
              <PTextarea label="Wheel model and requirements" name="message" required />
            </div>
            <PButton type="submit">Submit demo enquiry</PButton>
            <span className="wheels-demo-note">DEMO ONLY / FORM DATA IS NOT TRANSMITTED</span>
          </form>}
      </section>
    </main>
  );
}
