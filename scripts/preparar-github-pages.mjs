import { readdir, readFile, writeFile } from "node:fs/promises";
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
console.log(`GitHub Pages preparado en ${outputDirectory} para ${basePath}`);
