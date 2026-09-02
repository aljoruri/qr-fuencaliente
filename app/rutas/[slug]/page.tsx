import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { LanguageBar } from "../../components/language-bar";
import { MarkdownText } from "../../components/markdown-text";
import { PhotoHero } from "../../components/photo-hero";
import { SectionLabel } from "../../components/section-label";
import { SiteHeader } from "../../components/site-header";
import { getHitoById, getRuta, publicSections, rutas } from "../../lib/data";
import { assetPath } from "../../lib/paths";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return rutas.map((ruta) => ({ slug: ruta.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ruta = getRuta((await params).slug);
  return ruta ? { title: `${ruta.nombre} | Fuencaliente`, description: ruta.seleccion_estado } : {};
}

export default async function RutaPage({ params }: Props) {
  const ruta = getRuta((await params).slug);
  if (!ruta) notFound();
  const sections = publicSections(ruta.contenido.secciones);
  const intro = sections.find((section) => section.titulo === "Entradilla");
  const detailSections = sections.filter((section) => !/^(Entradilla|Paradas|Paradas actuales|Paradas provisionales|Miradores|Senderos|Espacios|Bodegas|Patrimonio y paisaje del vino|Elementos relacionados|Parada)$/i.test(section.titulo));
  const photoFilename = `public/fotos/rutas/${ruta.slug}.jpg`;

  return (
    <div className="site-shell">
      <SiteHeader title={ruta.nombre} />
      <main>
        <PhotoHero src={assetPath(`/fotos/rutas/${ruta.slug}.jpg`)} filename={photoFilename} title={ruta.nombre} subtitle={`${ruta.hito_ids.length} ${ruta.hito_ids.length === 1 ? "parada" : "paradas"} · Fuencaliente de La Palma`} />
        <LanguageBar />
        {intro && <section className="mobile-section"><SectionLabel>Sobre la ruta</SectionLabel><MarkdownText value={intro.contenido_markdown} /></section>}
        {detailSections.map((section) => <section className="mobile-section" key={section.titulo}><SectionLabel>{section.titulo}</SectionLabel><MarkdownText value={section.contenido_markdown} /></section>)}
        <section className="mobile-section">
          <SectionLabel>Paradas de la ruta</SectionLabel>
          <div className="poi-list">
            {ruta.hito_ids.map((id, index) => {
              const hito = getHitoById(id);
              if (!hito) return null;
              return (
                <a href={assetPath(hito.url)} className="poi-card" key={hito.id}>
                  <span className="poi-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="poi-copy"><b>{hito.nombre}</b><small><MapPin size={12} />{hito.ubicacion.texto ?? "Ubicación pendiente"}</small></span>
                  <ChevronRight size={18} />
                </a>
              );
            })}
          </div>
        </section>
        <nav className="back-block"><a href={assetPath("/#rutas")}><ChevronLeft size={17} /> Ver todas las rutas</a></nav>
      </main>
      <footer><b>Rutas de Fuencaliente</b><span>{ruta.nombre}</span></footer>
    </div>
  );
}
