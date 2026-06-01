import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi } from '../../../lib/api';

const fetchAccesos = async (token) => {
  try {
    const accesos = await loginApi.fetchMisAccesosWithToken(token);
    return { permisos: accesos.permisos || [], menu: accesos.menu || [] };
  } catch {
    return { permisos: [], menu: [] };
  }
};

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

      const accesos = await fetchAccesos(response.token);
      return {
        uid: response.uid || '',
        name: response.nombre || 'Usuario',
        email: response.email || '',
        rol: response.rol?.nombre || 'Usuario',
        token: response.token,
        parroquia: response.parroquia || null,
        expiresAt: null,
        ...accesos,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || error.msg || 'No se pudo conectar con el servidor',
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

      const accesos = await fetchAccesos(response.token);
      return {
        uid: response.uid || '',
        name: response.nombre || 'Usuario',
        email: response.email || '',
        rol: response.rol?.nombre || 'Usuario',
        token: response.token,
        expiresAt: null,
        parroquia: response.parroquia || null,
        ...accesos,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || error.msg || 'No se pudo verificar el código',
        type: 'error',
      });
    }
  }
);