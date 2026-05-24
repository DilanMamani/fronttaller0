import FormFields from '../../../shared/components/pages/FormFields.jsx';
import { personaFields, initialPersonaForm } from '../config/personasForm.js';

export default function TabAgregar({ formAdd, setFormAdd, onSubmit, isCreating }) {
  const isFormValid =
    formAdd.nombre?.trim() !== '' &&
    formAdd.apellido_paterno?.trim() !== '' &&
    formAdd.apellido_materno?.trim() !== '' &&
    formAdd.carnet_identidad?.trim() !== '' &&
    formAdd.fecha_nacimiento !== '' &&
    formAdd.lugar_nacimiento?.trim() !== '' &&
    formAdd.nombre_padre?.trim() !== '' &&
    formAdd.nombre_madre?.trim() !== '' &&
    formAdd.estado !== '';

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos Personales</h3>
      </div>

      <form className="p-6" onSubmit={onSubmit}>
        <FormFields fields={personaFields} values={formAdd} setValues={setFormAdd} />

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={isCreating || !isFormValid}
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isCreating ? 'Guardando...' : 'Agregar Persona'}
          </button>

          <button
            type="button"
            onClick={() => setFormAdd({ ...initialPersonaForm })}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}