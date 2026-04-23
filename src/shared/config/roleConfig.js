export const ROLES = {
  ADMIN: 'Administrador',
  CONSULTOR: 'Consultor',
};

export const ROUTES = {
  DASHBOARD: '/dashboard',
  PERSONAS: '/personas',
  SACRAMENTOS: '/sacramentos',
  CERTIFICADOS: '/certificados',
  AUDITORIA: '/auditoria',
  USUARIOS: '/usuarios',
  REPORTES: '/reportes',
  PARROQUIAS: '/parroquias',
};

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
  ],
  [ROLES.CONSULTOR]: [
    ROUTES.CERTIFICADOS,
  ],
};

// Verificar accesos
export const hasAccess = (userRole, route) => {
  if (!userRole || !route) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  return permissions.includes(route);
};

// Obtener ruta por defecto según el rol
export const getDefaultRoute = (userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions || permissions.length === 0) return '/';
  
  return permissions[0];
};

export const getFilteredNavItems = (navItems, userRole) => {
  if (!userRole) return [];
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return [];
  
  return navItems.filter(item => permissions.includes(item.to));
};