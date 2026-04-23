import { createAsyncThunk } from '@reduxjs/toolkit';
import { sacramentosApi } from '../../../lib/api';
import { parroquiasApi } from '../../../lib/api';



//rutas que se ponen para cada cosa al momento de buscar
// en este caso las personas se tienen que buscar, primero en bautizo
// no tiene que estar dentro de sacramentos

export const fetchPersonasParaSacramento = createAsyncThunk(
  'sacramentos/buscarPersonas',
  async ({ search, tipo, rol }, { rejectWithValue }) => {
    try {
      const response = await sacramentosApi.buscarPersonas({
        search,
        tipo,
        rol,
      });

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//  Obtener parroquias con paginación o filtros
export const fetchParroquias = createAsyncThunk(
  'parroquias/fetchParroquias',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('[parroquiasThunk] Enviando filtros:', filters);
      const response = await parroquiasApi.fetchParroquias(filters);
      console.log('[parroquiasThunk] Respuesta del servidor:', response.parroquias);

      // 
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
// para el sacramento completo con todas sus relaciones

//  Buscar personas que tengan bautizo + comunión + matrimonio (posibles sacerdotes)
export const buscarPersonasConTodosLosSacramentos = createAsyncThunk(
  'sacramentos/buscarPersonasConTodosLosSacramentos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sacramentosApi.buscarPersonasConTodosLosSacramentos(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const crearSacramentoCompleto = createAsyncThunk(
  'sacramentos/crearSacramentoCompleto',
  async (sacramentoData, { rejectWithValue }) => {
    try {
      const response = await sacramentosApi.crearSacramentoCompleto(sacramentoData);
      return response;
    }
    catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


//para buscar sacramentos
export const buscarSacramentos = createAsyncThunk(
  'sacramentos/buscarSacramentos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sacramentosApi.buscarSacramentos(params);
      return response;
    }
    catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// obtener sacramento completo por id (para editar)
export const fetchSacramentoCompleto = createAsyncThunk(
  'sacramentos/fetchSacramentoCompleto',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sacramentosApi.fetchSacramentoCompleto(id);
      return response;
    }
    catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// actualizar sacramento completo
export const actualizarSacramentoCompleto = createAsyncThunk(
  'sacramentos/actualizarSacramentoCompleto',
  async ({ id, sacramentoData }, { rejectWithValue }) => {
    try {
      const response = await sacramentosApi.actualizarSacramentoCompleto(id, sacramentoData);
      return response;
    }
    catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

