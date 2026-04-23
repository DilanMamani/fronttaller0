import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from './slices/dashboardThunks';
import {
  selectKPIs,
  selectTimeline,
  selectCombinaciones,
  selectIsLoading,
  selectError
} from './slices/dashboardSlice';

import KPICards from './components/KPICards';
import DashboardFilters from './components/DashboardFilters';
import SacramentosTimeline from './components/SacramentosTimeline';
import PersonasPorSacramento from './components/PersonasPorSacramento';
import Layout from '../../shared/components/layout/Layout';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { personas, sacramentos, parroquias } = useSelector(selectKPIs);
  const timelineData = useSelector(selectTimeline);
  const personasSacramentoData = useSelector(selectCombinaciones);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [filters, setFilters] = React.useState({
    fechaInicio: '',
    fechaFin: '',
    sacramentos: []
  });

  const sacramentosList = [
    'Bautismo',
    'Primera Comunión',
    'Confirmación',
    'Matrimonio'
  ];

  useEffect(() => {
    // Construir parámetros según lo que espera la API
    const params = {};
    
    // La API espera: start_date, end_date, tipo (puede ser array o string separado por comas)
    if (filters.fechaInicio) params.start_date = filters.fechaInicio;
    if (filters.fechaFin) params.end_date = filters.fechaFin;
    
    // Enviar tipos de sacramento si hay seleccionados
    if (filters.sacramentos.length > 0) {
      // La API acepta tanto array como string separado por comas
      // Axios convertirá el array automáticamente en tipo[]=valor1&tipo[]=valor2
      params.tipo = filters.sacramentos;
    }

    dispatch(fetchDashboardStats(params));
  }, [filters, dispatch]);

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchDashboardStats({}))}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Intentar nuevamente
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-8">

        <DashboardFilters
          filters={filters}
          onFilterChange={setFilters}
          sacramentosList={sacramentosList}
        />

        <KPICards 
          personas={personas}
          sacramentos={sacramentos}
          parroquias={parroquias}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <SacramentosTimeline data={timelineData} />
          </div>

          <div className="lg:col-span-2">
            <PersonasPorSacramento data={personasSacramentoData} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
