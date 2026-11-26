import { PLink } from "@/src/components/ui/carbon-primitives";

export function FitmentCallout() {
  return (
    <section className="fitment scheme-dark" id="fitment" aria-labelledby="fitment-heading">
      <div className="fitment__heading">
        <p className="eyebrow">VEHICLE COMPATIBILITY</p>
        <h2 id="fitment-heading">Made to fit.<br />Chosen with precision.</h2>
      </div>
      <div className="fitment-copy">
        <p>Wheel fitment is specific to the vehicle and its configuration. Start with your vehicle and explore the dimensions and specifications that matter.</p>
        <PLink href="/wheels#vehicle-fitment" icon="arrow-right">Find your vehicle</PLink>
        <span className="fitment__note">FITMENT GUIDANCE · SPECIFICATION · ENQUIRIES</span>
      </div>
    </section>
  );
}
