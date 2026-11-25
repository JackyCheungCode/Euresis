# Euresis

Premium automotive wheel storefront.

## Stack

- Next.js-compatible App Router powered by [vinext](https://github.com/cloudflare/vinext)
- React + TypeScript
- Porsche Design System v4 React components and Tailwind theme
- Cloudflare Workers through the Cloudflare Vite plugin and typed `cloudflare.config.ts`

## Project identity

- Repository: `JackyCheungCode/Euresis`
- Worker name: `euresis`
- Workers URL: `https://euresis.xg-y.workers.dev`

Do not append additional words to the project or Worker name.

## Local development

Requires Node.js 22.23.0 or later.

```bash
npm install
npm run init:vinext
npm run dev
```

## Build and deploy

```bash
npm run check
npm run typecheck
npm run build
npm run deploy
```

Authenticate with Cloudflare using `cf auth login` before deployment. The official `vinext init` command configures the Cloudflare integration without replacing the Euresis Worker identity.

## Design system

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md). Porsche Design System is used as a component and design-token foundation. Euresis retains its own brand identity and must not use Porsche marks or imply affiliation.

## Deployment note

Cloudflare currently recommends vinext for new Next.js-compatible Worker applications. vinext reimplements the Next.js API surface on Vite; it is not the official Next.js runtime and remains under active development. Validate all commerce-critical routes and framework features before production launch. See [Cloudflare's Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).
