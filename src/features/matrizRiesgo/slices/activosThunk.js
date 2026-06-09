import { createAsyncThunk } from '@reduxjs/toolkit';
import { activosApi } from '../../../lib/api';

export const fetchActivos = createAsyncThunk(
  'activos/fetchActivos',
  async (params = {}, { rejectWithValue }) => {
    try { return await activosApi.fetchActivos(params); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const createActivo = createAsyncThunk(
  'activos/createActivo',
  async (data, { rejectWithValue }) => {
    try { return await activosApi.createActivo(data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const updateActivo = createAsyncThunk(
  'activos/updateActivo',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await activosApi.updateActivo(id, data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const deleteActivo = createAsyncThunk(
  'activos/deleteActivo',
  async (id, { rejectWithValue }) => {
    try { await activosApi.deleteActivo(id); return id; }
    catch (e) { return rejectWithValue(e); }
  }
);
