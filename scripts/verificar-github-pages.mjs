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
if (pages.length !== 75) {
  throw new Error(`Se esperaban 75 páginas y se generaron ${pages.length}`);
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
console.log(`Exportación verificada: ${pages.length} páginas bajo ${basePath}`);
