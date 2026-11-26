# Euresis Design System

## Foundation

Euresis uses the public Volvo Cars Web Design System as its implementation reference and CSS foundation, with an independent Euresis brand layer.

- CSS package: `@volvo-cars/css` pinned to `3.3.0`.
- Load `tokens.css` and `styles_all-media.css`; do not load Volvo brand font assets or Volvo logos.
- Use documented semantic HTML patterns and component classes such as `button-filled`, `button-outlined`, and `button-text`.
- Keep Euresis-specific brand colors, typography, imagery, and editorial composition in `src/styles/euresis.css`.
- Do not use Volvo trademarks, logos, vehicle photography, or imply affiliation.

## Principles

1. One dominant action per decision point.
2. Clear hierarchy, generous spacing, restrained typography.
3. Native semantic HTML first; React behavior only where interaction requires it.
4. Keyboard access, visible focus, reduced-motion support, and responsive layouts are required.
5. Keep vehicle fitment and wheel specifications explicit; reference/OE data must not be represented as certified product fitment.

## Current foundation

The home page is the first implementation slice. Wheels, product detail, fitment, account, and inquiry routes are rebuilt in subsequent slices while preserving existing API and Supabase services.

## Licensing note

The package metadata currently reports `UNLICENSED`. Confirm the applicable Volvo Cars design-system usage terms for this commercial deployment before production release. If external commercial use is not authorized, replace the package CSS with an independently authored implementation based on general accessibility and layout principles.
