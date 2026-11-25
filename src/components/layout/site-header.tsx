"use client";

import { useEffect, useRef, useState } from "react";
import {
  PButtonPure,
  PDrilldown,
  PDrilldownItem,
  PDrilldownLink,
  type DrilldownDismissEventDetail,
  type DrilldownUpdateEventDetail,
} from "@porsche-design-system/components-react/ssr";

const searchSuggestions = [
  { label: "Forged wheels", href: "/#collections" },
  { label: "Vehicle fitment", href: "/#fitment" },
  { label: "Engineering", href: "/#engineering" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdentifier, setActiveIdentifier] =
    useState<DrilldownUpdateEventDetail["activeIdentifier"]>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

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

  const closePanels = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setActiveIdentifier(undefined);
  };

  const onDrilldownUpdate = (event: CustomEvent<DrilldownUpdateEventDetail>) => {
    setActiveIdentifier(event.detail.activeIdentifier);
  };

  const onDrilldownDismiss = (_event: CustomEvent<DrilldownDismissEventDetail>) => {
    setMenuOpen(false);
    setActiveIdentifier(undefined);
  };

  const filteredSuggestions = searchSuggestions.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__start">
            <nav aria-label="Main">
              <PButtonPure
                className="site-header__control"
                type="button"
                icon="menu-lines"
                hideLabel
                aria={{ "aria-haspopup": "dialog", "aria-expanded": menuOpen, "aria-label": "Open menu" }}
                onClick={() => { setMenuOpen(true); setSearchOpen(false); }}
              >Menu</PButtonPure>
              <PDrilldown
                open={menuOpen}
                activeIdentifier={activeIdentifier}
                onDismiss={onDrilldownDismiss}
                onUpdate={onDrilldownUpdate}
              >
                <PDrilldownItem identifier="wheels" label="Wheels">
                  <PDrilldownItem identifier="wheels-collections" label="Collections">
                    <PDrilldownLink href="/#collections">All wheel collections</PDrilldownLink>
                    <PDrilldownLink href="/#collections">Forged wheel series</PDrilldownLink>
                  </PDrilldownItem>
                  <PDrilldownItem identifier="wheels-specifications" label="Wheel specifications">
                    <PDrilldownLink href="/#engineering">Sizes & dimensions</PDrilldownLink>
                    <PDrilldownLink href="/#engineering">Finishes & details</PDrilldownLink>
                  </PDrilldownItem>
                  <PDrilldownLink href="/#collections">Explore wheels</PDrilldownLink>
                </PDrilldownItem>

                <PDrilldownItem identifier="vehicles" label="Vehicles">
                  <PDrilldownItem identifier="vehicles-fitment" label="Vehicle fitment">
                    <PDrilldownLink href="/#fitment">Find wheels for your vehicle</PDrilldownLink>
                    <PDrilldownLink href="/#fitment">Fitment guidance</PDrilldownLink>
                  </PDrilldownItem>
                  <PDrilldownLink href="/#fitment">Explore vehicle fitment</PDrilldownLink>
                </PDrilldownItem>

                <PDrilldownItem identifier="technology" label="Technology">
                  <PDrilldownItem identifier="technology-engineering" label="Engineering">
                    <PDrilldownLink href="/#engineering">Forging process</PDrilldownLink>
                    <PDrilldownLink href="/#engineering">Materials & construction</PDrilldownLink>
                  </PDrilldownItem>
                  <PDrilldownLink href="/#engineering">Explore technology</PDrilldownLink>
                </PDrilldownItem>

                <PDrilldownItem identifier="story" label="Our Story">
                  <PDrilldownLink href="/#engineering">About Euresis</PDrilldownLink>
                  <PDrilldownLink href="/#engineering">Design philosophy</PDrilldownLink>
                </PDrilldownItem>

                <PDrilldownItem identifier="journal" label="Journal">
                  <PDrilldownLink href="/#collections">Stories & builds</PDrilldownLink>
                  <PDrilldownLink href="/#collections">Latest articles</PDrilldownLink>
                </PDrilldownItem>

                <PDrilldownItem identifier="contact" label="Contact">
                  <PDrilldownLink href="/#fitment">Product enquiry</PDrilldownLink>
                  <PDrilldownLink href="/#fitment">Contact Euresis</PDrilldownLink>
                </PDrilldownItem>
              </PDrilldown>
            </nav>
            <span className="site-header__menu-label">Menu</span>
          </div>
          <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
          <div className="site-header__end">
            <PButtonPure
              className="site-header__control"
              type="button"
              icon="search"
              hideLabel
              aria={{ "aria-label": "Open search", "aria-expanded": searchOpen }}
              onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
            >Search</PButtonPure>
            <PButtonPure
              className="site-header__control"
              type="button"
              icon="user"
              hideLabel
              aria={{ "aria-label": "User account placeholder" }}
            >User</PButtonPure>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="global-overlay global-overlay--search" role="dialog" aria-modal="true" aria-label="Site search">
          <button className="global-overlay__backdrop" type="button" aria-label="Close search" onClick={closePanels} />
          <section className="search-panel">
            <div className="search-panel__top">
              <a className="wordmark" href="/" onClick={closePanels}>EURESIS</a>
              <PButtonPure icon="close" hideLabel type="button" aria={{ "aria-label": "Close search" }} onClick={closePanels}>Close</PButtonPure>
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
                  <a href={item.href} key={item.label} onClick={closePanels}>{item.label}<span aria-hidden="true">↗</span></a>
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
