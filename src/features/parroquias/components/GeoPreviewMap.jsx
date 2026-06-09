import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function GeoPreviewMap({ lat, lng, displayName, onMove, adjusted }) {
  const markerRef = useRef(null);

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800">
        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">
          {adjusted ? 'edit_location' : 'check_circle'}
        </span>
        <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium truncate flex-1">
          {adjusted ? 'Ubicación ajustada manualmente' : displayName}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">open_with</span>
          Arrastra el marcador para ajustar
        </span>
      </div>
      <div style={{ height: 220 }}>
        <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[lat, lng]}
            draggable
            ref={markerRef}
            eventHandlers={{
              dragend: () => {
                const m = markerRef.current;
                if (m && onMove) {
                  const { lat: newLat, lng: newLng } = m.getLatLng();
                  onMove({ lat: newLat, lng: newLng });
                }
              },
            }}
          />
          <Recenter lat={lat} lng={lng} />
        </MapContainer>
      </div>
    </div>
  );
}
