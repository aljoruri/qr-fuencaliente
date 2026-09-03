import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/client");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
  }));
  return files.flat();
}

const allFiles = await collectFiles(outputDirectory);
const pages = allFiles.filter((file) => file.endsWith("index.html"));
const rutas = JSON.parse(await readFile(path.resolve("app/data/rutas.json"), "utf8"));
const hitos = JSON.parse(await readFile(path.resolve("app/data/hitos.json"), "utf8"));
const edicionesTransvulcania = JSON.parse(await readFile(path.resolve("app/data/transvulcania-ediciones.json"), "utf8"));
const expectedPages = 1 + rutas.length + hitos.length + edicionesTransvulcania.length;
if (pages.length !== expectedPages) {
  throw new Error(`Se esperaban ${expectedPages} páginas y se generaron ${pages.length}`);
}

const textFiles = allFiles.filter((file) => file.endsWith(".html") || file.endsWith(".rsc"));
const forbidden = [
  'href="/assets/',
  'src="/assets/',
  'import("/assets/',
  'css:/assets/',
  'href="/rutas/',
  'href="/hitos/',
  'src="/fotos/',
];

for (const file of textFiles) {
  const contents = await readFile(file, "utf8");
  for (const fragment of forbidden) {
    if (contents.includes(fragment)) {
      throw new Error(`Dirección sin prefijo en ${path.relative(outputDirectory, file)}: ${fragment}`);
    }
  }
}

await access(path.join(outputDirectory, ".nojekyll"));
await access(path.join(outputDirectory, "assets"));
await access(path.join(outputDirectory, "sw.js"));
await access(path.join(outputDirectory, "manifest.webmanifest"));

const offlineManifest = JSON.parse(await readFile(path.join(outputDirectory, "offline-manifest.json"), "utf8"));
if (!offlineManifest.files.includes(`${basePath}/`) || offlineManifest.files.length < pages.length) {
  throw new Error("El manifiesto offline no contiene todas las páginas exportadas");
}
for (const ruta of rutas) {
  if (!Array.isArray(offlineManifest.routes[ruta.slug]) || offlineManifest.routes[ruta.slug].length === 0) {
    throw new Error(`Falta la descarga offline para ${ruta.slug}`);
  }
}
console.log(`Exportación verificada: ${pages.length} páginas bajo ${basePath}`);
