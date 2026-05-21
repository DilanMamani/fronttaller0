export default function FormFields({ fields = [], values = {}, setValues }) {
  const handleChange = (field, rawValue) => {
    setValues({
      ...values,
      [field.name]:
        field.valueType === 'boolean'
          ? rawValue === 'true'
          : rawValue,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields
        .filter((field) => !field.showIf || field.showIf(values))
        .map((field) => {
          const value = values?.[field.name] ?? '';

          const fullWidth =
            field.fullWidth ||
            field.colSpan === 'col-span-2' ||
            field.colSpan === 'md:col-span-2';

          return (
            <div
              key={field.name}
              className={fullWidth ? 'md:col-span-2' : ''}
            >
              <label
                htmlFor={field.name}
                className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {field.label}
              </label>

              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={String(value)}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="
                    w-full rounded-xl border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-background-dark
                    px-4 py-3 text-sm text-gray-900 dark:text-white
                    shadow-sm
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    outline-none transition-all
                  "
                >
                  {field.options?.map((op) => (
                    <option key={String(op.value)} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  placeholder={field.placeholder || ''}
                  value={value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="
                    w-full rounded-xl border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-background-dark
                    px-4 py-3 text-sm text-gray-900 dark:text-white
                    placeholder:text-gray-400
                    shadow-sm
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    outline-none transition-all
                  "
                />
              )}
            </div>
          );
        })}
    </div>
  );
}