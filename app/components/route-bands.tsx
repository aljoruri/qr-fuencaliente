import { getRutaById, routeAccent } from "../lib/data";
import { assetPath } from "../lib/paths";

export function RouteBands({ routeIds }: { routeIds: string[] }) {
  return (
    <div className="route-bands" aria-label="Rutas asociadas">
      {routeIds.map((id) => {
        const ruta = getRutaById(id);
        if (!ruta) return null;
        return (
          <a
            href={assetPath(ruta.url)}
            key={id}
            className="route-band"
            style={{ "--route-color": routeAccent(ruta) } as React.CSSProperties}
          >
            <span>{ruta.id}</span>{ruta.nombre}
          </a>
        );
      })}
    </div>
  );
}
