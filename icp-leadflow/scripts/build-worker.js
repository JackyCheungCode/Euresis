import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

const assets = {};
for (const file of files) {
  const body = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  assets[file] = {
    type: mimeTypes[path.extname(file)] ?? 'application/octet-stream',
    body,
  };
}

const worker = `const ASSETS = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    const key = (pathname.startsWith('/') ? pathname.slice(1) : pathname) || 'index.html';
    let asset = ASSETS[key];
    if (!asset && !key.includes('.')) asset = ASSETS['index.html'];
    if (!asset) return new Response('Not Found', { status: 404 });

    const headers = {
      'Content-Type': asset.type,
      'Cache-Control': key === 'index.html' ? 'no-cache' : 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    };
    return new Response(request.method === 'HEAD' ? null : asset.body, { headers });
  },
};
`;

const outputDir = new URL('../dist/', import.meta.url);
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('../dist/worker.js', import.meta.url), worker, 'utf8');
console.log(`Built Worker bundle: dist/worker.js (${files.length} static assets, ${Buffer.byteLength(worker)} bytes)`);
