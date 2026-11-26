const principles = [
  { number: "01", title: "Proportion", copy: "A considered relationship between spoke geometry, wheel diameter and the vehicle it completes." },
  { number: "02", title: "Material", copy: "Material choice and construction define the character, purpose and specification of each wheel." },
  { number: "03", title: "Precision", copy: "Machined surfaces, carefully resolved details and accurate fitment bring the design together." },
] as const;

export function DesignPrinciples() {
  return (
    <section className="principles" id="design" aria-labelledby="principles-heading">
      <div className="principles__intro">
        <p className="eyebrow">THE EURESIS APPROACH</p>
        <h2 id="principles-heading">Form follows<br />function. Always.</h2>
        <p className="principles__lead">A wheel is more than a visual statement. Its proportions, construction and fitment work together as one considered object.</p>
      </div>
      <div className="principles__list">
        {principles.map((item) => (
          <article className="principles__item" key={item.number}>
            <span className="principles__number">{item.number}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
            <span className="principles__arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}
