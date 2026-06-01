import { createAsyncThunk } from '@reduxjs/toolkit';
import { passwordApi } from '../../../lib/api';

export const solicitarReset = createAsyncThunk(
  'password/solicitar',
  async (email, { rejectWithValue }) => {
    try {
      return await passwordApi.solicitar(email);
    } catch (error) {
      return rejectWithValue({
        msg: error.message || error.msg || 'Error en el servidor',
      });
    }
  }
);

export const validarToken = createAsyncThunk(
  'password/validar',
  async (token, { rejectWithValue }) => {
    try {
      return await passwordApi.validar(token);
    } catch (error) {
      return rejectWithValue({
        msg: error.message || error.msg || 'Token inválido',
      });
    }
  }
);

export const cambiarPassword = createAsyncThunk(
  'password/cambiar',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      return await passwordApi.cambiar(token, newPassword);
    } catch (error) {
      return rejectWithValue({
        msg: error.message || error.msg || 'Error al cambiar contraseña',
      });
    }
  }
);