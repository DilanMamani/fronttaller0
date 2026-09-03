/**
 * Campo de texto para la parroquia detectada por OCR en el paso de revisión.
 * A diferencia de un input de solo lectura, permite corregir el texto crudo
 * que leyó el OCR y, si el backend encontró una parroquia parecida en el
 * catálogo real (fuzzy-match), ofrece aplicarla con un clic.
 */
export default function ParroquiaDetectadaField({ value, onChange, sugerencia, incierto }) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
        Parroquia detectada (texto OCR)
        {incierto && (
          <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400">
            · verificar
          </span>
        )}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${
          incierto
            ? 'border-amber-400 focus:ring-amber-200'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      <p className="text-[11px] text-gray-400">
        Texto leído del documento — corrígelo si el OCR se equivocó. No cambia la parroquia ya
        asignada al registro.
      </p>
      {sugerencia?.nombre && sugerencia.nombre !== value && (
        <button
          type="button"
          onClick={() => onChange(sugerencia.nombre)}
          className="self-start flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
          ¿Quisiste decir "{sugerencia.nombre}"? Usar sugerencia
        </button>
      )}
    </div>
  );
}
