import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FilterSection({ filters, onFilterChange, onApplyFilters, onClearFilters, hasActiveFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

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
              <span className="h-2 w-2 rounded-full bg-white"></span>
              Activos
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-light dark:text-muted-dark" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-light dark:text-muted-dark" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border-light px-6 py-4 dark:border-border-dark">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* Fecha de Fin */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Fecha de Fin
              </label>
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* Duración Mínima */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Duración Mínima (ms)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minDuration}
                onChange={(e) => handleInputChange('minDuration', e.target.value)}
                placeholder="0"
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* Duración Máxima */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Duración Máxima (ms)
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxDuration}
                onChange={(e) => handleInputChange('maxDuration', e.target.value)}
                placeholder="5000"
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Correo
              </label>
              <input
                type="text"
                value={filters.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Buscar correo..."
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* Nombre de la Aplicación */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Nombre de la Aplicación
              </label>
              <input
                type="text"
                value={filters.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                placeholder="Nombre de app..."
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* Método HTTP */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Método HTTP
              </label>
              <select
                value={filters.httpMethod}
                onChange={(e) => handleInputChange('httpMethod', e.target.value)}
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              >
                <option value="">Todos</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Estatus HTTP */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Estatus HTTP
              </label>
              <select
                value={filters.httpStatus}
                onChange={(e) => handleInputChange('httpStatus', e.target.value)}
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              >
                <option value="">Todos</option>
                <option value="200">200 - OK</option>
                <option value="201">201 - Created</option>
                <option value="400">400 - Bad Request</option>
                <option value="401">401 - Unauthorized</option>
                <option value="403">403 - Forbidden</option>
                <option value="404">404 - Not Found</option>
                <option value="500">500 - Server Error</option>
              </select>
            </div>

            {/* Dirección IP */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Dirección IP
              </label>
              <input
                type="text"
                value={filters.ipAddress}
                onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                placeholder="192.168.1.1"
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* ¿Tiene Excepción? */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                ¿Tiene Excepción?
              </label>
              <select
                value={filters.hasException}
                onChange={(e) => handleInputChange('hasException', e.target.value)}
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* ID de Correlación */}
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                ID de Correlación
              </label>
              <input
                type="text"
                value={filters.correlationId}
                onChange={(e) => handleInputChange('correlationId', e.target.value)}
                placeholder="abc-123-def..."
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* URL Endpoint */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                URL (Endpoint)
              </label>
              <input
                type="text"
                value={filters.endpoint}
                onChange={(e) => handleInputChange('endpoint', e.target.value)}
                placeholder="/api/users"
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>

            {/* User Agent */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Información del Navegador
              </label>
              <input
                type="text"
                value={filters.userAgent}
                onChange={(e) => handleInputChange('userAgent', e.target.value)}
                placeholder="Mozilla/5.0..."
                className="mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={onApplyFilters}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={onClearFilters}
              className="rounded-md border border-border-light bg-card-light px-4 py-2 text-sm font-medium text-foreground-light transition-colors hover:bg-background-light dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:hover:bg-background-dark"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}