import fs from "node:fs";

const rutas = JSON.parse(fs.readFileSync(new URL("../app/data/rutas.json", import.meta.url), "utf8"));
const hitosBase = JSON.parse(fs.readFileSync(new URL("../app/data/hitos.json", import.meta.url), "utf8"));
const edicionesTransvulcania = JSON.parse(fs.readFileSync(new URL("../app/data/transvulcania-ediciones.json", import.meta.url), "utf8"));
const hitos = [...hitosBase, ...edicionesTransvulcania];
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;

const rows = [
  ["portada", "PORTADA", "Portada general", "public/fotos/portada.jpg", "vertical", "pendiente"],
  ...rutas.map((ruta) => ["ruta", ruta.id, ruta.nombre, `public/fotos/rutas/${ruta.slug}.jpg`, "vertical", "pendiente"]),
  ...hitos.map((hito) => ["hito", hito.id, hito.nombre, `public/fotos/hitos/${hito.slug}.jpg`, "vertical", "pendiente"]),
];

const csv = [
  ["tipo", "id", "nombre", "archivo", "orientacion_recomendada", "estado"],
  ...rows,
].map((row) => row.map(quote).join(";")).join("\n");

fs.writeFileSync(new URL("../LISTADO_FOTOS.csv", import.meta.url), `${csv}\n`);
console.log(`Listado generado: ${rows.length} fotografías`);
