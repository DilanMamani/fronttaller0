import { createAsyncThunk } from '@reduxjs/toolkit';
import { ocrApi } from '../../../lib/api';
 
// PASO 1 — Subir imagen y procesar OCR
export const uploadOcrPreview = createAsyncThunk(
  'ocr/uploadPreview',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await ocrApi.preview(formData);
      // Respuesta esperada:
      //   { ok: true, historicoId, datosDetectados, tipo_sacramento, tipo_sacramento_id }
      //   o { ok: true, requiere_confirmacion_parroquia: true, historicoId, ... }
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || error?.msg || 'Error al procesar OCR');
    }
  }
);
 
// PASO 3a — Asignar parroquia existente
export const asignarParroquiaOcr = createAsyncThunk(
  'ocr/asignarParroquia',
  async ({ historicoId, parroquiaId }, { rejectWithValue }) => {
    try {
      console.log('>>> thunk body:', { institucion_parroquia_id: parroquiaId });
      const response = await ocrApi.asignarParroquia(historicoId, { institucion_parroquia_id: parroquiaId });
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al asignar parroquia');
    }
  }
);
 
// PASO 3b — Crear y asignar nueva parroquia
export const crearParroquiaOcr = createAsyncThunk(
  'ocr/crearParroquia',
  async ({ historicoId, data }, { rejectWithValue }) => {
    try {
      const response = await ocrApi.crearParroquia(historicoId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al crear parroquia');
    }
  }
);
 
// PASO 4 — Confirmar sacramento
export const confirmarOcr = createAsyncThunk(
  'ocr/confirmar',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await ocrApi.confirmar(payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.data?.msg || error?.message || 'Error al confirmar sacramento'
      );
    }
  }
);
 
// Rechazar histórico
export const rechazarOcr = createAsyncThunk(
  'ocr/rechazar',
  async (historicoId, { rejectWithValue }) => {
    try {
      const response = await ocrApi.rechazar(historicoId);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al rechazar');
    }
  }
);
 
// Listar histórico OCR
export const fetchOcrHistorico = createAsyncThunk(
  'ocr/fetchHistorico',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await ocrApi.fetchHistorico({ page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Error al cargar histórico');
    }
  }
);