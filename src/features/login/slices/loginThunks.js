import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi } from '../../../lib/api';

export const loginUser = createAsyncThunk(
  'login/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi.login(credentials);

      if (!response.ok) {
        return rejectWithValue({
          message: response.msg || 'Error al iniciar sesión',
          type: 'error',
        });
      }

      if (response.requiere2FA) {
        return {
          requiere2FA: true,
          token2FA: response.token2FA,
          message: response.msg,
        };
      }

      return {
        uid: response.uid || '',
        name: response.nombre || 'Usuario',
        email: response.email || '',
        rol: response.rol?.nombre || 'Usuario',
        token: response.token,
        expiresAt: null,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'No se pudo conectar con el servidor',
        type: 'error',
      });
    }
  }
);

export const verify2FAUser = createAsyncThunk(
  'login/verify2FAUser',
  async ({ token2FA, codigo }, { rejectWithValue }) => {
    try {
      const response = await loginApi.verificar2FA({ token2FA, codigo });

      if (!response.ok) {
        return rejectWithValue({
          message: response.msg || 'Código incorrecto',
          type: 'error',
        });
      }

      return {
        uid: response.uid || '',
        name: response.nombre || 'Usuario',
        email: response.email || '',
        rol: response.rol?.nombre || 'Usuario',
        token: response.token,
        expiresAt: null,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'No se pudo verificar el código',
        type: 'error',
      });
    }
  }
);