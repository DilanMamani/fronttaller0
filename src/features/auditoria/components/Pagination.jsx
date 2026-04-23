import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalItems 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-light bg-card-light px-6 py-4 dark:border-border-dark dark:bg-card-dark sm:flex-row sm:items-center sm:justify-between">
      {/* Info y selector de items por página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="text-sm text-muted-light dark:text-muted-dark">
          Mostrando <span className="font-medium text-foreground-light dark:text-foreground-dark">{startItem}</span> a{' '}
          <span className="font-medium text-foreground-light dark:text-foreground-dark">{endItem}</span> de{' '}
          <span className="font-medium text-foreground-light dark:text-foreground-dark">{totalItems}</span> registros
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-light dark:text-muted-dark">
            Por página:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="rounded-md border border-border-light bg-card-light px-2 py-1 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center rounded-md border border-border-light bg-card-light px-3 py-2 text-sm font-medium text-foreground-light transition-colors hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:hover:bg-background-dark"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Anterior</span>
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-muted-light dark:text-muted-dark"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'border border-border-light bg-card-light text-foreground-light hover:bg-background-light dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:hover:bg-background-dark'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center rounded-md border border-border-light bg-card-light px-3 py-2 text-sm font-medium text-foreground-light transition-colors hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:hover:bg-background-dark"
        >
          <span className="mr-1 hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}