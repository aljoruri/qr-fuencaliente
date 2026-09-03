"use client";

import { Check, Download, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "../lib/paths";

type OfflineManifest = {
  version: string;
  files: string[];
  routes: Record<string, string[]>;
  totalBytes: number;
  routeBytes: Record<string, number>;
};

type Props = {
  selection?: "all" | `route:${string}`;
  title?: string;
  description?: string;
};

type Status = "loading" | "idle" | "downloading" | "ready" | "error" | "unsupported";

export function OfflineDownload({
  selection = "all",
  title = "Llévate las rutas contigo",
  description = "Descarga el contenido antes de salir y consúltalo aunque no tengas cobertura.",
}: Props) {
  const [manifest, setManifest] = useState<OfflineManifest | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      const timer = window.setTimeout(() => setStatus("unsupported"), 0);
      return () => window.clearTimeout(timer);
    }

    let active = true;
    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message || message.requestId !== requestId.current) return;
      if (message.type === "OFFLINE_STATUS_RESULT") {
        setSavedAt(message.savedAt);
        setStatus(message.ready ? "ready" : "idle");
      } else if (message.type === "OFFLINE_PROGRESS") {
        setProgress({ completed: message.completed, total: message.total });
      } else if (message.type === "OFFLINE_COMPLETE") {
        setSavedAt(new Date().toISOString());
        setStatus("ready");
      } else if (message.type === "OFFLINE_ERROR") {
        setStatus("error");
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    (async () => {
      try {
        await navigator.serviceWorker.register(assetPath("/sw.js"), { scope: assetPath("/") });
        const registration = await navigator.serviceWorker.ready;
        const response = await fetch(assetPath("/offline-manifest.json"), { cache: "no-store" });
        if (!response.ok) throw new Error("Manifest unavailable");
        const nextManifest = await response.json() as OfflineManifest;
        if (!active) return;
        setManifest(nextManifest);
        requestId.current = crypto.randomUUID();
        registration.active?.postMessage({
          type: "OFFLINE_STATUS",
          requestId: requestId.current,
          selection,
          version: nextManifest.version,
        });
      } catch {
        if (active) setStatus("error");
      }
    })();

    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, [selection]);

  const files = manifest
    ? selection === "all"
      ? manifest.files
      : manifest.routes[selection.slice("route:".length)] ?? []
    : [];
  const routeSlug = selection.startsWith("route:") ? selection.slice("route:".length) : null;
  const downloadBytes = manifest
    ? routeSlug
      ? manifest.routeBytes[routeSlug] ?? 0
      : manifest.totalBytes
    : 0;
  const downloadSize = downloadBytes >= 1024 * 1024
    ? `${(downloadBytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(downloadBytes / 1024))} KB`;

  async function download() {
    if (!manifest || files.length === 0) return;
    setStatus("downloading");
    setProgress({ completed: 0, total: files.length });
    requestId.current = crypto.randomUUID();
    try {
      if (navigator.storage?.persist) await navigator.storage.persist();
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "OFFLINE_DOWNLOAD",
        requestId: requestId.current,
        selection,
        version: manifest.version,
        urls: files,
      });
    } catch {
      setStatus("error");
    }
  }

  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const buttonLabel = status === "downloading"
    ? `Descargando… ${percent}%`
    : status === "ready"
      ? "Actualizar contenido descargado"
      : selection === "all"
        ? "Descargar todo"
        : "Descargar esta ruta";

  return (
    <section className="mobile-section offline-panel" aria-live="polite">
      <div className="offline-heading">
        <span className="offline-icon"><WifiOff size={19} aria-hidden="true" /></span>
        <div><h2>{title}</h2><p>{description}</p></div>
      </div>

      {status !== "unsupported" && (
        <button className="offline-button" type="button" onClick={download} disabled={status === "loading" || status === "downloading" || !manifest}>
          {status === "ready" ? <RefreshCw size={17} /> : <Download size={17} />}
          <span>{buttonLabel}</span>
        </button>
      )}

      {manifest && status !== "downloading" && <p className="offline-size">{files.length} archivos · aproximadamente {downloadSize}</p>}

      {status === "downloading" && (
        <div className="offline-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span style={{ width: `${percent}%` }} />
        </div>
      )}

      {status === "ready" && (
        <p className="offline-status ready"><Check size={14} /> Disponible sin conexión{savedAt ? ` · actualizado ${new Date(savedAt).toLocaleDateString("es-ES")}` : ""}</p>
      )}
      {status === "error" && <p className="offline-status error">No se pudo completar la descarga. Comprueba la conexión e inténtalo de nuevo.</p>}
      {status === "unsupported" && <p className="offline-status error">Este navegador no permite guardar la ruta completa sin conexión.</p>}
      <p className="offline-note">Los mapas externos y las indicaciones para llegar requieren cobertura.</p>
    </section>
  );
}
