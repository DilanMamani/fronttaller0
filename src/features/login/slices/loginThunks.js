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
          type: 'error'
        });
      }

      return {
        uid: response.uid || response.usuario?.uid || '',
        name: response.nombre || response.usuario?.nombre || 'Usuario',
        email: response.email || response.usuario?.email || '',
        rol: response.rol || response.usuario?.role || 'Usuario',
        token: response.token,
        expiresAt: Date.now() + response.expiresIn * 1000,
      };
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          return rejectWithValue({
            message: data.msg || 'Credenciales inválidas',
            type: 'warning'
          });
        }
        
        if (status === 500) {
          return rejectWithValue({
            message: 'Error en el servidor. Intente más tarde',
            type: 'error'
          });
        }
      }
      
      return rejectWithValue({
        message: error.message || 'No se pudo conectar con el servidor',
        type: 'error'
      });
    }
  }
);