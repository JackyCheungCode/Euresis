import {
  PCarousel,
  PHeading,
} from "@porsche-design-system/components-react/ssr";

const capabilities = [
  {
    number: "01",
    category: "MANUFACTURING",
    title: "Forging & Casting",
    description:
      "Two core manufacturing routes, selected around the wheel design, intended use and specification.",
    image:
      "https://images.pexels.com/photos/5845934/pexels-photo-5845934.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Metal forming under a large industrial press",
    source: "https://www.pexels.com/photo/a-man-forging-a-metal-5845934/",
    credit: "Tima Miroshnichenko / Pexels",
    position: "center 45%",
  },
  {
    number: "02",
    category: "ENGINEERING",
    title: "Design & CNC Machining",
    description:
      "From digital design intent to accurately machined surfaces and carefully resolved details.",
    image:
      "https://images.pexels.com/photos/10406128/pexels-photo-10406128.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "CNC milling tool machining a metal component",
    source: "https://www.pexels.com/photo/close-up-photo-of-metal-tool-10406128/",
    credit: "Daniel Smyth / Pexels",
    position: "center 50%",
  },
  {
    number: "03",
    category: "STRUCTURAL DESIGN",
    title: "Strength & Lightweight",
    description:
      "Geometry, material use and weight are considered together when developing a wheel structure.",
    image:
      "https://images.pexels.com/photos/19895882/pexels-photo-19895882.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Engineer reviewing CAD design on computer monitors",
    source: "https://www.pexels.com/photo/engineer-working-in-office-19895882/",
    credit: "ThisIsEngineering / Pexels",
    position: "center 50%",
  },
  {
    number: "04",
    category: "SURFACE FINISHING",
    title: "Finishes & Details",
    description:
      "Surface appearance is shaped through finishing choices, from coating to machined and polished details.",
    image:
      "https://images.pexels.com/photos/36184235/pexels-photo-36184235.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Technician applying a coating in an industrial workshop",
    source: "https://www.pexels.com/photo/industrial-powder-coating-process-in-workshop-36184235/",
    credit: "Full Blown Coatings / Pexels",
    position: "center 50%",
  },
  {
    number: "05",
    category: "QUALITY CONTROL",
    title: "Testing & Inspection",
    description:
      "Dimensional checks and product testing are essential parts of a disciplined quality process.",
    image:
      "https://images.pexels.com/photos/16442863/pexels-photo-16442863.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Operator using a precision testing machine in a laboratory",
    source: "https://www.pexels.com/photo/achilles-series-by-testing-16442863/",
    credit: "Sternsteiger Stahlwaren / Pexels",
    position: "center 50%",
  },
  {
    number: "06",
    category: "VEHICLE FITMENT",
    title: "Specifications & Fitment",
    description:
      "PCD, offset, center bore and wheel dimensions help define compatibility with each vehicle.",
    image:
      "https://images.pexels.com/photos/32070739/pexels-photo-32070739.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Close-up of a car wheel with a polished alloy rim",
    source: "https://www.pexels.com/photo/close-up-of-stylish-car-wheel-with-polished-alloy-rim-32070739/",
    credit: "János Csatlós / Pexels",
    position: "center 58%",
  },
] as const;

export function EngineeringIntro() {
  return (
    <section className="capabilities" id="engineering" aria-labelledby="capabilities-heading">
      <div className="capabilities-header">
        <div className="capabilities-heading-copy">
          <p className="eyebrow">ENGINEERING &amp; MANUFACTURING</p>
          <PHeading
            id="capabilities-heading"
            tag="h2"
            size="2xl"
            className="capabilities-heading"
          >
            Built around the details
            <br />
            that make the difference.
          </PHeading>
        </div>
        <p className="capabilities-intro">
          Six disciplines that shape the wheel — from manufacturing processes
          and engineering decisions to finish, quality and vehicle fitment.
        </p>
      </div>

      <PCarousel
        className="capabilities-carousel"
        slidesPerPage={{ base: 1, s: 1, m: 2, l: 3, xl: 3 }}
        pagination
        gradient
        rewind
        width="full"
        aria={{ "aria-label": "EURESIS engineering and manufacturing capabilities" }}
        intl={{
          prev: "Previous capabilities",
          next: "Next capabilities",
          slideLabel: "Capability",
        }}
      >
        {capabilities.map((capability) => (
          <article className="capability-card" key={capability.number}>
            <div className="capability-image-wrap">
              <img
                className="capability-image"
                src={capability.image}
                alt={capability.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: capability.position }}
              />
              <span className="capability-number">{capability.number}</span>
            </div>
            <div className="capability-copy">
              <p className="capability-category">{capability.category}</p>
              <h3 className="capability-title">{capability.title}</h3>
              <p className="capability-description">{capability.description}</p>
              <a
                className="capability-source"
                href={capability.source}
                target="_blank"
                rel="noreferrer"
                aria-label={`View photo source: ${capability.credit}`}
              >
                Photo: {capability.credit}
              </a>
            </div>
          </article>
        ))}
      </PCarousel>
    </section>
  );
}
