import { wheelProducts } from "@/src/data/wheels";

export function generateStaticParams() {
  return wheelProducts.map(product=>({slug:product.slug}));
}

export default async function WheelDetailPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const product=wheelProducts.find(item=>item.slug===slug);
  if(!product) return <main className="simple-page" id="main"><span className="eyebrow">EURESIS / WHEELS</span><h1>Wheel not<br /><em>found.</em></h1><a className="button-outlined" href="/wheels">Back to all wheels <span>↗</span></a></main>;
  return (
    <main className="detail-page" id="main">
      <a className="back-link" href="/wheels">← All wheels</a>
      <div className="detail-layout">
        <div className="detail-image"><img src={product.image} alt={product.imageAlt} /><span>REFERENCE IMAGE / SAMPLE</span></div>
        <section className="detail-copy">
          <span className="eyebrow">{product.collection} COLLECTION / {product.manufacturing}</span>
          <h1>{product.model}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-specs">
            <div><span>DESIGN</span><strong>{product.design}</strong></div>
            <div><span>DIAMETER</span><strong>{product.diameterRange}</strong></div>
            <div><span>FINISH OPTIONS</span><strong>{product.finishCount}</strong></div>
            <div><span>PRODUCT CODE</span><strong>{product.code}</strong></div>
          </div>
          <a className="button-filled detail-action" href={`/contact?product=${product.slug}`}>Enquire about this wheel <span>↗</span></a>
          <p className="detail-disclaimer">This is an illustrative product record. Confirm production specifications and vehicle compatibility with Euresis before purchase.</p>
        </section>
      </div>
    </main>
  );
}
