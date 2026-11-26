"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EButton as Button,
  EHeading,
  EIcon,
  EEmailInput,
  ETextInput,
  ESelect,
  ESelectItem,
  ETextArea,
  EText,
} from "@/src/components/ui/carbon-primitives";
import { wheelCollections, wheelProducts } from "@/src/data/wheels";
import { LiveFitment } from "./live-fitment";
import { CountryRegionSelect } from "./country-region-select";

type SelectUpdateEvent = CustomEvent<{ value?: string | number | null }>;
type InputUpdateEvent = CustomEvent<{ value?: string }>;
const inputValue = (event: InputUpdateEvent) => String(event.detail?.value ?? "");

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
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoPaused, setHeroVideoPaused] = useState(false);

  const toggleHeroVideo = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setHeroVideoPaused(false);
    } else {
      video.pause();
      setHeroVideoPaused(true);
    }
  };

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
      setVehicleSummary(String(detail.vehicle ?? ""));
    };
    window.addEventListener("euresis:vehicle-reference-selected", onFitmentSelected);
    return () => window.removeEventListener("euresis:vehicle-reference-selected", onFitmentSelected);
  }, []);

  const submitDemoInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="wheels-page">
      <section className="wheels-hero scheme-dark" aria-labelledby="wheels-title">
        <video ref={heroVideoRef} className="wheels-hero__video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} poster="https://images.pexels.com/videos/28180175/free-video-28180175.jpg?auto=compress&cs=tinysrgb&w=2200"><source src="https://videos.pexels.com/video-files/40930926/40930926-hd_1920_1080_30fps.mp4" type="video/mp4" /></video>
        <div className="wheels-hero__content">
          <p className="wheels-eyebrow">EURESIS / PERFORMANCE WHEELS</p>
          <EHeading id="wheels-title" tag="h1" size="3xl" color="contrast-high" className="wheels-hero__title">
            ENGINEERED<br />FOR MOTION.
          </EHeading>
          <p className="wheels-hero__lead">Two manufacturing disciplines. Six design collections. One uncompromising point of view.</p>
          <div className="wheels-hero__actions">
            <a className="wheels-hero__primary-link" href="#catalogue">Explore the wheels <span aria-hidden="true">↗</span></a>
            <a className="wheels-hero__secondary-link" href="#vehicle-fitment">Find your vehicle</a>
          </div>
        </div>
        <span className="wheels-hero__index">EURESIS / PERFORMANCE WHEELS</span>
        <Button className="wheels-hero__video-control" type="button" variant="secondary" compact hideLabel icon={heroVideoPaused ? "play" : "pause"} aria={{ "aria-label": heroVideoPaused ? "Play background video" : "Pause background video" }} onClick={toggleHeroVideo}>{heroVideoPaused ? "Play background video" : "Pause background video"}</Button>
      </section>

      <section className="wheels-manufacturing scheme-light" aria-labelledby="manufacturing-title">
        <div className="wheels-section-heading">
          <div>
            <p className="wheels-eyebrow">01 / MANUFACTURING</p>
            <EHeading id="manufacturing-title" tag="h2" size="2xl" color="primary">TWO WAYS TO<br />DEFINE PERFORMANCE.</EHeading>
          </div>
          <EText color="contrast-high">Explore the Euresis range by manufacturing process, then discover the design collection that fits your direction.</EText>
        </div>
        <div className="wheels-manufacturing__grid">
          <button className={`manufacturing-card ${manufacturing === "FORGED" ? "is-active" : ""}`} type="button" onClick={() => { setManufacturing(manufacturing === "FORGED" ? "ALL" : "FORGED"); document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" }); }}>
            <img src="https://cdn.pixabay.com/photo/2014/01/30/01/55/wheel-rim-254714_1280.jpg" alt="Reference image of a detailed alloy wheel" loading="lazy" />
            <span className="manufacturing-card__number">01 / F</span>
            <span className="manufacturing-card__copy"><strong>FORGED</strong><small>PRECISION · STRENGTH · LIGHTWEIGHT</small></span>
            <span className="manufacturing-card__arrow">↗</span>
          </button>
          <button className={`manufacturing-card ${manufacturing === "CAST" ? "is-active" : ""}`} type="button" onClick={() => { setManufacturing(manufacturing === "CAST" ? "ALL" : "CAST"); document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" }); }}>
            <img src="https://cdn.pixabay.com/photo/2020/01/31/07/13/tire-4807271_1280.jpg" alt="Reference image of a polished alloy wheel" loading="lazy" />
            <span className="manufacturing-card__number">02 / C</span>
            <span className="manufacturing-card__copy"><strong>CAST</strong><small>DESIGN · VERSATILITY · PERFORMANCE</small></span>
            <span className="manufacturing-card__arrow">↗</span>
          </button>
        </div>
      </section>

      <section className="wheels-discovery scheme-dark" id="discovery" aria-labelledby="discovery-title">
        <div className="wheels-section-heading">
          <div><p className="wheels-eyebrow">02 / PRODUCT DISCOVERY</p><EHeading id="discovery-title" tag="h2" size="2xl" color="inherit">TWO WAYS TO<br />FIND YOUR WHEELS.</EHeading></div>
          <EText color="inherit">Start with your vehicle and refine the fitment, or start with wheel specifications directly. Both paths lead to the same catalogue.</EText>
        </div>
        <div className="wheels-discovery__grid">
          <a className="wheels-discovery__card" href="#vehicle-fitment"><span className="wheels-discovery__icon"><EIcon name="car" size="xl" color="inherit" /></span><span>01 / VEHICLE FIRST</span><strong>Find wheels for<br />your vehicle.</strong><small>Make · Model · Year · Modification</small><b>START WITH VEHICLE ↗</b></a>
          <a className="wheels-discovery__card" href="#catalogue"><span className="wheels-discovery__icon"><EIcon name="tire" size="xl" color="inherit" /></span><span>02 / SPECIFICATION FIRST</span><strong>Know your fitment?<br />Start with the numbers.</strong><small>Collection · Diameter · Width · PCD · Offset</small><b>FILTER BY SPECIFICATION ↗</b></a>
        </div>
      </section>

      <LiveFitment />

      <section className="wheels-catalogue scheme-light" id="catalogue" aria-labelledby="catalogue-title">
        <div className="wheels-section-heading">
          <div>
            <p className="wheels-eyebrow">04 / UNIFIED CATALOGUE</p>
            <EHeading id="catalogue-title" tag="h2" size="2xl" color="primary">THE WHEEL<br />CATALOGUE.</EHeading>
          </div>
          <EText color="contrast-high">Explore the Euresis wheel range. Filter by manufacturing, collection and wheel dimensions.</EText>
        </div>
        <div className="wheels-filters" aria-label="Catalogue filters">
          <ESelect label="Manufacturing" name="filter-manufacturing" value={manufacturing} onChange={(event: SelectUpdateEvent) => setManufacturing(String(event.detail.value ?? "") as typeof manufacturing)}>
            <ESelectItem value="ALL">All manufacturing</ESelectItem>
            <ESelectItem value="FORGED">Forged</ESelectItem>
            <ESelectItem value="CAST">Cast</ESelectItem>
          </ESelect>
          <ESelect label="Collection" name="filter-collection" value={collection} onChange={(event: SelectUpdateEvent) => setCollection(String(event.detail.value ?? ""))}>
            <ESelectItem value="ALL">All collections</ESelectItem>
            {wheelCollections.map((item) => <ESelectItem key={item.id} value={item.id}>{item.id}</ESelectItem>)}
          </ESelect>
          <ESelect label="Diameter" name="catalogue-diameter" value={diameter} onChange={(event: SelectUpdateEvent) => setDiameter(String(event.detail.value ?? ""))}>
            <ESelectItem value="ALL">All diameters</ESelectItem>
            {diameter !== "ALL" && !["17","18","19","20","21","22"].includes(diameter) && <ESelectItem value={diameter}>{diameter} inch · API selection</ESelectItem>}
            {["17","18","19","20","21","22"].map((value) => <ESelectItem key={value} value={value}>{value} inch</ESelectItem>)}
          </ESelect>
          <ESelect label="Finish options" name="filter-finish" value={finish} onChange={(event: SelectUpdateEvent) => setFinish(String(event.detail.value ?? ""))}>
            <ESelectItem value="ALL">Any finish count</ESelectItem>
            <ESelectItem value="3">3+ finishes</ESelectItem>
            <ESelectItem value="4">4+ finishes</ESelectItem>
          </ESelect>
          <ETextInput label="Width (J)" name="catalogue-width" value={fitmentWidth} onChange={(event: InputUpdateEvent) => setFitmentWidth(inputValue(event))} />
          <ETextInput label="Offset (ET)" name="catalogue-offset" value={fitmentOffset} onChange={(event: InputUpdateEvent) => setFitmentOffset(inputValue(event))} />
          <ETextInput label="Bolt pattern (PCD)" name="catalogue-pcd" value={fitmentPcd} onChange={(event: InputUpdateEvent) => setFitmentPcd(inputValue(event))} />
          <ETextInput label="Center bore (CB)" name="catalogue-center-bore" value={fitmentCenterBore} onChange={(event: InputUpdateEvent) => setFitmentCenterBore(inputValue(event))} />
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset filters</Button>
        </div>
        <div className="wheels-catalogue__meta"><span>{products.length.toString().padStart(2, "0")} SAMPLE MODELS</span><span>NO PRICING · NO CHECKOUT</span></div>
        {vehicleSummary && <p className="wheels-selected-fitment">Vehicle reference: <strong>{vehicleSummary}</strong> Vehicle specifications are shown for reference only and have not been used to assert product compatibility. Catalogue sample models do not yet contain verified fitment data.</p>}
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
      </section>

      <section className="wheels-engineering scheme-light" aria-labelledby="engineering-title">
        <div>
          <p className="wheels-eyebrow">05 / ENGINEERING</p>
          <EHeading id="engineering-title" tag="h2" size="2xl" color="primary">FORM FOLLOWS<br />FUNCTION.</EHeading>
        </div>
        <div className="wheels-engineering__copy">
          <p>Every production wheel requires its own verified technical specification. Construction method, dimensions, load rating and vehicle clearance are confirmed at product level—not inferred from a collection name.</p>
          <div className="wheels-engineering__labels"><span><EIcon name="wrench" size="sm" /> MANUFACTURING</span><span><EIcon name="configurate" size="sm" /> GEOMETRY</span><span><EIcon name="weight" size="sm" /> MATERIALS</span><span><EIcon name="car" size="sm" /> FITMENT</span></div>
        </div>
      </section>

      <section className="wheels-inquiry scheme-dark" id="inquiry" aria-labelledby="inquiry-title">
        <div className="wheels-inquiry__intro">
          <p className="wheels-eyebrow">06 / GLOBAL ENQUIRY</p>
          <EHeading id="inquiry-title" tag="h2" size="2xl" color="inherit">LET'S FIND<br />YOUR FIT.</EHeading>
          <p>Tell us which wheel and vehicle you are considering. The current demo form validates the enquiry layout locally; it does not transmit or store personal information.</p>
        </div>
        {submitted ? <div className="wheels-inquiry__success" role="status"><strong>Demo enquiry captured in this session.</strong><p>No message was sent. Connect an enquiry endpoint before accepting real customer requests.</p><Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>Create another demo enquiry</Button></div> :
          <form className="wheels-inquiry__form scheme-light" onSubmit={submitDemoInquiry}>
            <div className="wheels-inquiry__fields">
              <ETextInput label="Name" name="name" required />
              <EEmailInput label="Email" name="email" required />
              <CountryRegionSelect value={country} onChange={setCountry} />
              <ETextInput label="Vehicle" name="vehicle" value={vehicleSummary} placeholder="Make / Model / Year / Trim" />
              <ETextArea label="Wheel model and requirements" name="message" required />
            </div>
            <Button type="submit">Submit demo enquiry</Button>
            <span className="wheels-demo-note">DEMO ONLY / FORM DATA IS NOT TRANSMITTED</span>
          </form>}
      </section>
    </main>
  );
}
