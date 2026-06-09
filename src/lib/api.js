import axios from 'axios';
import { store } from '../store/index';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const errorData = {
        message: error.response.data?.msg || error.response.data?.message || 'Error en la petición',
        status: error.response.status,
        data: error.response.data,
      };
      return Promise.reject(errorData);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return Promise.reject({
        message: 'No se pudo conectar con el servidor',
        status: 0,
      });
    } else {
      // Error al configurar la petición
      return Promise.reject({
        message: error.message || 'Error desconocido',
        status: 0,
      });
    }
  }
);

// manejo de errores
const handleError = (error) => {
  throw error.response?.data || error.data || error;
};

export const loginApi = {
  login: (credentials) =>
    api.post('/usuarios/', credentials).then((res) => res.data).catch(handleError),

  verificar2FA: (data) =>
    api.post('/usuarios/verificar-2fa', data).then((res) => res.data).catch(handleError),

  fetchMisAccesosWithToken: (token) =>
    api.get('/usuarios/mis-accesos', { headers: { 'x-token': token } })
      .then((res) => res.data)
      .catch(handleError),
};

// pa colocar el header
api.interceptors.request.use((config) => {
  const { user } = store.getState().login;

  if (user?.token) {
    // 1. ¿El token expiró?
    if (user.expiresAt && Date.now() > user.expiresAt) {
      store.dispatch({ type: 'login/logout' });
      return Promise.reject({
        message: 'Sesión expirada',
        status: 401
      });
    }

    // 2. Token válido → lo enviamos
    config.headers['x-token'] = user.token;
  }

  return config;
});
// para manejar el error 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.status === 401) {
      store.dispatch({ type: 'login/logout' });
    }
    return Promise.reject(error);
  }
);



//para errores


// ejemplo de como orgnizar
export const userApi = {
  fetchUser: () =>
api.get('/usuarios/').then((res) => res.data).catch(handleError),
  fetchAllUsers: () =>
    api.get('/usuarios/all').then((res) => res.data).catch(handleError),
  fetchUserById: (id) =>
    api.get(`/usuarios/${id}`).then((res) => res.data).catch(handleError),
};

export const personasApi = {
  fetchPersonas: (params = {}) =>
    api.get('/personas/', { params }).then((res) => res.data).catch(handleError),

  fetchAllPersonas: () =>
    api.get('/personas/all').then((res) => res.data).catch(handleError),

  fetchPersonaById: (id) =>
    api.get(`/personas/${id}`).then((res) => res.data).catch(handleError),

  createPersona: (data) =>
    api.post('/personas/new', data).then((res) => res.data).catch(handleError),

  updatePersona: (id, data) =>
    api.put(`/personas/${id}`, data).then((res) => res.data).catch(handleError),

  deletePersona: (id) =>
    api.patch(`/personas/${id}`).then((res) => res.data).catch(handleError),
};
export const usuariosApi = {
  fetchUsuarios: (params = {}) =>
    api.get('/usuarios/', { params }).then((res) => res.data).catch(handleError),

  fetchAllUsuarios: () =>
    api.get('/usuarios/all').then((res) => res.data).catch(handleError),

  fetchUsuarioById: (id) =>
    api.get(`/usuarios/${id}`).then((res) => res.data).catch(handleError),
  createUsuario: (data) =>
    api.post('/usuarios/new', data).then((res) => res.data).catch(handleError),

  updateUsuario: (id, data) =>
    api.put(`/usuarios/${id}`, data).then((res) => res.data).catch(handleError),

  deleteUsuario: (id) =>
    api.patch(`/usuarios/${id}`).then((res) => res.data).catch(handleError),

  // para restablecer contraseña
  resetPassword: (email) =>
    api.post('/password/solicitar', { email }).then((res) => res.data).catch(handleError),
  //para cambiar la contraseña
  changePassword: (token, newPassword) =>
    api.post('/password/cambiar', { token, newPassword }).then((res) => res.data).catch(handleError),
  //para desbloquear usuario
  unlockUsuario: (id) =>
    api.post(`/usuarios/desbloquear/${id}`).then((res) => res.data).catch(handleError),
};

export const parroquiasApi = {
  fetchParroquias: (params = {}) =>
    api.get('/parroquias/', { params }).then((res) => res.data).catch(handleError),

  fetchAllParroquias: () =>
    api.get('/parroquias/all').then((res) => res.data).catch(handleError),

  fetchParroquiaById: (id) =>
    api.get(`/parroquias/${id}`).then((res) => res.data).catch(handleError),

  createParroquia: (data) =>
    api.post('/parroquias/new', data).then((res) => res.data).catch(handleError),

  updateParroquia: (id, data) =>
    api.put(`/parroquias/${id}`, data).then((res) => res.data).catch(handleError),

  fetchMapaResumen: () =>
    api.get('/mapa/resumen').then((res) => res.data).catch(handleError),
};
export const passwordApi = {
  solicitar: (email) =>
    api.post('/password/solicitar', { email }).then((res) => res.data).catch(handleError),

  validar: (token) =>
    api.get('/password/validar', { params: { token } }).then((res) => res.data).catch(handleError),

  cambiar: (token, newPassword) =>
    api.post('/password/cambiar', { token, newPassword }).then((res) => res.data).catch(handleError),
};

export const auditoriaAplicacionApi = {
  fetchAuditoriasAplicacion: (params = {}) =>
    api.get('/auditoria/aplicacion', { params }).then((res) => res.data).catch(handleError),
  fetchAuditoriaAplicacionDetalle: (id) =>
    api.get(`/auditoria/aplicacion/${id}`).then((res) => res.data).catch(handleError),
};
export const auditoriaSeguridadApi = {
  fetchAuditoriasSeguridad: (params = {}) =>
    api.get('/auditoria/seguridad', { params }).then((res) => res.data).catch(handleError),
  fetchAuditoriaById: (id) =>
    api.get(`/auditoria/seguridad/${id}`).then((res) => res.data).catch(handleError),
};

export const dashboardApi = {
  fetchStats: (filters = {}) =>
    api.get('/dashboard/summary/', { params: filters }).then(res => res.data).catch(handleError),
};

// apis para sacramentos
export const sacramentosApi = {
  buscarPersonas: (params = {}) =>
    api
      .get('/personas/buscar/sacramento', { params })
      .then((res) => res.data)
      .catch(handleError),
  crearSacramentoCompleto: (data) =>
    api
      .post('/sacramentos/new-completo', data)
      .then((res) => res.data)
      .catch(handleError),
  //actualizar de sacramentos
  actualizarSacramentoCompleto: (id, data) =>
    api
      .put(`/sacramentos/completo/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),
  //buscar para sacramentos
  buscarSacramentos: (params = {}) =>
    api
      .get('/sacramentos/buscar-persona', { params })
      .then((res) => res.data)
      .catch(handleError),
  //informacion de todo el sacramento
    fetchSacramentoCompleto: (id) =>
    api
      .get(`/sacramentos/completo/${id}`)
      .then((res) => res.data)
      .catch(handleError),
  // para buscar personas con todos los sacramentos (candidatos a sacerdote)
  buscarPersonasConTodosLosSacramentos: (params = {}) =>
    api

    .get('/usuarios', { params })

    .then((res) => res.data)

    .catch(handleError),    
};
//apis para roles 
export const rolesApi = {
  fetchRoles: (params = {}) =>
    api.get('/rol/', { params }).then((res) => res.data).catch(handleError),
  fetchRolById: (id) =>
    api.get(`/rol/${id}`).then((res) => res.data).catch(handleError),
  createRol: (data) =>
    api.post('/rol/new', data).then((res) => res.data).catch(handleError),
  updateRol: (id, data) =>
    api.put(`/rol/${id}`, data).then((res) => res.data).catch(handleError),
};
export const modulosApi = {
  fetchModulos: (params = {}) =>
    api.get('/modulo/', { params }).then((res) => res.data).catch(handleError),
  fetchModuloById: (id) =>
    api.get(`/modulo/${id}`).then((res) => res.data).catch(handleError),
  createModulo: (data) =>
    api.post('/modulo/new', data).then((res) => res.data).catch(handleError),
  updateModulo: (id, data) =>
    api.put(`/modulo/${id}`, data).then((res) => res.data).catch(handleError),
};

//apis para permisos
export const permisosApi = {
  fetchPermisos: (params = {}) =>
    api.get('/permiso/', { params }).then((res) => res.data).catch(handleError),
  fetchPermisoById: (id) =>
    api.get(`/permiso/${id}`).then((res) => res.data).catch(handleError),
  createPermiso: (data) =>
    api.post('/permiso/new', data).then((res) => res.data).catch(handleError),
  updatePermiso: (id, data) =>
    api.put(`/permiso/${id}`, data).then((res) => res.data).catch(handleError),

};

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// api para configuracion de seguridad
export const seguridadApi = {
  fetchConfiguracion: () =>
    api.get('/configuracion-seguridad').then((res) => res.data).catch(handleError),
  fetchConfiguracionReset: () =>
    publicApi.get('/configuracion-seguridad/reset').then((res) => res.data).catch(handleError),
  updateConfiguracion: (data) =>
    api.put(`/configuracion-seguridad`, data).then((res) => res.data).catch(handleError),
};

// api para activos de información
export const activosApi = {
  fetchActivos: (params = {}) =>
    api.get('/activos', { params }).then((res) => res.data).catch(handleError),
  fetchActivo: (id) =>
    api.get(`/activos/${id}`).then((res) => res.data).catch(handleError),
  createActivo: (data) =>
    api.post('/activos', data).then((res) => res.data).catch(handleError),
  updateActivo: (id, data) =>
    api.put(`/activos/${id}`, data).then((res) => res.data).catch(handleError),
  deleteActivo: (id) =>
    api.delete(`/activos/${id}`).then((res) => res.data).catch(handleError),
};

// api para vulnerabilidades y amenazas
export const vulnerabilidadesApi = {
  fetchVulnerabilidades: (params = {}) =>
    api.get('/vulnerabilidades', { params }).then((res) => res.data).catch(handleError),
  fetchVulnerabilidad: (id) =>
    api.get(`/vulnerabilidades/${id}`).then((res) => res.data).catch(handleError),
  createVulnerabilidad: (data) =>
    api.post('/vulnerabilidades', data).then((res) => res.data).catch(handleError),
  updateVulnerabilidad: (id, data) =>
    api.put(`/vulnerabilidades/${id}`, data).then((res) => res.data).catch(handleError),
  deleteVulnerabilidad: (id) =>
    api.delete(`/vulnerabilidades/${id}`).then((res) => res.data).catch(handleError),
};

// api para riesgos
export const riesgosApi = {
  fetchRiesgos: (params = {}) =>
    api.get('/riesgos', { params }).then((res) => res.data).catch(handleError),
  fetchRiesgo: (id) =>
    api.get(`/riesgos/${id}`).then((res) => res.data).catch(handleError),
  createRiesgo: (data) =>
    api.post('/riesgos', data).then((res) => res.data).catch(handleError),
  updateRiesgo: (id, data) =>
    api.put(`/riesgos/${id}`, data).then((res) => res.data).catch(handleError),
  deleteRiesgo: (id) =>
    api.delete(`/riesgos/${id}`).then((res) => res.data).catch(handleError),
  publicarRiesgo: (id) =>
    api.put(`/riesgos/${id}/publicar`).then((res) => res.data).catch(handleError),
  // controles
  fetchControles: (riesgoId) =>
    api.get(`/riesgos/${riesgoId}/controles`).then((res) => res.data).catch(handleError),
  createControl: (riesgoId, data) =>
    api.post(`/riesgos/${riesgoId}/controles`, data).then((res) => res.data).catch(handleError),
  updateControl: (riesgoId, controlId, data) =>
    api.put(`/riesgos/${riesgoId}/controles/${controlId}`, data).then((res) => res.data).catch(handleError),
  deleteControl: (riesgoId, controlId) =>
    api.delete(`/riesgos/${riesgoId}/controles/${controlId}`).then((res) => res.data).catch(handleError),
};

// api para los dominios de correos
export const dominiosApi = { 
  fetchDominios: () =>
    api.get('/dominio-permitido').then((res) => res.data).catch(handleError),
  crearDominio: (data) =>
    api.post('/dominio-permitido/new', data).then((res) => res.data).catch(handleError),
  eliminarDominio: (id) =>
    api.delete(`/dominio-permitido/${id}`).then((res) => res.data).catch(handleError),
  updateDominio: (id, data) =>
    api.put(`/dominio-permitido/${id}`, data).then((res) => res.data).catch(handleError),

};

export const ocrApi = {
  // PASO 1 — Subir imagen y procesar OCR
  preview: (formData) =>
    api
      .post('/ocr/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
      .catch(handleError),
 
  // PASO 3 — Asignar parroquia existente al histórico
  asignarParroquia: (historicoId, data) =>
    api
      .put(`/ocr/parroquia/${historicoId}`, data)
      .then((res) => res.data)
      .catch(handleError),
 
  // PASO 3 — Crear y asignar nueva parroquia al histórico
  crearParroquia: (historicoId, data) =>
    api
      .post(`/ocr/parroquia/crear/${historicoId}`, data)
      .then((res) => res.data)
      .catch(handleError),
 
  // PASO 4 — Confirmar y crear sacramento
  confirmar: (data) =>
    api
      .post('/ocr/confirmar', data)
      .then((res) => res.data)
      .catch(handleError),
 
  // Rechazar un histórico OCR
  rechazar: (historicoId) =>
    api
      .put(`/ocr/rechazar/${historicoId}`)
      .then((res) => res.data)
      .catch(handleError),
 
  // Listar histórico de registros OCR
  fetchHistorico: (params = {}) =>
    api
      .get('/ocr/historico', { params })
      .then((res) => res.data)
      .catch(handleError),
 
  // Buscar personas por texto (buscador autocomplete del flujo OCR)
  buscarPersonas: (params = {}) =>
    api
      .get('/personas/buscar/sacramento', { params })
      .then((res) => res.data)
      .catch(handleError),
};

export const chatbotApi = {
  enviarMensaje: (data) =>
    api.post('/chatbot/mensaje', data).then((res) => res.data).catch(handleError),
};