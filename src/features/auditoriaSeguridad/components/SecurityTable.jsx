import { Eye, CheckCircle, XCircle } from 'lucide-react';

const EVENTO_CONFIG = {
  LOGIN_OK:                  { label: 'Login exitoso',          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  LOGIN_FAIL:                { label: 'Login fallido',          color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
  LOGIN_2FA_ENVIADO:         { label: '2FA enviado',            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' },
  LOGOUT:                    { label: 'Logout',                 color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200' },
  PASSWORD_RESET_SOLICITADO: { label: 'Reset solicitado',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
  PASSWORD_SETUP_SOLICITADO: { label: 'Cambio de contraseña solicitado',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
  PASSWORD_CHANGE_OK:        { label: 'Contraseña cambiada',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  PASSWORD_SETUP_OK:         { label: 'Contraseña configurada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  PASSWORD_CHANGE_FAIL:      { label: 'Cambio fallido',         color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
  PASSWORD_TOKEN_INVALIDO:   { label: 'Token inválido',         color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
  ROLE_CHANGE:               { label: 'Cambio de rol',          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' },
};

const TH = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark ${className}`}>
    {children}
  </th>
);

export default function SecurityTable({ data, onViewDetails }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              <TH>Evento</TH>
              <TH>Resultado</TH>
              <TH>Nombre</TH>
              <TH>Correo</TH>
              <TH>IP</TH>
              <TH>Detalle</TH>
              <TH>Fecha</TH>
              <TH></TH>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-light bg-card-light dark:divide-border-dark dark:bg-card-dark">
            {data.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-sm text-muted-light dark:text-muted-dark">
                  No hay registros de seguridad.
                </td>
              </tr>
            ) : data.map((item) => {
              const config = EVENTO_CONFIG[item.evento] || { label: item.evento, color: 'bg-gray-100 text-gray-700' };
              return (
                <tr key={item.id_log} className="hover:bg-background-light dark:hover:bg-background-dark">

                  {/* Evento */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </td>

                  {/* Resultado */}
                  <td className="px-6 py-4">
                    {item.exitoso ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" /> Exitoso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-sm font-medium">
                        <XCircle className="h-4 w-4" /> Fallido
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {item.nombre_usuario || 'Sin nombre'}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                    {item.username || '—'}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                    {item.ip_address || '—'}
                  </td>

                  {/* Detalle / razón */}
                  <td className="px-6 py-4 text-sm text-muted-light dark:text-muted-dark max-w-xs truncate">
                    {item.detalle || '—'}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-light dark:text-muted-dark">
                    {new Date(item.fecha).toLocaleString()}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}