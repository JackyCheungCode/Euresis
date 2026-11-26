import { wheelProducts } from "@/src/data/wheels";

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

function WheelVisual() {
  return (
    <svg className="wheel-visual" viewBox="0 0 620 620" role="img" aria-label="Abstract technical illustration of a performance forged wheel">
      <defs>
        <radialGradient id="rimMetal" cx="38%" cy="28%" r="72%">
          <stop offset="0" stopColor="#f7f8f8" />
          <stop offset=".22" stopColor="#aeb4b8" />
          <stop offset=".48" stopColor="#343a3e" />
          <stop offset=".72" stopColor="#d5d9da" />
          <stop offset="1" stopColor="#555d62" />
        </radialGradient>
        <radialGradient id="hub" cx="35%" cy="25%" r="75%">
          <stop offset="0" stopColor="#7c858a" />
          <stop offset=".55" stopColor="#202528" />
          <stop offset="1" stopColor="#090b0c" />
        </radialGradient>
        <filter id="shadow"><feGaussianBlur stdDeviation="13" /></filter>
      </defs>
      <ellipse cx="310" cy="530" rx="190" ry="25" fill="#000" opacity=".5" filter="url(#shadow)" />
      <circle cx="310" cy="300" r="250" fill="#080a0b" stroke="#687176" strokeWidth="8" />
      <circle cx="310" cy="300" r="225" fill="url(#rimMetal)" stroke="#e3e6e7" strokeWidth="5" />
      <circle cx="310" cy="300" r="207" fill="#14191c" stroke="#252b2e" strokeWidth="9" />
      {Array.from({length:10},(_,i)=> <g key={i} transform={`rotate(${i*36} 310 300)`}>
        <path d="M300 104 L321 104 L346 278 L323 292 L298 275 Z" fill="url(#rimMetal)" stroke="#0b0e10" strokeWidth="5" />
        <path d="M305 118 L316 118 L329 265 L315 274 Z" fill="#f0f2f2" opacity=".45" />
      </g>)}
      <circle cx="310" cy="300" r="82" fill="url(#hub)" stroke="#d5d9da" strokeWidth="7" />
      <circle cx="310" cy="300" r="57" fill="#171c1f" stroke="#899196" strokeWidth="2" />
      <circle cx="310" cy="300" r="23" fill="#aeb5b8" />
      {Array.from({length:5},(_,i)=> <circle key={i} cx={310+Math.cos(i*Math.PI*2/5)*68} cy={300+Math.sin(i*Math.PI*2/5)*68} r="7" fill="#bfc5c8" />)}
      <circle cx="310" cy="300" r="242" fill="none" stroke="#fff" strokeWidth="1" opacity=".35" />
    </svg>
  );
}

export default function HomePage() {
  const featured = wheelProducts.slice(0, 3);
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">PRECISION PERFORMANCE · EURESIS</span>
          <h1>FORGED<br /><em>WITH INTENT.</em></h1>
          <p className="hero-description">Precision-engineered wheels. Considered down to the last millimetre.</p>
          <div className="hero-actions">
            <a className="button-filled" href="/wheels">Explore wheels <Arrow /></a>
            <a className="button-text hero-secondary" href="#engineering">Our approach <Arrow /></a>
          </div>
          <div className="hero-index"><span>01</span><span className="index-line" /><span>DESIGN WITHOUT COMPROMISE</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <WheelVisual />
          <span className="art-coordinate">E / 001 — FORGED SERIES</span>
          <span className="art-side-label">FORM FOLLOWS FUNCTION</span>
        </div>
        <div className="hero-bottom"><span>PRECISION IN EVERY DETAIL</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="intro-band" id="engineering">
        <span className="eyebrow">THE EURESIS STANDARD</span>
        <p>Performance is not an aesthetic.<br /><strong>It is the result of every decision.</strong></p>
        <span className="intro-note">DESIGN · ENGINEERING · FITMENT</span>
      </section>

      <section className="collection-section">
        <div className="section-heading">
          <div><span className="eyebrow">01 / THE COLLECTION</span><h2>Find your<br /><em>form.</em></h2></div>
          <a className="button-outlined" href="/wheels">View all wheels <Arrow /></a>
        </div>
        <div className="product-grid">
          {featured.map((wheel,index)=>(
            <a className="product-card" href={`/wheels/${wheel.slug}`} key={wheel.slug}>
              <div className="product-image">
                <img src={wheel.image} alt={wheel.imageAlt} loading="lazy" />
                <span className="product-number">0{index+1}</span>
                <span className="product-open" aria-hidden="true">↗</span>
              </div>
              <div className="product-meta"><span>{wheel.collection} SERIES</span><span>{wheel.manufacturing}</span></div>
              <div className="product-title"><h3>{wheel.model}</h3><span>{wheel.diameterRange}</span></div>
              <p>{wheel.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="fitment-strip">
        <div><span className="eyebrow">MADE TO FIT YOUR DRIVE</span><h2>The right fit.<br /><em>Without guesswork.</em></h2></div>
        <div className="fitment-copy"><p>Start with your vehicle. Explore wheel specifications with clear, considered fitment guidance.</p><a className="button-filled" href="/fitment">Find your fit <Arrow /></a></div>
      </section>

      <section className="closing-panel">
        <span className="eyebrow">EURESIS / PERFORMANCE WHEELS</span>
        <h2>Make every<br /><em>detail count.</em></h2>
        <a className="button-outlined" href="/wheels">Discover the collection <Arrow /></a>
      </section>
    </main>
  );
}
