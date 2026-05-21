export const initialParroquiaForm = {
  nombre: '',
  direccion: '',
  telefono: '',
  email: '',
  id_persona: null,
};

export const parroquiaFields = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Ingrese nombre' },
  { name: 'direccion', label: 'Dirección', placeholder: 'Ingrese dirección' },
  { name: 'telefono', label: 'Teléfono', placeholder: 'Ingrese teléfono' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Ingrese email' },
];

export const initialParroquiaFilters = {
  nombre: '',
  direccion: '',
};

export const parroquiaSearchFields = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Buscar por nombre' },
  { name: 'direccion', label: 'Dirección', placeholder: 'Buscar por dirección' },
];