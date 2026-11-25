import type { ReactNode } from "react";
import { PorscheDesignSystemProvider } from "@porsche-design-system/components-react/ssr";
import {
  getComponentChunkLinks,
  getFontLinks,
  getIconLinks,
  getMetaTagsAndIconLinks,
} from "@porsche-design-system/components-react/partials";
import { SiteHeader } from "@/src/components/layout/site-header";
import { SiteFooter } from "@/src/components/layout/site-footer";
import "./globals.css";

export const metadata = {
  title: "Euresis | Precision Performance Wheels",
  description:
    "Explore precision-engineered performance wheels with clear specifications and vehicle fitment guidance.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {getFontLinks({ format: "jsx" })}
        {getIconLinks({ format: "jsx" })}
        {getComponentChunkLinks({ format: "jsx" })}
        {getMetaTagsAndIconLinks({ appTitle: "Euresis", format: "jsx" })}
      </head>
      <body>
        <PorscheDesignSystemProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </PorscheDesignSystemProvider>
      </body>
    </html>
  );
}
