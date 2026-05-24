export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-sm w-full rounded-xl px-4 py-3.5 border ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
          : 'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800'
      }`}
    >
      {/* Ícono */}
      <span
        className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${
          isSuccess ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        {isSuccess ? 'check_circle' : 'error'}
      </span>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isSuccess ? 'text-emerald-800' : 'text-rose-800'}`}>
          {isSuccess ? 'Éxito' : 'Error'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
          {toast.message}
        </p>
      </div>

      {/* Botón cerrar */}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}

      {/* Barra de progreso */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 rounded-bl-xl animate-[shrink_4s_linear_forwards] ${
          isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
        style={{ width: '100%' }}
      />
    </div>
  );
}