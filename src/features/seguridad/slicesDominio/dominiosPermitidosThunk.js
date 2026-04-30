import { createAsyncThunk } from '@reduxjs/toolkit';
import { dominiosApi } from '../../../lib/api';

export const fetchDominiosPermitidos = createAsyncThunk(
  'dominiosPermitidos/fetchDominiosPermitidos',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await dominiosApi.fetchDominios(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createDominioPermitido = createAsyncThunk(
  'dominiosPermitidos/createDominioPermitido',
  async (data, { rejectWithValue }) => {
    try {
      return await dominiosApi.crearDominio(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateDominioPermitido = createAsyncThunk(
  'dominiosPermitidos/updateDominioPermitido',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await dominiosApi.updateDominio(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteDominioPermitido = createAsyncThunk(
  'dominiosPermitidos/deleteDominioPermitido',
  async (id, { rejectWithValue }) => {
    try {
      return await dominiosApi.eliminarDominio(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);