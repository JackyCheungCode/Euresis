import { LinkButton } from "@/src/components/ui/button";
export function FitmentCallout() {
  return <section className="fitment" id="fitment">
    <div><p className="eyebrow">FITMENT FIRST</p><h2>The right wheel.<br />The right fit.</h2></div>
    <div className="fitment-copy"><p>Wheel fitment is specific. We are building a guided selection experience around verified vehicle and wheel specifications.</p><LinkButton href="/fitment">Find your fitment ↗</LinkButton></div>
  </section>;
}
