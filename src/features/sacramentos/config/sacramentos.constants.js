export const ROL_IDS = {
  BAUTIZADO: 1,
  COMULGADO: 8,
  CONFIRMADO: 4,
  ESPOSO: 2,
  ESPOSA: 3,
  PADRINO: 5,
  MADRINA: 6,
  MINISTRO: 7,
};

export const TIPO_SACRAMENTO_IDS = {
  bautizo: 1,
  matrimonio: 2,
  comunion: 3,
  confirmacion: 4,
};

export const ROLES_SACRAMENTO_IDS = {
  bautizo:      1,  // BAUTIZADO
  matrimonio:   2,  // ESPOSO
  comunion:     8,  // COMULGADO
  confirmacion: 4,  // CONFIRMADO
};

export const TIPOS_SACRAMENTO = [
  { key: 'bautizo', label: 'Bautizo' },
  { key: 'comunion', label: 'Primera Comunión' },
  { key: 'confirmacion', label: 'Confirmación' },
  { key: 'matrimonio', label: 'Matrimonio' },
];

export const obtenerNombreRol = (id) => {
  const roles = {
    1: 'Bautizado',
    5: 'Padrino',
    6: 'Madrina',
    7: 'Ministro',
    4: 'Confirmado',
    2: 'Esposo',
    3: 'Esposa',
    8: 'Comulgado',
  };

  return roles[id] || 'Otro';
};