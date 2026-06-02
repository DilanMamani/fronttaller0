import { useState, useEffect } from 'react';
import MultiSelectSearch from '../ui/MultiSelectSearch';

// ── Normaliza una parte del nombre para usarla como prefijo de email ──────────
const normalizePart = (s) =>
  (s || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

function EmailBuilderField({ field, values, setValues, errors = {} }) {
  const n  = normalizePart(values.nombre);
  const ap = normalizePart(values.apellido_paterno);
  const am = normalizePart(values.apellido_materno);

  const hasErrors  = !!(errors.nombre || errors.apellido_paterno || errors.apellido_materno);
  const namesReady = n.length >= 2 && ap.length >= 2 && !hasErrors;

  const sugerencias = namesReady ? [
    `${n}.${ap}`,
    `${n[0]}${ap}`,
    am ? `${n}.${ap}.${am[0]}`   : null,
    am ? `${n[0]}${ap}.${am[0]}` : null,
  ].filter(Boolean) : [];

  const activeDomains = (field.domains || []).filter((d) => d.activo);

  const [prefix, setPrefix]   = useState('');
  const [domain, setDomain]   = useState(activeDomains[0]?.dominio || '');

  // Resetear prefijo cuando cambian los datos del nombre o hay errores
  useEffect(() => {
    setPrefix('');
    setValues((prev) => ({ ...prev, [field.name]: '' }));
  }, [n, ap, am, hasErrors]);

  // Actualizar el dominio por defecto si aún no hay uno seleccionado
  useEffect(() => {
    if (!domain && activeDomains[0]?.dominio) setDomain(activeDomains[0].dominio);
  }, [activeDomains.length]);

  // Cuando cambia prefijo o dominio, actualizar el email en el formulario
  useEffect(() => {
    const email = prefix && domain ? `${prefix}@${domain}` : '';
    setValues((prev) => ({ ...prev, [field.name]: email }));
  }, [prefix, domain]);

  const assembled = prefix && domain ? `${prefix}@${domain}` : '';

  return (
    <div className="space-y-3">
      {/* Prefijos sugeridos */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Selecciona el formato del nombre de usuario:
        </p>
        {!n || !ap ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
            Ingrese nombre y apellido paterno para ver opciones
          </span>
        ) : hasErrors ? (
          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            Corrige los errores en nombre y apellidos para ver las opciones de correo
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrefix(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${prefix === s
                    ? 'bg-primary text-white border-primary'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selector de dominio */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Dominio permitido:
        </p>
        {!activeDomains.length ? (
          <span className="text-xs text-red-400">No hay dominios activos configurados.</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeDomains.map((d) => (
              <button
                key={d.id_dominio}
                type="button"
                onClick={() => setDomain(d.dominio)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${domain === d.dominio
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary'}`}
              >
                @{d.dominio}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vista previa del email */}
      <div className={`rounded-xl border px-4 py-3 text-sm font-mono transition-all
        ${assembled
          ? 'border-primary/40 bg-primary/5 text-primary dark:text-primary'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
        {assembled || 'nombre@dominio.com'}
      </div>
    </div>
  );
}

export default function FormFields({ fields = [], values = {}, setValues, errors = {} }) {
  const handleChange = (field, rawValue) => {
    if (field.disabled || field.readOnly) return;

    let value = rawValue;

    if (field.type === 'multiselect') {
      value = rawValue;
    } else if (field.valueType === 'boolean') {
      value = rawValue === 'true';
    } else if (typeof field.transform === 'function') {
      value = field.transform(rawValue);
    }

    setValues({ ...values, [field.name]: value });
  };

  const baseClass = `
    w-full rounded-xl border border-gray-300 dark:border-gray-700
    bg-white dark:bg-background-dark
    px-4 py-3 text-sm text-gray-900 dark:text-white
    placeholder:text-gray-400
    shadow-sm
    focus:border-primary focus:ring-2 focus:ring-primary/20
    outline-none transition-all
  `;

  const disabledClass = `
    opacity-60 cursor-not-allowed
    bg-gray-100 dark:bg-gray-800
    text-gray-500 dark:text-gray-400
  `;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields
        .filter((field) => !field.showIf || field.showIf(values))
        .map((field) => {
          const value = values?.[field.name] ?? '';
          const isDisabled = Boolean(field.disabled);
          const isReadOnly = Boolean(field.readOnly);
          const fullWidth = field.fullWidth || field.colSpan === 'col-span-2' || field.colSpan === 'md:col-span-2';
          const inputClass = `${baseClass} ${isDisabled || isReadOnly ? disabledClass : ''}`;

          return (
            <div key={field.name} className={fullWidth ? 'md:col-span-2' : ''}>
              <label
                htmlFor={field.name}
                className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {field.label}
              </label>

              {field.type === 'date' ? (
                <input
                  id={field.name}
                  type="date"
                  value={value || ''}
                  max={field.max || undefined}
                  min={field.min || undefined}
                  disabled={isDisabled}
                  readOnly={isReadOnly}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={inputClass}
                />

              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  value={String(value)}
                  disabled={isDisabled}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={inputClass}
                >
                  {field.options?.map((op) => (
                    <option key={String(op.value)} value={op.value}>{op.label}</option>
                  ))}
                </select>

              ) : field.type === 'autocomplete-multiselect' ? (
                <MultiSelectSearch
                  options={field.options || []}
                  value={value || []}
                  onChange={(newValues) => handleChange(field, newValues)}
                  placeholder={field.placeholder}
                />

              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  placeholder={field.placeholder || ''}
                  value={value}
                  disabled={isDisabled}
                  readOnly={isReadOnly}
                  rows={field.rows || 4}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={inputClass}
                />

              ) : field.type === 'email-builder' ? (
                <EmailBuilderField field={field} values={values} setValues={setValues} errors={errors} />

              ) : field.type === 'email-hints' ? (() => {
                const norm = (s) => (s || '').trim().toLowerCase()
                  .split(/\s+/)[0]
                  .normalize('NFD').replace(/[̀-ͯ]/g, '')
                  .replace(/\s+/g, '');
                const n  = norm(values.nombre);
                const ap = norm(values.apellido_paterno);
                const am = norm(values.apellido_materno);
                const sugerencias = [
                  n && ap             ? `${n}.${ap}`              : null,
                  n && ap             ? `${n[0]}${ap}`            : null,
                  n && ap && am       ? `${n}.${ap}.${am[0]}`     : null,
                  n && ap && am       ? `${n[0]}${ap}.${am[0]}`   : null,
                ].filter(Boolean);
                return (
                  <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
                    {(!n && !ap) ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Ingrese nombre y apellidos para ver sugerencias
                      </span>
                    ) : sugerencias.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValues({ ...values, email: val })}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-primary text-primary hover:bg-primary hover:text-white cursor-pointer transition-all"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                );
              })() : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  placeholder={field.placeholder || ''}
                  value={value}
                  disabled={isDisabled}
                  readOnly={isReadOnly}
                  onChange={(e) => handleChange(field, e.target.value)}
                  onKeyDown={(e) => { if (field.noSpaces && e.key === ' ') e.preventDefault(); }}
                  className={inputClass}
                />
              )}

              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors[field.name]}</p>
              )}
              {!errors[field.name] && field.helpText && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );
        })}
    </div>
  );
}