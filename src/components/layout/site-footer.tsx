import { PLinkPure } from "@porsche-design-system/components-react/ssr";

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
      { label: "Fitment guidance", href: "/#fitment" },
      { label: "Product enquiry", href: "/#fitment" },
      { label: "Back to top", href: "/#top" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__groups" aria-label="Footer">
          {footerGroups.map((group) => (
            <section className="site-footer__group" key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <PLinkPure icon="none"><a href={link.href}>{link.label}</a></PLinkPure>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className="site-footer__brand">
          <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
          <p>Precision performance wheels</p>
          <span>© {new Date().getFullYear()} Euresis. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
