import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { GlobalVehicleFitmentBar } from "./global-vehicle-fitment-bar";
import { SiteFooter } from "./site-footer";

/**
 * Canonical site chrome. Keep global navigation and vehicle fitment controls
 * here so every public route shares one persistent vehicle selection.
 */
export function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <GlobalVehicleFitmentBar />
      {children}
      <SiteFooter />
    </>
  );
}
