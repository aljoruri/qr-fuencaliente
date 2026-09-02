import { Photo } from "./photo";

type Props = { src: string; filename: string; title: string; subtitle?: string; alt?: string };

export function PhotoHero({ src, filename, title, subtitle, alt = title }: Props) {
  return (
    <section className="photo-hero">
      <Photo src={src} filename={filename} alt={alt} className="photo-hero-image" />
      <div className="photo-hero-shade" />
      <div className="photo-hero-copy">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
