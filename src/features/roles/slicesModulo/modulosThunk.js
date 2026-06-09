import { createAsyncThunk } from '@reduxjs/toolkit';
import { modulosApi } from '../../../lib/api';

export const fetchModulos = createAsyncThunk(
  'modulos/fetchModulos',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await modulosApi.fetchModulos(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
