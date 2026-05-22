export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Sin resultados',
  loadingMessage = 'Cargando...',
  onRowClick,
  getRowKey,
  // Paginación — opcionales, si no se pasan no se muestra el paginador
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) {
  const colSpan = columns.length || 1;
  const hasPagination = totalPages > 1 && typeof onPageChange === 'function';

  // Genera el rango de páginas visibles: máximo 5 botones centrados en la página actual
  const getPageRange = () => {
    if (!totalPages) return [];
    const delta = 2;
    const range = [];
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) {
      range.push(1);
      if (left > 2) range.push('...');
    }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) range.push('...');
      range.push(totalPages);
    }
    return range;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3" scope="col">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-12" colSpan={colSpan}>
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-3">
                      progress_activity
                    </span>
                    <p className="text-sm font-medium">{loadingMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td className="px-6 py-4 text-center" colSpan={colSpan}>
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading && data.map((row, index) => (
              <tr
                key={getRowKey ? getRowKey(row) : row.id || row.id_persona || index}
                onClick={() => onRowClick?.(row)}
                className={`bg-white dark:bg-background-dark/50 border-b dark:border-gray-700 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador — solo se muestra si hay más de una página */}
      {hasPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">

          {/* Info de resultados */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalItems != null && (
              <>
                <span className="font-medium text-gray-700 dark:text-gray-300">{totalItems}</span> resultado{totalItems !== 1 ? 's' : ''}
                {' · '}
              </>
            )}
            Página <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> de{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
          </p>

          {/* Botones de página */}
          <div className="flex items-center gap-1">

            {/* Anterior */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            {/* Números de página */}
            {getPageRange().map((page, i) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Siguiente */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}