import React, { useState } from 'react';

export default function DashboardFilters({ filters, onFilterChange, sacramentosList }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const toggleSacramento = (sacramento) => {
    const current = tempFilters.sacramentos || [];
    const updated = current.includes(sacramento)
      ? current.filter(s => s !== sacramento)
      : [...current, sacramento];
    setTempFilters({ ...tempFilters, sacramentos: updated });
  };

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      fechaInicio: '',
      fechaFin: '',
      sacramentos: []
    };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-background-light dark:hover:bg-background-dark transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Filtros</span>
          {(filters.sacramentos?.length > 0 || filters.fechaInicio || filters.fechaFin) && (
            <span className="px-2 py-1 rounded-full bg-primary text-white text-xs font-medium">
              Activos
            </span>
          )}
        </div>
        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-border-light dark:border-border-dark">
          <div className="space-y-6">
            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Inicio</label>
                <input
                  type="date"
                  value={tempFilters.fechaInicio}
                  onChange={(e) => setTempFilters({ ...tempFilters, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Fin</label>
                <input
                  type="date"
                  value={tempFilters.fechaFin}
                  onChange={(e) => setTempFilters({ ...tempFilters, fechaFin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                />
              </div>
            </div>

            {/* Sacramentos  */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sacramentos ({tempFilters.sacramentos?.length || 0} seleccionados)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sacramentosList.map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer hover:bg-card-light dark:hover:bg-card-dark p-3 rounded-lg border border-border-light dark:border-border-dark transition-colors">
                    <input
                      type="checkbox"
                      checked={tempFilters.sacramentos?.includes(s) || false}
                      onChange={() => toggleSacramento(s)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-lg bg-[#0f49bd] text-white text-sm font-medium hover:bg-[#0f49bd]/90 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}