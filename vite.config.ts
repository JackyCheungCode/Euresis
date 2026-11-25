import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig(({ isSsrBuild }) => ({
  define: {
    // PDS SSR components select their server/browser implementation at build time.
    "process.browser": JSON.stringify(!isSsrBuild),
  },
  plugins: [
    tailwindcss(),
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
}));
