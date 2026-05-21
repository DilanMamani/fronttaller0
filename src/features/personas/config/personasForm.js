export const personaFields = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Ingrese el nombre' },
  { name: 'apellido_paterno', label: 'Apellido paterno', placeholder: 'Ingrese el apellido paterno' },
  { name: 'apellido_materno', label: 'Apellido materno', placeholder: 'Ingrese el apellido materno' },
  { name: 'carnet_identidad', label: 'Carnet de identidad', placeholder: 'Ingrese el CI' },
  { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
  { name: 'lugar_nacimiento', label: 'Lugar de nacimiento', placeholder: 'Ingrese el lugar' },
  { name: 'nombre_padre', label: 'Nombre del padre', placeholder: 'Ingrese el nombre del padre' },
  { name: 'nombre_madre', label: 'Nombre de la madre', placeholder: 'Ingrese el nombre de la madre' },
  {
    name: 'activo',
    label: 'Estado',
    type: 'select',
    valueType: 'boolean',
    options: [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
    ],
  },
  {
    name: 'estado',
    label: 'Estado de verificación',
    type: 'select',
    options: [
      { value: '', label: 'Seleccione' },
      { value: 'Verificado', label: 'Verificado' },
      { value: 'verificado', label: 'Verificado' },

      { value: 'No verificado', label: 'No verificado' },
      { value: 'no verificado', label: 'No verificado' },
    ],
  },
  ];
  export const initialPersonaForm = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    carnet_identidad: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    nombre_padre: '',
    nombre_madre: '',
    activo: true,
    estado: '',
};
export const personaSearchFields = [

  { name: 'nombre', label: 'Nombre', placeholder: 'Nombre' },

  { name: 'apellido_paterno', label: 'Apellido paterno', placeholder: 'Apellido paterno' },

  { name: 'apellido_materno', label: 'Apellido materno', placeholder: 'Apellido materno' },

  { name: 'carnet_identidad', label: 'Carnet de identidad', placeholder: 'CI' },

  { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },

  { name: 'lugar_nacimiento', label: 'Lugar de nacimiento', placeholder: 'Lugar' },

  { name: 'nombre_padre', label: 'Nombre del padre', placeholder: 'Padre' },

  { name: 'nombre_madre', label: 'Nombre de la madre', placeholder: 'Madre' },

  {

    name: 'activo',

    label: 'Estado',

    type: 'select',

    options: [

      { value: '', label: 'Todos' },

      { value: 'true', label: 'Activo' },

      { value: 'false', label: 'Inactivo' },

    ],

  },

  {

    name: 'estado',

    label: 'Estado de verificación',

    type: 'select',

    options: [

      { value: '', label: 'Todos' },

      { value: 'Verificado', label: 'Verificado' },

      { value: 'No verificado', label: 'No verificado' },

    ],

  },

];

export const initialPersonaFilters = {

  nombre: '',

  apellido_paterno: '',

  apellido_materno: '',

  carnet_identidad: '',

  fecha_nacimiento: '',

  lugar_nacimiento: '',

  nombre_padre: '',

  nombre_madre: '',

  activo: '',

  estado: '',

};