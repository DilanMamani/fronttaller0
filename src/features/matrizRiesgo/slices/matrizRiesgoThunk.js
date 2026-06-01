import { createAsyncThunk } from '@reduxjs/toolkit';
import { riesgosApi } from '../../../lib/api';

export const fetchRiesgos = createAsyncThunk(
  'matrizRiesgo/fetchRiesgos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await riesgosApi.fetchRiesgos(params);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al cargar riesgos');
    }
  }
);

export const createRiesgo = createAsyncThunk(
  'matrizRiesgo/createRiesgo',
  async (data, { rejectWithValue }) => {
    try {
      const response = await riesgosApi.createRiesgo(data);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al crear riesgo');
    }
  }
);

export const updateRiesgo = createAsyncThunk(
  'matrizRiesgo/updateRiesgo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await riesgosApi.updateRiesgo(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al actualizar riesgo');
    }
  }
);
