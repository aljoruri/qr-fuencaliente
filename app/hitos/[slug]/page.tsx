import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { LanguageBar } from "../../components/language-bar";
import { MarkdownText } from "../../components/markdown-text";
import { PhotoHero } from "../../components/photo-hero";
import { RouteBands } from "../../components/route-bands";
import { SectionLabel } from "../../components/section-label";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getHito, getHitoById, getRutaById, hitos, publicSections } from "../../lib/data";
import { assetPath } from "../../lib/paths";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return hitos.map((hito) => ({ slug: hito.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hito = getHito((await params).slug);
  return hito ? { title: `${hito.nombre} | Fuencaliente`, description: `Descubre ${hito.nombre} y las rutas de Fuencaliente a las que pertenece.` } : {};
}

export default async function HitoPage({ params }: Props) {
  const hito = getHito((await params).slug);
  if (!hito) notFound();
  const route = getRutaById(hito.rutas[0]);
  const routeIndex = route?.hito_ids.indexOf(hito.id) ?? -1;
  const previous = routeIndex > 0 ? getHitoById(route!.hito_ids[routeIndex - 1]) : null;
  const next = route && routeIndex >= 0 && routeIndex < route.hito_ids.length - 1 ? getHitoById(route.hito_ids[routeIndex + 1]) : null;
  const sections = publicSections(hito.contenido.secciones);
  const photoPath = assetPath(hito.media.imagen_principal ?? `/fotos/hitos/${hito.slug}.jpg`);
  const photoFilename = `public/fotos/hitos/${hito.slug}.jpg`;

  return (
    <div className="site-shell">
      <SiteHeader title={hito.nombre} />
      <main>
        <PhotoHero src={photoPath} filename={photoFilename} title={hito.nombre} subtitle={`${hito.categorias[0]?.replaceAll("_", " ")} · ${hito.id}`} />
        <RouteBands routeIds={hito.rutas} />
        <LanguageBar />
        {sections.map((section) => <section className="mobile-section" key={section.titulo}><SectionLabel>{section.titulo}</SectionLabel><MarkdownText value={section.contenido_markdown} /></section>)}
        <section className="mobile-section">
          <SectionLabel>Ubicación</SectionLabel>
          <p className="location-address">{hito.ubicacion.texto ?? "Ubicación pendiente de validar"}</p>
          <div className="map-placeholder"><MapPin size={27} /><span>Mapa pendiente de coordenadas verificadas</span></div>
          <button disabled className="map-button"><MapPin size={16} /> Abrir en Google Maps <ExternalLink size={14} /></button>
        </section>
        <section className="mobile-section">
          <SectionLabel>Este punto pertenece a</SectionLabel>
          <div className="poi-list">
            {hito.rutas.map((id) => {
              const item = getRutaById(id);
              return item ? <a href={assetPath(item.url)} className="poi-card" key={id}><span className="poi-number">{id}</span><span className="poi-copy"><b>{item.nombre}</b><small>{item.hito_ids.length} paradas</small></span><ChevronRight size={18} /></a> : null;
            })}
          </div>
        </section>
        <nav className="hito-nav">
          {previous ? <a href={assetPath(previous.url)}><small>Anterior</small><b><ChevronLeft size={15} />{previous.nombre}</b></a> : <span />}
          {next ? <a href={assetPath(next.url)} className="next"><small>Siguiente</small><b>{next.nombre}<ChevronRight size={15} /></b></a> : <span />}
        </nav>
        <nav className="back-block"><a href={assetPath("/#rutas")}><ChevronLeft size={17} /> Ver todas las rutas</a></nav>
      </main>
      <SiteFooter detail={`${hito.id} · Contenido provisional`} />
    </div>
  );
}
