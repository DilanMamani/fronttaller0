import { createAsyncThunk } from '@reduxjs/toolkit';
import { riesgosApi } from '../../../lib/api';

export const fetchRiesgos = createAsyncThunk(
  'matrizRiesgo/fetchRiesgos',
  async (params = {}, { rejectWithValue }) => {
    try { return await riesgosApi.fetchRiesgos(params); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const createRiesgo = createAsyncThunk(
  'matrizRiesgo/createRiesgo',
  async (data, { rejectWithValue }) => {
    try { return await riesgosApi.createRiesgo(data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const updateRiesgo = createAsyncThunk(
  'matrizRiesgo/updateRiesgo',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await riesgosApi.updateRiesgo(id, data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const deleteRiesgo = createAsyncThunk(
  'matrizRiesgo/deleteRiesgo',
  async (id, { rejectWithValue }) => {
    try { await riesgosApi.deleteRiesgo(id); return id; }
    catch (e) { return rejectWithValue(e); }
  }
);

export const publicarRiesgo = createAsyncThunk(
  'matrizRiesgo/publicarRiesgo',
  async (id, { rejectWithValue }) => {
    try { return await riesgosApi.publicarRiesgo(id); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const createControl = createAsyncThunk(
  'matrizRiesgo/createControl',
  async ({ riesgoId, data }, { rejectWithValue }) => {
    try { return await riesgosApi.createControl(riesgoId, data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const updateControl = createAsyncThunk(
  'matrizRiesgo/updateControl',
  async ({ riesgoId, controlId, data }, { rejectWithValue }) => {
    try { return await riesgosApi.updateControl(riesgoId, controlId, data); }
    catch (e) { return rejectWithValue(e); }
  }
);

export const deleteControl = createAsyncThunk(
  'matrizRiesgo/deleteControl',
  async ({ riesgoId, controlId }, { rejectWithValue }) => {
    try { await riesgosApi.deleteControl(riesgoId, controlId); return { riesgoId, controlId }; }
    catch (e) { return rejectWithValue(e); }
  }
);
