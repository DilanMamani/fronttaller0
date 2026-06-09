import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { parroquiasApi } from '../../../lib/api';

// Fix default marker icons broken by Webpack/Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function buildCustomIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px; height:36px; border-radius:50% 50% 50% 0;
        transform:rotate(-45deg); background:${color};
        border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,.35);
        display:flex; align-items:center; justify-content:center;
      ">
        <span style="transform:rotate(45deg); color:white; font-size:14px; font-family:'Material Symbols Outlined'">church</span>
      </div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -38],
  });
}

function colorByTotal(total) {
  if (total >= 200) return '#0f49bd';
  if (total >= 100) return '#c99c33';
  return '#6b7280';
}

function FitBounds({ parroquias }) {
  const map = useMap();
  useEffect(() => {
    if (!parroquias.length) return;
    const bounds = parroquias.map((p) => [p.latitud, p.longitud]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [parroquias, map]);
  return null;
}

const STATS = [
  { key: 'bautismos',     label: 'Bautismos',     icon: 'water_drop',         color: 'text-sky-600'   },
  { key: 'matrimonios',   label: 'Matrimonios',    icon: 'favorite',           color: 'text-rose-500'  },
  { key: 'comuniones',    label: 'Comuniones',     icon: 'volunteer_activism', color: 'text-amber-500' },
  { key: 'confirmaciones',label: 'Confirmaciones', icon: 'auto_awesome',       color: 'text-violet-500'},
];

export default function MapaParroquias() {
  const [parroquias, setParroquias] = useState([]);
  const [meta, setMeta]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    setLoading(true);
    parroquiasApi.fetchMapaResumen()
      .then(({ parroquias: list, meta: m }) => {
        setParroquias(list.filter((p) => p.latitud && p.longitud));
        setMeta(m);
      })
      .catch((err) => setError(err.message || 'Error al cargar el mapa'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <span className="text-sm">Cargando mapa de parroquias…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-red-500">
        <span className="material-symbols-outlined text-4xl">error</span>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tarjetas resumen */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-background-dark/50 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">church</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total parroquias</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{meta.total}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-2xl">location_on</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Con coordenadas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{meta.total - (meta.sin_coordenadas || 0)}</p>
            </div>
          </div>
          {meta.sin_coordenadas > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400">Sin coordenadas</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{meta.sin_coordenadas}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mapa */}
      {parroquias.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm text-gray-400">
          <span className="material-symbols-outlined text-5xl">map</span>
          <p className="text-sm">Ninguna parroquia tiene coordenadas registradas.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800" style={{ height: 520 }}>
          <MapContainer
            center={[parroquias[0].latitud, parroquias[0].longitud]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds parroquias={parroquias} />
            {parroquias.map((p) => (
              <Marker
                key={p.id_parroquia}
                position={[p.latitud, p.longitud]}
                icon={buildCustomIcon(colorByTotal(p.total_sacramentos))}
              >
                <Popup maxWidth={280}>
                  <div className="font-sans text-sm min-w-[220px]">
                    <p className="font-bold text-base text-gray-900 mb-2">{p.nombre}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                      {STATS.map(({ key, label }) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="text-gray-500 text-xs">{label}</span>
                          <span className="font-semibold text-gray-800 text-xs">{p[key] ?? 0}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-1 flex justify-between text-xs">
                      <span className="text-gray-500">Total sacramentos</span>
                      <span className="font-bold text-primary">{p.total_sacramentos}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-0.5">
                      <span className="text-gray-500">Total fieles</span>
                      <span className="font-bold text-gray-800">{p.total_fieles}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Leyenda */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Leyenda de marcadores</p>
        <div className="flex flex-wrap gap-4">
          {[
            { color: '#0f49bd', label: '≥ 200 sacramentos' },
            { color: '#c99c33', label: '100–199 sacramentos' },
            { color: '#6b7280', label: '< 100 sacramentos'  },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', background:color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
