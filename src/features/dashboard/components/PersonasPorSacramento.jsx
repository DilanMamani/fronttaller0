import React from 'react';

export default function PersonasPorSacramento({ data }) {
  const getPercentage = (count, total) => {
    return ((count / total) * 100).toFixed(1);
  };

  const total = data.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark">
      <h3 className="text-lg font-semibold mb-4">Personas por Sacramento(s)</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.combinacion}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{item.cantidad.toLocaleString()}</span>
                <span className="text-xs text-muted-light dark:text-muted-dark ml-2">
                  ({getPercentage(item.cantidad, total)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getPercentage(item.cantidad, total)}%`,
                  backgroundColor: item.color || '#0f49bd'
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total de Personas</span>
          <span className="text-lg font-bold text-[#0f49bd]">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}