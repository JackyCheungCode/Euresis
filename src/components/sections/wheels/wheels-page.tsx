"use client";

import { useMemo, useState } from "react";
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
import { demoVehicles, wheelCollections, wheelProducts } from "@/src/data/wheels";

type SelectUpdateEvent = CustomEvent<{ value: string }>;

const all = "ALL";

export function WheelsPage() {
  const [manufacturing, setManufacturing] = useState<"ALL" | "FORGED" | "CAST">("ALL");
  const [collection, setCollection] = useState("ALL");
  const [diameter, setDiameter] = useState("ALL");
  const [finish, setFinish] = useState("ALL");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trim, setTrim] = useState("");
  const [fitmentRequested, setFitmentRequested] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const products = useMemo(() => wheelProducts.filter((product) => {
    return (manufacturing === all || product.manufacturing === manufacturing)
      && (collection === all || product.collection === collection)
      && (diameter === all || product.diameterRange.includes(diameter))
      && (finish === all || product.finishCount >= Number(finish));
  }), [manufacturing, collection, diameter, finish]);

  const makeOptions = Object.keys(demoVehicles).filter((key) => key !== "Make");
  const modelOptions = make ? (demoVehicles as any)[make]?.Model ?? [] : [];
  const yearOptions = model ? (demoVehicles as any)[make]?.[model]?.Year ?? [] : [];
  const trimOptions = year ? (demoVehicles as any)[make]?.[model]?.[year] ?? [] : [];

  const resetFilters = () => {
    setManufacturing("ALL");
    setCollection("ALL");
    setDiameter("ALL");
    setFinish("ALL");
  };

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
          <button className={`manufacturing-card ${manufacturing === "FORGED" ? "is-active" : ""}`} type="button" onClick={() => { setManufacturing(manufacturing === "FORGED" ? "ALL" : "FORGED"); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }}>
            <img src="https://images.pexels.com/photos/41081788/pexels-photo-41081788.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Reference image of a detailed alloy wheel" loading="lazy" />
            <span className="manufacturing-card__number">01 / F</span>
            <span className="manufacturing-card__copy"><strong>FORGED</strong><small>PRECISION · STRENGTH · LIGHTWEIGHT</small></span>
            <span className="manufacturing-card__arrow">↗</span>
          </button>
          <button className={`manufacturing-card ${manufacturing === "CAST" ? "is-active" : ""}`} type="button" onClick={() => { setManufacturing(manufacturing === "CAST" ? "ALL" : "CAST"); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }}>
            <img src="https://images.pexels.com/photos/32070739/pexels-photo-32070739.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Reference image of a polished alloy wheel" loading="lazy" />
            <span className="manufacturing-card__number">02 / C</span>
            <span className="manufacturing-card__copy"><strong>CAST</strong><small>DESIGN · VERSATILITY · PERFORMANCE</small></span>
            <span className="manufacturing-card__arrow">↗</span>
          </button>
        </div>
      </section>

      <section className="wheels-collections" aria-labelledby="collections-title">
        <div className="wheels-section-heading wheels-section-heading--light">
          <div>
            <p className="wheels-eyebrow">02 / COLLECTIONS</p>
            <PHeading id="collections-title" tag="h2" size="2xl">SIX DISTINCT<br />DESIGN DIRECTIONS.</PHeading>
          </div>
          <PText color="contrast-high">A shared Euresis design philosophy, expressed through six individual motorsport-inspired collections.</PText>
        </div>
        <div className="wheels-collection-list">
          {wheelCollections.map((item, index) => (
            <button className={`wheels-collection-item ${collection === item.id ? "is-active" : ""}`} type="button" key={item.id} onClick={() => { setCollection(collection === item.id ? "ALL" : item.id); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span className="wheels-collection-item__index">0{index + 1}</span>
              <span className="wheels-collection-item__name">{item.id}</span>
              <span className="wheels-collection-item__subtitle">{item.subtitle}</span>
              <span className="wheels-collection-item__description">{item.description}</span>
              <span className="wheels-collection-item__arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="wheels-fitment" id="vehicle-fitment" aria-labelledby="fitment-title">
        <div className="wheels-fitment__intro">
          <p className="wheels-eyebrow">03 / VEHICLE FIRST</p>
          <PHeading id="fitment-title" tag="h2" size="2xl">START WITH<br />YOUR VEHICLE.</PHeading>
          <p>Choose your vehicle to begin a fitment enquiry. This demonstration selector uses sample vehicle entries only; it does not verify wheel compatibility.</p>
          <span className="wheels-demo-note">DEMO DATA / NOT VERIFIED FITMENT</span>
        </div>
        <div className="wheels-fitment__form">
          <div className="wheels-fitment__fields">
            <PSelect label="Make" name="vehicle-make" value={make} onUpdate={(event: SelectUpdateEvent) => { setMake(event.detail.value); setModel(""); setYear(""); setTrim(""); setFitmentRequested(false); }}>
              <PSelectOption value="">Select make</PSelectOption>
              {makeOptions.map((value) => <PSelectOption key={value} value={value}>{value}</PSelectOption>)}
            </PSelect>
            <PSelect label="Model" name="vehicle-model" value={model} disabled={!make} onUpdate={(event: SelectUpdateEvent) => { setModel(event.detail.value); setYear(""); setTrim(""); setFitmentRequested(false); }}>
              <PSelectOption value="">Select model</PSelectOption>
              {modelOptions.map((value: string) => <PSelectOption key={value} value={value}>{value}</PSelectOption>)}
            </PSelect>
            <PSelect label="Year" name="vehicle-year" value={year} disabled={!model} onUpdate={(event: SelectUpdateEvent) => { setYear(event.detail.value); setTrim(""); setFitmentRequested(false); }}>
              <PSelectOption value="">Select year</PSelectOption>
              {yearOptions.map((value: string) => <PSelectOption key={value} value={value}>{value}</PSelectOption>)}
            </PSelect>
            <PSelect label="Trim" name="vehicle-trim" value={trim} disabled={!year} onUpdate={(event: SelectUpdateEvent) => { setTrim(event.detail.value); setFitmentRequested(false); }}>
              <PSelectOption value="">Select trim</PSelectOption>
              {trimOptions.map((value: string) => <PSelectOption key={value} value={value}>{value}</PSelectOption>)}
            </PSelect>
          </div>
          <PButton type="button" disabled={!make || !model || !year || !trim} onClick={() => setFitmentRequested(true)}>Continue with this vehicle</PButton>
          {fitmentRequested && <div className="wheels-fitment__result" role="status"><strong>Vehicle details captured for enquiry</strong><p>{year} {make} {model} {trim}</p><span>Requires Confirmation — no verified compatibility data is connected to this demo catalogue.</span></div>}
        </div>
      </section>

      <section className="wheels-catalogue" id="catalogue" aria-labelledby="catalogue-title">
        <div className="wheels-section-heading">
          <div>
            <p className="wheels-eyebrow">04 / SAMPLE RANGE</p>
            <PHeading id="catalogue-title" tag="h2" size="2xl">THE WHEEL<br />CATALOGUE.</PHeading>
          </div>
          <PText color="contrast-high">Explore the first Euresis sample range. Images are visual references, not photographs of confirmed Euresis production models.</PText>
        </div>
        <div className="wheels-filters" aria-label="Catalogue filters">
          <PSelect label="Manufacturing" name="filter-manufacturing" value={manufacturing} onUpdate={(event: SelectUpdateEvent) => setManufacturing(event.detail.value as typeof manufacturing)}>
            <PSelectOption value="ALL">All manufacturing</PSelectOption>
            <PSelectOption value="FORGED">Forged</PSelectOption>
            <PSelectOption value="CAST">Cast</PSelectOption>
          </PSelect>
          <PSelect label="Collection" name="filter-collection" value={collection} onUpdate={(event: SelectUpdateEvent) => setCollection(event.detail.value)}>
            <PSelectOption value="ALL">All collections</PSelectOption>
            {wheelCollections.map((item) => <PSelectOption key={item.id} value={item.id}>{item.id}</PSelectOption>)}
          </PSelect>
          <PSelect label="Diameter" name="filter-diameter" value={diameter} onUpdate={(event: SelectUpdateEvent) => setDiameter(event.detail.value)}>
            <PSelectOption value="ALL">All diameters</PSelectOption>
            {["17","18","19","20","21","22"].map((value) => <PSelectOption key={value} value={value}>{value} inch</PSelectOption>)}
          </PSelect>
          <PSelect label="Finish options" name="filter-finish" value={finish} onUpdate={(event: SelectUpdateEvent) => setFinish(event.detail.value)}>
            <PSelectOption value="ALL">Any finish count</PSelectOption>
            <PSelectOption value="3">3+ finishes</PSelectOption>
            <PSelectOption value="4">4+ finishes</PSelectOption>
          </PSelect>
          <PButton type="button" variant="tertiary" onClick={resetFilters}>Reset filters</PButton>
        </div>
        <div className="wheels-catalogue__meta"><span>{products.length.toString().padStart(2, "0")} SAMPLE MODELS</span><span>NO PRICING · NO CHECKOUT</span></div>
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
              <PInputText label="Country / Region" name="region" required />
              <PInputText label="Vehicle" name="vehicle" value={[year, make, model, trim].filter(Boolean).join(" ")} placeholder="Make / Model / Year / Trim" />
              <PTextarea label="Wheel model and requirements" name="message" required />
            </div>
            <PButton type="submit">Submit demo enquiry</PButton>
            <span className="wheels-demo-note">DEMO ONLY / FORM DATA IS NOT TRANSMITTED</span>
          </form>}
      </section>
    </main>
  );
}
