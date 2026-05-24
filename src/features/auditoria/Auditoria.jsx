import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import FilterSection from './components/FilterSection';
import AuditTable from './components/AuditTable';
import DetailModal from './components/DetailModal';
import Pagination from './components/Pagination';
import {
  fetchAuditoriasAplicacion,
  fetchAuditoriaAplicacionDetalle,
  setCurrentPage,
  setItemsPerPage,
  clearDetalle,
} from './slices/auditoriaSlice';

const EMPTY_FILTERS = {
  startDate: '', endDate: '',
  minDuration: '', maxDuration: '',
  username: '', appName: '',
  httpMethod: '', httpStatus: '',
  ipAddress: '', hasException: '',
  correlationId: '', endpoint: '',
  userAgent: '', entidad: '', accion: '',
};

export default function Auditoria() {
  const dispatch = useDispatch();

  const {
    data, total, currentPage, itemsPerPage,
    loading, error, appliedFilters: reduxAppliedFilters,
    detalle, loadingDetalle,
  } = useSelector((state) => state.auditoriaAplicacion);

  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedItem, setSelectedItem]     = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);

  useEffect(() => {
    dispatch(fetchAuditoriasAplicacion({
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters,
    }));
  }, [dispatch, currentPage, itemsPerPage, appliedFilters]);

  const validateFilters = (f) => {
    if (f.startDate && f.endDate && new Date(f.startDate) > new Date(f.endDate)) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin');
      return null;
    }
    if (f.minDuration && f.maxDuration) {
      const min = Number(f.minDuration), max = Number(f.maxDuration);
      if (min < 0 || max < 0)  { alert('Las duraciones no pueden ser negativas'); return null; }
      if (min > max)            { alert('La duración mínima no puede ser mayor que la máxima'); return null; }
    }
    if (f.ipAddress?.trim()) {
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(f.ipAddress.trim())) {
        alert('El formato de la dirección IP no es válido');
        return null;
      }
    }
    return f;
  };

  const handleApplyFilters = () => {
    const validated = validateFilters(filters);
    if (!validated) return;
    setAppliedFilters(validated);
    dispatch(setCurrentPage(1));
    dispatch(fetchAuditoriasAplicacion({ page: 1, limit: itemsPerPage, ...validated }));
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    dispatch(setCurrentPage(1));
    dispatch(fetchAuditoriasAplicacion({ page: 1, limit: itemsPerPage }));
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    dispatch(fetchAuditoriaAplicacionDetalle(item.id_log));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    dispatch(clearDetalle());
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(total / itemsPerPage)) {
      dispatch(setCurrentPage(page));
    }
  };

  const hasActiveFilters = Object.values(appliedFilters).some(v => v !== '');
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Layout title="Auditoría de Aplicación">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <AuditTable data={data} onViewDetails={handleViewDetails} />
        )}

        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(items) => dispatch(setItemsPerPage(items))}
            totalItems={total}
          />
        )}

        <DetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          data={detalle || selectedItem}
          loading={loadingDetalle}
        />
      </div>
    </Layout>
  );
}