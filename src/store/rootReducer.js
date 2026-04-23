import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { loginReducer } from '../features/login/slices/loginSlice';
import { dashboardReducer } from '../features/dashboard/slices/dashboardSlice';
import { personasReducer } from '../features/personas/slices/personasSlice';
import { passwordReducer } from '../features/password/slices/passwordSlice';
import { auditoriaReducer } from '../features/auditoria/slices/auditoriaSlice';
import { usuariosReducer } from '../features/usuarios/slices/usuariosSlice';
import { parroquiasReducer } from '../features/parroquias/slices/parroquiasSlice';
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
  auditoria: auditoriaReducer,
  usuarios: usuariosReducer,
  parroquias: parroquiasReducer,
});

export default rootReducer;
