const getFullName = (u) =>
  `${u.nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim();

export const buildUsuarioColumns = ({ onUnlock }) => [
  {
    key: 'nombre',
    header: 'Nombre',
    render: (u) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {getFullName(u)}
      </span>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (u) => u.email,
  },
  {
    key: 'rol',
    header: 'Rol',
    render: (u) => (
      <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
        {u.rol?.nombre || 'Sin rol'}
      </span>
    ),
  },
  {
    key: 'parroquia',
    header: 'Parroquia',
    render: (u) =>
      u.parroquias?.length > 0
        ? u.parroquias.map((p) => p.nombre).join(', ')
        : 'Sin parroquia',
  },
  {
    key: 'activo',
    header: 'Estado',
    render: (u) =>
      u.activo ? (
        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Activo
        </span>
      ) : (
        <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Inactivo
        </span>
      ),
  },
  {
    key: 'bloqueado',
    header: 'Bloqueo',
    render: (u) =>
      u.bloqueado ? (
        <button
          type="button"
          onClick={(e) => onUnlock(u, e)}
          className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          Bloqueado
        </button>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1">
          <span className="material-symbols-outlined text-sm">lock_open</span>
          Libre
        </span>
      ),
  },
];