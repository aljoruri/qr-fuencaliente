import rutasData from "../data/rutas.json";
import hitosData from "../data/hitos.json";

export type ContentSection = {
  titulo: string;
  visibilidad: "publica" | "interna";
  contenido_markdown: string;
};

export type Ruta = {
  id: string;
  nombre: string;
  slug: string;
  url: string;
  color: string | null;
  color_estado: string;
  seleccion_estado: string;
  contenido: { secciones: ContentSection[] };
  hito_ids: string[];
  estado: Record<string, string>;
};

export type Hito = {
  id: string;
  nombre: string;
  slug: string;
  url: string;
  categorias: string[];
  rutas: string[];
  orden_en_rutas: Record<string, number | null>;
  ubicacion: {
    texto: string | null;
    latitud: number | null;
    longitud: number | null;
    como_llegar_url: string | null;
  };
  contenido: { secciones: ContentSection[] };
  media: {
    imagen_principal: string | null;
    galeria: string[];
    estado: string;
  };
  fuentes: string[];
  estado: Record<string, string | string[]>;
  observaciones_internas: string | null;
};

export const rutas = rutasData as Ruta[];
export const hitos = hitosData as Hito[];

export const getRuta = (slug: string) => rutas.find((ruta) => ruta.slug === slug);
export const getHito = (slug: string) => hitos.find((hito) => hito.slug === slug);
export const getHitoById = (id: string) => hitos.find((hito) => hito.id === id);
export const getRutaById = (id: string) => rutas.find((ruta) => ruta.id === id);

export function publicSections(sections: ContentSection[]) {
  return sections.filter((section) => section.visibilidad === "publica");
}

export function sectionByTitle(sections: ContentSection[], title: string) {
  return sections.find((section) => section.titulo.toLowerCase() === title.toLowerCase());
}

export function routeAccent(ruta: Ruta) {
  return ruta.color ?? "#697077";
}
