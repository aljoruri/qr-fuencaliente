import { assetPath } from "../lib/paths";

export function SiteFooter({ detail }: { detail: string }) {
  return (
    <footer className="site-footer">
      <img
        src={assetPath("/identidad/escudo-ayuntamiento-fuencaliente.png")}
        alt="Escudo del Ayuntamiento de Fuencaliente de La Palma"
        className="footer-crest"
      />
      <div className="footer-copy">
        <b>Ayuntamiento de Fuencaliente de La Palma</b>
        <span>{detail}</span>
      </div>
    </footer>
  );
}
