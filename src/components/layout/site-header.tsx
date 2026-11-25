"use client";

import { useEffect, useRef, useState } from "react";
import { PButtonPure } from "@porsche-design-system/components-react/ssr";

const navigation = [
  { id: "wheels", number: "01", label: "Wheels", description: "Explore forged wheel collections.", href: "/#collections", visual: "FORGED COLLECTIONS", detail: "Precision-machined forms. Distinctive finishes. Engineered for the road." },
  { id: "vehicles", number: "02", label: "Vehicles", description: "Find wheels for your vehicle.", href: "/#fitment", visual: "VEHICLE FITMENT", detail: "Start with your vehicle and narrow down the right wheel specification." },
  { id: "technology", number: "03", label: "Technology", description: "Materials, engineering and process.", href: "/#engineering", visual: "ENGINEERED IN DETAIL", detail: "A closer look at materials, construction and manufacturing precision." },
  { id: "story", number: "04", label: "Our Story", description: "The thinking behind Euresis.", href: "/#engineering", visual: "DESIGN WITH INTENT", detail: "A considered approach to form, function and performance." },
  { id: "journal", number: "05", label: "Journal", description: "Stories, details and inspiration.", href: "/#collections", visual: "THE JOURNAL", detail: "Explore product stories, technical perspectives and selected builds." },
  { id: "contact", number: "06", label: "Contact", description: "Talk to our wheel specialists.", href: "/#fitment", visual: "START A CONVERSATION", detail: "Share your vehicle and requirements for a product consultation." },
];

const searchSuggestions = [
  { label: "Forged wheels", href: "/#collections" },
  { label: "Vehicle fitment", href: "/#fitment" },
  { label: "Engineering", href: "/#engineering" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("wheels");
  const [query, setQuery] = useState("");
  const [isHome, setIsHome] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeNavigation = navigation.find((item) => item.id === activeItem) ?? navigation[0];

  useEffect(() => {
    setIsHome(window.location.pathname === "/");
    const updateScroll = () => setIsScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
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
  };

  const filteredSuggestions = searchSuggestions.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <header className={`site-header ${isHome ? "site-header--home" : ""} ${isScrolled ? "site-header--scrolled" : ""}`}>
        <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
        <div className="site-header__actions">
          <PButtonPure
            className="site-header__icon"
            type="button"
            icon="search"
            hideLabel
            aria={{ "aria-label": "Open search", "aria-expanded": searchOpen }}
            onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
          >Search</PButtonPure>
          <span className="site-header__avatar" aria-label="User account, coming later">
            <span aria-hidden="true"> </span>
          </span>
          <PButtonPure
            className="site-header__icon"
            type="button"
            icon={menuOpen ? "close" : "menu-lines"}
            hideLabel
            aria={{ "aria-label": menuOpen ? "Close menu" : "Open menu", "aria-expanded": menuOpen }}
            onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }}
          >{menuOpen ? "Close menu" : "Open menu"}</PButtonPure>
        </div>
      </header>

      {menuOpen && (
        <div className="global-overlay global-overlay--menu" role="dialog" aria-modal="true" aria-label="Main navigation">
          <button className="global-overlay__backdrop" type="button" aria-label="Close menu" onClick={closePanels} />
          <div className="mega-menu">
            <div className="mega-menu__top">
              <a className="wordmark" href="/" onClick={closePanels}>EURESIS</a>
              <PButtonPure icon="close" hideLabel type="button" aria={{ "aria-label": "Close menu" }} onClick={closePanels}>Close</PButtonPure>
            </div>
            <div className="mega-menu__body">
              <nav className="mega-menu__navigation" aria-label="Main navigation">
                <span className="eyebrow">Explore Euresis</span>
                {navigation.map((item) => (
                  <a
                    className={`mega-menu__link ${activeItem === item.id ? "is-active" : ""}`}
                    href={item.href}
                    key={item.id}
                    onMouseEnter={() => setActiveItem(item.id)}
                    onFocus={() => setActiveItem(item.id)}
                    onClick={closePanels}
                  >
                    <span className="mega-menu__number">{item.number}</span>
                    <span className="mega-menu__label">{item.label}</span>
                    <span className="mega-menu__arrow" aria-hidden="true">↗</span>
                  </a>
                ))}
              </nav>
              <section className={`mega-menu__visual mega-menu__visual--${activeItem}`} aria-live="polite">
                <div className="mega-menu__visual-art" aria-hidden="true">
                  <div className="mega-menu__wheel"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
                  <div className="mega-menu__wheel-center">E</div>
                </div>
                <div className="mega-menu__visual-copy">
                  <span className="eyebrow">{activeNavigation.visual}</span>
                  <h2>{activeNavigation.label}</h2>
                  <p>{activeNavigation.detail}</p>
                  <a href={activeNavigation.href} onClick={closePanels}>Discover more <span aria-hidden="true">↗</span></a>
                </div>
              </section>
            </div>
            <div className="mega-menu__bottom">
              <span>Precision performance wheels</span>
              <span>EN / 中文</span>
            </div>
          </div>
        </div>
      )}

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
