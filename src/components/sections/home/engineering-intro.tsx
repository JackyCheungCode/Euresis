const capabilities = [
  {
    number: "01",
    category: "MANUFACTURING",
    title: "Forging & casting",
    description: "Different manufacturing routes shape the structure, character and possibilities of each wheel range.",
    image: "https://images.pexels.com/photos/5845934/pexels-photo-5845934.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Industrial metal forging process under a large press",
  },
  {
    number: "02",
    category: "PRECISION ENGINEERING",
    title: "CNC machining",
    description: "Precisely machined surfaces bring definition to the spokes, contours and fine details.",
    image: "https://images.pexels.com/photos/10406128/pexels-photo-10406128.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "CNC milling tool machining a metal component",
  },
  {
    number: "03",
    category: "FINAL SPECIFICATION",
    title: "Finish & fitment",
    description: "Finish, dimensions and vehicle compatibility complete the wheel specification.",
    image: "https://images.pexels.com/photos/32070739/pexels-photo-32070739.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Close-up of a polished alloy wheel fitted to a vehicle",
  },
] as const;

export function EngineeringIntro() {
  return (
    <section className="capabilities" id="engineering" aria-labelledby="capabilities-heading">
      <div className="capabilities-header">
        <div className="capabilities-heading-copy">
          <p className="eyebrow">ENGINEERING & CRAFTSMANSHIP</p>
          <h2 id="capabilities-heading" className="capabilities-heading">Precision is<br />in the details.</h2>
        </div>
        <p className="capabilities-intro">From the first design decision to the final specification, the details define the result. Explore the processes and considerations behind the Euresis range.</p>
      </div>
      <div className="capabilities-grid">
        {capabilities.map((capability) => (
          <article className="capability-card" key={capability.number}>
            <div className="capability-image-wrap">
              <img className="capability-image" src={capability.image} alt={capability.alt} loading="lazy" decoding="async" />
              <span className="capability-number">{capability.number}</span>
            </div>
            <div className="capability-copy">
              <p className="capability-category">{capability.category}</p>
              <h3 className="capability-title">{capability.title}</h3>
              <p className="capability-description">{capability.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
