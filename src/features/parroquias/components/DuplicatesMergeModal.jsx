export default function DuplicatesMergeModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fusionar Registros Duplicados</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Seleccione los valores que desea conservar para el registro fusionado. Las diferencias están resaltadas.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="font-semibold text-gray-500 dark:text-gray-400 self-center justify-self-start hidden md:block">Campo</div>
            <div className="font-semibold text-gray-900 dark:text-white">Registro Original</div>
            <div className="font-semibold text-gray-900 dark:text-white">Registro Duplicado</div>
          </div>
          <div className="divide-y dark:divide-gray-800 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="font-medium text-gray-700 dark:text-gray-300">Nombre</div>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="nombre" defaultChecked className="form-radio text-primary focus:ring-primary/50" />
                  <span>Sofia Rodriguez</span>
                </label>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="nombre" className="form-radio text-primary focus:ring-primary/50" />
                  <span>Sofía Rodríguez García</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento</div>
              <div className="p-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="fecha_nac" defaultChecked className="form-radio text-primary focus:ring-primary/50" />
                  <span>1998-02-10</span>
                </label>
              </div>
              <div className="p-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="fecha_nac" className="form-radio text-primary focus:ring-primary/50" />
                  <span>1998-02-10</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="font-medium text-gray-700 dark:text-gray-300">Lugar de Nacimiento</div>
              <div className="p-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="lugar_nac" defaultChecked className="form-radio text-primary focus:ring-primary/50" />
                  <span>Ciudad de México</span>
                </label>
              </div>
              <div className="p-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="lugar_nac" className="form-radio text-primary focus:ring-primary/50" />
                  <span>Ciudad de México</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="font-medium text-gray-700 dark:text-gray-300">Padre</div>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="padre" defaultChecked className="form-radio text-primary focus:ring-primary/50" />
                  <span>Manuel Rodríguez</span>
                </label>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="padre" className="form-radio text-primary focus:ring-primary/50" />
                  <span>Manuel Rodríguez Pérez</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="font-medium text-gray-700 dark:text-gray-300">Madre</div>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="madre" defaultChecked className="form-radio text-primary focus:ring-primary/50" />
                  <span>Laura García</span>
                </label>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="madre" className="form-radio text-primary focus:ring-primary/50" />
                  <span>Laura García López</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-800 flex justify-end gap-3 rounded-b-xl">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>Cancelar</button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold">
            <span className="material-symbols-outlined text-base">merge_type</span>
            <span>Fusionar y Guardar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
