import { wheelProducts, wheelCollections } from "@/src/data/wheels";
import WheelsExplorer from "@/src/components/sections/wheels/wheels-explorer";

export const metadata = { title: "Wheels — Euresis", description: "Explore and filter Euresis performance wheel concepts." };

export default function WheelsPage() {
  return <main className="catalog-page" id="main">
    <header className="catalog-intro">
      <span className="eyebrow">EURESIS / WHEEL COLLECTIONS</span>
      <h1>Designed to<br /><em>move differently.</em></h1>
      <p>Explore the Euresis wheel catalogue by collection, construction and design. Compare the concepts, then request a confirmed specification for your vehicle.</p>
    </header>
    <WheelsExplorer products={wheelProducts} collections={wheelCollections.map(({id,subtitle})=>({id,subtitle}))} />
    <p className="catalog-disclaimer">Product names, specifications and imagery shown here are illustrative sample data and are not a representation of certified production products.</p>
  </main>;
}
