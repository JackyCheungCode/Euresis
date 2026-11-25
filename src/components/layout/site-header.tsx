"use client";

import { useEffect, useRef, useState } from "react";
import {
  PButtonPure,
  PDrilldown,
  PDrilldownItem,
  PDrilldownLink,
} from "@porsche-design-system/components-react/ssr";

const searchSuggestions = [
  { label: "Forged wheels", href: "/#collections" },
  { label: "Vehicle fitment", href: "/#fitment" },
  { label: "Engineering", href: "/#engineering" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdentifier, setActiveIdentifier] = useState<string | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsHome(window.location.pathname === "/");
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setActiveIdentifier(undefined);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setActiveIdentifier(undefined);
  };

  const filteredSuggestions = searchSuggestions.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <header className={`site-header ${isHome ? "site-header--home" : "site-header--inner"}`}>
        <div className="site-header__inner">
          <div className="site-header__start scheme-dark">
            <PButtonPure
              className="site-header__control"
              type="button"
              icon="menu-lines"
              hideLabel={{ base: true, s: false }}
              aria={{ "aria-label": "Open menu", "aria-haspopup": "dialog", "aria-expanded": menuOpen }}
              onClick={() => { setMenuOpen(true); setSearchOpen(false); }}
            >
              Menu
            </PButtonPure>
          </div>
          <a className="site-header__wordmark scheme-dark" href="/" aria-label="Euresis home">
            EURESIS
          </a>
          <div className="site-header__end scheme-dark">
            <PButtonPure
              className="site-header__control"
              type="button"
              icon="search"
              hideLabel
              title="Search"
              aria={{ "aria-label": "Open search", "aria-expanded": searchOpen }}
              onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
            >
              Search
            </PButtonPure>
            <PButtonPure
              className="site-header__control"
              type="button"
              icon="user"
              hideLabel
              title="User"
              aria={{ "aria-label": "User account placeholder" }}
            >
              User
            </PButtonPure>
          </div>
        </div>
        <nav className="site-header__drilldown" aria-label="Main navigation">
          <PDrilldown
            open={menuOpen}
            activeIdentifier={activeIdentifier}
            onDismiss={closeMenu}
            onUpdate={(event) => setActiveIdentifier(event.detail.activeIdentifier)}
          >
            <PDrilldownItem identifier="wheels" label="Wheels">
              <PDrilldownLink href="/#collections">All collections</PDrilldownLink>
              <PDrilldownItem identifier="wheels-forged" label="Forged wheels">
                <PDrilldownLink href="/#collections">Monoblock</PDrilldownLink>
                <PDrilldownLink href="/#collections">Two-piece</PDrilldownLink>
                <PDrilldownLink href="/#collections">Three-piece</PDrilldownLink>
              </PDrilldownItem>
              <PDrilldownItem identifier="wheels-design" label="Design & finish">
                <PDrilldownLink href="/#collections">Wheel designs</PDrilldownLink>
                <PDrilldownLink href="/#engineering">Finishes & details</PDrilldownLink>
              </PDrilldownItem>
              <PDrilldownLink href="/#engineering">Technical specifications</PDrilldownLink>
            </PDrilldownItem>

            <PDrilldownItem identifier="vehicles" label="Vehicles">
              <PDrilldownLink href="/#fitment">Vehicle fitment</PDrilldownLink>
              <PDrilldownItem identifier="vehicles-makes" label="Browse by vehicle">
                <PDrilldownLink href="/#fitment">Porsche</PDrilldownLink>
                <PDrilldownLink href="/#fitment">BMW</PDrilldownLink>
                <PDrilldownLink href="/#fitment">Mercedes-Benz</PDrilldownLink>
                <PDrilldownLink href="/#fitment">Other vehicles</PDrilldownLink>
              </PDrilldownItem>
              <PDrilldownItem identifier="vehicles-guidance" label="Fitment guidance">
                <PDrilldownLink href="/#fitment">Fitment process</PDrilldownLink>
                <PDrilldownLink href="/#engineering">Wheel specifications</PDrilldownLink>
              </PDrilldownItem>
            </PDrilldownItem>

            <PDrilldownItem identifier="technology" label="Technology">
              <PDrilldownLink href="/#engineering">Engineering overview</PDrilldownLink>
              <PDrilldownItem identifier="technology-process" label="Manufacturing">
                <PDrilldownLink href="/#engineering">Forging process</PDrilldownLink>
                <PDrilldownLink href="/#engineering">Materials</PDrilldownLink>
                <PDrilldownLink href="/#engineering">Quality control</PDrilldownLink>
              </PDrilldownItem>
            </PDrilldownItem>

            <PDrilldownItem identifier="story" label="Our Story">
              <PDrilldownLink href="/#engineering">Euresis philosophy</PDrilldownLink>
            </PDrilldownItem>

            <PDrilldownItem identifier="journal" label="Journal">
              <PDrilldownLink href="/#collections">Stories & builds</PDrilldownLink>
            </PDrilldownItem>

            <PDrilldownItem identifier="contact" label="Contact">
              <PDrilldownLink href="/#fitment">Product enquiry</PDrilldownLink>
            </PDrilldownItem>
          </PDrilldown>
        </nav>
      </header>

      {searchOpen && (
        <div className="global-overlay global-overlay--search" role="dialog" aria-modal="true" aria-label="Site search">
          <section className="search-panel">
            <div className="search-panel__top">
              <a className="site-header__wordmark" href="/" onClick={() => setSearchOpen(false)}>EURESIS</a>
              <PButtonPure icon="close" hideLabel type="button" aria={{ "aria-label": "Close search" }} onClick={() => setSearchOpen(false)}>Close</PButtonPure>
            </div>
            <div className="search-panel__content">
              <span className="eyebrow">Search Euresis</span>
              <h2>What are you looking for?</h2>
              <form className="search-panel__form" onSubmit={(event) => event.preventDefault()}>
                <span aria-hidden="true">⌕</span>
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search wheels, series, vehicle..."
                  aria-label="Search wheels, series and vehicles"
                />
                <kbd>ESC</kbd>
              </form>
              <div className="search-panel__results">
                <span className="eyebrow">{query ? "Suggested destinations" : "Popular searches"}</span>
                {filteredSuggestions.length > 0 ? filteredSuggestions.map((item) => (
                  <a href={item.href} key={item.label} onClick={() => setSearchOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>
                )) : <p className="search-panel__empty">No matching suggestions. Product catalogue search can be connected when the catalogue is ready.</p>}
              </div>
              <p className="search-panel__note">Search suggestions currently navigate to existing site sections. Catalogue-wide search will be connected when product data is available.</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
