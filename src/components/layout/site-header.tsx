"use client";

import { useState } from "react";
import { PButtonPure, PLink } from "@porsche-design-system/components-react";

const navigation = [
  { label: "Collections", href: "#collections" },
  { label: "Fitment", href: "#fitment" },
  { label: "Engineering", href: "#engineering" },
];

export function SiteHeader() {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  const closeMobileNavigation = () => setIsMobileNavigationOpen(false);

  return (
    <header className="site-header" id="top">
      <a className="wordmark" href="/" aria-label="Euresis home">
        EURESIS
      </a>

      <nav className="site-header__desktop-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <PLink key={item.href} href={item.href}>
            {item.label}
          </PLink>
        ))}
      </nav>

      <div className="site-header__actions">
        <PLink className="site-header__primary-link" href="#collections" icon="arrow-up-right">
          Explore wheels
        </PLink>
        <PButtonPure
          className="site-header__menu-toggle"
          type="button"
          icon={isMobileNavigationOpen ? "close" : "menu-lines"}
          hideLabel
          aria={{
            "aria-label": isMobileNavigationOpen ? "Close navigation" : "Open navigation",
            "aria-expanded": String(isMobileNavigationOpen),
            "aria-controls": "mobile-navigation",
          }}
          onClick={() => setIsMobileNavigationOpen((open) => !open)}
        >
          {isMobileNavigationOpen ? "Close navigation" : "Open navigation"}
        </PButtonPure>
      </div>

      <nav
        className="site-header__mobile-nav"
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!isMobileNavigationOpen}
      >
        {navigation.map((item) => (
          <PLink key={item.href} href={item.href} onClick={closeMobileNavigation}>
            {item.label}
          </PLink>
        ))}
        <PLink href="#collections" icon="arrow-up-right" onClick={closeMobileNavigation}>
          Explore wheels
        </PLink>
      </nav>
    </header>
  );
}
