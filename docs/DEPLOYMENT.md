# Euresis deployment

## Framework decision

Euresis uses vinext as its Next.js-compatible runtime on Vite, with Cloudflare Workers as the deployment target. It is not using the official Next.js runtime or OpenNext in the current architecture.

## Worker identity

- Worker name: `euresis`
- Account workers.dev subdomain: `xg-y`
- URL: `https://euresis.xg-y.workers.dev`

The account-level workers.dev subdomain is `xg-y`. The Worker name is exactly `euresis`; do not append additional words.

## Stack

- App Router API surface: vinext
- React + TypeScript
- Porsche Design System v4
- Vite + Cloudflare Vite plugin
- Cloudflare Workers native integration via `cloudflare.config.ts`

## Local development

Requires Node.js 22.23.0 or later.

```bash
npm install
npm run check
npm run dev
```

## Build and deploy

Authenticate using `npx cf auth login`, then:

```bash
npm run build
npm run deploy
```

The deploy script invokes the official `@vinext/cloudflare` deployment CLI. The CLI validates the vinext Cloudflare setup, builds the application and deploys the Worker configured in `cloudflare.config.ts`.

## Compatibility and production gate

vinext reimplements the Next.js API surface on Vite. It supports substantial App Router functionality but is not a drop-in replacement for every Next.js feature and remains under active development. Before enabling production checkout, test route handlers, caching, image optimization, Server Actions, authentication, and all required framework APIs. Keep the Worker name in `cloudflare.config.ts` exactly `euresis`.

Official references:
- https://vinext.dev/docs/deploying/cloudflare
- https://github.com/cloudflare/vinext


## Wheel-Size Fitment API

The live vehicle selector uses the Wheel-Size API v2 through the server route at `/api/wheel-size/[resource]`. The API key is read only by the Worker and must never be exposed as a `NEXT_PUBLIC_*` or client-side variable.

Configure the production secret before enabling live queries:

```bash
npx wrangler secret put WHEEL_SIZE_API_KEY
```

Paste the API key when prompted. The Worker must be redeployed after the secret is configured. Without the secret, the route intentionally returns `503 API_KEY_MISSING`; the UI must not fall back to fabricated vehicle data.

The make/model/year/modification catalogue endpoints may be cached within the API plan's limits. Vehicle fitment search is issued only after the visitor clicks **Search wheel fitment**, in line with Wheel-Size's user-initiated search policy. API terms and plan limits apply: https://developer.wheel-size.com/api-tos
