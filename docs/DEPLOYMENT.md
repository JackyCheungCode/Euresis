# Euresis deployment

## Worker identity

- Worker name: `euresis`
- Account workers.dev subdomain: `xg-y`
- URL: `https://euresis.xg-y.workers.dev`

The account-level workers.dev subdomain is already set to `xg-y`. The Worker name is exactly `euresis`; no additional words are appended.

## Runtime

- Next.js-compatible App Router powered by vinext
- React + TypeScript
- Porsche Design System v4
- Cloudflare Workers with the Cloudflare Vite plugin
- Typed deployment configuration: `cloudflare.config.ts`

## Local development

Requires Node.js 22.18 or later.

```bash
npm install
npm run check
npm run dev
```

## Build and deploy

Authenticate with Cloudflare using `cf auth login`, then:

```bash
npm run build
npm run deploy
```

## Production compatibility gate

Cloudflare recommends vinext for new Next.js-compatible Worker applications. vinext reimplements the Next.js API surface on Vite; it is not the official Next.js runtime and remains under active development. Before production commerce launch, validate route handlers, caching, image optimization, server actions, authentication and every required Next.js API. If a required feature is not supported, evaluate the official Next.js runtime with the OpenNext Cloudflare adapter as a fallback.
