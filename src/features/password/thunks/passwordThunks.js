import { createAsyncThunk } from '@reduxjs/toolkit';
import { passwordApi } from '../../../lib/api';

export const solicitarReset = createAsyncThunk(
  'password/solicitar',
  async (email, { rejectWithValue }) => {
    try {
      const response = await passwordApi.solicitar(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: 'Error en el servidor' });
    }
  }
);

export const validarToken = createAsyncThunk(
  'password/validar',
  async (token, { rejectWithValue }) => {
    try {
      const response = await passwordApi.validar(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: 'Token inválido' });
    }
  }
);

export const cambiarPassword = createAsyncThunk(
  'password/cambiar',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await passwordApi.cambiar(token, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: 'Error al cambiar contraseña' });
    }
  }
);