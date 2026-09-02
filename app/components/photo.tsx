"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

type Props = { src: string; alt: string; filename: string; className?: string };

export function Photo({ src, alt, filename, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`photo-fallback ${className}`} role="img" aria-label={`Fotografía pendiente: ${alt}`}>
        <ImageIcon size={32} aria-hidden="true" />
        <span>Fotografía pendiente</span>
        <code>{filename}</code>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
