export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Sin resultados',
  loadingMessage = 'Cargando...',
  onRowClick,
  getRowKey,
}) {
  const colSpan = columns.length || 1;

  return (
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
              <td className="px-6 py-4" colSpan={colSpan}>
                {emptyMessage}
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row, index) => (
              <tr
                key={getRowKey ? getRowKey(row) : row.id || row.id_persona || index}
                onClick={() => onRowClick?.(row)}
                className={`bg-white dark:bg-background-dark/50 border-b dark:border-gray-700 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                    : ''
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
  );
}