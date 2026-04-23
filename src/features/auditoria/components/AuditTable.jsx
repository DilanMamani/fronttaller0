import { Eye } from 'lucide-react';
import routeDescriptions from "../data/routeDescriptions.json";

const getStatusColor = (http_status) => {
  if (http_status >= 200 && http_status < 300)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200";

  if (http_status >= 400 && http_status < 500)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";

  if (http_status >= 500)
    return "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200";

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
};

const getMethodColor = (method) => {
  const colors = {
    GET: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
    POST: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    PATCH: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  };
  return colors[method] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
};

const translateMethod = (method) => {
  const translations = {
    GET: "Obtiene",
    POST: "Crea",
    PUT: "Modifica",
    PATCH: "Actualiza",
    DELETE: "Elimina",
  };
  return translations[method?.toUpperCase()] || "Acción";
};

const translateRoute = (method, originalUrl) => {
  // --- LIMPIEZA CONTROLADA (solo basura, NO valores) ---
  let url = originalUrl
    .trim()
    .replace(/\+/g, " ")     // evitar La+Paz
    .replace(/\/\?/, "?")    
    .replace(/&&+/g, "&")
    .replace(/\/+$/, "")
    .replace(/\?$/, "");

  // Separar ruta y query
  const [rawPath, rawQuery] = url.split("?");
  const path = rawPath.replace(/\/$/, "");
  const normalizedPath = path.replace(/\/\d+$/, "/:id");

  // Identificar grupo del JSON
  const routeGroup =
    routeDescriptions[normalizedPath] ||
    routeDescriptions[path];

  if (!routeGroup) {
    return `${translateMethod(method)} en ${path}`;
  }

  // Si no hay query → usar traducción simple
  if (!rawQuery) {
    return routeGroup[method] || `${translateMethod(method)} en ${path}`;
  }

  // --- Parseo REAL de valores ---
  const queryParams = {};
  rawQuery.split("&").forEach((pair) => {
    if (!pair.includes("=")) return;

    const [key, value] = pair.split("=");

    // ignorar parámetros vacíos, pero NO borrar el key si hay valor
    if (!key || value === undefined || value === "") return;

    queryParams[key] = decodeURIComponent(value.trim());
  });

  // --- Buscar coincidencia dinámica ---
  for (const jsonKey of Object.keys(routeGroup)) {
    if (!jsonKey.startsWith(method + "?")) continue;

    const expectedParams = jsonKey.replace(method + "?", "").split("&");

    let allMatch = true;
    let translatedText = routeGroup[jsonKey];

    for (const ep of expectedParams) {
      const [paramName] = ep.split("=");

      if (!queryParams[paramName]) {
        allMatch = false;
        break;
      }

      // Insertar valor real
      translatedText = translatedText.replace("{value}", queryParams[paramName]);
    }

    if (allMatch) return translatedText;
  }

  // --- Si no match, armar texto básico pero con valores ---
  const readableFilters = Object.entries(queryParams)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  return readableFilters
    ? `${translateMethod(method)} en ${path} — filtros: ${readableFilters}`
    : `${translateMethod(method)} en ${path}`;
};
export default function AuditTable({ data, onViewDetails }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              <th className="w-1/3 px-6 py-3 text-left text-xs font-semibold uppercase text-muted-light tracking-wider dark:text-muted-dark">
                Acción
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-light tracking-wider dark:text-muted-dark">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-light tracking-wider dark:text-muted-dark">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-light tracking-wider dark:text-muted-dark">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-light tracking-wider dark:text-muted-dark">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted-light tracking-wider dark:text-muted-dark">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-light bg-card-light dark:divide-border-dark dark:bg-card-dark">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-sm text-muted-light dark:text-muted-dark"
                >
                  No hay registros de auditoría.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id_log} className="hover:bg-background-light dark:hover:bg-background-dark">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                            item.http_status
                          )}`}
                        >
                          {item.http_status}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getMethodColor(
                            item.http_method
                          )}`}
                        >
                          {translateMethod(item.http_method)}
                        </span>
                      </div>

                      <span className="text-sm text-foreground-light dark:text-foreground-dark">
                        {translateRoute(item.http_method, item.url)}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {item.nombre_usuario || "Sin nombre"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {item.username}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {item.ip_address || "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {new Date(item.created_at).toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}