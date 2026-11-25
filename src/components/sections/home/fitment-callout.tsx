import { PLink } from "@porsche-design-system/components-react/ssr";

export function FitmentCallout() {
  return (
    <section className="fitment scheme-only-dark" id="fitment">
      <div>
        <p className="eyebrow">FITMENT FIRST</p>
        <h2>The right wheel.<br />The right fit.</h2>
      </div>
      <div className="fitment-copy">
        <p>Wheel fitment is specific. We are building a guided selection experience around verified vehicle and wheel specifications.</p>
        <PLink href="#collections" icon="arrow-up-right">Explore wheels</PLink>
      </div>
    </section>
  );
}
