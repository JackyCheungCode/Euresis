import { wheelProducts, wheelCollections } from "@/src/data/wheels";

export const metadata = { title: "Wheels — Euresis", description: "Explore the Euresis performance wheel collections." };

export default function WheelsPage() {
  return (
    <main className="catalog-page" id="main">
      <header className="catalog-intro">
        <span className="eyebrow">EURESIS / WHEEL COLLECTIONS</span>
        <h1>Designed to<br /><em>move differently.</em></h1>
        <p>Explore forged and cast wheel concepts, each defined by its own design language and performance intent.</p>
      </header>
      <section className="catalog-collections" aria-label="Wheel collections">
        {wheelCollections.map(item=><a href={`#${item.id}`} key={item.id}><span>{item.id}</span><small>{item.subtitle}</small></a>)}
      </section>
      {wheelCollections.map(collection=>{
        const products=wheelProducts.filter(product=>product.collection===collection.id);
        if(!products.length)return null;
        return <section className="catalog-group" id={collection.id} key={collection.id}>
          <div className="catalog-group-heading"><div><span className="eyebrow">{collection.subtitle}</span><h2>{collection.id}</h2></div><p>{collection.description}</p></div>
          <div className="product-grid">
            {products.map(product=><a className="product-card" href={`/wheels/${product.slug}`} key={product.slug}>
              <div className="product-image"><img src={product.image} alt={product.imageAlt} loading="lazy" /><span className="product-open">↗</span></div>
              <div className="product-meta"><span>{product.manufacturing}</span><span>{product.code}</span></div>
              <div className="product-title"><h3>{product.model}</h3><span>{product.diameterRange}</span></div>
              <p>{product.description}</p>
            </a>)}
          </div>
        </section>;
      })}
      <p className="catalog-disclaimer">Product names, specifications and imagery shown here are illustrative sample data and are not a representation of certified production products.</p>
    </main>
  );
}
