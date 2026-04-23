import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kpis: {
    personas: 0,
    sacramentos: 0,
    parroquias: 0,
  },
  timeline: [],
  combinaciones: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setTotales(state, action) {
      state.kpis = action.payload.kpis || state.kpis;
      state.timeline = action.payload.timeline || state.timeline;
      state.combinaciones = action.payload.combinaciones || state.combinaciones;
      state.isLoading = false;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('dashboard/fetchStats/rejected', (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const { setTotales, setLoading, setError } = dashboardSlice.actions;

// Selectors
export const selectKPIs = (state) => state.dashboard.kpis;
export const selectTimeline = (state) => state.dashboard.timeline;
export const selectCombinaciones = (state) => state.dashboard.combinaciones;
export const selectIsLoading = (state) => state.dashboard.isLoading;
export const selectError = (state) => state.dashboard.error;

export const dashboardReducer = dashboardSlice.reducer;

export default dashboardSlice.reducer;