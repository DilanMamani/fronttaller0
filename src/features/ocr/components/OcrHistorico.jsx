import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOcrHistorico } from '../slices/ocrThunk';
import {
  selectOcrHistorico,
  selectOcrIsLoadingHistorico,
  selectOcrError,
  selectOcrTotalItems,
  selectOcrTotalPages,
  selectOcrCurrentPage,
} from '../slices/ocrSlice';
import { useState } from 'react';

/* ─── Helpers ─────────────────────────────────────────── */
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

/* ─── Estado badge ────────────────────────────────────── */
const ESTADO_MAP = {
  confirmado:          { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', icon: 'check_circle' },
  rechazado:           { cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',                icon: 'cancel' },
  pendiente:           { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',         icon: 'hourglass_empty' },
  esperando_parroquia: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',            icon: 'church' },
};

function EstadoBadge({ estado }) {
  const key   = estado?.toLowerCase() ?? '';
  const cfg   = ESTADO_MAP[key] ?? { cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: 'help' };
  const label = key.replace(/_/g, ' ') || 'desconocido';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cfg.cls}`}>
      <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
      {label}
    </span>
  );
}

/* ─── Fila de detalle en el modal ─────────────────────── */
function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide self-start pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 dark:text-gray-200 break-words">{value}</span>
    </div>
  );
}

/* ─── Modal de detalle ────────────────────────────────── */
function DetalleModal({ item, onClose }) {
  if (!item) return null;

  const d = item.datos_extraidos ?? {};

  const camposGenericos = [
    { label: 'Parroquia (OCR)',   value: d.parroquia },
    { label: 'Foja',              value: d.foja },
    { label: 'Número',            value: d.numero },
    { label: 'Número de acta',    value: d.numero_acta },
    { label: 'Fecha sacramento',  value: d.fecha_sacramento },
    { label: 'Lugar ceremonia',   value: d.lugar_ceremonia },
    { label: 'Reg. Civil',        value: d.reg_civil },
  ];

  const camposPersonas = [
    { label: 'Nombre',       value: d.nombre },
    { label: 'Contrayente',  value: d.nombre_contrayente },
    { label: 'Contrayenta',  value: d.nombre_contrayenta },
    { label: 'Testigo 1',    value: d.testigo1 },
    { label: 'Testigo 2',    value: d.testigo2 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">document_search</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Registro #{item.id}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.tipoSacramento?.nombre ?? '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-400">Estado</span>
              <EstadoBadge estado={item.estado} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-400">Registrado</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                item.registrado
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <span className="material-symbols-outlined text-[13px]">
                  {item.registrado ? 'task_alt' : 'radio_button_unchecked'}
                </span>
                {item.registrado ? 'Sí' : 'No'}
              </span>
            </div>
          </div>

          {item.parroquia && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-blue-500 mb-1">Parroquia confirmada</p>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{item.parroquia.nombre}</p>
              <p className="text-xs text-blue-500">ID: {item.parroquia.id_parroquia}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Datos extraídos (OCR)</p>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-4 py-2">
              {[...camposGenericos, ...camposPersonas].every(c => !c.value) ? (
                <p className="text-xs text-gray-400 py-2">Sin datos extraídos.</p>
              ) : (
                [...camposGenericos, ...camposPersonas].map(({ label, value }) => (
                  <DetailRow key={label} label={label} value={value} />
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Metadatos</p>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 px-4 py-2">
              <DetailRow label="ID"               value={`#${item.id}`} />
              <DetailRow label="Tipo sacramento"  value={item.tipoSacramento?.nombre} />
              <DetailRow label="Usuario ID"       value={item.usuario_id} />
              <DetailRow label="Sacramento ID"    value={item.sacramento_id ?? '—'} />
              <DetailRow label="Fecha registro"   value={fmtDateTime(item.fecha_registro)} />
              <DetailRow label="Última actualiz." value={fmtDateTime(item.fecha_actualizacion)} />
              <DetailRow label="Archivo S3"       value={item.s3_key} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Paginación ──────────────────────────────────────── */
function Pagination({ currentPage, totalPages, onChange, isLoading }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    }
  }

  const withEllipsis = [];
  let prev = null;
  for (const p of pages) {
    if (prev !== null && p - prev > 1) withEllipsis.push('...');
    withEllipsis.push(p);
    prev = p;
  }

  const btnBase =
    'p-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {/* |< Primera */}
        <button onClick={() => onChange(1)} disabled={currentPage === 1 || isLoading} title="Primera" className={btnBase}>
          <span className="material-symbols-outlined text-[18px]">first_page</span>
        </button>
        {/* < Anterior */}
        <button onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} title="Anterior" className={btnBase}>
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {/* Números */}
        {withEllipsis.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="w-8 text-center text-xs text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              disabled={isLoading}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                p === currentPage
                  ? 'bg-primary text-white shadow-sm pointer-events-none'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* > Siguiente */}
        <button onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} title="Siguiente" className={btnBase}>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
        {/* >| Última */}
        <button onClick={() => onChange(totalPages)} disabled={currentPage === totalPages || isLoading} title="Última" className={btnBase}>
          <span className="material-symbols-outlined text-[18px]">last_page</span>
        </button>
      </div>

      {/* Selector de salto directo */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Ir a página</span>
        <select
          value={currentPage}
          disabled={isLoading}
          onChange={(e) => onChange(Number(e.target.value))}
          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer disabled:opacity-50"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>{p} / {totalPages}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────── */
export default function OcrHistorico() {
  const dispatch     = useDispatch();
  const historico    = useSelector(selectOcrHistorico);
  const isLoading    = useSelector(selectOcrIsLoadingHistorico);
  const error        = useSelector(selectOcrError);
  const totalItems   = useSelector(selectOcrTotalItems);
  const totalPages   = useSelector(selectOcrTotalPages);
  const currentPage  = useSelector(selectOcrCurrentPage);

  const [selectedItem, setSelectedItem] = useState(null);
  const PAGE_SIZE = 10;

  // Carga la página indicada desde el servidor
  const cargarPagina = (page) => {
    dispatch(fetchOcrHistorico({ page, limit: PAGE_SIZE }));
  };

  // Carga inicial
  useEffect(() => {
    cargarPagina(1);
  }, [dispatch]);

  /* ── Estados de la UI ── */
  if (error && !historico.length) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-red-500">
        <span className="material-symbols-outlined">error</span>
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!isLoading && !historico.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <span className="material-symbols-outlined text-4xl">history</span>
        <p className="text-sm">No hay registros OCR en el histórico.</p>
      </div>
    );
  }

  const from = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to   = Math.min(currentPage * PAGE_SIZE, totalItems);

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Histórico de procesamiento OCR
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalItems} registro{totalItems !== 1 ? 's' : ''} en total
            </p>
          </div>
          <button
            onClick={() => cargarPagina(1)}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[15px] ${isLoading ? 'animate-spin' : ''}`}>
              {isLoading ? 'progress_activity' : 'refresh'}
            </span>
            Actualizar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                {['ID', 'Tipo', 'Estado', 'Parroquia', 'Registrado', 'Fecha', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                /* Skeleton mientras carga */
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="bg-white dark:bg-gray-900">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                historico.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-xs">#{item.id}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {item.tipoSacramento?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={item.estado} /></td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[160px] truncate">
                      {item.parroquia?.nombre ?? item.datos_extraidos?.parroquia ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        item.registrado ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {item.registrado ? 'task_alt' : 'radio_button_unchecked'}
                        </span>
                        {item.registrado ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {fmtDate(item.fecha_registro)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Ver más
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info de registros */}
        <div className="flex items-center justify-between px-1 pt-1">
          <p className="text-xs text-gray-400">
            {totalItems > 0 ? `Mostrando ${from}–${to} de ${totalItems}` : 'Sin registros'}
          </p>
          <p className="text-xs text-gray-400">
            Página {currentPage} de {totalPages}
          </p>
        </div>

        {/* Paginación server-side */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={cargarPagina}
          isLoading={isLoading}
        />
      </div>

      {selectedItem && (
        <DetalleModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
