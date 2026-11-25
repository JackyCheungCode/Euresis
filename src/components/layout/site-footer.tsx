import { PLink } from "@porsche-design-system/components-react/ssr";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Wheels & Collections", href: "/#collections" },
      { label: "Vehicle Fitment", href: "/#fitment" },
      { label: "Technology", href: "/#engineering" },
    ],
  },
  {
    title: "Euresis",
    links: [
      { label: "Our Story", href: "/#engineering" },
      { label: "Journal", href: "/#collections" },
      { label: "Contact", href: "/#fitment" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Legal", href: "#legal" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
          <p>Precision performance wheels.<br />Designed with intent.</p>
        </div>
        {footerGroups.map((group) => (
          <nav className="site-footer__group" aria-label={group.title} key={group.title}>
            <span className="eyebrow">{group.title}</span>
            {group.links.map((link) => (
              <PLink href={link.href} key={link.label}>{link.label}</PLink>
            ))}
          </nav>
        ))}
        <div className="site-footer__contact">
          <span className="eyebrow">Start a conversation</span>
          <a href="/#fitment" className="site-footer__contact-link">Product enquiry <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Euresis. All rights reserved.</span>
        <span>Precision performance wheels</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
