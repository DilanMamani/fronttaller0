import { X } from "lucide-react";
import routeDescriptions from "../data/routeDescriptions.json";

export default function DetailModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;


  const parseRequestBody = (requestBody) => {
    if (!requestBody) return null;

    if (typeof requestBody === "object") return requestBody;

    if (typeof requestBody === "string") {
      try {
        return JSON.parse(requestBody);
      } catch {
        return { error: "JSON inválido", raw: requestBody };
      }
    }

    return null;
  };

  const requestBody = parseRequestBody(data.request_body);

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
  let url = originalUrl.trim();

  // --- LIMPIEZA UNIVERSAL DE URL ANTES DE PROCESAR ---
  url = url
    .replace(/\/\?/, "?")          // quitar barra antes del ?
    .replace(/&&+/g, "&")          // evitar && duplicados
    .replace(/\?&/, "?")           // quitar ?&
    .replace(/=&/g, "&")           // nombre=&direccion= → nombre&direccion=
    .replace(/=$/, "")             // quitar "=" final
    .replace(/\/+$/, "")           // quitar barras finales
    .replace(/\?$/, "");           // quitar ? al final si está vacío

  // --- Separar path y query ---
  const [rawPath, rawQuery] = url.split("?");
  const path = rawPath.replace(/\/$/, "");
  
  // Normalizar path con ID → /:id
  const normalizedPath = path.replace(/\/\d+$/, "/:id");

  // Buscar grupo dentro del JSON
  const routeGroup =
    routeDescriptions[normalizedPath] || routeDescriptions[path];

  if (!routeGroup) {
    return `${translateMethod(method)} en ${path}`;
  }

  // --- Si NO hay parámetros ---
  if (!rawQuery) {
    return routeGroup[method] || `${translateMethod(method)} en ${path}`;
  }

  // --- Parsear query params ---
  const queryParams = {};
  rawQuery.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    queryParams[key] = decodeURIComponent(value || "");
  });

  // ---- BUSCADOR POTENTE DE RUTAS DINÁMICAS ----
  for (const jsonKey of Object.keys(routeGroup)) {
    if (!jsonKey.startsWith(method + "?")) continue;

    // Dividir parámetros del JSON
    const expectedParams = jsonKey.replace(method + "?", "").split("&");

    let allMatch = true;
    let output = routeGroup[jsonKey];

    for (const p of expectedParams) {
      const [paramName] = p.split("=");

      if (!queryParams[paramName]) {
        allMatch = false;
        break;
      }

      // Reemplazar {value} con el valor real
      output = output.replace("{value}", queryParams[paramName]);
    }

    if (allMatch) return output;
  }

  // Fallback si no encuentra coincidencia
  return `${translateMethod(method)} en ${url}`;
};

  const DetailRow = ({ label, value }) => (
    <div className="py-3">
      <dt className="text-xs font-medium text-muted-light dark:text-muted-dark">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground-light dark:text-foreground-dark break-words">
        {value || "N/A"}
      </dd>
    </div>
  );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-xl border border-border-light bg-card-light shadow-xl dark:border-border-dark dark:bg-card-dark">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
            Detalle de Auditoría
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-light hover:bg-background-light dark:text-muted-dark dark:hover:bg-background-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 space-y-8">

          {/* Acción traducida (lo más importante) */}
          <div>
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              {translateRoute(data.http_method, data.url)}
            </h2>
            <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
              Acción registrada desde el módulo:{" "}
              <strong>{data.application_name}</strong>
            </p>
          </div>

          {/* Usuario */}
          <div className="border-b pb-4 border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              Usuario
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-base">{data.nombre_usuario}</p>
              <p className="text-sm text-muted-light dark:text-muted-dark">
                {data.username}
              </p>
            </div>
          </div>

          {/* Información temporal */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground-light dark:text-foreground-dark">
              Información temporal
            </h3>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-300">
                  Inicio
                </span>
                <p className="font-medium">
                  {new Date(data.fecha_inicio).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-xs text-blue-600 dark:text-blue-300">
                  Fin
                </span>
                <p className="font-medium">
                  {new Date(data.fecha_fin).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-xs text-blue-600 dark:text-blue-300">
                  Duración
                </span>
                <p className="font-bold text-indigo-600 dark:text-indigo-300">
                  {data.duracion_ms} ms
                </p>
              </div>
            </div>
          </div>

          {/* Datos técnicos — sección completa */}
          <div className="space-y-4 border-b pb-6 border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              Información técnica
            </h3>

            <DetailRow label="Método HTTP" value={data.http_method} />
            <DetailRow label="Estado HTTP" value={data.http_status} />
            <DetailRow label="IP" value={data.ip_address} />
            <DetailRow label="URL completa" value={data.url} />
            <DetailRow
              label="ID de correlación"
              value={data.correlation_id}
            />
            <DetailRow
              label="User-Agent"
              value={data.user_agent}
            />

            <div>
              <dt className="text-sm font-medium text-muted-light dark:text-muted-dark">
                ¿Hubo excepción?
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    data.has_exception
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {data.has_exception ? "Sí" : "No"}
                </span>
              </dd>
            </div>
          </div>

          {/* Request body */}
          <div>
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              Parámetros enviados
            </h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {requestBody
                ? JSON.stringify(requestBody, null, 2)
                : "No se enviaron parámetros."}
            </pre>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-border-light px-6 py-4 dark:border-border-dark">
          <button
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}