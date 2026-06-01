import MultiSelectSearch from '../ui/MultiSelectSearch';

export default function FormFields({ fields = [], values = {}, setValues }) {
  const handleChange = (field, rawValue) => {
    if (field.disabled || field.readOnly) return;

    let value = rawValue;

    if (field.type === 'multiselect') {
      value = rawValue;
    } else if (field.valueType === 'boolean') {
      value = rawValue === 'true';
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
                  className={inputClass}
                />
              )}

              {field.helpText && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
            </div>
          );
        })}
    </div>
  );
}