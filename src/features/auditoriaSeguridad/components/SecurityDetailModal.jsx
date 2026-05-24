import { X, CheckCircle, XCircle, Shield, Clock, Monitor } from 'lucide-react';

const EVENTO_CONFIG = {
  LOGIN_OK:                  { label: 'Login exitoso',          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  LOGIN_FAIL:                { label: 'Login fallido',          color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
  LOGIN_2FA_ENVIADO:         { label: '2FA enviado',            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' },
  LOGOUT:                    { label: 'Logout',                 color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200' },
  PASSWORD_RESET_SOLICITADO: { label: 'Reset solicitado',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
  PASSWORD_SETUP_SOLICITADO: { label: 'Setup solicitado',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
  PASSWORD_CHANGE_OK:        { label: 'Contraseña cambiada',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  PASSWORD_SETUP_OK:         { label: 'Contraseña configurada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  PASSWORD_CHANGE_FAIL:      { label: 'Cambio fallido',         color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
  PASSWORD_TOKEN_INVALIDO:   { label: 'Token inválido',         color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
};

const DetailRow = ({ label, value }) => (
  <div className="py-2">
    <dt className="text-xs font-medium text-muted-light dark:text-muted-dark">{label}</dt>
    <dd className="mt-1 text-sm text-foreground-light dark:text-foreground-dark break-words">{value || 'N/A'}</dd>
  </div>
);

export default function SecurityDetailModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const config = EVENTO_CONFIG[data.evento] || { label: data.evento, color: 'bg-gray-100 text-gray-700' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border-light bg-card-light shadow-xl dark:border-border-dark dark:bg-card-dark">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              Evento de Seguridad
            </h3>
          </div>
          <button onClick={onClose}
            className="rounded-md p-1 text-muted-light hover:bg-background-light dark:text-muted-dark dark:hover:bg-background-dark">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 space-y-6">

          {/* Evento + resultado */}
          <div className="flex flex-col gap-3">
            <span className={`inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${config.color}`}>
              {config.label}
            </span>
            {data.exitoso ? (
              <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="h-5 w-5" /> Operación exitosa
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <XCircle className="h-5 w-5" /> Operación fallida
              </span>
            )}
          </div>

          {/* Razón / detalle */}
          {data.detalle && (
            <div className={`rounded-lg px-4 py-3 text-sm ${
              data.exitoso
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200'
            }`}>
              {data.detalle}
            </div>
          )}

          {/* Usuario */}
          <div className="border-b pb-4 border-border-light dark:border-border-dark">
            <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              Usuario
            </h4>
            <p className="text-base font-medium">{data.nombre_usuario || 'Sin nombre'}</p>
            <p className="text-sm text-muted-light dark:text-muted-dark">{data.username || '—'}</p>
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-2 text-sm text-muted-light dark:text-muted-dark">
            <Clock className="h-4 w-4" />
            <span>{new Date(data.fecha).toLocaleString()}</span>
          </div>

          {/* Técnico */}
          <div className="space-y-1 border-t pt-4 border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-4 w-4 text-muted-light dark:text-muted-dark" />
              <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                Información técnica
              </h4>
            </div>
            <DetailRow label="Dirección IP"      value={data.ip_address} />
            <DetailRow label="ID de correlación" value={data.correlation_id} />
            <DetailRow label="Aplicación"        value={data.application_name} />
            <DetailRow label="User-Agent"        value={data.user_agent} />
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