import { createAsyncThunk } from '@reduxjs/toolkit';
import { usuariosApi } from '../../../lib/api';

export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetchUsuarios',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('[usuariosThunk] Enviando filtros:', filters);
      const response = await usuariosApi.fetchUsuarios(filters);
      console.log('[usuariosThunk] Respuesta del servidor:', response);
      console.log('[usuariosThunk] Usuarios obtenidos:', response.usuarios || response);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAllUsuarios = createAsyncThunk(
  'usuarios/fetchAllUsuarios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usuariosApi.fetchAllUsuarios();
      return response.usuarios || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUsuarioById = createAsyncThunk(
  'usuarios/fetchUsuarioById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usuariosApi.fetchUsuarioById(id);
      return response.usuario || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createUsuario = createAsyncThunk(
  'usuarios/createUsuario',
  async (payload, { rejectWithValue }) => {
    try {
      console.log('[usuariosThunk] Creando usuario:', payload)
      const response = await usuariosApi.createUsuario(payload)
      console.log('[usuariosThunk] Usuario creado:', response)
      // Algunos backends devuelven { usuario }, otros el objeto directo
      return response?.usuario || response
    } catch (error) {
      console.error('[usuariosThunk] Error creando usuario:', error)
      return rejectWithValue(error?.response?.data || error.message || error)
    }
  }

)
// para las contrasenas
export const createUsuarioAndSendReset = createAsyncThunk(
  'usuarios/createUsuarioAndSendReset',
  async (payload, { rejectWithValue }) => {
    try {
      console.log('[usuariosThunk] Creando usuario (con reset):', payload);
      const created = await usuariosApi.createUsuario(payload);
      const usuario = created?.usuario || created;
      const email = usuario?.email || payload?.email;
      if (!email) {
        throw new Error('No se pudo determinar el email para enviar restablecimiento.');
      }
      const resetResp = await usuariosApi.resetPassword(email);
      return { usuario, reset: resetResp };
    } catch (error) {
      console.error('[usuariosThunk] Error create+reset:', error);
      return rejectWithValue(error?.response?.data || error.message || error);
    }
  }
);
//normal de usuario
export const updateUsuario = createAsyncThunk(
  'usuarios/updateUsuario',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('[usuariosThunk] Actualizando usuario:', id, data);
      const response = await usuariosApi.updateUsuario(id, data);
      console.log('[usuariosThunk] Usuario actualizado:', response);
      return response?.usuario || response;
    } catch (error) {
      console.error('[usuariosThunk] Error actualizando usuario:', error);
      return rejectWithValue(error?.response?.data || error.message || error);
    }
  }
);

export const deleteUsuario = createAsyncThunk(
  'usuarios/deleteUsuario',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[usuariosThunk] Eliminando usuario ID:', id);
      const response = await usuariosApi.deleteUsuario(id);
      console.log('[usuariosThunk] Usuario eliminado:', response);
      return response?.usuario || response;
    } catch (error) {
      console.error('[usuariosThunk] Error eliminando usuario:', error);
      return rejectWithValue(error?.response?.data || error.message || error);  
    }
  }
); 
//funciones para contrasenas
export const resetUsuarioPassword = createAsyncThunk(
    'usuarios/resetPassword',
    async (email, { rejectWithValue }) => {
        try {
            console.log('[usuariosThunk] Restableciendo contraseña para email:', email);
            const response = await usuariosApi.resetPassword(email);
            console.log('[usuariosThunk] Respuesta de restablecimiento de contraseña:', response);
            return response;
        }
        catch (error) {
            console.error('[usuariosThunk] Error restableciendo contraseña:', error);
            return rejectWithValue(error?.response?.data || error.message || error);
        }
    }
);
export const changeUsuarioPassword = createAsyncThunk(
    'usuarios/changePassword',
    async ({ token, passwords }, { rejectWithValue }) => {
        try {
            console.log('[usuariosThunk] Cambiando contraseña para usuario con token:', token);
            const response = await usuariosApi.changePassword(token, passwords);
            console.log('[usuariosThunk] Respuesta de cambio de contraseña:', response);
            return response;
        }
        catch (error) {
            console.error('[usuariosThunk] Error cambiando contraseña:', error);
            return rejectWithValue(error?.response?.data || error.message || error);
        }
    }
);  
