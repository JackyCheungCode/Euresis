import { WheelsProductDetail } from "@/src/components/sections/wheels/wheels-product-detail";
import { wheelProducts } from "@/src/data/wheels";

export function generateStaticParams() {
  return wheelProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = wheelProducts.find((item) => item.slug === slug);
  return {
    title: product ? `${product.collection}-${product.manufacturing === "FORGED" ? "F" : "C"} ${product.model} | Euresis` : "Wheel model | Euresis",
    description: product?.description ?? "Explore Euresis sample wheel models.",
  };
}

export default async function WheelProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WheelsProductDetail slug={slug} />;
}
