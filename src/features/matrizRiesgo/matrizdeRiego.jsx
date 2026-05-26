import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import Toast from '../../shared/components/ui/Toast.jsx';
import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import { fetchRiesgos, createRiesgo, updateRiesgo } from './slices/matrizRiesgoThunk';
import {
  selectRiesgos,
  selectIsLoading,
  selectIsCreating,
  selectIsUpdating,
  clearError,
} from './slices/matrizRiesgoSlice';

const calcRiesgo = (p, i) => Number(p) * Number(i);

const fmtFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const nivelRiesgo = (valor) => {
  if (valor <= 4)  return 'Bajo';
  if (valor <= 9)  return 'Moderado';
  if (valor <= 16) return 'Alto';
  return 'Extremo';
};

const NIVEL_STYLES = {
  Bajo:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  Moderado: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  Alto:     'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  Extremo:  'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
};

const NIVEL_ORDER = { Extremo: 0, Alto: 1, Moderado: 2, Bajo: 3 };

const TRATAMIENTOS  = ['Reducir', 'Aceptar', 'Evitar', 'Compartir'];
const TIPOS_CONTROL = ['P', 'D', 'C', 'Di', 'P, D'];
const NIVELES_CTRL  = ['A', 'S', 'M'];
const FRECUENCIAS   = ['D', 'S', 'M', 'A', 'PT', 'Pe'];

const INITIAL_FORM = {
  numero: '',
  activo_info: '',
  amenaza_vulnerabilidad: '',
  consecuencia: '',
  probabilidad_inherente: '1',
  impacto_inherente: '1',
  tratamiento: 'Reducir',
  controles: '',
  tipo_control: 'P',
  nivel_control: 'A',
  frecuencia_control: 'PT',
  probabilidad_residual: '1',
  impacto_residual: '1',
};

const TABS = [
  { key: 'instrucciones', label: 'Instrucciones' },
  { key: 'tabla',         label: 'Tabla de Riesgos' },
  { key: 'tarjetas',      label: 'Vista por Nivel' },
  { key: 'agregar',       label: 'Agregar Riesgo' },
];

// ─── Componentes menores ─────────────────────────────────────────────────────

function NivelBadge({ nivel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${NIVEL_STYLES[nivel] || ''}`}>
      {nivel}
    </span>
  );
}

function ScaleInput({ label, name, value, onChange }) {
  return (
    <div>
      <FieldLabel field={name}>
        {label} <span className="text-primary font-bold ml-1">{value}</span>
      </FieldLabel>
      <input
        type="range" min="1" max="5" step="1"
        name={name} value={value} onChange={onChange}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
      </div>
    </div>
  );
}

// ─── Help tooltips ───────────────────────────────────────────────────────────

const FIELD_HELP = {
  numero:                   'Número correlativo del riesgo en la matriz. Ej: 1, 2, 3…',
  activo_info:              'Sistema, aplicación o servicio que se está evaluando. Ej: Aplicación Core, Directorio Activo, Estaciones de trabajo.',
  amenaza_vulnerabilidad:   'Situación de riesgo identificada: qué podría salir mal o qué debilidad existe. Ej: Usurpación de identidad, Falta de parches de seguridad.',
  consecuencia:             'Impacto potencial si la amenaza se materializa. Ej: Accesos no autorizados, Pérdida de trazabilidad de eventos.',
  probabilidad_inherente:   '¿Qué tan probable es que ocurra sin ningún control aplicado?\n1 = Muy improbable  2 = Improbable  3 = Posible  4 = Probable  5 = Casi certero',
  impacto_inherente:        '¿Qué tan grave sería el daño si ocurre, sin ningún control?\n1 = Insignificante  2 = Menor  3 = Moderado  4 = Mayor  5 = Catastrófico',
  tratamiento:              'Decisión estratégica sobre cómo gestionar este riesgo:\n• Reducir — implementar controles para bajar la probabilidad o el impacto\n• Aceptar — el riesgo es tolerable y se monitorea\n• Evitar — eliminar la actividad que genera el riesgo\n',
  controles:                'Medidas concretas a implementar para mitigar el riesgo. Pueden ser técnicas (configuraciones, herramientas) u organizativas (políticas, procedimientos).',
  tipo_control:             '• P = Preventivo: evita que el riesgo ocurra\n• D = Detectivo: detecta cuando el riesgo ocurrió\n• C = Correctivo: corrige las consecuencias\n• Di = Disuasivo: inhibe que el riesgo ocurra',
  nivel_control:            '• A = Alto: control robusto y bien implementado\n• S = Satisfactorio: control funcional con margen de mejora\n• M = Mínimo: control básico, requiere refuerzo',
  frecuencia_control:       '¿Con qué frecuencia se aplica o revisa el control?\n• D = Diario  • S = Semanal  • M = Mensual  • A = Anual  • PT = Por transacción  • Pe = Periódico',
  probabilidad_residual:    'Probabilidad de que el riesgo ocurra DESPUÉS de aplicar los controles. Debe ser igual o menor a la probabilidad inherente.',
  impacto_residual:         'Impacto que tendría el riesgo DESPUÉS de aplicar los controles. Debe ser igual o menor al impacto inherente.',
};

function FieldHelp({ field }) {
  const [visible, setVisible] = useState(false);
  const text = FIELD_HELP[field];
  if (!text) return null;

  return (
    <span className="relative inline-flex ml-1.5 align-middle">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-[10px] font-bold leading-none transition-colors"
        aria-label="Ayuda"
      >
        ?
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none">
          {text.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
          ))}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      )}
    </span>
  );
}

function FieldLabel({ children, field, required }) {
  return (
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
      <FieldHelp field={field} />
    </label>
  );
}

function TabInstrucciones() {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (key) => setOpenSection(prev => prev === key ? null : key);

  return (
    <div className="space-y-4 max-w-5xl">

      {/* ── Fórmula + niveles ── */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 bg-primary/8 dark:bg-primary/10 rounded-lg px-5 py-3 shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">functions</span>
            <span className="font-mono font-bold text-primary text-base">Riesgo = P × I</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { rango: '1–4',   nivel: 'Bajo',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' },
              { rango: '5–9',   nivel: 'Moderado', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' },
              { rango: '10–16', nivel: 'Alto',     cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300' },
              { rango: '20–25', nivel: 'Extremo',  cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' },
            ].map(({ rango, nivel, cls }) => (
              <span key={nivel} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cls}`}>
                <span className="opacity-70">{rango}</span>
                <span>·</span>
                <span>{nivel}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila principal: Pasos + Matriz de calor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pasos del proceso */}
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Proceso</p>
          <ol className="space-y-3">
            {[
              { n: '1', icon: 'search',         label: 'Identificar',  desc: 'Activo, amenaza y consecuencia' },
              { n: '2', icon: 'monitoring',      label: 'Evaluar',      desc: 'Probabilidad × Impacto inherente' },
              { n: '3', icon: 'shield',          label: 'Mitigar',      desc: 'Elegir tratamiento y controles' },
              { n: '4', icon: 'trending_down',   label: 'Medir residual', desc: 'P × I después de controles' },
            ].map(({ n, icon, label, desc }) => (
              <li key={n} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{n}</span>
                <span className="material-symbols-outlined text-base text-gray-400">{icon}</span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{label}</span>
                  <span className="text-gray-400 ml-1.5">{desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Matriz de calor */}
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Matriz de calor P × I</p>
          <div className="overflow-x-auto">
            <table className="text-xs text-center border-collapse w-full">
              <thead>
                <tr>
                  <th className="p-1.5 text-gray-400 text-[10px]">P \ I</th>
                  {['1','2','3','4','5'].map(i => (
                    <th key={i} className="p-1.5 w-10 font-semibold text-gray-500 dark:text-gray-400">{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5,4,3,2,1].map(p => (
                  <tr key={p}>
                    <td className="p-1.5 font-semibold text-gray-500 dark:text-gray-400">{p}</td>
                    {[1,2,3,4,5].map(i => {
                      const val = p * i;
                      return (
                        <td key={i} className={`p-1.5 w-10 font-bold rounded-md ${NIVEL_STYLES[nivelRiesgo(val)]}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Referencia rápida de códigos ── */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Referencia rápida de códigos</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">category</span>
              Tipo de control
            </p>
            <div className="space-y-1.5">
              {[
                { code: 'P',    label: 'Preventivo',  desc: 'Evita que ocurra' },
                { code: 'D',    label: 'Detectivo',   desc: 'Detecta cuando ocurrió' },
                { code: 'C',    label: 'Correctivo',  desc: 'Corrige consecuencias' },
                { code: 'Di',   label: 'Disuasivo',   desc: 'Inhibe que ocurra' },
                { code: 'P, D', label: 'Preventivo y Detectivo', desc: 'Combinado' },
              ].map(({ code, label, desc }) => (
                <div key={code} className="flex items-baseline gap-2 text-xs">
                  <span className="font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded min-w-[28px] text-center">{code}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-gray-400">— {desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
              Nivel del control
            </p>
            <div className="space-y-1.5">
              {[
                { code: 'A', label: 'Alto',          desc: 'Robusto y bien implementado' },
                { code: 'S', label: 'Satisfactorio', desc: 'Funcional, con mejoras posibles' },
                { code: 'M', label: 'Mínimo',        desc: 'Básico, requiere refuerzo' },
              ].map(({ code, label, desc }) => (
                <div key={code} className="flex items-baseline gap-2 text-xs">
                  <span className="font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded min-w-[28px] text-center">{code}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-gray-400">— {desc}</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-4 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Frecuencia
            </p>
            <div className="space-y-1.5">
              {[
                { code: 'D',  label: 'Diario' },
                { code: 'S',  label: 'Semanal' },
                { code: 'M',  label: 'Mensual' },
                { code: 'A',  label: 'Anual' },
                { code: 'PT', label: 'Por transacción' },
                { code: 'Pe', label: 'Periódico' },
              ].map(({ code, label }) => (
                <div key={code} className="flex items-baseline gap-2 text-xs">
                  <span className="font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded min-w-[28px] text-center">{code}</span>
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">bar_chart</span>
              Escala de probabilidad / impacto
            </p>
            <div className="space-y-1.5">
              {[
                { val: 1, p: 'Muy improbable',  i: 'Insignificante' },
                { val: 2, p: 'Improbable',      i: 'Menor' },
                { val: 3, p: 'Posible',         i: 'Moderado' },
                { val: 4, p: 'Probable',        i: 'Mayor' },
                { val: 5, p: 'Casi certero',    i: 'Catastrófico' },
              ].map(({ val, p, i }) => (
                <div key={val} className="flex items-baseline gap-2 text-xs">
                  <span className="font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded min-w-[20px] text-center">{val}</span>
                  <span className="text-gray-600 dark:text-gray-400"><span className="text-gray-500">P:</span> {p}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-600 dark:text-gray-400"><span className="text-gray-500">I:</span> {i}</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-4 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">fork_right</span>
              Tratamiento
            </p>
            <div className="space-y-1.5">
              {[
                { t: 'Reducir',    desc: 'Implementar controles' },
                { t: 'Aceptar',    desc: 'Tolerable, se monitorea' },
                { t: 'Evitar',     desc: 'Eliminar la actividad' },
                { t: 'Compartir',  desc: 'Transferir a tercero' },
              ].map(({ t, desc }) => (
                <div key={t} className="flex items-baseline gap-2 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[64px]">{t}</span>
                  <span className="text-gray-400">— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Acordeón: ¿Qué significa cada campo? ── */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggle('campos')}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <span className="material-symbols-outlined text-base text-gray-400">help_outline</span>
            ¿Qué significa cada campo del formulario?
          </span>
          <span className={`material-symbols-outlined text-gray-400 transition-transform ${openSection === 'campos' ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
        {openSection === 'campos' && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4">
              {[
                { campo: 'N°',                          desc: 'Número correlativo del riesgo en la matriz.' },
                { campo: 'Activo de información',       desc: 'Sistema, app o servicio evaluado. Ej: App Core, Directorio Activo.' },
                { campo: 'Amenaza / Vulnerabilidad',    desc: 'Qué podría salir mal o qué debilidad existe.' },
                { campo: 'Consecuencia',                desc: 'Impacto potencial si la amenaza se materializa.' },
                { campo: 'Probabilidad inherente',      desc: 'Qué tan probable es sin controles aplicados (1–5).' },
                { campo: 'Impacto inherente',           desc: 'Qué tan grave sería el daño sin controles (1–5).' },
                { campo: 'Tratamiento',                 desc: 'Decisión estratégica: Reducir, Aceptar, Evitar o Compartir.' },
                { campo: 'Controles a implementar',     desc: 'Medidas técnicas u organizativas para mitigar el riesgo.' },
                { campo: 'Tipo de control',             desc: 'P = Preventivo · D = Detectivo · C = Correctivo · Di = Disuasivo.' },
                { campo: 'Nivel del control',           desc: 'A = Alto · S = Satisfactorio · M = Mínimo.' },
                { campo: 'Frecuencia',                  desc: 'Con qué periodicidad se aplica o revisa el control.' },
                { campo: 'P y I residual',              desc: 'Probabilidad e Impacto después de aplicar controles.' },
              ].map(({ campo, desc }) => (
                <div key={campo} className="flex gap-2 text-xs py-1.5 border-b border-gray-50 dark:border-gray-800">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[160px] shrink-0">{campo}</span>
                  <span className="text-gray-500 dark:text-gray-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Tab Tabla ───────────────────────────────────────────────────────────────

function TabTabla({ riesgos, loading, onEdit }) {
  if (loading) return (
    <div className="flex justify-center items-center py-16">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  );

  if (!riesgos.length) return (
    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
      No hay riesgos registrados aún.
    </div>
  );

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
            <tr>

              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Registrado por</th>
              <th className="px-4 py-3 min-w-[180px]">Amenaza</th>
              <th className="px-4 py-3 min-w-[160px]">Consecuencia</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">I</th>
              <th className="px-4 py-3 text-center">R. Inherente</th>
              <th className="px-4 py-3">Tratamiento</th>
              <th className="px-4 py-3 text-center">P res.</th>
              <th className="px-4 py-3 text-center">I res.</th>
              <th className="px-4 py-3 text-center">R. Residual</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {riesgos.map((r) => {
              const ri = calcRiesgo(r.probabilidad_inherente, r.impacto_inherente);
              const rr = calcRiesgo(r.probabilidad_residual, r.impacto_residual);
              return (
                <tr key={r.id_riesgo} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.numero}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.activo_info}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {fmtFecha(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido_paterno} ${r.usuario.apellido_materno}` : '—'} {r.usuario?.email && <span className="text-gray-400">({r.usuario.email})</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.amenaza_vulnerabilidad}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.consecuencia}</td>
                  <td className="px-4 py-3 text-center">{r.probabilidad_inherente}</td>
                  <td className="px-4 py-3 text-center">{r.impacto_inherente}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold">{ri}</span>
                      <NivelBadge nivel={nivelRiesgo(ri)} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {r.tratamiento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{r.probabilidad_residual}</td>
                  <td className="px-4 py-3 text-center">{r.impacto_residual}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold">{rr}</span>
                      <NivelBadge nivel={nivelRiesgo(rr)} />
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(r)}
                      className="text-primary hover:text-primary/80 text-xs font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab Tarjetas ────────────────────────────────────────────────────────────

function TabTarjetas({ riesgos, loading, onEdit }) {
  if (loading) return (
    <div className="flex justify-center items-center py-16">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  );

  const grupos = ['Extremo', 'Alto', 'Moderado', 'Bajo'];

  return (
    <div className="space-y-8">
      {grupos.map((nivel) => {
        const lista = riesgos
          .filter(r => nivelRiesgo(calcRiesgo(r.probabilidad_inherente, r.impacto_inherente)) === nivel)
          .sort((a, b) => calcRiesgo(b.probabilidad_inherente, b.impacto_inherente) - calcRiesgo(a.probabilidad_inherente, a.impacto_inherente));

        if (!lista.length) return null;

        return (
          <div key={nivel}>
            <div className="flex items-center gap-3 mb-3">
              <NivelBadge nivel={nivel} />
              <span className="text-sm text-gray-500 dark:text-gray-400">{lista.length} riesgo{lista.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {lista.map((r) => {
                const ri = calcRiesgo(r.probabilidad_inherente, r.impacto_inherente);
                const rr = calcRiesgo(r.probabilidad_residual, r.impacto_residual);
                return (
                  <div
                    key={r.id_riesgo}
                    className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-gray-400">#{r.numero}</span>
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm mt-0.5">{r.activo_info}</h4>
                      </div>
                      <NivelBadge nivel={nivelRiesgo(ri)} />
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Amenaza</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{r.amenaza_vulnerabilidad}</p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Consecuencia</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{r.consecuencia}</p>

                    {/* Riesgo inherente vs residual */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Inherente</p>
                        <p className="font-bold text-lg">{ri}</p>
                        <NivelBadge nivel={nivelRiesgo(ri)} />
                      </div>
                      <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Residual</p>
                        <p className="font-bold text-lg">{rr}</p>
                        <NivelBadge nivel={nivelRiesgo(rr)} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                        {r.tratamiento}
                      </span>
                      <button
                        onClick={() => onEdit(r)}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Editar
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                        {fmtFecha(r.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {r.usuario_id ?? 'Sin usuario'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!riesgos.length && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No hay riesgos registrados aún.
        </div>
      )}
    </div>
  );
}

// ─── Formulario ──────────────────────────────────────────────────────────────

function FormRiesgo({ initial = INITIAL_FORM, onSubmit, onCancel, isSaving, title }) {
  const [form, setForm] = useState({ ...initial });

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const ri = calcRiesgo(form.probabilidad_inherente, form.impacto_inherente);
  const rr = calcRiesgo(form.probabilidad_residual, form.impacto_residual);

  const isValid = form.activo_info.trim() && form.amenaza_vulnerabilidad.trim() &&
    form.consecuencia.trim() && form.controles.trim() && form.numero;

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-6 space-y-8">

        {/* Identificación */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Identificación del Activo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel field="numero">N°</FieldLabel>
              <input type="number" name="numero" value={form.numero} onChange={handle}
                placeholder="1"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3" />
            </div>
            <div>
              <FieldLabel field="activo_info" required>Activo de información</FieldLabel>
              <input type="text" name="activo_info" value={form.activo_info} onChange={handle}
                placeholder="Ej: Aplicación Core, Directorio Activo…"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3" />
            </div>
            <div className="md:col-span-2">
              <FieldLabel field="amenaza_vulnerabilidad" required>Amenaza / Vulnerabilidad</FieldLabel>
              <textarea name="amenaza_vulnerabilidad" value={form.amenaza_vulnerabilidad} onChange={handle}
                rows={2} placeholder="Describa la amenaza o vulnerabilidad identificada"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3 resize-none" />
            </div>
            <div className="md:col-span-2">
              <FieldLabel field="consecuencia" required>Consecuencia / Riesgo</FieldLabel>
              <textarea name="consecuencia" value={form.consecuencia} onChange={handle}
                rows={2} placeholder="Describa el impacto potencial"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3 resize-none" />
            </div>
          </div>
        </section>

        {/* Evaluación inherente */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Evaluación del Riesgo Inherente
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ScaleInput label="Probabilidad" name="probabilidad_inherente" value={form.probabilidad_inherente} onChange={handle} />
            <ScaleInput label="Impacto" name="impacto_inherente" value={form.impacto_inherente} onChange={handle} />
          </div>
          <div className="mt-4 flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Riesgo Inherente:</span>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{ri}</span>
            <NivelBadge nivel={nivelRiesgo(ri)} />
          </div>
        </section>

        {/* Mitigación */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Mitigación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel field="tratamiento">Tratamiento</FieldLabel>
              <select name="tratamiento" value={form.tratamiento} onChange={handle}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3">
                {TRATAMIENTOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel field="tipo_control">Tipo de control</FieldLabel>
              <select name="tipo_control" value={form.tipo_control} onChange={handle}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3">
                {TIPOS_CONTROL.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel field="nivel_control">Nivel del control</FieldLabel>
              <select name="nivel_control" value={form.nivel_control} onChange={handle}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3">
                {NIVELES_CTRL.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel field="frecuencia_control">Frecuencia</FieldLabel>
              <select name="frecuencia_control" value={form.frecuencia_control} onChange={handle}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3">
                {FRECUENCIAS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <FieldLabel field="controles" required>Controles a implementar</FieldLabel>
              <textarea name="controles" value={form.controles} onChange={handle}
                rows={3} placeholder="Describa los controles técnicos u organizativos a implementar"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary p-3 resize-none" />
            </div>
          </div>
        </section>

        {/* Riesgo residual */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Riesgo Residual (después de controles)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ScaleInput label="Probabilidad residual" name="probabilidad_residual" value={form.probabilidad_residual} onChange={handle} />
            <ScaleInput label="Impacto residual" name="impacto_residual" value={form.impacto_residual} onChange={handle} />
          </div>
          <div className="mt-4 flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Riesgo Residual:</span>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{rr}</span>
            <NivelBadge nivel={nivelRiesgo(rr)} />
            {rr < ri && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-base">trending_down</span>
                Reducción de {ri - rr} puntos
              </span>
            )}
          </div>
        </section>

        {/* Botones */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={!isValid || isSaving}
            onClick={() => onSubmit(form)}
            className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
              isValid && !isSaving ? 'bg-primary hover:bg-primary/90' : 'bg-primary/40 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Guardando...' : 'Guardar Riesgo'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal de edición ─────────────────────────────────────────────────────────

function EditModal({ riesgo, onClose, onSave, isSaving }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (isSaving) return;
    setClosing(true);
    setTimeout(onClose, 160);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-3xl bg-white dark:bg-background-dark rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-150`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editar Riesgo #{riesgo.numero}</h2>
          <button onClick={handleClose} disabled={isSaving}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-1">
          <FormRiesgo
            initial={riesgo}
            onSubmit={onSave}
            onCancel={handleClose}
            isSaving={isSaving}
            title=""
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MatrizRiesgos() {
  const dispatch = useDispatch();
  const riesgos  = useSelector(selectRiesgos);
  const loading  = useSelector(selectIsLoading);
  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);

  const [activeTab, setActiveTab]   = useState('instrucciones');
  const [toast, setToast]           = useState(null);
  const [editRiesgo, setEditRiesgo] = useState(null);

  const isSaving = isCreating || isUpdating;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    dispatch(fetchRiesgos({ limit: 100 }));
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleCreate = async (form) => {
    const result = await dispatch(createRiesgo(form));
    if (createRiesgo.fulfilled.match(result)) {
      showToast('success', 'Riesgo creado correctamente');
      setActiveTab('tabla');
    } else {
      showToast('error', result.payload || 'Error al crear riesgo');
    }
  };

  const handleSaveEdit = async (form) => {
    const result = await dispatch(updateRiesgo({ id: editRiesgo.id_riesgo, data: form }));
    if (updateRiesgo.fulfilled.match(result)) {
      showToast('success', 'Riesgo actualizado correctamente');
      setEditRiesgo(null);
    } else {
      showToast('error', result.payload || 'Error al actualizar riesgo');
    }
  };

  return (
    <Layout title="Matriz de Análisis de Riesgos">
      <PageTabs activeTab={activeTab} onChange={setActiveTab} tabs={TABS} />

      {activeTab === 'instrucciones' && <TabInstrucciones />}

      {activeTab === 'tabla' && (
        <TabTabla riesgos={riesgos} loading={loading} onEdit={setEditRiesgo} />
      )}

      {activeTab === 'tarjetas' && (
        <TabTarjetas riesgos={riesgos} loading={loading} onEdit={setEditRiesgo} />
      )}

      {activeTab === 'agregar' && (
        <FormRiesgo
          title="Registrar nuevo riesgo"
          onSubmit={handleCreate}
          isSaving={isSaving}
        />
      )}

      {editRiesgo && (
        <EditModal
          riesgo={editRiesgo}
          onClose={() => setEditRiesgo(null)}
          onSave={handleSaveEdit}
          isSaving={isSaving}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
}