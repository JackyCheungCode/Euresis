import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  accountId: "ea4e98dce9c478d7dd5c07f10e5c722d",
  worker: defineWorker({
    name: "euresis",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-25",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
