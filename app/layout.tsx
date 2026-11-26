import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Euresis",
  description: "A new digital experience for Euresis performance wheels.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
