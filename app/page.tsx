import { ChevronRight, MapPin } from "lucide-react";
import { LanguageBar } from "./components/language-bar";
import { OfflineDownload } from "./components/offline-download";
import { PhotoHero } from "./components/photo-hero";
import { SectionLabel } from "./components/section-label";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { publicSections, routeAccent, rutas, sectionByTitle } from "./lib/data";
import { assetPath } from "./lib/paths";

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <PhotoHero src={assetPath("/fotos/portada.jpg")} filename="public/fotos/portada.jpg" title="Rutas de Fuencaliente" subtitle="La Palma · volcanes, costa, cultura y tradición" />
        <LanguageBar />
        <OfflineDownload />
        <section className="mobile-section intro-section">
          <SectionLabel>Descubre el municipio</SectionLabel>
          <p>Recorre Fuencaliente a través de sus paisajes, senderos y lugares de interés. Cada punto abre una ficha propia y permite continuar por todas las rutas a las que pertenece.</p>
        </section>
        <section className="mobile-section" id="rutas">
          <SectionLabel>Las rutas</SectionLabel>
          <div className="route-list">
            {rutas.map((ruta) => {
              const intro = sectionByTitle(publicSections(ruta.contenido.secciones), "Entradilla");
              return (
                <a href={assetPath(ruta.url)} className="route-list-card" key={ruta.id} style={{ "--route-color": routeAccent(ruta) } as React.CSSProperties}>
                  <div className="route-thumb" style={{ backgroundImage: `url('${assetPath(`/fotos/rutas/${ruta.slug}.jpg`)}')` }} aria-hidden="true" />
                  <div className="route-list-copy">
                    <span className="route-kicker">{ruta.id} · {ruta.hito_ids.length} {ruta.hito_ids.length === 1 ? "parada" : "paradas"}</span>
                    <h2>{ruta.nombre}</h2>
                    <p>{intro?.contenido_markdown}</p>
                  </div>
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </section>
        <section className="mobile-section location-summary">
          <SectionLabel>Fuencaliente de La Palma</SectionLabel>
          <div className="location-row"><MapPin size={18} /><span>Extremo sur de la isla de La Palma</span></div>
          <p>La información de esta demo es provisional y está preparada para validación municipal.</p>
        </section>
      </main>
      <SiteFooter detail="Rutas de Fuencaliente · Sistema QR editable y ampliable" />
    </div>
  );
}
