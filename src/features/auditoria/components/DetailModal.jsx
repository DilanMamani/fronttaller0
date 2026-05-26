import { X, FileText, Clock, Monitor, User, AlertTriangle, CheckCircle } from 'lucide-react';
import routeDescriptions from '../data/routeDescriptions.json';

const METHOD_LABEL = { GET: 'Consultó', POST: 'Creó', PUT: 'Modificó', PATCH: 'Actualizó', DELETE: 'Eliminó' };

const ACCION_CONFIG = {
  CREATE: { label: 'Creación',     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  UPDATE: { label: 'Actualización', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
  DELETE: { label: 'Eliminación',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
  READ:   { label: 'Consulta',     color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200' },
};

// Reemplaza la función translateRoute completa por esta:
const buildDescripcion = (data) => {
  const method = data.http_method;
  const url    = data.url || '';
  const entidad = data.entidad || '';
  const accion  = data.accion  || '';

  // Extraer ID de la URL si existe
  const idMatch = url.match(/\/(\d+)(\?|$)/);
  const id = idMatch ? idMatch[1] : null;

  // Traducción semántica usando entidad + accion del backend
  if (entidad && accion) {
    const entidadLabel = {
      personas:               'persona',
      usuarios:               'usuario',
      sacramentos:            'sacramento',
      parroquias:             'parroquia',
      matrimoniodetalles:     'detalle matrimonial',
      personasacramentos:     'sacramento de persona',
      tiposacramentos:        'tipo de sacramento',
      rolsacramentos:         'rol sacramental',
      configuracion:          'configuración de seguridad',
      'dominio-permitido':    'dominio permitido',
      'usuario-parroquia':    'asignación de parroquia',
    }[entidad] || entidad;

    // Si hay campos modificados, listarlos
    const campos = data.campos_modificados
      ? Object.keys(data.campos_modificados).join(', ')
      : null;

    switch (accion) {
      case 'CREATE':
        return `Registró ${articuloIndefinido(entidadLabel)} ${entidadLabel}${id ? ` (ID ${id})` : ''}`;
      case 'UPDATE':
        return campos
          ? `Modificó ${campos} de ${articuloDefinido(entidadLabel)} ${entidadLabel}${id ? ` (ID ${id})` : ''}`
          : `Actualizó ${articuloDefinido(entidadLabel)} ${entidadLabel}${id ? ` (ID ${id})` : ''}`;
      case 'DELETE':
        return `Eliminó ${articuloDefinido(entidadLabel)} ${entidadLabel}${id ? ` (ID ${id})` : ''}`;
      case 'READ':
        return id
          ? `Consultó ${articuloDefinido(entidadLabel)} ${entidadLabel} con ID ${id}`
          : `Consultó la lista de ${entidadLabel}s`;
      default:
        return `${accion} sobre ${entidadLabel}`;
    }
  }

  // Fallback al JSON si no hay entidad/accion
  const path = url.split('?')[0].replace(/\/\d+$/, '/:id');
  const routeGroup = routeDescriptions[path] || routeDescriptions[url.split('?')[0]];
  if (routeGroup?.[method]) return routeGroup[method];

  return `${METHOD_LABEL[method] || 'Acción'} en ${url.split('?')[0]}`;
};

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

// Helpers de artículos
const articuloDefinido   = (e) => ['usuario', 'sacramento', 'rol sacramental'].includes(e) ? 'el' : 'la';
const articuloIndefinido = (e) => ['usuario', 'sacramento', 'rol sacramental'].includes(e) ? 'un'  : 'una';

// Fila de detalle — igual al modal de seguridad
const DetailRow = ({ label, value }) => (
  <div className="py-2">
    <dt className="text-xs font-medium text-muted-light dark:text-muted-dark">{label}</dt>
    <dd className="mt-1 text-sm text-foreground-light dark:text-foreground-dark break-words">{value ?? 'N/A'}</dd>
  </div>
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

  const accionConfig = ACCION_CONFIG[data.accion] || { label: data.accion, color: 'bg-gray-100 text-gray-700' };
  const tieneCambios = data.dato_anterior || data.dato_nuevo || data.campos_modificados;

  const requestBody = (() => {
    if (!data.request_body) return null;
    if (typeof data.request_body === 'object') return data.request_body;
    try { return JSON.parse(data.request_body); }
    catch { return null; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border-light bg-card-light shadow-xl dark:border-border-dark dark:bg-card-dark">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              Registro de Cambio
            </h3>
          </div>
          <button onClick={onClose}
            className="rounded-md p-1 text-muted-light hover:bg-background-light dark:text-muted-dark dark:hover:bg-background-dark">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 space-y-6">

          {/* Acción + resultado */}
          {/* Acción + resultado */}
        <div className="flex flex-col gap-3">
          <span className={`inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${accionConfig.color}`}>
            {accionConfig.label}
          </span>

          {/* ← antes era translateRoute(data.http_method, data.url) */}
          <p className="text-base font-medium text-foreground-light dark:text-foreground-dark">
            {buildDescripcion(data)}
          </p>

          {(() => {
            const s = data.http_status;
            if (s >= 500) return (
              <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" /> Error del servidor ({s})
              </span>
            );
            if (s >= 400) return (
              <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" /> Solicitud rechazada ({s})
              </span>
            );
            return (
              <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle className="h-4 w-4" /> Operación exitosa
              </span>
            );
          })()}
        </div>

          {/* Usuario */}
          <div className="border-b pb-4 border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-light dark:text-muted-dark" />
              <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">Usuario</h4>
            </div>
            <p className="text-base font-medium">{data.nombre_usuario || 'Sin nombre'}</p>
            <p className="text-sm text-muted-light dark:text-muted-dark">{data.username || '—'}</p>
          </div>

          {/* Fecha y duración */}
          <div className="flex items-center justify-between border-b pb-4 border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 text-sm text-muted-light dark:text-muted-dark">
              <Clock className="h-4 w-4" />
              <span>{new Date(data.fecha_inicio).toLocaleString()}</span>
            </div>
            <span className="text-sm font-semibold text-primary">
              {data.duracion_ms} ms
            </span>
          </div>

          {/* Cambios realizados */}
          {tieneCambios && (
            <div className="border-b pb-6 border-border-light dark:border-border-dark space-y-4">
              <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                Cambios realizados
              </h4>

              {/* Tabla diff */}
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
                            {anterior === null ? '—' : String(anterior)}
                          </td>
                          <td className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {nuevo === null ? '—' : String(nuevo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Información técnica */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-4 w-4 text-muted-light dark:text-muted-dark" />
              <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                Información técnica
              </h4>
            </div>
            <DetailRow label="Método HTTP"      value={data.http_method} />
            <DetailRow label="Estado HTTP"      value={data.http_status} />
            <DetailRow label="Entidad"          value={ENTIDAD_LABEL[data.entidad] || data.entidad} />
            <DetailRow label="Dirección IP"     value={data.ip_address} />
            <DetailRow label="ID correlación"   value={data.correlation_id} />
            <DetailRow label="Aplicación"       value={data.application_name} />
            <DetailRow label="User-Agent"       value={data.user_agent} />
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