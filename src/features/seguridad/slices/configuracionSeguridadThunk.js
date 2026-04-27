import { createAsyncThunk } from '@reduxjs/toolkit';
import { seguridadApi } from '../../../lib/api';

export const fetchConfiguracionSeguridad = createAsyncThunk(
  'configuracionSeguridad/fetchConfiguracionSeguridad',
  async (_, { rejectWithValue }) => {
    try {
      return await seguridadApi.fetchConfiguracion();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateConfiguracionSeguridad = createAsyncThunk(
  'configuracionSeguridad/updateConfiguracionSeguridad',
  async ({ data }, { rejectWithValue }) => {
    try {
      return await seguridadApi.updateConfiguracion(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);