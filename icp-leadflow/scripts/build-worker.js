import { mkdir, writeFile } from 'node:fs/promises';

const files = [
  'index.html',
  'src/styles/carbon.css',
  'src/services/supabase.js',
  'src/data/icp-options.js',
  'src/components/stage.js',
  'src/main.js',
  'src/services/integrations.js',
  'src/pages/integrations.js',
  'src/state.js',
  'src/router.js',
  'src/components/panel.js',
  'src/components/table.js',
  'src/components/tag.js',
  'src/components/toast.js',
  'src/components/toolcard.js',
  'src/data/icp.js',
  'src/data/lead.js',
  'src/steps/step0-icp.js',
  'src/steps/step1-discover.js',
  'src/steps/step2-scrape.js',
  'src/steps/step3-enrich.js',
  'src/steps/step4-verify.js',
  'src/steps/step5-research.js',
  'src/steps/step6-rounter.js',
];

const worker = `const ASSETS = new Set(${JSON.stringify(files)});
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url).pathname); } catch { return new Response("Bad Request", { status: 400 }); }
    let key = (pathname.startsWith("/") ? pathname.slice(1) : pathname) || "index.html";
    if (key.split("/").some(part => part === ".." || part === ".")) return new Response("Not Found", { status: 404 });
    if (!ASSETS.has(key)) {
      if (!key.includes(".")) key = "index.html";
      else return new Response("Not Found", { status: 404 });
    }
    const remote = "https://raw.githubusercontent.com/JackyCheungCode/Euresis/main/icp-leadflow/" + key;
    let upstream;
    try { upstream = await fetch(remote, { headers: { Accept: "text/plain" } }); } catch { return new Response("Upstream asset unavailable", { status: 502 }); }
    if (!upstream.ok) return new Response("Asset not found", { status: upstream.status === 404 ? 404 : 502 });
    const ext = key.slice(key.lastIndexOf("."));
    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", TYPES[ext] || "application/octet-stream");
    headers.set("Cache-Control", key === "index.html" ? "no-cache" : "public, max-age=300");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(request.method === "HEAD" ? null : upstream.body, { status: 200, headers });
  }
};
`;

const outputDir = new URL('../dist/', import.meta.url);
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('../dist/worker.js', import.meta.url), worker, 'utf8');
console.log(`Built Worker proxy for ${files.length} allowlisted static assets (${Buffer.byteLength(worker)} bytes)`);
