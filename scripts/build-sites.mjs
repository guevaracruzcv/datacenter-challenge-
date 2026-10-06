import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const projectRoot = resolve(".");
const websiteDir = resolve(projectRoot, "website");
const outputDir = resolve(projectRoot, "dist", "server");

const assetPaths = {
  index: resolve(websiteDir, "index.html"),
  css: resolve(websiteDir, "style.css"),
  js: resolve(websiteDir, "app.js")
};

const assets = {
  index: await readFile(assetPaths.index, "utf8"),
  css: await readFile(assetPaths.css, "utf8"),
  js: await readFile(assetPaths.js, "utf8")
};

await mkdir(outputDir, { recursive: true });

const generatedAssetsPath = resolve(outputDir, "generated-assets.mjs");

const generatedEntryPath = resolve(outputDir, "generated-entry.mjs");

const generatedEntryModule = `
import adapter from "../../backend/sites-adapter.js";
import { publicAssets } from "./generated-assets.mjs";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.redirect(new URL("/website/", request.url), 302);
    }

    const asset = publicAssets[url.pathname];

    if (asset) {
      return new Response(asset.body, {
        headers: {
          "Content-Type": asset.contentType
        }
      });
    }

    return adapter.fetch(request, env, ctx);
  }
};
`;

await import("node:fs/promises").then(({ writeFile }) =>
  writeFile(generatedEntryPath, generatedEntryModule, "utf8")
);


const generatedAssetsModule = `
export const publicAssets = {
  "/website/": {
    contentType: "text/html; charset=utf-8",
    body: ${JSON.stringify(assets.index)}
  },
  "/website/index.html": {
    contentType: "text/html; charset=utf-8",
    body: ${JSON.stringify(assets.index)}
  },
  "/website/style.css": {
    contentType: "text/css; charset=utf-8",
    body: ${JSON.stringify(assets.css)}
  },
  "/website/app.js": {
    contentType: "application/javascript; charset=utf-8",
    body: ${JSON.stringify(assets.js)}
  }
};
`;

await import("node:fs/promises").then(({ writeFile }) =>
  writeFile(generatedAssetsPath, generatedAssetsModule, "utf8")
);


await build({
  entryPoints: [generatedEntryPath],
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  outfile: resolve(outputDir, "index.mjs")
});

console.log("Sites build preparation passed.");
console.log(`index.html: ${assets.index.length} characters`);
console.log(`style.css: ${assets.css.length} characters`);
console.log(`app.js: ${assets.js.length} characters`);
console.log(`output: ${outputDir}`);
