import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPersona } from '../../personas/slices/personasThunk';
import { selectIsCreating } from '../../personas/slices/personasSlice';

/**
 * Modal para crear una nueva persona desde el flujo OCR.
 *
 * Props:
 *  - isOpen         : bool
 *  - onClose        : () => void
 *  - onPersonaCreada: (persona) => void
 *  - datosOcr       : { nombre_completo?, fecha_nacimiento?, lugar_nacimiento? }
 */
export default function NuevaPersonaModal({ isOpen, onClose, onPersonaCreada, datosOcr = {} }) {
  const dispatch = useDispatch();
  const isCreating = useSelector(selectIsCreating);

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
    const nombreNormalizado = nombreCompleto
      .trim()
      .replace(/\s+/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const aleatorio = Math.floor(100000 + Math.random() * 900000);
    return `${nombreNormalizado || 'PERSONA'}-${aleatorio}`;
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

  const [camposVacios, setCamposVacios] = useState([]);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [ciError, setCiError] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'carnet_identidad') setCiError('');
    setCamposVacios((prev) => prev.filter((c) => c !== field));
  };

  const handleSubmit = async () => {
    setCiError('');
    setErrorGeneral('');

    const camposRequeridos = [
      'nombre', 'apellido_paterno', 'apellido_materno',
      'carnet_identidad', 'fecha_nacimiento', 'lugar_nacimiento',
      'nombre_padre', 'nombre_madre',
    ];
    const vacios = camposRequeridos.filter((c) => !form[c]?.trim());
    if (vacios.length) {
      setCamposVacios(vacios);
      setErrorGeneral('Todos los campos son obligatorios.');
      return;
    }

    setCamposVacios([]);
    const result = await dispatch(createPersona({ ...form, activo: true, estado: 'no verificado' }));
    if (createPersona.fulfilled.match(result)) {
      onPersonaCreada(result.payload);
    } else {
      const msg = result.payload?.message || result.payload?.msg || '';
      if (
        msg.toLowerCase().includes('carnet') ||
        msg.toLowerCase().includes('ci') ||
        msg.toLowerCase().includes('duplicado') ||
        msg.toLowerCase().includes('unique')
      ) {
        const nuevoCi = generarCITemporal(
          `${form.nombre}${form.apellido_paterno}${form.apellido_materno}`
        );
        setForm((prev) => ({ ...prev, carnet_identidad: nuevoCi }));
        setCiError('CI duplicado. Se generó uno nuevo automáticamente, puedes corregirlo.');
      } else {
        setErrorGeneral(msg || 'Error al registrar la persona.');
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
        {errorGeneral && (
          <div className="flex items-center gap-2 mx-6 mt-4 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-lg">
            <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
            <p className="text-xs text-red-600 dark:text-red-400">{errorGeneral}</p>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Nombre *">
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={inputCls(camposVacios.includes('nombre'))}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Apellido paterno *">
              <input
                type="text"
                value={form.apellido_paterno}
                onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                className={inputCls(camposVacios.includes('apellido_paterno'))}
                required
              />
            </Field>
            <Field label="Apellido materno *">
              <input
                type="text"
                value={form.apellido_materno}
                onChange={(e) => handleChange('apellido_materno', e.target.value)}
                className={inputCls(camposVacios.includes('apellido_materno'))}
                required
              />
            </Field>
          </div>

          <Field label="Carnet de identidad *">
            <input
              type="text"
              value={form.carnet_identidad}
              onChange={(e) => handleChange('carnet_identidad', e.target.value)}
              className={inputCls(camposVacios.includes('carnet_identidad') || !!ciError)}
              required
            />
            {ciError ? (
              <p className="text-xs text-red-600 mt-1">{ciError}</p>
            ) : (
              <p className="text-xs text-amber-600 mt-1">
                CI temporal generado desde el nombre OCR. Corrígelo si tienes el dato real.
              </p>
            )}
          </Field>

          <Field label="Fecha de nacimiento *">
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
              className={inputCls(camposVacios.includes('fecha_nacimiento'))}
              required
            />
            {!datosOcr.fecha_nacimiento && (
              <p className="text-xs text-amber-600 mt-1">Fecha no detectada, ingrésala manualmente.</p>
            )}
          </Field>

          <Field label="Lugar de nacimiento *">
            <input
              type="text"
              value={form.lugar_nacimiento}
              onChange={(e) => handleChange('lugar_nacimiento', e.target.value)}
              className={inputCls(camposVacios.includes('lugar_nacimiento'))}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del padre *">
              <input
                type="text"
                value={form.nombre_padre}
                onChange={(e) => handleChange('nombre_padre', e.target.value)}
                className={inputCls(camposVacios.includes('nombre_padre'))}
                required
              />
            </Field>
            <Field label="Nombre de la madre *">
              <input
                type="text"
                value={form.nombre_madre}
                onChange={(e) => handleChange('nombre_madre', e.target.value)}
                className={inputCls(camposVacios.includes('nombre_madre'))}
                required
              />
            </Field>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Esta persona se registrará con estado <strong>no verificado</strong>. Sus datos pueden
              corregirse desde la sección de Personas.
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
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            Registrar persona
          </button>
        </div>
      </div>
    </div>
  );
}

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
