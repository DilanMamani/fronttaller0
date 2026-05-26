export const initialUsuarioForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  email: '',
  password: '',
  fecha_nacimiento: '',
  id_rol: '',
  id_parroquias: [],
  activo: '',
};

export const initialUsuarioFilters = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  email: '',
  fecha_nacimiento: '',
  rol: '',
  id_parroquia: '',
  activo: '',
};

export const buildUsuarioFields = ({
  roles = [],
  parroquias = [],
  isLoadingRoles = false,
  isLoadingParroquias = false,
  mostrarParroquia = false,
  editing = false,
}) => {
  const fields = [
    { name: 'nombre', label: 'Nombre', placeholder: 'Ingrese el nombre', disabled: editing },
    { name: 'apellido_paterno', label: 'Apellido paterno', placeholder: 'Ingrese el apellido paterno', disabled: editing  },
    { name: 'apellido_materno', label: 'Apellido materno', placeholder: 'Ingrese el apellido materno',disabled: editing  },
    { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'correo@dominio.com',
      disabled: editing,
    },
    {
      name: 'id_rol',
      label: 'Rol',
      type: 'select',
      options: [
        { value: '', label: isLoadingRoles ? 'Cargando roles...' : 'Seleccione' },
        ...roles.map((r) => ({
          value: r.id_rol,
          label: r.nombre,
        })),
      ],
    },
  ];


  fields.push({
  name: 'id_parroquias',
  label: 'Parroquias asignadas',
  type: 'autocomplete-multiselect',
  fullWidth: true,
  showIf: (values) => {
    const rolSeleccionado = roles.find(
      (r) => String(r.id_rol) === String(values.id_rol)
    );

    const nombreRol = rolSeleccionado?.nombre?.toLowerCase() || '';

    return (
      nombreRol === 'parroco' ||
      nombreRol === 'párroco' ||
      nombreRol === 'secretario_parroquial'
    );
  },
  options: parroquias.map((p) => ({
    value: String(p.id_parroquia),
    label: p.nombre,
  })),
});

  fields.push({
    name: 'activo',
    label: 'Estado',
    type: 'select',
    valueType: 'boolean',
    options: [
      { value: '', label: 'Seleccione' },
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
    ],
  });

  return fields;
};

export const buildUsuarioSearchFields = ({ roles = [] }) => [
  { name: 'nombre', label: 'Nombre', placeholder: 'Buscar por nombre' },
  { name: 'apellido_paterno', label: 'Apellido paterno', placeholder: 'Buscar por apellido paterno' },
  { name: 'apellido_materno', label: 'Apellido materno', placeholder: 'Buscar por apellido materno' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'correo@dominio.com' },
  { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
  {
    name: 'rol',
    label: 'Rol',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      ...roles.map((r) => ({
        value: r.nombre,
        label: r.nombre,
      })),
    ],
  },
  {
    name: 'activo',
    label: 'Estado',
    type: 'select',
    valueType: 'boolean',
    options: [
      { value: '', label: 'Todos' },
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
    ],
  },
];