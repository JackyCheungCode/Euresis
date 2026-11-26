"use client";

import { useState } from "react";
import {
  EButton as Button,
  EIconButton as ButtonPure,
  ECheckbox,
  EDivider,
  EEmailInput,
  ETextInput,
  ELink,
  ERadioGroup,
  ERadioOption,
  ESelect,
  ESelectItem,
  ESegmentedControl,
  ESegmentedItem,
  ETextArea,
} from "@/src/components/ui/carbon-primitives";

const sections = [
  { id: "overview", label: "Overview", number: "00" },
  { id: "colors", label: "Color system", number: "01" },
  { id: "typography", label: "Typography", number: "02" },
  { id: "buttons", label: "Buttons & links", number: "03" },
  { id: "forms", label: "Form controls", number: "04" },
  { id: "navigation", label: "Navigation", number: "05" },
  { id: "feedback", label: "Feedback & status", number: "06" },
  { id: "layout", label: "Layout & spacing", number: "07" },
  { id: "wheel-ui", label: "Wheel components", number: "08" },
];

const colorTokens = [
  { name: "Canvas", token: "--cds-background", role: "Main page background" },
  { name: "Surface", token: "--cds-layer", role: "Cards and grouped content" },
  { name: "Primary", token: "--euresis-black", role: "Primary text and emphasis" },
  { name: "Contrast higher", token: "--euresis-graphite", role: "Strong secondary text" },
  { name: "Contrast high", token: "--euresis-graphite", role: "Body copy" },
  { name: "Contrast medium", token: "--euresis-steel", role: "Muted labels" },
  { name: "Contrast lower", token: "--euresis-line", role: "Borders and dividers" },
  { name: "Info", token: "--cds-support-info", role: "Informational state" },
  { name: "Success", token: "--cds-support-success", role: "Success state" },
  { name: "Warning", token: "--cds-support-warning", role: "Warning state" },
  { name: "Error", token: "--cds-support-error", role: "Error state" },
  { name: "Focus", token: "--cds-focus", role: "Keyboard focus indicator" },
];

const typeSamples = [
  ["5XL", "3rem", "Display / campaign"],
  ["4XL", "2.5rem", "Page title"],
  ["3XL", "2rem", "Section heading"],
  ["2XL", "1.5rem", "Subsection heading"],
  ["XL", "1.25rem", "Card heading"],
  ["LG", "1.125rem", "Lead paragraph"],
  ["MD", "1rem", "Body text"],
  ["SM", "0.875rem", "Supporting text"],
  ["XS", "0.75rem", "Metadata"],
  ["2XS", "0.625rem", "Eyebrow / caption"],
];

const spacingSamples = [
  ["2XS", "0.125rem"],
  ["XS", "0.25rem"],
  ["SM", "0.5rem"],
  ["MD", "1rem"],
  ["LG", "1.5rem"],
  ["XL", "2rem"],
  ["2XL", "2rem"],
];

export function DesignSystemShowcase() {
  const [darkPreview, setDarkPreview] = useState(false);

  return (
    <main className="ds-page">
      <div className="ds-topline">
        <span>DESIGN SYSTEM / COMPONENT LIBRARY</span>
        <span>RELEASE 02 · CARBON v11</span>
      </div>

      <div className="ds-shell">
        <aside className="ds-sidebar" aria-label="Design system sections">
          <div className="ds-sidebar__heading">
            <span className="ds-kicker">INDEX</span>
            <span className="ds-sidebar__count">09 SECTIONS</span>
          </div>
          <nav className="ds-sidebar__nav">
            {sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                <span>{section.number}</span>
                {section.label}
              </a>
            ))}
          </nav>
          <div className="ds-sidebar__note">
            <span className="ds-kicker">SYSTEM PRINCIPLE</span>
            <p>Native Carbon components. Euresis semantic tokens. One consistent UI foundation.</p>
          </div>
        </aside>

        <div className="ds-content">
          <section className="ds-hero" id="overview">
            <div className="ds-hero__copy">
              <p className="ds-kicker">EURESIS / FOUNDATIONS</p>
              <h1>Precision<br />in every detail.</h1>
              <p className="ds-hero__lead">
                A working reference for the visual language and reusable interface components
                behind the Euresis wheel experience.
              </p>
              <div className="ds-hero__meta">
                <span>GLOBAL UI KIT</span><span>·</span><span>RESPONSIVE BY DEFAULT</span><span>·</span><span>ACCESSIBILITY FIRST</span>
              </div>
            </div>
            <div className="ds-hero__visual" aria-hidden="true">
              <div className="ds-wheel ds-wheel--outer"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="ds-wheel ds-wheel--inner"><span>E</span></div>
              <div className="ds-hero__visual-caption">E / 001<br />FORM & FUNCTION</div>
            </div>
          </section>

          <section className="ds-section" id="colors">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">01 / FOUNDATIONS</p><h2>Color system</h2></div>
              <p>Semantic colors are inherited from Carbon theme tokens and automatically adapt to the selected color scheme.</p>
            </div>
            <div className="ds-theme-panel">
              <div><strong>Theme preview</strong><span>Switch the sample surface between light and dark.</span></div>
              <Button variant="secondary" type="button" icon="theme" onClick={() => setDarkPreview((value) => !value)}>
                {darkPreview ? "Preview light" : "Preview dark"}
              </Button>
            </div>
            <div className={`ds-color-preview ${darkPreview ? "scheme-dark" : "scheme-light"}`}>
              <div className="ds-color-preview__label"><span>{darkPreview ? "DARK SCHEME" : "LIGHT SCHEME"}</span><span>LIVE TOKEN PREVIEW</span></div>
              <div className="ds-color-grid">
                {colorTokens.map((token) => (
                  <div className="ds-color-item" key={token.token}>
                    <div className="ds-color-item__swatch" style={{ backgroundColor: `var(${token.token})` }} />
                    <strong>{token.name}</strong>
                    <code>{token.token}</code>
                    <span>{token.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="ds-note">Color values are not redefined in this page. Swatches read the installed Carbon Design System CSS variables.</p>
          </section>

          <section className="ds-section" id="typography">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">02 / FOUNDATIONS</p><h2>Typography</h2></div>
              <p>Type scale and font weights follow the Carbon type scale.</p>
            </div>
            <div className="ds-type-list">
              {typeSamples.map(([size, token, role]) => (
                <div className="ds-type-row" key={size}>
                  <div className="ds-type-meta"><strong>{size}</strong><code>{token}</code><span>{role}</span></div>
                  <div className="ds-type-sample" style={{ fontSize: `var(${token})` }}>Euresis / Precision wheels</div>
                </div>
              ))}
            </div>
            <div className="ds-weight-row">
              <div><span>REGULAR / 400</span><strong>Engineering through simplicity.</strong></div>
              <div><span>SEMIBOLD / 600</span><b>Engineering through simplicity.</b></div>
              <div><span>BOLD / 700</span><strong className="ds-bold">Engineering through simplicity.</strong></div>
            </div>
          </section>

          <section className="ds-section" id="buttons">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">03 / COMPONENTS</p><h2>Buttons & links</h2></div>
              <p>Use buttons for actions and links for navigation. These examples are Carbon React components.</p>
            </div>
            <div className="ds-component-grid">
              <article className="ds-component-card">
                <span className="ds-component-card__label">BUTTON / PRIMARY</span>
                <div className="ds-control-row"><Button>Primary action</Button><Button disabled>Disabled</Button></div>
                <code>Button · variant=primary</code>
              </article>
              <article className="ds-component-card">
                <span className="ds-component-card__label">BUTTON / SECONDARY</span>
                <div className="ds-control-row"><Button variant="secondary">Secondary action</Button><Button variant="secondary" icon="arrow-right">Continue</Button></div>
                <code>Button · variant=secondary</code>
              </article>
              <article className="ds-component-card">
                <span className="ds-component-card__label">BUTTON / PURE</span>
                <div className="ds-control-row"><ButtonPure icon="menu-lines" hideLabel aria={{ "aria-label": "Open menu" }}>Open menu</ButtonPure><ButtonPure icon="arrow-up-right">Explore</ButtonPure></div>
                <code>ButtonPure</code>
              </article>
              <article className="ds-component-card">
                <span className="ds-component-card__label">LINK</span>
                <div className="ds-control-row"><ELink href="#forms">Text link</ELink><ELink href="#wheel-ui" icon="arrow-up-right">Explore wheel UI</ELink></div>
                <code>ELink · Carbon navigation pattern</code>
              </article>
            </div>
          </section>

          <section className="ds-section" id="forms">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">04 / COMPONENTS</p><h2>Form controls</h2></div>
              <p>Form elements are shown as working controls. No data is submitted or stored by this showcase.</p>
            </div>
            <div className="ds-form-grid">
              <div className="ds-form-card">
                <span className="ds-component-card__label">TEXT INPUT</span>
                <ETextInput label="Full name" name="showcase-name" placeholder="Enter your name" />
                <EEmailInput label="Email address" name="showcase-email" placeholder="name@example.com" />
                <ETextInput label="Disabled field" name="showcase-disabled" value="Not editable" disabled />
              </div>
              <div className="ds-form-card">
                <span className="ds-component-card__label">SELECT & TEXTAREA</span>
                <ESelect label="Wheel diameter" name="showcase-diameter">
                  <ESelectItem value="18">18 inch</ESelectItem>
                  <ESelectItem value="19">19 inch</ESelectItem>
                  <ESelectItem value="20">20 inch</ESelectItem>
                  <ESelectItem value="21">21 inch</ESelectItem>
                </ESelect>
                <ETextArea label="Additional notes" name="showcase-notes" placeholder="Enter a message" />
              </div>
              <div className="ds-form-card">
                <span className="ds-component-card__label">CHECKBOX & RADIO</span>
                <ECheckbox label="I would like fitment guidance" name="showcase-guidance" />
                <ECheckbox label="Disabled option" disabled />
                <ERadioGroup label="Preferred finish" name="showcase-finish" value="satin">
                  <ERadioOption value="satin" label="Satin black" />
                  <ERadioOption value="silver" label="Brushed silver" />
                  <ERadioOption value="bronze" label="Bronze" />
                </ERadioGroup>
              </div>
              <div className="ds-form-card">
                <span className="ds-component-card__label">SEGMENTED CONTROL</span>
                <ESegmentedControl label="View mode" name="showcase-view" value="gallery">
                  <ESegmentedItem value="gallery">Gallery</ESegmentedItem>
                  <ESegmentedItem value="list">List</ESegmentedItem>
                  <ESegmentedItem value="specs">Specs</ESegmentedItem>
                </ESegmentedControl>
                <ESegmentedControl label="Wheel size" name="showcase-size" value="20">
                  <ESegmentedItem value="18">18"</ESegmentedItem>
                  <ESegmentedItem value="19">19"</ESegmentedItem>
                  <ESegmentedItem value="20">20"</ESegmentedItem>
                </ESegmentedControl>
              </div>
            </div>
          </section>

          <section className="ds-section" id="navigation">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">05 / PATTERNS</p><h2>Navigation</h2></div>
              <p>Global navigation is rendered by the shared site Header and Footer. This section documents the intended hierarchy.</p>
            </div>
            <div className="ds-nav-demo">
              <div className="ds-nav-demo__bar"><span className="ds-wordmark">EURESIS</span><nav><a href="#overview">Collections</a><a href="#wheel-ui">Fitment</a><a href="#layout">Engineering</a></nav><Button variant="secondary" icon="arrow-up-right">Contact</Button></div>
              <div className="ds-breadcrumb"><span>Home</span><span>/</span><span>Collections</span><span>/</span><strong>Forged series</strong></div>
              <div className="ds-mobile-nav-demo"><span className="ds-wordmark">EURESIS</span><ButtonPure icon="menu-lines" hideLabel aria={{ "aria-label": "Open navigation preview" }}>Open navigation</ButtonPure></div>
            </div>
            <div className="ds-note">The page-level index on the left is a showcase-only sidebar. It is not added to the public site navigation.</div>
          </section>

          <section className="ds-section" id="feedback">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">06 / COMPONENTS</p><h2>Feedback & status</h2></div>
              <p>Semantic state colors should communicate status, never act as decoration.</p>
            </div>
            <div className="ds-status-grid">
              <div className="ds-status-card ds-status-card--info"><span>INFORMATION</span><strong>Fitment details available</strong><p>Review the vehicle specifications before choosing a wheel.</p></div>
              <div className="ds-status-card ds-status-card--success"><span>SUCCESS</span><strong>Compatibility confirmed</strong><p>The selected wheel specification matches the vehicle.</p></div>
              <div className="ds-status-card ds-status-card--warning"><span>WARNING</span><strong>Additional verification</strong><p>Offset and brake clearance require confirmation.</p></div>
              <div className="ds-status-card ds-status-card--error"><span>ERROR</span><strong>Incomplete information</strong><p>Some required vehicle details are missing.</p></div>
            </div>
          </section>

          <section className="ds-section" id="layout">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">07 / FOUNDATIONS</p><h2>Layout & spacing</h2></div>
              <p>Spacing, radius and elevation follow Carbon foundations with Euresis brand refinements.</p>
            </div>
            <div className="ds-spacing-list">
              {spacingSamples.map(([name, token]) => (
                <div className="ds-spacing-row" key={name}>
                  <strong>{name}</strong><code>{token}</code><div className="ds-spacing-bar" style={{ width: `var(${token})` }} /><span>var({token})</span>
                </div>
              ))}
            </div>
            <div className="ds-layout-examples">
              <div><span>CONTENT / NARROW</span><strong>Readable text measure</strong><p>Long-form descriptions and technical notes.</p></div>
              <div><span>CONTENT / WIDE</span><strong>Product and collection grid</strong><p>Responsive columns with consistent gutters.</p></div>
              <div><span>CONTENT / FULL</span><strong>Immersive campaign sections</strong><p>Large visual areas with controlled text width.</p></div>
            </div>
            <div className="ds-token-chips"><span>RADIUS / SM <b>var(0)</b></span><span>RADIUS / MD <b>var(4px)</b></span><span>RADIUS / LG <b>var(8px)</b></span><span>SHADOW / MD <b>var(0 2px 6px rgba(0,0,0,.16))</b></span></div>
          </section>

          <section className="ds-section" id="wheel-ui">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">08 / EURESIS PATTERNS</p><h2>Wheel components</h2></div>
              <p>Business-specific presentation patterns built around the Carbon foundation. These are not checkout or cart components.</p>
            </div>
            <div className="ds-wheel-grid">
              <article className="ds-wheel-card">
                <div className="ds-wheel-card__art"><div className="ds-wheel-art"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span>01 / FORGED</span></div>
                <div className="ds-wheel-card__body"><div><strong>RS / 07</strong><span>Monoblock · Forged aluminium</span></div><ELink href="#forms" icon="arrow-up-right">View specifications</ELink></div>
              </article>
              <article className="ds-spec-card">
                <span className="ds-component-card__label">TECHNICAL SPECIFICATION</span>
                <h3>RS / 07</h3>
                <div><span>Diameter</span><strong>20 × 9.0J</strong></div>
                <div><span>Bolt pattern</span><strong>5 × 112</strong></div>
                <div><span>Offset</span><strong>ET 35</strong></div>
                <div><span>Construction</span><strong>Monoblock forged</strong></div>
                <div><span>Finish</span><strong>Satin graphite</strong></div>
              </article>
            </div>
            <div className="ds-inquiry-strip"><div><span className="ds-kicker">FITMENT / CONSULTATION</span><h3>Need help confirming compatibility?</h3><p>Use an enquiry-led flow for vehicle details and technical verification.</p></div><Button icon="arrow-up-right">Request fitment advice</Button></div>
          </section>

          <footer className="ds-page-footer">
            <span>EURESIS / DESIGN SYSTEM</span><span>INTERNAL REVIEW PAGE · NOT A COMMERCE FLOW</span>
            <a href="#top">BACK TO TOP ↑</a>
          </footer>
        </div>
      </div>
    </main>
  );
}
