import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPersona } from '../../personas/slices/personasThunk';
import { selectIsCreating } from '../../personas/slices/personasSlice';
 
/**
 * Modal para crear una nueva persona desde el flujo OCR.
 *
 * Props:
 *  - isOpen        : bool
 *  - onClose       : () => void            — cancela sin crear
 *  - onPersonaCreada: (persona) => void    — persona recién creada del backend
 *  - datosOcr      : {
 *      nombre_completo?: string,
 *      fecha_nacimiento?: string,
 *      lugar_nacimiento?: string,
 *    }                                     — datos pre-rellenados desde OCR
 */
export default function NuevaPersonaModal({ isOpen, onClose, onPersonaCreada, datosOcr = {} }) {
  const dispatch = useDispatch();
  const isCreating = useSelector(selectIsCreating);
 
  // ── Pre-relleno desde OCR ──────────────────────────────────────────────────
  const parsearNombreCompleto = (nombreCompleto = '') => {
    const tokens = nombreCompleto.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return { nombre: '', apellidoPaterno: '', apellidoMaterno: '' };
    if (tokens.length === 1) return { nombre: tokens[0], apellidoPaterno: '', apellidoMaterno: '' };
    if (tokens.length === 2) return { nombre: tokens[0], apellidoPaterno: tokens[1], apellidoMaterno: '' };
    const apellidoMaterno = tokens[tokens.length - 1];
    const apellidoPaterno = tokens[tokens.length - 2];
    const nombre = tokens.slice(0, tokens.length - 2).join(' ');
    return { nombre, apellidoPaterno, apellidoMaterno };
  };
 
  const generarCITemporal = (nombreCompleto = '') => {
    const sinEspacios = nombreCompleto.replace(/\s+/g, '').toUpperCase();
    const aleatorio = Math.floor(100000 + Math.random() * 900000);
    return `${sinEspacios}-${aleatorio}`;
  };
 
  const { nombre, apellidoPaterno, apellidoMaterno } = parsearNombreCompleto(
    datosOcr.nombre_completo || ''
  );
  const NA = 'Información no disponible';
 
  const [form, setForm] = useState({
    nombre: nombre || NA,
    apellido_paterno: apellidoPaterno || NA,
    apellido_materno: apellidoMaterno || NA,
    carnet_identidad: generarCITemporal(datosOcr.nombre_completo || ''),
    fecha_nacimiento: datosOcr.fecha_nacimiento || '',
    lugar_nacimiento: datosOcr.lugar_nacimiento || NA,
    nombre_padre: NA,
    nombre_madre: NA,
    activo: true,
    estado: 'no verificado',
  });
 
  const [ciError, setCiError] = useState('');
 
  if (!isOpen) return null;
 
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'carnet_identidad') setCiError('');
  };
 
  const handleSubmit = async () => {
    setCiError('');
    const result = await dispatch(createPersona({ ...form, activo: true, estado: 'no verificado' }));
    if (createPersona.fulfilled.match(result)) {
      const persona = result.payload;
      onPersonaCreada(persona);
    } else {
      const msg = result.payload?.message || result.payload?.msg || '';
      if (msg.toLowerCase().includes('carnet') || msg.toLowerCase().includes('ci') || msg.toLowerCase().includes('duplicado')) {
        setCiError('El carnet de identidad ya está registrado');
      }
    }
  };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Registrar nueva persona
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
 
        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nombre */}
          <Field label="Nombre *">
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={inputCls()}
            />
          </Field>
 
          {/* Apellido paterno */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Apellido paterno *">
              <input
                type="text"
                value={form.apellido_paterno}
                onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                className={inputCls()}
              />
            </Field>
            <Field label="Apellido materno *">
              <input
                type="text"
                value={form.apellido_materno}
                onChange={(e) => handleChange('apellido_materno', e.target.value)}
                className={inputCls()}
              />
            </Field>
          </div>
 
          {/* Carnet */}
          <Field label="Carnet de identidad *">
            <input
              type="text"
              value={form.carnet_identidad}
              onChange={(e) => handleChange('carnet_identidad', e.target.value)}
              className={inputCls(!!ciError)}
            />
            {ciError ? (
              <p className="text-xs text-red-600 mt-1">{ciError}</p>
            ) : (
              <p className="text-xs text-amber-600 mt-1">
                CI temporal generado automáticamente. Corrígelo si tienes el dato real.
              </p>
            )}
          </Field>
 
          {/* Fecha nacimiento */}
          <Field label="Fecha de nacimiento *">
            {datosOcr.fecha_nacimiento ? (
              <input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                className={inputCls()}
              />
            ) : (
              <>
                <input
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                  className={inputCls()}
                />
                <p className="text-xs text-amber-600 mt-1">
                  Fecha no detectada, ingrésala manualmente.
                </p>
              </>
            )}
          </Field>
 
          {/* Lugar nacimiento */}
          <Field label="Lugar de nacimiento *">
            <input
              type="text"
              value={form.lugar_nacimiento}
              onChange={(e) => handleChange('lugar_nacimiento', e.target.value)}
              className={inputCls()}
            />
          </Field>
 
          {/* Padres */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del padre">
              <input
                type="text"
                value={form.nombre_padre}
                onChange={(e) => handleChange('nombre_padre', e.target.value)}
                className={inputCls()}
              />
            </Field>
            <Field label="Nombre de la madre">
              <input
                type="text"
                value={form.nombre_madre}
                onChange={(e) => handleChange('nombre_madre', e.target.value)}
                className={inputCls()}
              />
            </Field>
          </div>
 
          {/* Estado (siempre no verificado — solo informativo) */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Esta persona se registrará con estado <strong>no verificado</strong>. Sus datos
              pueden corregirse más adelante desde la sección de Personas.
            </p>
          </div>
        </div>
 
        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreating && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            Registrar persona
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Helpers de UI ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}
 
function inputCls(hasError = false) {
  return [
    'w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-white outline-none transition-colors',
    hasError
      ? 'border-red-500 focus:ring-2 focus:ring-red-300'
      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
  ].join(' ');
}