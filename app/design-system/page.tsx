import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/src/components/showcase/design-system-showcase";

export const metadata: Metadata = {
  title: "Design System | Euresis",
  description: "Euresis global components, visual tokens and Porsche Design System v4 component showcase.",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
