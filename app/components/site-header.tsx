import { Menu } from "lucide-react";
import { assetPath } from "../lib/paths";

export function SiteHeader({ title = "Rutas de Fuencaliente" }: { title?: string }) {
  return (
    <header className="site-header">
      <a href={assetPath("/")} className="header-title" aria-label="Rutas de Fuencaliente, inicio">{title}</a>
      <a href={assetPath("/#rutas")} className="header-brand"><Menu aria-hidden="true" size={14} /> Fuencaliente</a>
    </header>
  );
}
