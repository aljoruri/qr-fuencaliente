import { assetPath } from "../lib/paths";

export function SiteHeader({ title = "Rutas de Fuencaliente" }: { title?: string }) {
  return (
    <header className="site-header">
      <a href={assetPath("/")} className="header-title" aria-label="Rutas de Fuencaliente, inicio">{title}</a>
      <a href={assetPath("/#rutas")} className="header-brand" aria-label="Ver las rutas de Fuencaliente">
        <span>Fuencaliente</span>
        <img src={assetPath("/identidad/escudo-ayuntamiento-fuencaliente.png")} alt="" className="header-crest" />
      </a>
    </header>
  );
}
