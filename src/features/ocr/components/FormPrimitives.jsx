import { useId, cloneElement, isValidElement } from 'react';

/**
 * Primitivas compartidas por los tres pasos de revisión (Bautismo, Matrimonio,
 * Primera Comunión) — antes vivían copiadas en cada archivo, lo que significaba
 * que un fix o un ajuste de jerarquía visual había que repetirlo tres veces.
 * `parseFecha`/`ic` (no son componentes) viven en ./formUtils.
 */

export function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-gray-700">
      <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
      <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
  );
}

/**
 * `optional` reduce el peso visual del título y añade una etiqueta explícita,
 * en vez de que una sección requerida y una opcional se vean idénticas.
 */
export function Section({ title, children, action, optional = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          className={
            optional
              ? 'text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'
              : 'text-sm font-semibold text-gray-800 dark:text-gray-200'
          }
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Field({ label, children, incierto }) {
  const autoId = useId();
  const fieldId = isValidElement(children) ? children.props.id ?? autoId : undefined;
  const child = isValidElement(children) ? cloneElement(children, { id: fieldId }) : children;

  return (
    <div className="flex flex-col gap-1 flex-1">
      <label
        htmlFor={fieldId}
        className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5"
      >
        {label}
        {incierto && (
          <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400">
            · no detectado, revisa
          </span>
        )}
      </label>
      {child}
    </div>
  );
}
