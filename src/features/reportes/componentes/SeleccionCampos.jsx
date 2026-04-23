function SeleccionCampos({ campos, setCampos }) {
  const camposDisponibles = [
    { id: 'fecha_sacramento', label: 'Fecha Sacramento', grupo: 'basico' },
    { id: 'foja', label: 'Foja', grupo: 'basico' },
    { id: 'numero', label: 'Número', grupo: 'basico' },
    { id: 'activo', label: 'Estado', grupo: 'basico' },
    { id: 'tipo_sacramento', label: 'Tipo Sacramento', grupo: 'relaciones' },
    { id: 'parroquia', label: 'Parroquia', grupo: 'relaciones' },
    { id: 'usuario', label: 'Usuario Registro', grupo: 'relaciones' },
    { id: 'fecha_registro', label: 'Fecha Registro', grupo: 'fechas' },
    { id: 'fecha_actualizacion', label: 'Fecha Actualización', grupo: 'fechas' }
  ];

  const toggleCampo = (campoId) => {
    setCampos(prev => 
      prev.includes(campoId) 
        ? prev.filter(c => c !== campoId)
        : [...prev, campoId]
    );
  };

  const seleccionarTodos = () => {
    setCampos(camposDisponibles.map(c => c.id));
  };

  const deseleccionarTodos = () => {
    setCampos([]);
  };

  const grupos = {
    basico: 'Campos Básicos',
    relaciones: 'Relaciones',
    fechas: 'Fechas'
  };

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campos del Reporte</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Seleccione los campos que desea incluir</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={seleccionarTodos}
              className="px-3 py-1.5 text-xs rounded-lg border border-primary text-primary hover:bg-primary/10"
            >
              Seleccionar Todos
            </button>
            <button
              onClick={deseleccionarTodos}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-7">
        {Object.entries(grupos).map(([grupoKey, grupoLabel]) => {
          const camposGrupo = camposDisponibles.filter(c => c.grupo === grupoKey);

          return (
            <div key={grupoKey}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">
                  folder
                </span>
                {grupoLabel}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({camposGrupo.length})
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {camposGrupo.map(campo => (
                  <label
                    key={campo.id}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-lg border cursor-pointer
                      transition-all duration-200 select-none
                      ${campos.includes(campo.id)
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/50 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={campos.includes(campo.id)}
                      onChange={() => toggleCampo(campo.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium truncate">
                      {campo.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} export default SeleccionCampos;