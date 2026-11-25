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
      "Two manufacturing routes, each selected to support the intended wheel design and specification.",
    image:
      "https://images.pexels.com/photos/5845934/pexels-photo-5845934.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Industrial metal forging process under a large press",
    position: "center 45%",
  },
  {
    number: "02",
    category: "PRECISION ENGINEERING",
    title: "Design & CNC Machining",
    description:
      "Digital design and precision machining bring each spoke, surface and detail into focus.",
    image:
      "https://images.pexels.com/photos/10406128/pexels-photo-10406128.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "CNC milling tool machining a metal component",
    position: "center 50%",
  },
  {
    number: "03",
    category: "FINISH & FITMENT",
    title: "Details That Define the Result",
    description:
      "Surface finish, dimensions and vehicle fitment complete the wheel specification.",
    image:
      "https://images.pexels.com/photos/32070739/pexels-photo-32070739.jpeg?auto=compress&cs=tinysrgb&w=1400",
    alt: "Close-up of a car wheel with a polished alloy rim",
    position: "center 58%",
  },
] as const;

export function EngineeringIntro() {
  return (
    <section
      className="capabilities"
      id="engineering"
      aria-labelledby="capabilities-heading"
    >
      <div className="capabilities-header">
        <div className="capabilities-heading-copy">
          <p className="eyebrow">ENGINEERING &amp; CRAFTSMANSHIP</p>
          <PHeading
            id="capabilities-heading"
            tag="h2"
            size="2xl"
            className="capabilities-heading"
          >
            Considered in every detail.
          </PHeading>
        </div>
        <p className="capabilities-intro">
          From manufacturing process to final fitment, every decision shapes
          the character and specification of the wheel.
        </p>
      </div>

      <PCarousel
        className="capabilities-carousel"
        slidesPerPage={{ base: 1, s: 1, m: 2, l: 3, xl: 3 }}
        pagination
        rewind
        width="full"
        aria={{ "aria-label": "EURESIS engineering and manufacturing" }}
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
            </div>
          </article>
        ))}
      </PCarousel>
    </section>
  );
}
