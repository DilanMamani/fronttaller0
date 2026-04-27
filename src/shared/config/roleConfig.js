// src/shared/config/roleConfig.js

// ===============================
// ROLES
// ===============================
export const ROLES = {
  ADMIN: 'ADMIN_SISTEMA',
  CONSULTOR: 'Consultor',

  // Puedes ir ampliando según tu sistema real
  PARROCO: 'PARROCO',
  SECRETARIO: 'SECRETARIO_PARROQUIAL',
  OSI: 'OFICIAL_SEGURIDAD',
  AUDITOR: 'AUDITOR'
};

// ===============================
// RUTAS
// ===============================
export const ROUTES = {
  DASHBOARD: '/dashboard',
  PERSONAS: '/personas',
  SACRAMENTOS: '/sacramentos',
  CERTIFICADOS: '/certificados',
  AUDITORIA: '/auditoria',
  USUARIOS: '/usuarios',
  REPORTES: '/reportes',
  PARROQUIAS: '/parroquias',
  ROL_PERMISOS: '/roles-permisos',
};

// ===============================
// MATRIZ DE ACCESOS
// ===============================
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    ROUTES.DASHBOARD,
    ROUTES.PERSONAS,
    ROUTES.SACRAMENTOS,
    ROUTES.CERTIFICADOS,
    ROUTES.AUDITORIA,
    ROUTES.USUARIOS,
    ROUTES.REPORTES,
    ROUTES.PARROQUIAS,
    ROUTES.ROL_PERMISOS,
  ],

  [ROLES.CONSULTOR]: [
    ROUTES.CERTIFICADOS,
  ],

  [ROLES.PARROCO]: [
    ROUTES.DASHBOARD,
    ROUTES.SACRAMENTOS,
    ROUTES.CERTIFICADOS,
  ],

  [ROLES.SECRETARIO]: [
    ROUTES.PERSONAS,
    ROUTES.SACRAMENTOS,
    ROUTES.CERTIFICADOS,
  ],

  [ROLES.OSI]: [
    ROUTES.AUDITORIA,
    ROUTES.REPORTES,
    ROUTES.ROL_PERMISOS,
  ],
  [ROLES.AUDITOR]: [
    ROUTES.AUDITORIA,
  ],
  
};

// ===============================
// NORMALIZADOR DE ROL
// ===============================
// Soporta:
// - "ADMIN_SISTEMA"
// - { id_rol: 1, nombre: "ADMIN_SISTEMA" }
const normalizeRole = (userRole) => {
  if (!userRole) return null;

  if (typeof userRole === 'object') {
    return userRole.nombre || null;
  }

  return userRole;
};

// ===============================
// VERIFICAR ACCESO
// ===============================
export const hasAccess = (userRole, route) => {
  const role = normalizeRole(userRole);

  if (!role || !route) return false;

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  return permissions.includes(route);
};

// ===============================
// RUTA POR DEFECTO
// ===============================
export const getDefaultRoute = (userRole) => {
  const role = normalizeRole(userRole);

  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions || permissions.length === 0) {
    return '/';
  }

  return permissions[0]; // primera ruta disponible
};

// ===============================
// FILTRAR MENÚ SEGÚN ROL
// ===============================
export const getFilteredNavItems = (navItems, userRole) => {
  const role = normalizeRole(userRole);

  if (!role) return [];

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];

  return navItems.filter(item => permissions.includes(item.to));
};