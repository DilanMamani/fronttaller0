import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Colores fijos para sacramentos
const SACRAMENTO_COLORS = {
  bautizo: '#0f49bd',
  confirmacion: '#c99c33',
  matrimonio: '#10b981',
  comunion: '#8b5cf6'
};

export default function SacramentosTimeline({ data }) {
  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark">
      <h3 className="text-lg font-semibold mb-4">Sacramentos por Año</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="periodo" 
            stroke="#9ca3af"
            style={{ fontSize: '13px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '13px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="bautizo" 
            stroke={SACRAMENTO_COLORS.bautizo}
            strokeWidth={2.5}
            name="Bautizo"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="confirmacion" 
            stroke={SACRAMENTO_COLORS.confirmacion}
            strokeWidth={2.5}
            name="Confirmación"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="matrimonio" 
            stroke={SACRAMENTO_COLORS.matrimonio}
            strokeWidth={2.5}
            name="Matrimonio"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="comunion" 
            stroke={SACRAMENTO_COLORS.comunion}
            strokeWidth={2.5}
            name="Primera Comunión"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}