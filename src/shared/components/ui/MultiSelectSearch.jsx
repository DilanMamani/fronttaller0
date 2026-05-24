import { useMemo, useState } from 'react';

export default function MultiSelectSearch({
  options = [],
  value = [],
  onChange,
  placeholder = 'Buscar...',
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      {/* seleccionados */}
      <div className="flex flex-wrap gap-2">
        {value.map((v) => {
          const option = options.find((o) => o.value === v);

          return (
            <div
              key={v}
              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {option?.label}

              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((x) => x !== v))
                }
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* buscador */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-gray-300 dark:border-gray-700
          px-4 py-3 bg-white dark:bg-background-dark
        "
      />

      {/* resultados */}
      <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl">
        {filtered.map((option) => {
          const selected = value.includes(option.value);

          return (
            <button
              type="button"
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={`
                w-full text-left px-4 py-3 border-b last:border-b-0
                hover:bg-gray-50 dark:hover:bg-gray-800
                ${selected ? 'bg-primary/10 text-primary font-medium' : ''}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}