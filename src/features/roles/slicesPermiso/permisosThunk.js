import { createAsyncThunk } from '@reduxjs/toolkit';
import { permisosApi } from '../../../lib/api';

export const fetchPermisos = createAsyncThunk(
  'permisos/fetchPermisos',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await permisosApi.fetchPermisos(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchPermisoById = createAsyncThunk(
  'permisos/fetchPermisoById',
  async (id, { rejectWithValue }) => {
    try {
      return await permisosApi.fetchPermisoById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createPermiso = createAsyncThunk(
  'permisos/createPermiso',
  async (data, { rejectWithValue }) => {
    try {
      return await permisosApi.createPermiso(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updatePermiso = createAsyncThunk(
  'permisos/updatePermiso',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await permisosApi.updatePermiso(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);