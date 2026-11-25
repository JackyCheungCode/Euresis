# Euresis Design System

> Status: v1.0 — foundational design rules  
> Reference: Porsche Design System v4, Landing Page template and documented design tokens  
> Reference documentation: https://designsystem.porsche.com/v4/templates/landing-page/

## 1. Product and brand direction

Euresis is a premium automotive wheel storefront. The interface should communicate engineering, precision, fitment confidence and material quality. Use Porsche Design System as a design reference for layout discipline, typography hierarchy, spacing, interaction patterns and accessibility—not as a source of Porsche branding.

- Do not use Porsche logos, crests, proprietary brand assets or imply affiliation.
- Do not copy Porsche's proprietary font files. Use a properly licensed typeface with a neutral sans-serif fallback.
- Product photography and wheel details must remain the visual focus.
- Prioritize product discovery, vehicle fitment and purchase/contact conversion.

## 2. Visual principles

1. **Precision over decoration:** restrained surfaces, clear alignment, deliberate whitespace.
2. **Large editorial imagery:** high-resolution wheel and vehicle photography; avoid generic gradients and ornamental UI.
3. **Strong hierarchy:** one dominant headline and one primary action per major section.
4. **Technical credibility:** show specifications in structured, scannable layouts.
5. **Consistent interaction:** buttons, links, filters, selectors and cards share predictable states.
6. **Responsive by design:** mobile layouts are designed intentionally, not merely compressed desktop layouts.

## 3. Color system

Start with a neutral, high-contrast palette inspired by the reference system. Keep brand accent configurable until the Euresis brand identity is finalized.

| Token | Initial value | Usage |
|---|---|---|
| `--color-canvas` | `#FFFFFF` | Main page background |
| `--color-surface` | `#F2F2F2` | Secondary surfaces and cards |
| `--color-primary` | `#111111` | Primary text and dark surfaces |
| `--color-secondary` | `#5F6368` | Supporting text |
| `--color-border` | `#D9D9D9` | Dividers and subtle outlines |
| `--color-accent` | TBD | Euresis brand action/highlight |
| `--color-success` | `#237A3B` | Success feedback |
| `--color-warning` | `#A85B00` | Warning feedback |
| `--color-error` | `#B4232C` | Error feedback |

Rules:
- Maintain WCAG AA contrast for text and interactive controls.
- Never use low-contrast decorative text for essential information.
- Accent color should be used sparingly for primary actions, selected states and key highlights.
- Support light theme first. Add dark theme only when the full component set has defined semantic tokens.

## 4. Typography

- Use a licensed modern sans-serif such as Inter, or the platform sans-serif stack until a brand font is selected.
- Use a clear scale: display, heading 1–3, body, label and caption.
- Headlines are concise, high contrast and editorial; body copy remains highly legible.
- Use tabular numerals for prices, dimensions and technical specifications where supported.
- Use relative units and preserve readability at 200% text zoom.

Suggested responsive scale:
- Display: `clamp(2.75rem, 6vw, 6rem)`
- H1: `clamp(2.25rem, 4vw, 4.5rem)`
- H2: `clamp(1.75rem, 3vw, 3rem)`
- H3: `clamp(1.25rem, 2vw, 2rem)`
- Body: `1rem` to `1.125rem`
- Caption: `0.8125rem` to `0.875rem`

## 5. Layout, grid and spacing

Use a centered responsive content container with consistent horizontal gutters. Prefer fluid spacing for section-level rhythm and a compact fixed scale for component internals.

Reference breakpoints from the Porsche v4 token documentation:
- XS: 480px
- SM: 760px
- MD: 1000px
- LG: 1300px
- XL: 1760px
- 2XL: 1920px

Implementation may consolidate breakpoints where the chosen framework requires it, but behavior must remain responsive across these ranges.

Spacing scale:
- 4px, 8px, 16px, 32px, 48px, 80px
- Section spacing should scale fluidly with viewport size.
- Use consistent grid alignment; avoid arbitrary per-section offsets.

## 6. Landing page structure

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

## 7. Core component rules

- **Header/navigation:** clear active state, keyboard-accessible menus, compact mobile navigation.
- **Buttons:** primary, secondary and text variants; define default, hover, focus-visible, active, disabled and loading states.
- **Product cards:** consistent image ratio, wheel name, collection, starting price, finish options and product link.
- **Filters:** visible selected filters, removable chips, clear-all action and usable mobile filter panel.
- **Fitment selector:** progressive selection, explicit validation and clear handling of no-match/unknown states.
- **Specification tables:** aligned labels and values; units always explicit.
- **Forms:** persistent labels, inline validation, accessible error messaging.
- **Dialogs/drawers:** focus management, escape-to-close and return focus to trigger.

## 8. Motion and imagery

- Use motion to communicate state or support navigation, not as decoration.
- Keep transitions short and restrained; respect `prefers-reduced-motion`.
- Use real product photography, consistent crops and high-quality responsive assets.
- Provide meaningful alt text; mark purely decorative images appropriately.
- Avoid autoplay video with sound.

## 9. Accessibility and quality gates

- Target WCAG 2.2 AA.
- Full keyboard operation and visible focus states.
- Semantic landmarks and correctly ordered headings.
- Text zoom to 200% without loss of content or functionality.
- Form controls have programmatic labels and understandable errors.
- Touch targets are comfortably usable on mobile.
- Check color contrast, responsive overflow, image loading and reduced-motion behavior before release.

## 10. Engineering conventions

- Treat design tokens as the single source of truth; do not scatter raw colors, spacing and radii through components.
- Build reusable components before duplicating page-specific UI.
- Keep content, product data and presentation separate.
- Do not hard-code vehicle compatibility; fitment must come from verified structured data.
- Keep all prices, dimensions and units explicit and locale-aware.
- Use the Porsche Design System documentation as a reference, and pin any adopted package/version after the application stack is selected.

## 11. Initial design decisions still open

These require product/brand input before final visual lock:
- Euresis logo and brand accent color.
- Target markets, currencies and languages.
- Initial wheel catalog and verified fitment data source.
- Framework and deployment target.
- Whether the first release supports checkout or lead-generation/contact conversion only.
