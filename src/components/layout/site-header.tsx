"use client";

import { useEffect, useRef, useState } from "react";
import { PButtonPure } from "@porsche-design-system/components-react/ssr";

const navigation = [
  { id: "wheels", label: "Wheels", href: "/#collections", children: [{ label: "Collections", href: "/#collections" }, { label: "Wheel specifications", href: "/#engineering" }] },
  { id: "vehicles", label: "Vehicles", href: "/#fitment", children: [{ label: "Vehicle fitment", href: "/#fitment" }] },
  { id: "technology", label: "Technology", href: "/#engineering", children: [{ label: "Engineering", href: "/#engineering" }, { label: "Materials & construction", href: "/#engineering" }] },
  { id: "story", label: "Our Story", href: "/#engineering", children: [{ label: "About Euresis", href: "/#engineering" }] },
  { id: "journal", label: "Journal", href: "/#collections", children: [{ label: "Stories & builds", href: "/#collections" }] },
  { id: "contact", label: "Contact", href: "/#fitment", children: [{ label: "Product enquiry", href: "/#fitment" }] },
];

const searchSuggestions = [
  { label: "Forged wheels", href: "/#collections" },
  { label: "Vehicle fitment", href: "/#fitment" },
  { label: "Engineering", href: "/#engineering" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isHome, setIsHome] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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
        setActiveItem(null);
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
    setActiveItem(null);
  };

  const filteredSuggestions = searchSuggestions.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <header className={`site-header ${isHome ? "site-header--home" : ""} ${isScrolled ? "site-header--scrolled" : ""}`}>
        <div className="site-header__inner">
          <div className="site-header__start">
            <PButtonPure
              className={`site-header__control ${isHome && !isScrolled ? "site-header__control--hero" : ""}`}
              type="button"
              icon="menu-lines"
              hideLabel
              aria={{ "aria-label": "Open menu", "aria-haspopup": "dialog", "aria-expanded": menuOpen }}
              onClick={() => { setMenuOpen(true); setSearchOpen(false); }}
            >Menu</PButtonPure>
            <span className="site-header__menu-label">Menu</span>
          </div>
          <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
          <div className="site-header__end">
            <PButtonPure
              className={`site-header__control ${isHome && !isScrolled ? "site-header__control--hero" : ""}`}
              type="button"
              icon="search"
              hideLabel
              aria={{ "aria-label": "Open search", "aria-expanded": searchOpen }}
              onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
            >Search</PButtonPure>
            <PButtonPure
              className={`site-header__control ${isHome && !isScrolled ? "site-header__control--hero" : ""}`}
              type="button"
              icon="user"
              hideLabel
              aria={{ "aria-label": "User account placeholder" }}
            >User</PButtonPure>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="global-overlay global-overlay--menu" role="dialog" aria-modal="true" aria-label="Main navigation">
          <button className="global-overlay__backdrop" type="button" aria-label="Close menu" onClick={closePanels} />
          <aside className="navigation-panel">
            <div className="navigation-panel__header">
              <span className="navigation-panel__heading">Menu</span>
              <PButtonPure icon="close" hideLabel type="button" aria={{ "aria-label": "Close menu" }} onClick={closePanels}>Close</PButtonPure>
            </div>
            <nav className="navigation-panel__nav" aria-label="Main">
              {navigation.map((item) => (
                <div className="navigation-panel__group" key={item.id}>
                  <button
                    className={`navigation-panel__item ${activeItem === item.id ? "is-active" : ""}`}
                    type="button"
                    aria-expanded={activeItem === item.id}
                    onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                  >
                    <span>{item.label}</span>
                    <span className="navigation-panel__chevron" aria-hidden="true">{activeItem === item.id ? "−" : "+"}</span>
                  </button>
                  {activeItem === item.id && (
                    <div className="navigation-panel__children">
                      {item.children.map((child) => (
                        <a href={child.href} key={child.label} onClick={closePanels}>{child.label}</a>
                      ))}
                      <a className="navigation-panel__all" href={item.href} onClick={closePanels}>Explore {item.label}</a>
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="navigation-panel__footer">
              <span>Precision performance wheels</span>
              <a href="/#fitment" onClick={closePanels}>Product enquiry <span aria-hidden="true">↗</span></a>
            </div>
          </aside>
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
