import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const INPUT_CLASS =
  'mt-1 block w-full rounded-md border border-border-light bg-card-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark';

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
    {children}
  </label>
);

const EVENTOS = [
  { value: 'LOGIN_OK',                  label: 'Login exitoso' },
  { value: 'LOGIN_FAIL',                label: 'Login fallido' },
  { value: 'LOGIN_2FA_ENVIADO',         label: '2FA enviado' },
  { value: 'LOGOUT',                    label: 'Logout' },
  { value: 'PASSWORD_RESET_SOLICITADO', label: 'Reset solicitado' },
  { value: 'PASSWORD_SETUP_SOLICITADO', label: 'Cambio de contraseña solicitado' },
  { value: 'PASSWORD_CHANGE_OK',        label: 'Contraseña cambiada' },
  { value: 'PASSWORD_SETUP_OK',         label: 'Contraseña configurada' },
  { value: 'PASSWORD_CHANGE_FAIL',      label: 'Cambio fallido' },
  { value: 'PASSWORD_TOKEN_INVALIDO',   label: 'Token inválido' },
  { value: 'ROLE_CHANGE',               label: 'Cambio de rol' }
];

export default function SecurityFilterSection({ filters, onFilterChange, onApplyFilters, onClearFilters, hasActiveFilters }) {
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
            Filtros de Seguridad
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

            <div>
              <Label>Correo</Label>
              <input type="text" value={filters.username} placeholder="Buscar correo..."
                onChange={e => set('username', e.target.value)} className={INPUT_CLASS} />
            </div>

            <div>
              <Label>Evento</Label>
              <select value={filters.evento} onChange={e => set('evento', e.target.value)} className={INPUT_CLASS}>
                <option value="">Todos</option>
                {EVENTOS.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Resultado</Label>
              <select value={filters.exitoso} onChange={e => set('exitoso', e.target.value)} className={INPUT_CLASS}>
                <option value="">Todos</option>
                <option value="true">Exitoso</option>
                <option value="false">Fallido</option>
              </select>
            </div>

            <div>
              <Label>Dirección IP</Label>
              <input type="text" value={filters.ipAddress} placeholder="xxx.xxx.xxx.xxx"
                onChange={e => set('ipAddress', e.target.value)} className={INPUT_CLASS} />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Label>ID de Correlación</Label>
              <input type="text" value={filters.correlationId} placeholder="abc-123-def..."
                onChange={e => set('correlationId', e.target.value)} className={INPUT_CLASS} />
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