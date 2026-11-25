"use client";

import { useState } from "react";
import {
  PButton,
  PButtonPure,
  PCheckbox,
  PDivider,
  PInputEmail,
  PInputText,
  PLink,
  PRadioGroup,
  PRadioGroupOption,
  PSelect,
  PSelectOption,
  PSegmentedControl,
  PSegmentedControlItem,
  PTextarea,
} from "@porsche-design-system/components-react";

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
  { name: "Canvas", token: "--p-color-canvas", role: "Main page background" },
  { name: "Surface", token: "--p-color-surface", role: "Cards and grouped content" },
  { name: "Primary", token: "--p-color-primary", role: "Primary text and emphasis" },
  { name: "Contrast higher", token: "--p-color-contrast-higher", role: "Strong secondary text" },
  { name: "Contrast high", token: "--p-color-contrast-high", role: "Body copy" },
  { name: "Contrast medium", token: "--p-color-contrast-medium", role: "Muted labels" },
  { name: "Contrast lower", token: "--p-color-contrast-lower", role: "Borders and dividers" },
  { name: "Info", token: "--p-color-info", role: "Informational state" },
  { name: "Success", token: "--p-color-success", role: "Success state" },
  { name: "Warning", token: "--p-color-warning", role: "Warning state" },
  { name: "Error", token: "--p-color-error", role: "Error state" },
  { name: "Focus", token: "--p-color-focus", role: "Keyboard focus indicator" },
];

const typeSamples = [
  ["5XL", "--p-typescale-5xl", "Display / campaign"],
  ["4XL", "--p-typescale-4xl", "Page title"],
  ["3XL", "--p-typescale-3xl", "Section heading"],
  ["2XL", "--p-typescale-2xl", "Subsection heading"],
  ["XL", "--p-typescale-xl", "Card heading"],
  ["LG", "--p-typescale-lg", "Lead paragraph"],
  ["MD", "--p-typescale-md", "Body text"],
  ["SM", "--p-typescale-sm", "Supporting text"],
  ["XS", "--p-typescale-xs", "Metadata"],
  ["2XS", "--p-typescale-2xs", "Eyebrow / caption"],
];

const spacingSamples = [
  ["2XS", "--p-spacing-static-2xs"],
  ["XS", "--p-spacing-static-xs"],
  ["SM", "--p-spacing-static-sm"],
  ["MD", "--p-spacing-static-md"],
  ["LG", "--p-spacing-static-lg"],
  ["XL", "--p-spacing-static-xl"],
  ["2XL", "--p-spacing-static-2xl"],
];

export function DesignSystemShowcase() {
  const [darkPreview, setDarkPreview] = useState(false);

  return (
    <main className="ds-page">
      <div className="ds-topline">
        <span>DESIGN SYSTEM / COMPONENT LIBRARY</span>
        <span>RELEASE 01 · PDS 4.10.1</span>
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
            <p>Native PDS components. Official design tokens. No parallel UI library.</p>
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
              <p>Semantic colors are inherited from PDS tokens and automatically adapt to the selected color scheme.</p>
            </div>
            <div className="ds-theme-panel">
              <div><strong>Theme preview</strong><span>Switch the sample surface between light and dark.</span></div>
              <PButton variant="secondary" type="button" icon="theme" onClick={() => setDarkPreview((value) => !value)}>
                {darkPreview ? "Preview light" : "Preview dark"}
              </PButton>
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
            <p className="ds-note">Color values are not redefined in this page. Swatches read the installed Porsche Design System CSS variables.</p>
          </section>

          <section className="ds-section" id="typography">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">02 / FOUNDATIONS</p><h2>Typography</h2></div>
              <p>Type scale and font weights follow the installed PDS typography tokens.</p>
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
              <p>Use buttons for actions and links for navigation. These examples are native PDS React components.</p>
            </div>
            <div className="ds-component-grid">
              <article className="ds-component-card">
                <span className="ds-component-card__label">BUTTON / PRIMARY</span>
                <div className="ds-control-row"><PButton>Primary action</PButton><PButton disabled>Disabled</PButton></div>
                <code>PButton · variant=primary</code>
              </article>
              <article className="ds-component-card">
                <span className="ds-component-card__label">BUTTON / SECONDARY</span>
                <div className="ds-control-row"><PButton variant="secondary">Secondary action</PButton><PButton variant="secondary" icon="arrow-right">Continue</PButton></div>
                <code>PButton · variant=secondary</code>
              </article>
              <article className="ds-component-card">
                <span className="ds-component-card__label">BUTTON / PURE</span>
                <div className="ds-control-row"><PButtonPure icon="menu-lines" hideLabel aria={{ "aria-label": "Open menu" }}>Open menu</PButtonPure><PButtonPure icon="arrow-up-right">Explore</PButtonPure></div>
                <code>PButtonPure</code>
              </article>
              <article className="ds-component-card">
                <span className="ds-component-card__label">LINK</span>
                <div className="ds-control-row"><PLink href="#forms">Text link</PLink><PLink href="#wheel-ui" icon="arrow-up-right">Explore wheel UI</PLink></div>
                <code>PLink · PDS navigation pattern</code>
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
                <PInputText label="Full name" name="showcase-name" placeholder="Enter your name" />
                <PInputEmail label="Email address" name="showcase-email" placeholder="name@example.com" />
                <PInputText label="Disabled field" name="showcase-disabled" value="Not editable" disabled />
              </div>
              <div className="ds-form-card">
                <span className="ds-component-card__label">SELECT & TEXTAREA</span>
                <PSelect label="Wheel diameter" name="showcase-diameter">
                  <PSelectOption value="18">18 inch</PSelectOption>
                  <PSelectOption value="19">19 inch</PSelectOption>
                  <PSelectOption value="20">20 inch</PSelectOption>
                  <PSelectOption value="21">21 inch</PSelectOption>
                </PSelect>
                <PTextarea label="Additional notes" name="showcase-notes" placeholder="Enter a message" />
              </div>
              <div className="ds-form-card">
                <span className="ds-component-card__label">CHECKBOX & RADIO</span>
                <PCheckbox label="I would like fitment guidance" name="showcase-guidance" />
                <PCheckbox label="Disabled option" disabled />
                <PRadioGroup label="Preferred finish" name="showcase-finish" value="satin">
                  <PRadioGroupOption value="satin" label="Satin black" />
                  <PRadioGroupOption value="silver" label="Brushed silver" />
                  <PRadioGroupOption value="bronze" label="Bronze" />
                </PRadioGroup>
              </div>
              <div className="ds-form-card">
                <span className="ds-component-card__label">SEGMENTED CONTROL</span>
                <PSegmentedControl label="View mode" name="showcase-view" value="gallery">
                  <PSegmentedControlItem value="gallery">Gallery</PSegmentedControlItem>
                  <PSegmentedControlItem value="list">List</PSegmentedControlItem>
                  <PSegmentedControlItem value="specs">Specs</PSegmentedControlItem>
                </PSegmentedControl>
                <PSegmentedControl label="Wheel size" name="showcase-size" value="20">
                  <PSegmentedControlItem value="18">18"</PSegmentedControlItem>
                  <PSegmentedControlItem value="19">19"</PSegmentedControlItem>
                  <PSegmentedControlItem value="20">20"</PSegmentedControlItem>
                </PSegmentedControl>
              </div>
            </div>
          </section>

          <section className="ds-section" id="navigation">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">05 / PATTERNS</p><h2>Navigation</h2></div>
              <p>Global navigation is rendered by the shared site Header and Footer. This section documents the intended hierarchy.</p>
            </div>
            <div className="ds-nav-demo">
              <div className="ds-nav-demo__bar"><span className="ds-wordmark">EURESIS</span><nav><a href="#overview">Collections</a><a href="#wheel-ui">Fitment</a><a href="#layout">Engineering</a></nav><PButton variant="secondary" icon="arrow-up-right">Contact</PButton></div>
              <div className="ds-breadcrumb"><span>Home</span><span>/</span><span>Collections</span><span>/</span><strong>Forged series</strong></div>
              <div className="ds-mobile-nav-demo"><span className="ds-wordmark">EURESIS</span><PButtonPure icon="menu-lines" hideLabel aria={{ "aria-label": "Open navigation preview" }}>Open navigation</PButtonPure></div>
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
              <p>Spacing, radius, and shadow values are consumed directly from PDS tokens.</p>
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
            <div className="ds-token-chips"><span>RADIUS / SM <b>var(--p-radius-sm)</b></span><span>RADIUS / MD <b>var(--p-radius-md)</b></span><span>RADIUS / LG <b>var(--p-radius-lg)</b></span><span>SHADOW / MD <b>var(--p-shadow-md)</b></span></div>
          </section>

          <section className="ds-section" id="wheel-ui">
            <div className="ds-section__heading">
              <div><p className="ds-kicker">08 / EURESIS PATTERNS</p><h2>Wheel components</h2></div>
              <p>Business-specific presentation patterns built around the PDS foundation. These are not checkout or cart components.</p>
            </div>
            <div className="ds-wheel-grid">
              <article className="ds-wheel-card">
                <div className="ds-wheel-card__art"><div className="ds-wheel-art"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span>01 / FORGED</span></div>
                <div className="ds-wheel-card__body"><div><strong>RS / 07</strong><span>Monoblock · Forged aluminium</span></div><PLink href="#forms" icon="arrow-up-right">View specifications</PLink></div>
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
            <div className="ds-inquiry-strip"><div><span className="ds-kicker">FITMENT / CONSULTATION</span><h3>Need help confirming compatibility?</h3><p>Use an enquiry-led flow for vehicle details and technical verification.</p></div><PButton icon="arrow-up-right">Request fitment advice</PButton></div>
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
