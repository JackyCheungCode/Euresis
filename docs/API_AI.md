# API and AI integration conventions

## API layers

- Browser-safe transport: src/lib/api/client.ts handles JSON, response envelopes and normalized errors only.
- Domain API: src/features/<domain>/api/*.ts exposes typed operations such as product listing and fitment lookup.
- Server services: src/features/<domain>/services/*.ts contain business rules and orchestrate data access.
- Route handlers: app/api/<resource>/route.ts validate requests, invoke services and map results to HTTP responses.
- Data adapters: src/integrations/<provider> or a domain repository. Database credentials never enter browser code.

## Response contract

Success: { "data": T, "requestId"?: string }
Failure: { "error": { "code": string, "message": string, "details"?: unknown }, "requestId"?: string }

Use appropriate HTTP status codes. Never return stack traces, secrets, raw provider errors or internal database details.

## AI architecture

1. UI calls an application API route; it never calls a model provider directly with a secret.
2. The route authenticates and validates requests, applies rate limits and input-size limits.
3. An AI application service builds approved prompts and calls the provider interface in src/lib/ai.
4. Provider adapters implement AiProvider and read credentials from Cloudflare Worker secrets.
5. Validate model output before using it. Treat output as untrusted input.
6. Log request IDs, latency and token usage where appropriate; avoid logging private customer data.

AI must not be the source of truth for product prices, stock, wheel dimensions, load ratings or vehicle compatibility. Those values must come from verified structured records. AI may explain verified data or assist discovery, but must not fabricate technical fitment advice.

## Provider and secret policy

- Keep provider SDKs in server-only modules.
- Store keys as Cloudflare Worker secrets, never in source control, NEXT_PUBLIC_*, Vite client variables or browser storage.
- Keep provider-specific code behind the AiProvider interface so providers can be changed without rewriting UI or domain logic.
- AI remains disabled until a provider, authentication policy, rate limits, budget controls and evaluation tests are configured.
