import { PLink } from "@porsche-design-system/components-react/ssr";

const footerLinks = [
  { label: "Collections", href: "#collections" },
  { label: "Fitment guide", href: "#fitment" },
  { label: "Engineering", href: "#engineering" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="wordmark" href="/" aria-label="Euresis home">
        EURESIS
      </a>
      <nav className="site-footer__nav" aria-label="Footer navigation">
        {footerLinks.map((item) => (
          <PLink key={item.href} href={item.href}>
            {item.label}
          </PLink>
        ))}
      </nav>
      <small className="site-footer__copyright">© {new Date().getFullYear()} Euresis</small>
    </footer>
  );
}
