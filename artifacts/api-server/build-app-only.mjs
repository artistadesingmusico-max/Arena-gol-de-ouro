import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const outdir = path.resolve(artifactDir, "..", "..", "api", "_bundled");

async function buildApp() {
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/app.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outdir,
    outExtension: { ".js": ".cjs" },
    logLevel: "info",
    external: [
      "*.node",
      "lightningcss",
      "pg-native",
    ],
    alias: {
      pino: path.resolve(artifactDir, "stubs/pino.mjs"),
      "pino-http": path.resolve(artifactDir, "stubs/pino-http.mjs"),
    },
  });
}

buildApp().catch((err) => {
  console.error(err);
  process.exit(1);
});
