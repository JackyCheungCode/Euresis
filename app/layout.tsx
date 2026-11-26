import type { ReactNode } from "react";
import SiteHeader from "@/src/components/layout/site-header";
import SiteFooter from "@/src/components/layout/site-footer";
import "@volvo-cars/css/tokens.css";
import "@volvo-cars/css/styles_all-media.css";
import "./globals.css";

export const metadata = {
  title: "Euresis — Precision Performance Wheels",
  description: "Forged with intent. Explore Euresis performance wheel collections and vehicle fitment.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
