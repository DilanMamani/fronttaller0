import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { parroquiasApi } from '../../../lib/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function buildCustomIcon(color, highlight = false) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${highlight ? 44 : 36}px; height:${highlight ? 44 : 36}px;
        border-radius:50% 50% 50% 0; transform:rotate(-45deg);
        background:${color}; border:${highlight ? '4px solid #fff' : '3px solid white'};
        box-shadow:${highlight ? '0 0 0 3px ' + color + '55, 0 4px 12px rgba(0,0,0,.4)' : '0 2px 6px rgba(0,0,0,.35)'};
        display:flex; align-items:center; justify-content:center;
      ">
        <span style="transform:rotate(45deg); color:white; font-size:${highlight ? 16 : 14}px; font-family:'Material Symbols Outlined'">church</span>
      </div>`,
    iconSize:    [highlight ? 44 : 36, highlight ? 44 : 36],
    iconAnchor:  [highlight ? 22 : 18, highlight ? 44 : 36],
    popupAnchor: [0, -46],
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

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.latitud, target.longitud], 15, { animate: true, duration: 1 });
  }, [target, map]);
  return null;
}

const STATS = [
  { key: 'bautismos',      label: 'Bautismos',      icon: 'water_drop',         color: 'text-sky-600'    },
  { key: 'matrimonios',    label: 'Matrimonios',     icon: 'favorite',           color: 'text-rose-500'   },
  { key: 'comuniones',     label: 'Comuniones',      icon: 'volunteer_activism', color: 'text-amber-500'  },
  { key: 'confirmaciones', label: 'Confirmaciones',  icon: 'auto_awesome',       color: 'text-violet-500' },
];

export default function MapaParroquias() {
  const [parroquias, setParroquias] = useState([]);
  const [meta, setMeta]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [query, setQuery]           = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected]     = useState(null);
  const markerRefs = useRef({});
  const searchRef  = useRef(null);

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

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? parroquias.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (p) => {
    setSelected(p);
    setQuery(p.nombre);
    setShowDropdown(false);
    setTimeout(() => {
      markerRefs.current[p.id_parroquia]?.openPopup();
    }, 1100);
  };

  const handleClear = () => {
    setQuery('');
    setSelected(null);
    setShowDropdown(false);
  };

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

      {/* Barra de búsqueda */}
      {parroquias.length > 0 && (
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-gray-400 text-xl shrink-0">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setSelected(null); }}
              onFocus={() => { if (query.trim()) setShowDropdown(true); }}
              placeholder="Buscar parroquia en el mapa…"
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none"
            />
            {query && (
              <button onClick={handleClear} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Dropdown de resultados */}
          {showDropdown && query.trim() && (
            <div className="absolute top-full left-0 right-0 z-[1000] mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                  <span className="material-symbols-outlined text-base">search_off</span>
                  Sin resultados para <strong className="ml-1">"{query}"</strong>
                </div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id_parroquia}
                    onMouseDown={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-base text-gray-400 group-hover:text-primary transition-colors shrink-0">church</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.total_sacramentos} sacramentos · {p.total_fieles} fieles</p>
                    </div>
                    <span className="material-symbols-outlined text-xs text-gray-300 group-hover:text-primary ml-auto shrink-0 transition-colors">my_location</span>
                  </button>
                ))
              )}
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
            <FlyTo target={selected} />
            {parroquias.map((p) => {
              const isSelected = selected?.id_parroquia === p.id_parroquia;
              return (
                <Marker
                  key={p.id_parroquia}
                  position={[p.latitud, p.longitud]}
                  icon={buildCustomIcon(colorByTotal(p.total_sacramentos), isSelected)}
                  ref={(el) => { if (el) markerRefs.current[p.id_parroquia] = el; }}
                  zIndexOffset={isSelected ? 1000 : 0}
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
              );
            })}
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
