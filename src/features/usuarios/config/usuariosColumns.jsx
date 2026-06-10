const getFullName = (u) =>
  `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();

export const buildUsuarioColumns = ({ onUnlock }) => [

  {
    key: 'nombre_usuario',
    label: 'Usuario',
    render: (u) => (
      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 
                      text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
        {u.nombre_usuario || '—'}
      </span>
    ),
  },
  {
    key: 'nombre',
    label: 'Nombre',
    render: (u) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {getFullName(u)}
      </span>
    ),
  },

  {
    key: 'email',
    label: 'Email',
    render: (u) => u.email,
  },

  {
    key: 'rol',
    label: 'Rol',
    render: (u) => (
      <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
        {u.rol?.nombre || 'Sin rol'}
      </span>
    ),
  },

  {
    key: 'parroquia',
    label: 'Parroquia',
    render: (u) =>
      u.parroquias?.length > 0
        ? u.parroquias.map((p) => p.nombre).join(', ')
        : 'Sin parroquia',
  },

  {
    key: 'activo',
    label: 'Estado',
    render: (u) =>
      u.activo ? (
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
    key: 'bloqueado',
    label: 'Bloqueo',
    render: (u) =>
      u.bloqueado ? (
        <button
          type="button"
          onClick={(e) => onUnlock(u, e)}
          className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            lock
          </span>
          Bloqueado
        </button>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1">
          <span className="material-symbols-outlined text-sm">
            lock_open
          </span>
          Libre
        </span>
      ),
  },
];