import { PLink } from "@porsche-design-system/components-react/ssr";

const navigation = [
  { label: "Collections", href: "/collections" },
  { label: "Fitment", href: "/fitment" },
  { label: "Engineering", href: "/engineering" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Euresis home">EURESIS</a>
      <nav aria-label="Main navigation">
        {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <PLink className="header-action" href="/collections" icon="arrow-up-right">Explore wheels</PLink>
    </header>
  );
}
