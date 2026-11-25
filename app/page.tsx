import { PLink } from "@porsche-design-system/components-react/ssr";

const collections = [
  { name: "FORGED SERIES", detail: "Lightweight construction. Precision machining." },
  { name: "FLOW FORMED", detail: "Performance-focused strength and weight." },
  { name: "CLASSIC SERIES", detail: "Timeless proportions. Modern engineering." },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
        <nav aria-label="Main navigation">
          <a href="#collections">Collections</a>
          <a href="#fitment">Find Your Fitment</a>
          <a href="#engineering">Engineering</a>
        </nav>
        <PLink className="header-action" href="#collections" icon="arrow-up-right">Explore wheels</PLink>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ENGINEERED TO MOVE</p>
          <h1>Precision in<br />every rotation.</h1>
          <p className="hero-description">
            Performance wheels shaped by engineering, defined by proportion.
            Discover the right specification for your vehicle.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#collections">Explore collections <span aria-hidden="true">↗</span></a>
            <a className="button button-secondary" href="#fitment">Find your fitment</a>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Abstract close-up composition representing precision wheel engineering">
          <div className="visual-ring visual-ring-one" />
          <div className="visual-ring visual-ring-two" />
          <div className="visual-center"><span>E</span></div>
          <p className="visual-caption">FORM / FUNCTION / PERFORMANCE</p>
        </div>
        <div className="hero-index"><span>01</span><span className="index-line" /><span>03</span></div>
      </section>

      <section className="intro" id="engineering">
        <p className="eyebrow">THE EURESIS STANDARD</p>
        <h2>Built around the details<br />that make the difference.</h2>
        <p>Material, geometry and fitment are not afterthoughts. They are the starting point.</p>
      </section>

      <section className="collections" id="collections">
        <div className="section-heading">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Choose your direction.</h2></div>
          <a href="#fitment" className="text-link">View all collections ↗</a>
        </div>
        <div className="collection-grid">
          {collections.map((item, index) => (
            <article className="collection-card" key={item.name}>
              <div className="collection-art"><span>0{index + 1}</span><div className="art-disc"><i /><i /><i /><i /><i /><i /></div></div>
              <div className="collection-meta"><div><h3>{item.name}</h3><p>{item.detail}</p></div><span aria-hidden="true">↗</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="fitment" id="fitment">
        <div><p className="eyebrow">FITMENT FIRST</p><h2>The right wheel.<br />The right fit.</h2></div>
        <div className="fitment-copy"><p>Wheel fitment is specific. We are building a guided selection experience around verified vehicle and wheel specifications.</p><a className="button button-primary" href="#collections">Explore wheels ↗</a></div>
      </section>

      <footer className="site-footer"><a className="wordmark" href="/">EURESIS</a><span>Precision performance wheels.</span><span>© {new Date().getFullYear()} Euresis</span></footer>
    </main>
  );
}
