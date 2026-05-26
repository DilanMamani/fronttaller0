import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { loginReducer } from '../features/login/slices/loginSlice';
import { dashboardReducer } from '../features/dashboard/slices/dashboardSlice';
import { personasReducer } from '../features/personas/slices/personasSlice';
import { passwordReducer } from '../features/password/slices/passwordSlice';
import { auditoriaAplicacionReducer } from '../features/auditoria/slices/auditoriaSlice';
import { auditoriaSeguriadReducer } from '../features/auditoriaSeguridad/slices/auditoriaSeguridadSlices';
import { usuariosReducer } from '../features/usuarios/slices/usuariosSlice';
import { parroquiasReducer } from '../features/parroquias/slices/parroquiasSlice';
import rolesReducer from '../features/roles/slicesRol/rolesSlice';
import permisosReducer from '../features/roles/slicesPermiso/permisosSlice';
import configuracionSeguridadReducer from '../features/seguridad/slices/configuracionSeguridadSlice';
import dominiosPermitidosReducer from '../features/seguridad/slicesDominio/dominiosPermitidosSlice';
import { ocrReducer } from '../features/ocr/slices/ocrSlice';
import { matrizRiesgoReducer } from '../features/matrizRiesgo/slices/matrizRiesgoSlice';
// Agregar otros reducers aqui sdjalsd
// Mantener los reducers en sus carpetas pofavo

const loginPersistConfig = {
  key: 'login',
  storage,
  whitelist: ['user'],
};

export const rootReducer = combineReducers({
  login: persistReducer(loginPersistConfig, loginReducer),
  dashboard: dashboardReducer,
  personas: personasReducer,
  password: passwordReducer,
  auditoriaAplicacion: auditoriaAplicacionReducer,
  auditoriaSeguridad: auditoriaSeguriadReducer,
  usuarios: usuariosReducer,
  parroquias: parroquiasReducer,
  roles: rolesReducer,
  permisos: permisosReducer,
  configuracionSeguridad: configuracionSeguridadReducer,
  dominiosPermitidos: dominiosPermitidosReducer,
  ocr: ocrReducer,
  matrizRiesgo: matrizRiesgoReducer,
  // Agregar otros reducers aqui sdjalsd
});

export default rootReducer;
