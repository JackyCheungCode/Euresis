# Euresis Design System

> Status: v1.0 — foundational design rules
> Reference: Porsche Design System v4, Landing Page template and documented design tokens
> Reference documentation: https://designsystem.porsche.com/v4/templates/landing-page/

## 1. Product and brand direction

Euresis is a premium automotive wheel storefront. The interface should communicate engineering, precision, fitment confidence and material quality. Use Porsche Design System as the design foundation for layout discipline, typography hierarchy, spacing, interaction patterns and accessibility—not as a source of Porsche branding.

- Do not use Porsche logos, crests, proprietary brand assets or imply affiliation.
- Do not copy Porsche's proprietary font files. Use a properly licensed typeface with a neutral sans-serif fallback.
- Product photography and wheel details must remain the visual focus.
- Prioritize product discovery, vehicle fitment and purchase/contact conversion.

## 2. Mandatory PDS v4 usage policy

Porsche Design System v4 is the mandatory UI foundation for Euresis.

- Prefer official PDS React components for all controls and interaction patterns whenever a suitable component exists.
- Use official PDS design tokens as the source of truth for colors, typography, spacing, sizing, borders, radii, shadows and motion.
- Do not recreate an existing PDS control with custom HTML/CSS or introduce another component library for controls.
- Euresis may add thin wrappers in `src/components/ui/` only when they preserve the official component API, behavior, accessibility and visual contract.
- If PDS does not provide a suitable component, use semantic native HTML and accessible browser behavior, styled with available PDS tokens. Record the gap before introducing a project-specific semantic token or custom component.
- Custom CSS is for page layout, responsive composition and Euresis-specific content—not for overriding PDS component internals.
- Do not use arbitrary raw values when an official PDS token exists. Project tokens may be semantic aliases to documented PDS tokens, not a competing token system.
- Confirm token names and component APIs against the installed PDS v4 package documentation; never guess token identifiers.

## 3. Visual principles

1. **Precision over decoration:** restrained surfaces, clear alignment, deliberate whitespace.
2. **Large editorial imagery:** high-resolution wheel and vehicle photography; avoid generic gradients and ornamental UI.
3. **Strong hierarchy:** one dominant headline and one primary action per major section.
4. **Technical credibility:** show specifications in structured, scannable layouts.
5. **Consistent interaction:** use PDS components and predictable states for buttons, links, filters, selectors and cards.
6. **Responsive by design:** mobile layouts are designed intentionally, not merely compressed desktop layouts.

## 4. Color system

Use the official PDS color tokens. Euresis brand accent decisions must be expressed through an approved semantic token mapped to the appropriate documented PDS token or documented extension. Do not hard-code colors in components.

Rules:
- Maintain WCAG AA contrast for text and interactive controls.
- Never use low-contrast decorative text for essential information.
- Use accent color sparingly for primary actions, selected states and key highlights.
- Support light theme first. Add dark theme only when the full component set has defined semantic tokens.

## 5. Typography

Use the official PDS typography tokens and typography components/patterns where available. Do not introduce arbitrary font sizes, weights or line heights in individual controls.

- Use licensed fonts and the PDS-supported font setup.
- Maintain a clear display, heading, body, label and caption hierarchy.
- Use tabular numerals for prices, dimensions and technical specifications where supported.
- Preserve readability at 200% text zoom.

## 6. Layout, grid and spacing

Use PDS layout and spacing tokens wherever available. Project-level layout aliases may be used only when mapped to documented PDS tokens or responsive layout rules.

- Keep a centered responsive content container with consistent horizontal gutters.
- Prefer consistent grid alignment; avoid arbitrary per-section offsets.
- Use the PDS responsive breakpoints or document any deliberate project mapping.

## 7. Landing page structure

The homepage should follow the conversion-focused Landing Page pattern, adapted for wheel commerce:

1. **Header:** Euresis wordmark, Shop Wheels, Collections, Fitment Guide, About, search and cart.
2. **Hero:** full-bleed wheel/vehicle image, concise value proposition, primary CTA (Shop Wheels) and secondary CTA (Find Your Fitment).
3. **Shop by vehicle:** guided make/model/year/trim selection; never imply fitment compatibility without verified data.
4. **Featured collections:** curated wheel families with clear product imagery.
5. **Engineering and materials:** forged/cast construction, finish, load rating and manufacturing details when verified.
6. **Featured products:** price, sizes/finishes, availability and product detail entry.
7. **Fitment confidence:** bolt pattern, diameter, width, offset, center bore and brake-clearance notes as applicable.
8. **Brand story:** concise proof points and workshop/product photography.
9. **Footer:** customer service, shipping/returns, warranty, contact, social and legal links.

The homepage must have a clear primary conversion path. Avoid placing multiple competing primary CTAs in the same section.

## 8. Core component rules

Use PDS official components for controls wherever available.

- **Header/navigation:** use PDS navigation/link patterns where applicable; provide keyboard-accessible menus and compact mobile navigation.
- **Buttons:** use the PDS button component and supported variants/states.
- **Product cards:** compose imagery, text and PDS controls; do not replace PDS control primitives with custom lookalikes.
- **Filters:** use PDS inputs, selects, checkboxes, chips and disclosure patterns where available.
- **Fitment selector:** use PDS form controls with progressive selection, explicit validation and clear no-match/unknown states.
- **Specification tables:** use semantic tables and PDS typography/spacing tokens.
- **Forms:** use PDS form controls where available, persistent labels and accessible validation.
- **Dialogs/drawers:** use PDS dialog/overlay components where available, preserving focus management, escape-to-close and return focus behavior.

## 9. Motion and imagery

- Use PDS motion tokens and documented interaction patterns where available.
- Use motion to communicate state or support navigation, not as decoration.
- Respect `prefers-reduced-motion`.
- Use real product photography, consistent crops and high-quality responsive assets.
- Provide meaningful alt text; mark purely decorative images appropriately.
- Avoid autoplay video with sound.

## 10. Accessibility and quality gates

- Target WCAG 2.2 AA.
- Full keyboard operation and visible focus states.
- Semantic landmarks and correctly ordered headings.
- Text zoom to 200% without loss of content or functionality.
- Form controls have programmatic labels and understandable errors.
- Touch targets are comfortably usable on mobile.
- Check color contrast, responsive overflow, image loading and reduced-motion behavior before release.

## 11. Engineering conventions

- Treat documented PDS design tokens as the single source of truth for UI design values.
- Build thin reusable wrappers only when they add a clear Euresis-specific benefit.
- Keep content, product data and presentation separate.
- Do not hard-code vehicle compatibility; fitment must come from verified structured data.
- Keep all prices, dimensions and units explicit and locale-aware.
- Do not invent PDS component APIs or token names; verify them against the installed v4 package documentation.

## 12. Initial design decisions still open

These require product/brand input before final visual lock:
- Euresis logo and brand accent color.
- Target markets, currencies and languages.
- Initial wheel catalog and verified fitment data source.
- Framework and deployment target.
- Whether the first release supports checkout or lead-generation/contact conversion only.

## 13. Code ownership and component structure

Follow [ARCHITECTURE.md](ARCHITECTURE.md) for the required application structure and [API_AI.md](API_AI.md) for API and AI integration boundaries. Header, Footer, navigation, reusable controls, page sections, domain logic and styles must remain separate modules. Route files compose these modules; they do not become containers for unrelated implementation details.


## 14. PDS v4.10.1 implementation audit — November 2026

The Wheels page retains its approved editorial surface rhythm. This audit does not require making every section the same color.

- Use `colorCanvas` for the page canvas and `colorSurface` for subtle section or component surfaces. Do not use foreground contrast tokens such as `colorContrastLow` as a section background.
- Use `.scheme-dark` and `.scheme-light` as explicit theme scopes for image-led dark sections and light form surfaces. PDS color tokens resolve through the active `color-scheme`.
- Use PDS fluid spacing tokens for major section rhythm; keep Euresis aliases semantic and mapped directly to PDS tokens.
- Keep a single shared content-width alias for editorial sections and catalogue grids.
- Custom display typography is permitted for Euresis brand expression, but must be deliberate, documented, responsive and checked at 200% text zoom. PDS component typography and form controls must not be overridden internally.
- The approved Wheels sequence remains: Hero, Manufacturing, Product Discovery, Vehicle Fitment, Unified Catalogue, Engineering, Global Enquiry.
- A source-code audit is not visual QA. Desktop/mobile browser screenshots, keyboard focus, contrast and 200% text zoom must be checked before calling the page visually accepted.
