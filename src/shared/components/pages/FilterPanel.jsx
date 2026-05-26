import { useState } from 'react';
import FormFields from './FormFields';

export default function FilterPanel({
  title = 'Filtros',
  description = 'Use uno o más campos para filtrar los resultados.',
  fields = [],
  values = {},
  setValues,
  onSearch,
  onReset,
}) {
  const [open, setOpen] = useState(false);

  const activeFilters = Object.values(values).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length;

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeFilters > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {activeFilters} activo(s)
            </span>
          )}

          <span className="material-symbols-outlined text-gray-500">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {open && (
        <form className="p-5 border-t border-gray-100 dark:border-gray-800" onSubmit={onSearch}>
          <FormFields
            fields={fields}
            values={values}
            setValues={setValues}
          />

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
            >
              Buscar
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
            >
              Limpiar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}