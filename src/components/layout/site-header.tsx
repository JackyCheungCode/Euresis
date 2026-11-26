"use client";

import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen,setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Euresis home">EURESIS<span>®</span></a>
      <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(v=>!v)}>
        <span>{menuOpen ? "CLOSE" : "MENU"}</span><span className="menu-lines" aria-hidden="true" />
      </button>
      <nav id="primary-navigation" className={`primary-navigation${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
        <a href="/wheels" onClick={()=>setMenuOpen(false)}>Wheels</a>
        <a href="/engineering" onClick={()=>setMenuOpen(false)}>Engineering</a>
        <a href="/fitment" onClick={()=>setMenuOpen(false)}>Fitment</a>
        <a href="/about" onClick={()=>setMenuOpen(false)}>About</a>
      </nav>
      <a className="header-cta" href="/contact">Enquire <span aria-hidden="true">↗</span></a>
    </header>
  );
}
