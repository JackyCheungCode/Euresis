import {
  PButton,
  PHeading,
  PText,
} from "@/src/components/ui/carbon-primitives";

const collections = [
  {
    id: "forged-construction",
    number: "01",
    category: "MANUFACTURING PROCESS",
    title: "FORGED WHEELS",
    description:
      "A collection defined by lightweight construction, precise geometry and carefully machined detail.",
    image:
      "https://cdn.pixabay.com/photo/2014/01/30/01/55/wheel-rim-254714_1280.jpg",
    alt: "Close-up detail of a custom alloy wheel",
    constructions: ["MONOBLOCK", "2-PIECE", "3-PIECE"],
    position: "center 54%",
  },
  {
    id: "cast-construction",
    number: "02",
    category: "MANUFACTURING PROCESS",
    title: "CAST WHEELS",
    description:
      "A versatile collection balancing distinctive spoke design, proportion and finish.",
    image:
      "https://cdn.pixabay.com/photo/2017/05/08/19/05/rim-2296197_1280.jpg",
    alt: "Polished alloy wheel fitted to a vehicle",
    constructions: ["MONOBLOCK"],
    position: "center 56%",
  },
] as const;

export function CollectionSection() {
  return (
    <section
      className="collections"
      id="collections"
      aria-labelledby="collections-heading"
    >
      <div className="collections-header">
        <div className="collections-heading-copy">
          <p className="eyebrow">THE EURESIS RANGE</p>
          <PHeading
            id="collections-heading"
            className="collections-heading"
            tag="h2"
            size="2xl"
          >
            WHEEL COLLECTIONS
          </PHeading>
        </div>
        <PText className="collections-intro" color="contrast-high" size="md">
          Explore two distinct manufacturing routes, each with its own
          construction language and design possibilities.
        </PText>
      </div>

      <div className="collections-grid">
        {collections.map((collection) => (
          <article
            className="collection-panel"
            id={collection.id}
            key={collection.id}
          >
            <div className="collection-image-wrap collection-image-wrap--product">
              <img
                className="collection-image"
                src={collection.image}
                alt={collection.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: collection.position }}
              />
              <span className="collection-number">{collection.number}</span>
              <div className="collection-image-copy">
                <p className="collection-category">{collection.category}</p>
                <h3 className="collection-title">{collection.title}</h3>
                <p className="collection-description">
                  {collection.description}
                </p>
              </div>
            </div>

            <div className="collection-details">
              <p className="collection-construction-label">
                WHEEL CONSTRUCTION
              </p>
              <ul className="collection-constructions">
                {collection.constructions.map((construction) => (
                  <li key={construction}>{construction}</li>
                ))}
              </ul>
              <PButton variant="secondary" type="button">
                <a href="/wheels">Discuss your fitment</a>
              </PButton>
            </div>
          </article>
        ))}
      </div>
      <p className="collections-note">
        Construction types shown are category references; specific
        configurations depend on the individual wheel range.
      </p>
    </section>
  );
}
