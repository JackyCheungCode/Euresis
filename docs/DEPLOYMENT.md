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
