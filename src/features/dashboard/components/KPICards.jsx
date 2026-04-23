import React from 'react';

export default function KPICards({ personas, sacramentos, parroquias }) {
  const formattedPersonas = Number(personas ?? 0).toLocaleString('es-ES');
  const formattedSacramentos = Number(sacramentos ?? 0).toLocaleString('es-ES');
  const formattedParroquias = Number(parroquias ?? 0).toLocaleString('es-ES');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-light dark:text-muted-dark text-sm font-medium">Número de Personas</p>
            <p className="text-3xl font-bold mt-2 text-[#0f49bd]">{formattedPersonas}</p>
          </div>
          <div className="h-12 w-12 bg-[#0f49bd]/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0f49bd]">group</span>
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-light dark:text-muted-dark text-sm font-medium">Número de Sacramentos</p>
            <p className="text-3xl font-bold mt-2 text-[#0f49bd]">{formattedSacramentos}</p>
          </div>
          <div className="h-12 w-12 bg-[#0f49bd]/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0f49bd]">workspace_premium</span>
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-light dark:text-muted-dark text-sm font-medium">Número de Parroquias</p>
            <p className="text-3xl font-bold mt-2 text-[#0f49bd]">{formattedParroquias}</p>
          </div>
          <div className="h-12 w-12 bg-[#0f49bd]/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0f49bd]">church</span>
          </div>
        </div>
      </div>
    </div>
  );
}