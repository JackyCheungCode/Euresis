# EURESIS Global Design System v1.0

Status: approved baseline  
Scope: global site chrome and shared design foundations only.

## Global layout contract

- `app/layout.tsx` owns the document shell and the single `PorscheDesignSystemProvider`.
- `src/components/layout/site-layout.tsx` is the canonical composition point for the global Header, page content, and Footer.
- Route/page files own only their page content. They must not import or render another Header, navigation instance, or Footer.
- Do not add route-specific copies of global chrome. A future exceptional layout requires explicit design approval.

## Header

- Use the existing EURESIS wordmark and Porsche Design System v4 controls.
- Keep the current three-zone alignment: menu at start, wordmark centered, search and decorative user placeholder at end.
- Header is not sticky or fixed. Preserve the current home/inner-page presentation and natural document scrolling.
- Do not add a scroll-state divider, sticky shadow, or scroll-triggered background transition without approval.
- Preserve the existing search overlay and suggestion behavior. Search is out of scope for routine layout refactors.

## Sidebar / multi-level navigation

- The drilldown navigation is owned by the global Header and rendered once for the whole application.
- Use the existing PDS `PDrilldown`, `PDrilldownItem`, and `PDrilldownLink` primitives; do not replace them with a second component library or custom imitation.
- Keep one consistent interaction model for all nesting levels, including open, back, dismiss, Escape, and keyboard accessibility.
- Keep navigation destinations in the shared navigation definition/component, not duplicated in route pages.
- Menu labels and destinations must only point to implemented routes or verified in-page anchors. Do not create placeholder business routes as part of a layout change.

## Footer

- Render one shared Footer after page content through `SiteLayout`.
- Preserve the approved navigation groups, EURESIS wordmark, descriptor, and copyright line.
- Keep desktop/mobile responsive behavior in the shared layout stylesheet.
- Footer links must target implemented routes or verified anchors.

## Design tokens and components

- Prefer official Porsche Design System v4 components and official PDS Design Tokens.
- Project semantic aliases live in `src/styles/tokens.css`; aliases should reference PDS tokens rather than introduce a competing palette or spacing scale.
- Shared layout styling lives in `src/styles/layout.css`; global CSS imports are centralized in `app/globals.css`.
- Do not introduce another component library, arbitrary one-off design tokens, or duplicate controls already provided by PDS.
- Use semantic HTML only where PDS has no suitable primitive, while retaining PDS tokens and accessibility requirements.

## Change control

- A change to Header, navigation, Footer, global tokens, or shared layout CSS is a site-wide change and must be reviewed for desktop and mobile impact.
- Do not change search behavior during unrelated layout work.
- Do not add cart, checkout, payment, customer-account, or order-management functionality. EURESIS remains an enquiry-led site.
- Do not create new business pages or routes without explicit user authorization.
