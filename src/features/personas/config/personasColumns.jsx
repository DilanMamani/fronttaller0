export const personaColumns = [
  { key: 'nombre', label: 'Nombre' },

  { key: 'apellido_paterno', label: 'Apellido paterno' },

  { key: 'apellido_materno', label: 'Apellido materno' },

  { key: 'carnet_identidad', label: 'CI' },

  { key: 'fecha_nacimiento', label: 'Fecha nac.' },

  { key: 'lugar_nacimiento', label: 'Lugar nac.' },

  {
    key: 'activo',
    label: 'Estado',
    render: (p) =>
      p.activo ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Activo
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          Inactivo
        </span>
      ),
  },

  {
    key: 'estado',
    label: 'Estado de verificación',
    render: (p) =>
      p.estado === 'Verificado' ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          Verificado
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
          No verificado
        </span>
      ),
  },
];