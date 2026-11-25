import { homepageContent } from "@/src/data/homepage";
export function CollectionSection() {
  return <section className="collections" id="collections">
    <div className="section-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>Choose your direction.</h2></div><a href="/collections" className="text-link">View all collections ↗</a></div>
    <div className="collection-grid">{homepageContent.collections.map((item, index) => <article className="collection-card" key={item.name}>
      <div className="collection-art"><span>0{index + 1}</span><div className="art-disc"><i /><i /><i /><i /><i /><i /></div></div>
      <div className="collection-meta"><div><h3>{item.name}</h3><p>{item.detail}</p></div><a href="/collections" aria-label={"Explore " + item.name}>↗</a></div>
    </article>)}</div>
  </section>;
}
