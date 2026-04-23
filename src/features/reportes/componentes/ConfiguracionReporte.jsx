function ConfiguracionReporte({ config, setConfig }) {
  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración del Reporte</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personalice el formato y contenido</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Título del Reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título del Reporte
          </label>
          <input
            type="text"
            value={config.titulo}
            onChange={(e) => setConfig(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ej. Reporte de Sacramentos 2024"
            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
          />
        </div>

        {/* Incluir Estadísticas */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Incluir Estadísticas</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Agregar gráficos y resúmenes estadísticos al reporte</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.incluirEstadisticas}
              onChange={(e) => setConfig(prev => ({ ...prev, incluirEstadisticas: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Vista Previa de Estadísticas */}
        {config.incluirEstadisticas && (
          <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Estadísticas Incluidas</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Total de registros
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Distribución por tipo de sacramento
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Distribución por parroquia
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Registros por mes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Estado (Activos/Inactivos)
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} export default ConfiguracionReporte;  