import type { AiProvider } from "./types";
/** Provider adapters run on the server. Keep API keys in Worker secrets, never in browser bundles. */
export function getAiProvider(): AiProvider {
  throw new Error("AI provider is not configured. Add a server-side provider adapter before enabling AI features.");
}
