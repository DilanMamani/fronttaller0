export const parroquiaColumns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'persona', label: 'Encargado', render: (p) => p.parroco ? `${p.parroco.nombre} ${p.parroco.apellido_paterno}` : 'Sin encargado' },
];