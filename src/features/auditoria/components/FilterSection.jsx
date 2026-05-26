import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const INPUT_CLASS =
  'mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark';

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
    {children}
  </label>
);

export default function FilterSection({ filters, onFilterChange, onApplyFilters, onClearFilters, hasActiveFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  const set = (field, value) => onFilterChange({ ...filters, [field]: value });

  return (
    <div className="rounded-lg border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            Filtros de Auditoría
          </h2>
          {hasActiveFilters && (
            <span className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-white" />
              Activos
            </span>
          )}
        </div>
        {isOpen
          ? <ChevronUp className="h-5 w-5 text-muted-light dark:text-muted-dark" />
          : <ChevronDown className="h-5 w-5 text-muted-light dark:text-muted-dark" />
        }
      </button>

      {isOpen && (
        <div className="border-t border-border-light px-6 py-4 dark:border-border-dark">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Fechas */}
            <div>
              <Label>Fecha de Inicio</Label>
              <input type="datetime-local" value={filters.startDate}
                onChange={e => set('startDate', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <Label>Fecha de Fin</Label>
              <input type="datetime-local" value={filters.endDate}
                onChange={e => set('endDate', e.target.value)} className={INPUT_CLASS} />
            </div>

            {/* Duración */}
            <div>
              <Label>Duración Mínima (ms)</Label>
              <input type="number" min="0" value={filters.minDuration} placeholder="0"
                onChange={e => set('minDuration', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <Label>Duración Máxima (ms)</Label>
              <input type="number" min="0" value={filters.maxDuration} placeholder="5000"
                onChange={e => set('maxDuration', e.target.value)} className={INPUT_CLASS} />
            </div>

            {/* Usuario */}
            <div>
              <Label>Correo</Label>
              <input type="text" value={filters.username} placeholder="Buscar correo..."
                onChange={e => set('username', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <Label>Nombre de la Aplicación</Label>
              <input type="text" value={filters.appName} placeholder="Nombre de app..."
                onChange={e => set('appName', e.target.value)} className={INPUT_CLASS} />
            </div>

            {/* HTTP */}
            <div>
              <Label>Método HTTP</Label>
              <select value={filters.httpMethod} onChange={e => set('httpMethod', e.target.value)} className={INPUT_CLASS}>
                <option value="">Todos</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <Label>Estatus HTTP</Label>
              <select value={filters.httpStatus} onChange={e => set('httpStatus', e.target.value)} className={INPUT_CLASS}>
                <option value="">Todos</option>
                <option value="200">200 — Exitoso</option>
                <option value="201">201 — Creado</option>
                <option value="400">400 — Solicitud inválida</option>
                <option value="401">401 — No autenticado</option>
                <option value="403">403 — Sin permiso</option>
                <option value="404">404 — No encontrado</option>
                <option value="500">500 — Error del servidor</option>
              </select>
            </div>

            {/* Entidad y Acción — nuevos */}
            <div>
              <Label>Entidad</Label>
              <input type="text" value={filters.entidad} placeholder="usuarios, sacramentos..."
                onChange={e => set('entidad', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <Label>Acción</Label>
              <select value={filters.accion} onChange={e => set('accion', e.target.value)} className={INPUT_CLASS}>
                <option value="">Todas</option>
                <option value="CREATE">Crear</option>
                <option value="UPDATE">Actualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="READ">Consultar</option>
              </select>
            </div>

            {/* Red */}
            <div>
              <Label>Dirección IP</Label>
              <input type="text" value={filters.ipAddress} placeholder="192.168.1.1"
                onChange={e => set('ipAddress', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <Label>¿Tiene Excepción?</Label>
              <select value={filters.hasException} onChange={e => set('hasException', e.target.value)} className={INPUT_CLASS}>
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <Label>ID de Correlación</Label>
              <input type="text" value={filters.correlationId} placeholder="abc-123-def..."
                onChange={e => set('correlationId', e.target.value)} className={INPUT_CLASS} />
            </div>

            {/* URL — ancho completo */}
            <div className="md:col-span-2">
              <Label>URL (Endpoint)</Label>
              <input type="text" value={filters.endpoint} placeholder="/api/usuarios"
                onChange={e => set('endpoint', e.target.value)} className={INPUT_CLASS} />
            </div>

            {/* User Agent — ancho completo */}
            <div className="md:col-span-2 lg:col-span-3">
              <Label>Información del Navegador</Label>
              <input type="text" value={filters.userAgent} placeholder="Mozilla/5.0..."
                onChange={e => set('userAgent', e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={onApplyFilters}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              Aplicar Filtros
            </button>
            <button onClick={onClearFilters}
              className="rounded-md border border-border-light bg-card-light px-4 py-2 text-sm font-medium text-foreground-light transition-colors hover:bg-background-light dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:hover:bg-background-dark">
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}