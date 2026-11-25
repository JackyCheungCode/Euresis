import { PLink } from "@porsche-design-system/components-react/ssr";
import { homepageContent } from "@/src/data/homepage";

export function HeroSection() {
  const { hero } = homepageContent;

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1>Precision in<br />every rotation.</h1>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-actions">
          <PLink href="#collections" icon="arrow-up-right">Explore collections</PLink>
          <PLink href="#fitment" variant="secondary">Find your fitment</PLink>
        </div>
      </div>
      <div className="hero-visual" role="img" aria-label="Abstract close-up composition representing precision wheel engineering">
        <div className="visual-ring visual-ring-one" />
        <div className="visual-ring visual-ring-two" />
        <div className="visual-center"><span>E</span></div>
        <p className="visual-caption">FORM / FUNCTION / PERFORMANCE</p>
      </div>
      <div className="hero-index"><span>01</span><span className="index-line" /><span>03</span></div>
    </section>
  );
}
