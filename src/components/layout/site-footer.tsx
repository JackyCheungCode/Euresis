const footerLinks = [
  { label: "Collections", href: "/collections" },
  { label: "Fitment guide", href: "/fitment" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
      <nav aria-label="Footer navigation">
        {footerLinks.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <span>© {new Date().getFullYear()} Euresis</span>
    </footer>
  );
}
