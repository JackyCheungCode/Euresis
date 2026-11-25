import { CollectionSection } from "@/src/components/sections/home/collection-section";
import { EngineeringIntro } from "@/src/components/sections/home/engineering-intro";
import { FitmentCallout } from "@/src/components/sections/home/fitment-callout";
import { HeroSection } from "@/src/components/sections/home/hero-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CollectionSection />
      <EngineeringIntro />
      <FitmentCallout />
    </main>
  );
}
