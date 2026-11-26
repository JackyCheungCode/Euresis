import { wheelProducts } from "@/src/data/wheels";
import ProductDetail from "@/src/components/sections/product-detail/product-detail";

export function generateStaticParams() {
  return wheelProducts.map(product=>({slug:product.slug}));
}

export default async function WheelDetailPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const product=wheelProducts.find(item=>item.slug===slug);
  if(!product) return <main className="simple-page" id="main"><span className="eyebrow">EURESIS / WHEELS</span><h1>Wheel not<br /><em>found.</em></h1><a className="button-outlined" href="/wheels">Back to all wheels <span>↗</span></a></main>;
  return <ProductDetail product={product} />;
}
