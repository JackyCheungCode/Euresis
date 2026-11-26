import type { ReactNode } from "react";
import { SiteLayout } from "@/src/components/layout/site-layout";
import "./carbon.scss";
import "./globals.css";

export const metadata = {
  title: "Euresis | Precision Performance Wheels",
  description: "Explore precision-engineered performance wheels with clear specifications and vehicle fitment guidance.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
