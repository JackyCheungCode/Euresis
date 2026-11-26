# EURESIS Global Design System v2.0

Status: active migration baseline  
Foundation: IBM Carbon Design System v11 / Carbon React  
Brand layer: Euresis semantic tokens and automotive marketing components

## Design principles

- Carbon React is the only shared UI component foundation.
- Euresis owns the brand expression: typography scale, image direction, campaign layouts, wheel product presentation and editorial composition.
- Do not reproduce IBM's product UI visual language as the storefront brand. Use Carbon's accessibility, interaction, grid and component behavior while retaining Euresis' monochrome automotive identity.
- Keep the site enquiry-led. Do not introduce cart, checkout, payment or pricing flows without explicit product approval.

## Global layout contract

- `app/layout.tsx` owns the document shell and Carbon Sass foundation.
- `src/components/layout/site-layout.tsx` is the canonical composition point for the global Header, compact vehicle fitment bar, page content and Footer.
- Route/page files own only their page content. They must not render duplicate global chrome.
- Shared components live under `src/components/layout`, `src/components/ui` and feature-specific component directories.

## Header and navigation

- Use Carbon React controls for interactive actions and Euresis-owned layout styling for the three-zone header: menu, centered wordmark, account/search.
- Keep menu and search overlays keyboard accessible, dismissible with Escape and correctly labelled.
- Navigation destinations must point to implemented routes or verified in-page anchors.
- Do not introduce a sticky header or scroll-state behavior unless separately approved.

## Vehicle fitment

- The compact global vehicle selector remains directly below the Header.
- Preserve market, make, model, year and trim selection; multiple saved vehicle specifications; and local persistence.
- Vehicle reference data from Wheel-Size is not Euresis product fitment certification. Product recommendations require an explicit mapping to published Euresis variants and technical verification.

## Carbon component usage

- Install and import shared controls from `@carbon/react`; icons from `@carbon/react/icons`.
- Compile the Carbon Sass foundation from `app/carbon.scss`.
- Prefer Carbon Button, Select, TextInput, TextArea, Checkbox, RadioButtonGroup, ToggleGroup, Link, Search and modal/navigation patterns where appropriate.
- Use semantic HTML for brand-specific marketing compositions where Carbon has no dedicated marketing component. Do not force product Hero, wheel gallery, campaign Banner or editorial sections into generic enterprise cards.
- Shared Carbon compatibility primitives live in `src/components/ui/carbon-primitives.tsx`; new components should use Carbon APIs directly rather than adding new PDS-style aliases.

## Tokens and styling

- Euresis semantic tokens are maintained in `src/styles/tokens.css`.
- Carbon styles are loaded from `app/carbon.scss`; application styles are centralized in `app/globals.css`.
- Use Carbon theme tokens for component surfaces, borders, text, support states and focus indicators. Use Euresis tokens for brand-specific spacing, layout, monochrome surfaces and editorial rhythm.
- Avoid raw one-off values when an existing Carbon or Euresis token expresses the same intent.
- Maintain visible keyboard focus, reduced-motion support, responsive layouts and adequate color contrast.

## Footer

- Render one shared Footer after page content through `SiteLayout`.
- Preserve the Euresis wordmark, descriptor, navigation groups and copyright line.
- Footer links must target implemented routes or verified anchors.

## Change control

- Header, navigation, Footer, global tokens, Sass foundation and shared layout CSS are site-wide changes.
- Review desktop and mobile behavior before merging.
- Preserve Supabase, Wheel-Size API, customer account, inquiry review and existing business logic during design-system work.
- Do not claim a vehicle fitment is verified unless product variant dimensions and all relevant clearance requirements have been technically reviewed.
