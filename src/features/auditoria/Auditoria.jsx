import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import FilterSection from './components/FilterSection';
import AuditTable from './components/AuditTable';
import DetailModal from './components/DetailModal';
import Pagination from './components/Pagination';
import { 
  fetchAuditorias, 
  setCurrentPage, 
  setItemsPerPage 
} from './slices/auditoriaSlice';

export default function Auditoria() {
  const dispatch = useDispatch();
  
  // Estado de Redux
  const { 
    data, 
    total, 
    currentPage, 
    itemsPerPage, 
    loading, 
    error,
    appliedFilters: reduxAppliedFilters 
  } = useSelector((state) => state.auditoria);

  // Estados locales
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minDuration: '',
    maxDuration: '',
    username: '',
    appName: '',
    httpMethod: '',
    httpStatus: '',
    ipAddress: '',
    hasException: '',
    correlationId: '',
    endpoint: '',
    userAgent: ''
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(fetchAuditorias({
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters
    }));
  }, [dispatch, currentPage, itemsPerPage, appliedFilters]);

  // Validación de filtros
  const validateFilters = (filters) => {
    const validated = { ...filters };
    
    // Validar fechas
    if (validated.startDate && validated.endDate) {
      const start = new Date(validated.startDate);
      const end = new Date(validated.endDate);
      if (start > end) {
        alert('La fecha de inicio no puede ser mayor que la fecha de fin');
        return null;
      }
    }
    
    // Validar duraciones
    if (validated.minDuration && validated.maxDuration) {
      const min = Number(validated.minDuration);
      const max = Number(validated.maxDuration);
      if (min < 0 || max < 0) {
        alert('Las duraciones no pueden ser negativas');
        return null;
      }
      if (min > max) {
        alert('La duración mínima no puede ser mayor que la máxima');
        return null;
      }
    }
    
    // Validar IP (formato básico)
    if (validated.ipAddress && validated.ipAddress.trim()) {
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(validated.ipAddress.trim())) {
        alert('El formato de la dirección IP no es válido');
        return null;
      }
    }
    
    return validated;
  };

  const handleApplyFilters = () => {
    const validated = validateFilters(filters);
    if (validated) {
      setAppliedFilters(validated);
      dispatch(setCurrentPage(1));
      dispatch(fetchAuditorias({
        page: 1,
        limit: itemsPerPage,
        ...validated
      }));
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      startDate: '',
      endDate: '',
      minDuration: '',
      maxDuration: '',
      username: '',
      appName: '',
      httpMethod: '',
      httpStatus: '',
      ipAddress: '',
      hasException: '',
      correlationId: '',
      endpoint: '',
      userAgent: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    dispatch(setCurrentPage(1));
    dispatch(fetchAuditorias({
      page: 1,
      limit: itemsPerPage
    }));
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(total / itemsPerPage)) {
      dispatch(setCurrentPage(page));
    }
  };

  const handleItemsPerPageChange = (items) => {
    dispatch(setItemsPerPage(items));
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(appliedFilters).some(value => value !== '');

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Layout title="Auditoría">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        <FilterSection
          filters={filters}
          onFilterChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AuditTable
            data={data}
            onViewDetails={handleViewDetails}
          />
        )}

        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={total}
          />
        )}

        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedItem}
        />
      </div>
    </Layout>
  );
}