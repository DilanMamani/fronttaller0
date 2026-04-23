import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../../../lib/api';
import { setLoading, setTotales, setError } from '../slices/dashboardSlice';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (filters, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading());
      
      // La respuesta completa de la API
      const response = await dashboardApi.fetchStats(filters);
      
      // Extraer solo los datos necesarios
      const data = {
        kpis: response.kpis,
        timeline: response.timeline,
        combinaciones: response.combinaciones
      };
      
      dispatch(setTotales(data));
      return data;
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || error?.message || 'Error al cargar estadísticas';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);