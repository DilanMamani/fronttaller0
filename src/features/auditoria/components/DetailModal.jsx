import { X } from 'lucide-react';
import routeDescriptions from '../data/routeDescriptions.json';

const METHOD_LABEL = { GET: 'Obtiene', POST: 'Crea', PUT: 'Modifica', PATCH: 'Actualiza', DELETE: 'Elimina' };

const translateRoute = (method, originalUrl) => {
  let url = originalUrl.trim().replace(/\/\?/, '?').replace(/&&+/g, '&').replace(/\/+$/, '').replace(/\?$/, '');
  const [rawPath, rawQuery] = url.split('?');
  const path = rawPath.replace(/\/$/, '');
  const normalizedPath = path.replace(/\/\d+$/, '/:id');
  const routeGroup = routeDescriptions[normalizedPath] || routeDescriptions[path];

  if (!routeGroup) return `${METHOD_LABEL[method] || 'Acción'} en ${path}`;
  if (!rawQuery)   return routeGroup[method] || `${METHOD_LABEL[method] || 'Acción'} en ${path}`;

  const queryParams = {};
  rawQuery.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value !== undefined) queryParams[key] = decodeURIComponent(value || '');
  });

  for (const jsonKey of Object.keys(routeGroup)) {
    if (!jsonKey.startsWith(method + '?')) continue;
    const expectedParams = jsonKey.replace(method + '?', '').split('&');
    let allMatch = true, output = routeGroup[jsonKey];
    for (const p of expectedParams) {
      const [paramName] = p.split('=');
      if (!queryParams[paramName]) { allMatch = false; break; }
      output = output.replace('{value}', queryParams[paramName]);
    }
    if (allMatch) return output;
  }
  return `${METHOD_LABEL[method] || 'Acción'} en ${url}`;
};

const DetailRow = ({ label, value }) => (
  <div className="py-3">
    <dt className="text-xs font-medium text-muted-light dark:text-muted-dark">{label}</dt>
    <dd className="mt-1 text-sm text-foreground-light dark:text-foreground-dark break-words">{value || 'N/A'}</dd>
  </div>
);

const JsonBlock = ({ value }) => (
  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-48">
    {value ? JSON.stringify(value, null, 2) : 'Sin datos'}
  </pre>
);

export default function DetailModal({ isOpen, onClose, data, loading }) {
  if (!isOpen) return null;

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-white text-sm">Cargando detalle...</p>
        </div>
      </div>
    );
  }

  const requestBody = (() => {
    if (!data.request_body) return null;
    if (typeof data.request_body === 'object') return data.request_body;
    try { return JSON.parse(data.request_body); }
    catch { return { error: 'JSON inválido', raw: data.request_body }; }
  })();

  const tieneCambios = data.dato_anterior || data.dato_nuevo || data.campos_modificados;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-xl border border-border-light bg-card-light shadow-xl dark:border-border-dark dark:bg-card-dark">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
            Detalle de Auditoría
          </h3>
          <button onClick={onClose}
            className="rounded-md p-1 text-muted-light hover:bg-background-light dark:text-muted-dark dark:hover:bg-background-dark">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 space-y-8">

          {/* Acción traducida */}
          <div>
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              {translateRoute(data.http_method, data.url)}
            </h2>
            <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
              Módulo: <strong>{data.application_name}</strong>
              {data.entidad && <> · Entidad: <strong>{data.entidad}</strong></>}
            </p>
          </div>

          {/* Usuario */}
          <div className="border-b pb-4 border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Usuario</h3>
            <div className="mt-2 space-y-1">
              <p className="text-base">{data.nombre_usuario || 'Sin nombre'}</p>
              <p className="text-sm text-muted-light dark:text-muted-dark">{data.username}</p>
            </div>
          </div>

          {/* Tiempos */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground-light dark:text-foreground-dark">
              Información temporal
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-300">Inicio</span>
                <p className="font-medium">{new Date(data.fecha_inicio).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-300">Fin</span>
                <p className="font-medium">{new Date(data.fecha_fin).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-300">Duración</span>
                <p className="font-bold text-indigo-600 dark:text-indigo-300">{data.duracion_ms} ms</p>
              </div>
            </div>
          </div>

          {/* Técnico */}
          <div className="space-y-4 border-b pb-6 border-border-light dark:border-border-dark">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              Información técnica
            </h3>
            <DetailRow label="Método HTTP"     value={data.http_method} />
            <DetailRow label="Estado HTTP"     value={data.http_status} />
            <DetailRow label="IP"              value={data.ip_address} />
            <DetailRow label="URL completa"    value={data.url} />
            <DetailRow label="ID correlación"  value={data.correlation_id} />
            <DetailRow label="User-Agent"      value={data.user_agent} />
            <div>
              <dt className="text-sm font-medium text-muted-light dark:text-muted-dark">¿Hubo excepción?</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                  data.has_exception
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {data.has_exception ? 'Sí' : 'No'}
                </span>
              </dd>
            </div>
          </div>

          {/* ── Cambios realizados ── */}
          {tieneCambios && (
            <div className="space-y-4 border-b pb-6 border-border-light dark:border-border-dark">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                Cambios realizados
              </h3>

              {/* Tabla de diff */}
              {data.campos_modificados && (
                <div className="rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
                  <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                    <thead className="bg-background-light dark:bg-background-dark">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-light dark:text-muted-dark">Campo</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-light dark:text-muted-dark">Antes</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-light dark:text-muted-dark">Después</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark bg-card-light dark:bg-card-dark">
                      {Object.entries(data.campos_modificados).map(([campo, { anterior, nuevo }]) => (
                        <tr key={campo}>
                          <td className="px-4 py-2 text-xs font-medium text-foreground-light dark:text-foreground-dark">
                            {campo}
                          </td>
                          <td className="px-4 py-2 text-xs text-rose-600 dark:text-rose-400 line-through">
                            {anterior === null ? 'null' : String(anterior)}
                          </td>
                          <td className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {nuevo === null ? 'null' : String(nuevo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Snapshots completos */}
              {(data.dato_anterior || data.dato_nuevo) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">Estado anterior</p>
                    <JsonBlock value={data.dato_anterior} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Estado nuevo</p>
                    <JsonBlock value={data.dato_nuevo} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parámetros enviados */}
          <div>
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              Parámetros enviados
            </h3>
            <JsonBlock value={requestBody} />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-border-light px-6 py-4 dark:border-border-dark">
          <button onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}