"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Search } from "@carbon/react";
import { Close, Menu, Search as SearchIcon } from "@carbon/react/icons";

const navigation = [
  { label: "Wheels", href: "/wheels" },
  { label: "Collections", href: "/wheels#collections" },
  { label: "Vehicle fitment", href: "/wheels#vehicle-fitment" },
  { label: "Engineering", href: "/#engineering" },
  { label: "Our story", href: "/#engineering" },
  { label: "Contact", href: "/wheels#inquiry" },
];
const searchSuggestions = [
  { label: "Forged wheels", href: "/wheels#catalogue" },
  { label: "Cast wheels", href: "/wheels#catalogue" },
  { label: "Wheel collections", href: "/wheels#collections" },
  { label: "Vehicle fitment", href: "/wheels#vehicle-fitment" },
  { label: "Engineering", href: "/#engineering" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  const filtered = searchSuggestions.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__start">
          <Button kind="ghost" size="md" hasIconOnly renderIcon={Menu} iconDescription="Open menu" onClick={() => { setMenuOpen(true); setSearchOpen(false); }} />
        </div>
        <a className="site-header__wordmark" href="/" aria-label="Euresis home">EURESIS</a>
        <div className="site-header__end">
          <a className="site-header__account-link" href="/account" aria-label="Customer account" title="Customer account">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
          </a>
          <Button kind="ghost" size="md" hasIconOnly renderIcon={SearchIcon} iconDescription="Open search" onClick={() => { setSearchOpen(true); setMenuOpen(false); }} />
        </div>
      </div>
    </header>
    {menuOpen && <div className="global-overlay global-overlay--menu" role="dialog" aria-modal="true" aria-label="Main navigation">
      <section className="menu-panel">
        <div className="search-panel__top"><a className="site-header__wordmark" href="/">EURESIS</a><Button kind="ghost" hasIconOnly renderIcon={Close} iconDescription="Close menu" onClick={() => setMenuOpen(false)} /></div>
        <nav className="menu-panel__links" aria-label="Main navigation">{navigation.map((item) => <a href={item.href} key={item.label} onClick={() => setMenuOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>)}</nav>
      </section>
    </div>}
    {searchOpen && <div className="global-overlay global-overlay--search" role="dialog" aria-modal="true" aria-label="Site search">
      <section className="search-panel">
        <div className="search-panel__top"><a className="site-header__wordmark" href="/" onClick={() => setSearchOpen(false)}>EURESIS</a><Button kind="ghost" hasIconOnly renderIcon={Close} iconDescription="Close search" onClick={() => setSearchOpen(false)} /></div>
        <div className="search-panel__content">
          <span className="eyebrow">Search Euresis</span><h2>What are you looking for?</h2>
          <Search ref={searchRef as any} labelText="Search wheels, series and vehicles" placeholder="Search wheels, series, vehicle..." value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
          <div className="search-panel__results"><span className="eyebrow">{query ? "Suggested destinations" : "Popular searches"}</span>
            {filtered.length ? filtered.map((item) => <a href={item.href} key={item.label} onClick={() => setSearchOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>) : <p className="search-panel__empty">No matching suggestions. Catalogue-wide search can be connected when product data is ready.</p>}
          </div>
          <p className="search-panel__note">Search suggestions navigate to existing site sections. Catalogue-wide search will be connected when product data is available.</p>
        </div>
      </section>
    </div>}
  </>;
}
