import { createAsyncThunk } from '@reduxjs/toolkit';
import { vulnerabilidadesApi } from '../../../lib/api';

export const fetchVulnerabilidades = createAsyncThunk(
  'vulnerabilidades/fetchVulnerabilidades',
  async (params = {}, { rejectWithValue }) => {
    try { return await vulnerabilidadesApi.fetchVulnerabilidades(params); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const createVulnerabilidad = createAsyncThunk(
  'vulnerabilidades/createVulnerabilidad',
  async (data, { rejectWithValue }) => {
    try { return await vulnerabilidadesApi.createVulnerabilidad(data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const updateVulnerabilidad = createAsyncThunk(
  'vulnerabilidades/updateVulnerabilidad',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await vulnerabilidadesApi.updateVulnerabilidad(id, data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const deleteVulnerabilidad = createAsyncThunk(
  'vulnerabilidades/deleteVulnerabilidad',
  async (id, { rejectWithValue }) => {
    try { await vulnerabilidadesApi.deleteVulnerabilidad(id); return id; }
    catch (e) { return rejectWithValue(e); }
  }
);
