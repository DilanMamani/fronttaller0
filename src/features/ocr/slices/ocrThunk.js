import { ocrApi } from '../../../lib/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const uploadOcrPreview = createAsyncThunk(
  'ocr/uploadPreview',
  async (formData, { rejectWithValue }) => {
    try {
      return await ocrApi.preview(formData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const asignarParroquiaOcr = createAsyncThunk(
  'ocr/asignarParroquia',
  async ({ historicoId, parroquiaId }, { rejectWithValue }) => {
    try {
      return await ocrApi.asignarParroquia(historicoId, { institucion_parroquia_id: parroquiaId });
    } catch (error) {
      return rejectWithValue(error);
    } 
  }
);

export const crearParroquiaOcr = createAsyncThunk(
  'ocr/crearParroquia',
  async ({ historicoId, data }, { rejectWithValue }) => {
    try {
      return await ocrApi.crearParroquia(historicoId, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const confirmarOcr = createAsyncThunk(
  'ocr/confirmar',
  async (payload, { rejectWithValue }) => {
    try {
      return await ocrApi.confirmar(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const rechazarOcr = createAsyncThunk(
  'ocr/rechazar',
  async (historicoId, { rejectWithValue }) => {
    try {
      return await ocrApi.rechazar(historicoId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchOcrHistorico = createAsyncThunk(
  'ocr/fetchHistorico',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = params;
      return await ocrApi.fetchHistorico({ page, limit });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);