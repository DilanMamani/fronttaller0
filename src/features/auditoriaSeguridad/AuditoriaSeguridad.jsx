import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import Pagination from '../auditoria/components/Pagination';
import {
  fetchAuditoriasSeguridad,
  setCurrentPage,
  setItemsPerPage,
} from './slices/auditoriaSeguridadSlices';
import SecurityFilterSection from './components/SecurityFilterSection';
import SecurityTable from './components/SecurityTable';
import SecurityDetailModal from './components/SecurityDetailModal';

const EMPTY_FILTERS = {
  startDate: '', endDate: '',
  username: '', evento: '',
  ipAddress: '', correlationId: '',
  exitoso: '',
};

export default function AuditoriaSeguridad() {
  const dispatch = useDispatch();

  const {
    data, total, currentPage, itemsPerPage, loading, error,
  } = useSelector((state) => state.auditoriaSeguridad);

  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedItem, setSelectedItem]     = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);

  useEffect(() => {
    dispatch(fetchAuditoriasSeguridad({
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters,
    }));
  }, [dispatch, currentPage, itemsPerPage, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    dispatch(setCurrentPage(1));
    dispatch(fetchAuditoriasSeguridad({ page: 1, limit: itemsPerPage, ...filters }));
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    dispatch(setCurrentPage(1));
    dispatch(fetchAuditoriasSeguridad({ page: 1, limit: itemsPerPage }));
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(v => v !== '');
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Layout title="Auditoría de Seguridad">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        <SecurityFilterSection
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
          <SecurityTable data={data} onViewDetails={handleViewDetails} />
        )}

        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
            }}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(items) => dispatch(setItemsPerPage(items))}
            totalItems={total}
          />
        )}

        <SecurityDetailModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
          data={selectedItem}
        />
      </div>
    </Layout>
  );
}