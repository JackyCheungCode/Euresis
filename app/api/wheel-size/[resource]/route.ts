import { env } from "cloudflare:workers";

const endpoints: Record<string, string> = {
  makes: "makes", models: "models", years: "years", modifications: "modifications",
  search: "search/by_model", upsteps: "upsteps",
};
const allowed = new Set(["make", "model", "year", "generation", "modification", "region", "limit", "offset", "tire_width", "tire_aspect_ratio", "rim_diameter", "steps_min", "steps_max"]);

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const endpoint = endpoints[resource];
  if (!endpoint) return Response.json({ error: { code: "NOT_FOUND", message: "Unknown Wheel-Size resource." } }, { status: 404 });
  const apiKey = (env as unknown as Record<string, string | undefined>).WHEEL_SIZE_API_KEY;
  if (!apiKey) return Response.json({ error: { code: "API_KEY_MISSING", message: "Wheel-Size API key is not configured on the server." } }, { status: 503 });
  const incoming = new URL(request.url);
  const params = new URLSearchParams();
  for (const [key, value] of incoming.searchParams) if (allowed.has(key) && value) params.set(key, value);
  params.set("user_key", apiKey);
  const upstream = await fetch(`https://api.wheel-size.com/v2/${endpoint}/?${params.toString()}`, {
    headers: { Accept: "application/json", "Accept-Encoding": "gzip" },
    signal: AbortSignal.timeout(15000),
  });
  const body: any = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return Response.json({ error: { code: "WHEEL_SIZE_UPSTREAM", message: body?.detail ?? body?.message ?? `Wheel-Size returned HTTP ${upstream.status}.` } }, { status: upstream.status });
  }
  return Response.json(body, { headers: { "Cache-Control": resource === "makes" || resource === "models" || resource === "years" || resource === "modifications" ? "public, max-age=3600, s-maxage=3600" : "no-store" } });
}
