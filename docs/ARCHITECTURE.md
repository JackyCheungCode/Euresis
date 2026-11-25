# Euresis application architecture

This document is mandatory for future development. Keep each layer focused; do not place unrelated concerns in a single file.

## Architectural rules

1. Route files compose page-level components. They do not contain large sections, business logic, API calls or page-specific style blocks.
2. Shared controls live in src/components/ui. Header, Footer and navigation live in src/components/layout.
3. Page sections live in src/components/sections/<page>. A section composes shared controls and feature modules.
4. Domain logic and domain types live in src/features/<domain>.
5. Design tokens and global styles live in src/styles. Never scatter global styles across route files.
6. API transport and response/error types live in src/lib/api. Domain API functions live beside their feature in src/features/<domain>/api.
7. AI provider adapters and prompt orchestration live in src/lib/ai. AI keys and provider SDKs are server-only.
8. External integrations live in src/integrations/<provider>; environment validation lives in src/config.
9. Product, price, dimensions and vehicle compatibility must come from validated data, never invented demo values.
10. Shared components require clear names, typed props and a single responsibility.
11. Use Porsche Design System v4 official React components and official design tokens as the default and mandatory UI foundation. Do not recreate controls that PDS already provides.
12. If PDS has no suitable component, use semantic native HTML with accessible behavior and PDS-aligned tokens. Do not introduce a parallel visual system.
13. Do not hard-code design values in components. Use official PDS tokens; Euresis semantic tokens may alias documented PDS tokens where a project-level name is useful.
14. Do not override or imitate PDS component internals with custom CSS. Custom styles may handle layout and composition, not replace the component's documented appearance or behavior.

## Directory map

    app/                         Routes, layouts and route handlers only
    src/components/layout/       Header, Footer, navigation, page shell
    src/components/ui/           PDS-based shared controls and narrow business wrappers
    src/components/sections/     Page-specific composed sections
    src/features/catalog/        Product domain, queries and validation
    src/features/fitment/        Vehicle selection and compatibility rules
    src/features/cart/           Cart state and operations when enabled
    src/features/checkout/       Checkout workflows when enabled
    src/data/                    Static content and typed seed data only
    src/lib/api/                 HTTP client, response envelope and errors
    src/lib/ai/                  Provider interface, adapters and prompt services
    src/integrations/             Payment, analytics, search and external vendors
    src/config/                  Runtime configuration and environment validation
    src/styles/                  Token aliases, base, layout and section composition styles
    docs/                        Architecture, API/AI, design and deployment rules

## Component boundaries

- SiteHeader and SiteFooter are independent components, consumed through the root layout. Pages must not recreate them.
- UI controls are presentation-level and do not know database schemas or provider credentials.
- Use the official PDS component directly when it satisfies the requirement. Add an Euresis wrapper only for a real shared need such as a stable project API, domain-specific composition or consistent analytics hooks.
- Wrappers must preserve the PDS component's supported props, semantics, keyboard behavior, focus behavior and accessibility contract. Do not fork or reimplement the underlying control.
- Feature modules own domain behavior. Components receive typed data and callbacks.
- Section components compose controls for a specific page purpose.
- Route files remain short and declarative.

## Styling boundaries

- PDS official design tokens are the source of truth for component-level design values.
- tokens.css: project semantic aliases only; alias documented PDS tokens where possible. Do not duplicate the full PDS token set or invent a competing scale.
- base.css: reset, document defaults and accessibility behavior.
- components.css: only minimal project-specific composition styles; do not restyle or reproduce PDS controls.
- layout.css: Header, Footer, navigation and shell layout.
- sections.css: page-section-specific layout and composition.
- Use PDS-provided styling integrations as documented by the installed package version.
- Import all styles once from app/globals.css.

## Native control and token compliance

Before adding or changing a control:
1. Check whether PDS v4 provides an official React component for the required interaction.
2. If it does, use that component and its documented props/events/slots.
3. Use the official PDS token for each available color, typography, spacing, sizing, border, radius and motion decision.
4. If a PDS component or token is unavailable, document the gap and use semantic HTML or a narrowly scoped Euresis semantic alias without creating an unrelated design language.
5. Verify keyboard interaction, visible focus, accessible naming, disabled/error states and responsive behavior.

Prohibited:
- Rebuilding an existing PDS control with a custom button/input/select/dialog implementation.
- Arbitrary hex colors, spacing values, radii, shadows or typography values in component styles when a PDS token exists.
- CSS selectors that target PDS internals or override component internals to force a different visual design.
- Adding a second component library for controls without an explicit architecture decision.

## Naming and quality

- React components use PascalCase exports and descriptive kebab-case filenames.
- Hooks use use<Name>; API functions use domain + action names.
- Use server components by default. Add client boundaries only for interactive browser state.
- Route handlers validate input, call a feature service and return a consistent response envelope.
- Add tests for fitment calculations, pricing, API validation and AI safety boundaries before enabling commerce-critical behavior.
