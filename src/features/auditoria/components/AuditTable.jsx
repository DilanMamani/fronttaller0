import { Eye } from 'lucide-react';
import routeDescriptions from '../data/routeDescriptions.json';

const getStatusColor = (s) => {
  if (s >= 200 && s < 300) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200';
  if (s >= 400 && s < 500) return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200';
  if (s >= 500)            return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

const getMethodColor = (m) => ({
  GET:    'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
  POST:   'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  PUT:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  PATCH:  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
}[m] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200');

const getAccionColor = (a) => ({
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  UPDATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  READ:   'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
}[a] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200');

const ACCION_LABEL = { CREATE: 'Creó', UPDATE: 'Actualizó', DELETE: 'Eliminó', READ: 'Consultó' };
const METHOD_LABEL = { GET: 'Consulta', POST: 'Crea', PUT: 'Modifica', PATCH: 'Actualiza', DELETE: 'Elimina' };

const ENTIDAD_LABEL = {
  personas:               'Personas',
  usuarios:               'Usuarios',
  sacramentos:            'Sacramentos',
  parroquias:             'Parroquias',
  matrimoniodetalles:     'Detalles matrimoniales',
  personasacramentos:     'Sacramentos por persona',
  tiposacramentos:        'Tipos de sacramento',
  rolsacramentos:         'Roles sacramentales',
  configuracion:          'Configuración de seguridad',
  'dominio-permitido':    'Dominios permitidos',
  'usuario-parroquia':    'Asignación de parroquia',
  roles:                  'Roles',
  permisos:               'Permisos',
  riesgos:                'Riesgos',
  auditoria:              'Auditoría',
};

const translateRoute = (method, originalUrl) => {
  let url = originalUrl.trim().replace(/\+/g, ' ').replace(/\/\?/, '?').replace(/&&+/g, '&').replace(/\/+$/, '').replace(/\?$/, '');
  const [rawPath, rawQuery] = url.split('?');
  const path = rawPath.replace(/\/$/, '');
  const normalizedPath = path.replace(/\/\d+$/, '/:id');
  const routeGroup = routeDescriptions[normalizedPath] || routeDescriptions[path];

  if (!routeGroup) return `${METHOD_LABEL[method] || 'Acción'} en ${path}`;
  if (!rawQuery)   return routeGroup[method] || `${METHOD_LABEL[method] || 'Acción'} en ${path}`;

  const queryParams = {};
  rawQuery.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) queryParams[key] = decodeURIComponent(value.trim());
  });

  for (const jsonKey of Object.keys(routeGroup)) {
    if (!jsonKey.startsWith(method + '?')) continue;
    const expectedParams = jsonKey.replace(method + '?', '').split('&');
    let allMatch = true, text = routeGroup[jsonKey];
    for (const ep of expectedParams) {
      const [paramName] = ep.split('=');
      if (!queryParams[paramName]) { allMatch = false; break; }
      text = text.replace('{value}', queryParams[paramName]);
    }
    if (allMatch) return text;
  }

  const readable = Object.entries(queryParams).map(([k, v]) => `${k}: ${v}`).join(', ');
  return readable ? `${METHOD_LABEL[method] || 'Acción'} en ${path} — filtros: ${readable}` : `${METHOD_LABEL[method] || 'Acción'} en ${path}`;
};

const FILTER_LABEL = {
  nombre: 'nombre', apellido_paterno: 'apellido paterno', apellido_materno: 'apellido materno',
  email: 'correo', fecha_nacimiento: 'fecha de nacimiento', rol: 'rol',
  activo: 'activo', id_parroquia: 'parroquia', username: 'correo',
};
const IGNORED_PARAMS = new Set(['page', 'limit', 'offset', 'size', 'per_page']);

const extractFilters = (url) => {
  const query = url?.split('?')[1];
  if (!query) return null;
  const entries = query.split('&').flatMap((pair) => {
    const [k, v] = pair.split('=');
    if (!k || !v || IGNORED_PARAMS.has(k)) return [];
    const label = FILTER_LABEL[k] || k;
    return [`${label}: ${decodeURIComponent(v.replace(/\+/g, ' '))}`];
  });
  return entries.length ? entries.join(', ') : null;
};

const buildRowDescription = (item) => {
  const { entidad, accion, http_method, url } = item;

  if (entidad && accion) {
    const label = ENTIDAD_LABEL[entidad] || entidad;
    switch (accion) {
      case 'CREATE': return `Registró en ${label}`;
      case 'UPDATE': return `Actualizó en ${label}`;
      case 'DELETE': return `Eliminó de ${label}`;
      case 'READ': {
        const filters = extractFilters(url);
        return filters ? `Consultó ${label} — ${filters}` : `Consultó ${label}`;
      }
      default: return `${accion} sobre ${label}`;
    }
  }

  return translateRoute(http_method, url);
};

const TH = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark ${className}`}>
    {children}
  </th>
);

export default function AuditTable({ data, onViewDetails }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              <TH>Acción</TH>
              <TH>Entidad</TH>
              <TH>Nombre</TH>
              <TH>Correo</TH>
              <TH>IP</TH>
              <TH>Fecha</TH>
              <TH>Detalle</TH>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-light bg-card-light dark:divide-border-dark dark:bg-card-dark">
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-sm text-muted-light dark:text-muted-dark">
                  No hay registros de auditoría.
                </td>
              </tr>
            ) : data.map((item) => (
              <tr key={item.id_log} className="hover:bg-background-light dark:hover:bg-background-dark">

                {/* Acción HTTP */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(item.http_status)}`}>
                        {item.http_status}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getMethodColor(item.http_method)}`}>
                        {METHOD_LABEL[item.http_method] || item.http_method}
                      </span>
                    </div>
                    <span className="text-sm text-foreground-light dark:text-foreground-dark">
                      {buildRowDescription(item)}
                    </span>
                  </div>
                </td>

                {/* Entidad + acción semántica */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {item.accion && (
                      <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold ${getAccionColor(item.accion)}`}>
                        {ACCION_LABEL[item.accion] || item.accion}
                      </span>
                    )}
                    <span className="text-sm text-muted-light dark:text-muted-dark">
                      {ENTIDAD_LABEL[item.entidad] || item.entidad || '—'}
                    </span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.nombre_usuario || 'Sin nombre'}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {item.username}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {item.ip_address || '—'}
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
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}