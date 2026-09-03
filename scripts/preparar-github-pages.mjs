import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/client");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

if (!basePath.startsWith("/") || basePath.endsWith("/")) {
  throw new Error("NEXT_PUBLIC_BASE_PATH debe tener el formato /nombre-del-repositorio");
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
  }));
  return files.flat();
}

const files = (await collectFiles(outputDirectory)).filter((file) =>
  file.endsWith(".html") || file.endsWith(".rsc"),
);

for (const file of files) {
  const original = await readFile(file, "utf8");
  const updated = original.replace(
    /(?<![A-Za-z0-9_-])\/assets\//g,
    `${basePath}/assets/`,
  );
  if (updated !== original) await writeFile(file, updated);
}

await writeFile(path.join(outputDirectory, ".nojekyll"), "");

const rutas = JSON.parse(await readFile(path.resolve("app/data/rutas.json"), "utf8"));
const hitosBase = JSON.parse(await readFile(path.resolve("app/data/hitos.json"), "utf8"));
const ediciones = JSON.parse(await readFile(path.resolve("app/data/transvulcania-ediciones.json"), "utf8"));
const hitos = [...hitosBase, ...ediciones];
const allOutputFiles = await collectFiles(outputDirectory);

const toPublicUrl = (file) => {
  const relative = path.relative(outputDirectory, file).split(path.sep).join("/");
  if (relative === "index.html") return `${basePath}/`;
  if (relative.endsWith("/index.html")) return `${basePath}/${relative.slice(0, -"index.html".length)}`;
  return `${basePath}/${relative}`;
};

const unique = (values) => [...new Set(values)].sort();
const allUrls = unique(allOutputFiles.map(toPublicUrl));
const sizeByUrl = new Map(await Promise.all(allOutputFiles.map(async (file) => [toPublicUrl(file), (await stat(file)).size])));
const globalUrls = allUrls.filter((url) =>
  url === `${basePath}/` ||
  url.startsWith(`${basePath}/assets/`) ||
  url === `${basePath}/favicon.svg` ||
  url === `${basePath}/manifest.webmanifest` ||
  url === `${basePath}/sw.js` ||
  url.includes("/identidad/")
);

const routeUrls = Object.fromEntries(rutas.map((ruta) => {
  const routePrefix = `${basePath}/rutas/${ruta.slug}/`;
  const routePhoto = `${basePath}/fotos/rutas/${ruta.slug}.jpg`;
  const relatedHitos = ruta.hito_ids.map((id) => hitos.find((hito) => hito.id === id)).filter(Boolean);
  const urls = [
    ...globalUrls,
    ...allUrls.filter((url) => url.startsWith(routePrefix)),
    ...allUrls.filter((url) => url === routePhoto),
    ...relatedHitos.flatMap((hito) => {
      const hitoPrefix = `${basePath}/hitos/${hito.slug}/`;
      const hitoPhoto = `${basePath}/fotos/hitos/${hito.slug}.jpg`;
      return allUrls.filter((url) => url.startsWith(hitoPrefix) || url === hitoPhoto);
    }),
  ];
  return [ruta.slug, unique(urls)];
}));
const bytesFor = (urls) => unique(urls).reduce((total, url) => total + (sizeByUrl.get(url) ?? 0), 0);

const offlineManifest = {
  version: process.env.GITHUB_SHA ?? new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  files: unique([...allUrls, `${basePath}/offline-manifest.json`]),
  routes: routeUrls,
  totalBytes: bytesFor(allUrls),
  routeBytes: Object.fromEntries(Object.entries(routeUrls).map(([slug, urls]) => [slug, bytesFor(urls)])),
};

await writeFile(
  path.join(outputDirectory, "offline-manifest.json"),
  `${JSON.stringify(offlineManifest, null, 2)}\n`,
);
console.log(`GitHub Pages preparado en ${outputDirectory} para ${basePath}`);
