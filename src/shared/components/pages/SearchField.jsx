import { ClipLoader } from 'react-spinners';

/**
 * SearchField — campo de búsqueda con dropdown de resultados.
 *
 * Props:
 *  label        — etiqueta visible encima del input
 *  placeholder  — placeholder del input
 *  value        — valor controlado del input
 *  onChange     — (string) => void  llamado cuando el usuario escribe
 *  onSelect     — (item) => void    llamado cuando el usuario elige un resultado
 *  items        — array de resultados
 *  loading      — boolean
 *  open         — boolean, controla si el dropdown está visible
 *  selected     — boolean, indica que ya hay una selección (oculta dropdown)
 *  getKey       — (item) => string|number
 *  getTitle     — (item) => string  línea principal del resultado
 *  getSubtitle  — (item) => string  línea secundaria del resultado
 *  emptyMessage — string mostrado si no hay resultados (default genérico)
 *  readOnly     — boolean, muestra el campo como solo lectura
 *  helpText     — string opcional debajo del campo
 *  required     — boolean
 */
export default function SearchField({
  label,
  placeholder = 'Buscar...',
  value,
  onChange,
  onSelect,
  items = [],
  loading = false,
  open = false,
  selected = false,
  getKey,
  getTitle,
  getSubtitle,
  emptyMessage = 'No se encontraron resultados.',
  readOnly = false,
  helpText,
  required = false,
}) {
  const showDropdown = open && !selected;
  const showEmpty = showDropdown && !loading && items.length === 0 && value.trim().length >= 2;
  const showItems = showDropdown && !loading && items.length > 0;

  if (readOnly) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-700 dark:text-gray-300 min-h-[46px]">
          {value || <span className="text-gray-400">—</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
        />

        {/* Ícono de búsqueda */}
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none">
          {loading ? 'autorenew' : 'search'}
        </span>

        {/* Dropdown */}
        {(showDropdown || showEmpty) && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">

            {/* Spinner */}
            {loading && (
              <div className="flex justify-center items-center py-4">
                <ClipLoader size={26} color="#4f46e5" />
              </div>
            )}

            {/* Sin resultados */}
            {showEmpty && (
              <p className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </p>
            )}

            {/* Resultados */}
            {showItems && items.map((item) => (
              <button
                key={getKey(item)}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full text-left px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                  {getTitle(item)}
                </span>
                {getSubtitle && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {getSubtitle(item)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helpText}</p>
      )}
    </div>
  );
}