import { createAsyncThunk } from '@reduxjs/toolkit';
import { parroquiasApi } from '../../../lib/api';

//  Obtener parroquias con paginación o filtros
export const fetchParroquias = createAsyncThunk(
  'parroquias/fetchParroquias',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('[parroquiasThunk] Enviando filtros:', filters);
      const response = await parroquiasApi.fetchParroquias(filters);
      console.log('[parroquiasThunk] Respuesta del servidor:', response.parroquias);

      // 🔸 Si el backend devuelve { parroquias: [...], ok: true, currentPage: 1, ... }
      // devolvemos solo los campos útiles que usará el slice
      return {
        parroquias: response.parroquias || [],
        totalItems: response.totalItems || response.parroquias?.length || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
      };
    } catch (error) {
      console.error('[parroquiasThunk] Error:', error);
      return rejectWithValue(error?.response?.data || { message: 'Error en la carga de parroquias' });
    }
  }
);

//  Obtener todas las parroquias sin filtros (por ejemplo, para un dropdown)
export const fetchAllParroquias = createAsyncThunk(
  'parroquias/fetchAllParroquias',
  async (_, { rejectWithValue }) => {
    try {
      const response = await parroquiasApi.fetchAllParroquias();
      return response.parroquias || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//  Obtener una parroquia específica por ID
export const fetchParroquiaById = createAsyncThunk(
  'parroquias/fetchParroquiaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await parroquiasApi.fetchParroquiaById(id);
      return response.parroquia || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message || error);
    }
  }
);

//  Crear una nueva parroquia
export const createParroquia = createAsyncThunk(
  'parroquias/createParroquia',
  async (data, { rejectWithValue }) => {
    try {
      const response = await parroquiasApi.createParroquia(data);
      return response.parroquia || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//  Actualizar una parroquia existente
export const updateParroquia = createAsyncThunk(
  'parroquias/updateParroquia',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await parroquiasApi.updateParroquia(id, data);
      return response.parroquia || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
