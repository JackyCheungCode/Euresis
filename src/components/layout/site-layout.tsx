import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/**
 * Canonical site chrome. Keep global navigation and footer here so every
 * route inherits the same approved structure without duplicating components.
 */
export function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
