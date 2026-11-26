import { PButton, PHeading, PText } from "@porsche-design-system/components-react/ssr";
import { wheelProducts } from "@/src/data/wheels";

export function WheelsProductDetail({ slug }: { slug: string }) {
  const product = wheelProducts.find((item) => item.slug === slug);
  if (!product) {
    return <main className="wheel-detail wheel-detail--not-found"><p className="wheels-eyebrow">EURESIS / PRODUCT CATALOGUE</p><PHeading tag="h1" size="2xl">MODEL NOT FOUND.</PHeading><PButton type="button"><a href="/wheels">Back to wheels</a></PButton></main>;
  }

  const suffix = product.manufacturing === "FORGED" ? "F" : "C";
  return (
    <main className="wheel-detail">
      <div className="wheel-detail__breadcrumb"><a href="/wheels">WHEELS</a><span>/</span><span>{product.manufacturing}</span><span>/</span><span>{product.collection}</span></div>
      <section className="wheel-detail__hero">
        <div className="wheel-detail__image"><img src={product.image} alt={product.imageAlt} /><span>SAMPLE / REFERENCE IMAGE</span></div>
        <div className="wheel-detail__content">
          <p className="wheels-eyebrow">EURESIS / {product.manufacturing}</p>
          <PHeading tag="h1" size="2xl">{product.collection}-{suffix}</PHeading>
          <h2>{product.model}</h2>
          <p>{product.description}</p>
          <div className="wheel-detail__tags"><span>{product.manufacturing}</span><span>{product.collection}</span><span>SAMPLE MODEL</span></div>
          <PButton type="button"><a href="/wheels#inquiry">Request a quote</a></PButton>
          <small>Demonstration product only. No price, inventory or verified fitment is available.</small>
        </div>
      </section>
      <section className="wheel-detail__specs">
        <div><p className="wheels-eyebrow">DESIGN INFORMATION</p><PHeading tag="h2" size="xl">MODEL OVERVIEW.</PHeading></div>
        <dl>
          <div><dt>Collection</dt><dd>{product.collection}</dd></div>
          <div><dt>Manufacturing</dt><dd>{product.manufacturing}</dd></div>
          <div><dt>Design concept</dt><dd>{product.design}</dd></div>
          <div><dt>Diameter concept</dt><dd>{product.diameterRange}</dd></div>
          <div><dt>Finish concepts</dt><dd>{product.finishCount}</dd></div>
          <div><dt>Fitment status</dt><dd>Requires Confirmation</dd></div>
        </dl>
        <PText color="contrast-high">All dimensions, materials, offsets, bolt patterns, center bores, load ratings and brake clearances require validation against a real production specification. This sample model does not claim vehicle compatibility.</PText>
      </section>
      <section className="wheel-detail__source"><span>REFERENCE IMAGE SOURCE</span><a href={product.imageSourceUrl} target="_blank" rel="noreferrer">{product.imageSource} ↗</a></section>
    </main>
  );
}
