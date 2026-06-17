import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Layout from '../../shared/components/layout/Layout';
import Toast from '../../shared/components/ui/Toast.jsx';
import PageTabs from '../../shared/components/pages/PageTabs.jsx';

import { fetchActivos, createActivo, updateActivo, deleteActivo } from './slices/activosThunk';
import { selectActivos, selectActivosLoading, selectActivosSaving } from './slices/activosSlice';

import { fetchVulnerabilidades, createVulnerabilidad, updateVulnerabilidad, deleteVulnerabilidad } from './slices/vulnerabilidadesThunk';
import { selectVulnerabilidades, selectVulnerabilidadesLoading, selectVulnerabilidadesSaving } from './slices/vulnerabilidadesSlice';

import {
  fetchRiesgos, createRiesgo,
  createControl, deleteControl, publicarRiesgo,
} from './slices/matrizRiesgoThunk';
import {
  selectRiesgos, selectIsLoading, selectIsCreating, selectIsUpdating, clearError,
} from './slices/matrizRiesgoSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcRiesgo = (p, i) => Number(p) * Number(i);

const nivelRiesgo = (valor) => {
  if (valor <= 4)  return 'Bajo';
  if (valor <= 9) return 'Moderado';
  if (valor <= 16) return 'Alto';
  return 'Extremo';
};

const NIVEL_STYLES = {
  Bajo:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Moderado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Alto:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Extremo:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const TIPOS_ACTIVO = ['hardware', 'software', 'datos', 'personas', 'instalaciones', 'servicios', 'otro'];
const TRATAMIENTOS  = ['Reducir', 'Aceptar', 'Evitar', 'Compartir'];
const TIPOS_CONTROL = ['preventivo', 'detectivo', 'correctivo', 'disuasivo'];
const NIVELES_CTRL  = ['Automático', 'Semi automático', 'Manual'];
const FRECUENCIAS   = ['continuo', 'diario', 'semanal', 'mensual', 'anual', 'por transacción', 'periódico'];

const TABS = [
  { key: 'activos',          label: 'Activos' },
  { key: 'vulnerabilidades', label: 'Vulnerabilidades' },
  { key: 'riesgos',          label: 'Riesgos' },
  { key: 'matriz',           label: 'Matriz' },
];

// ─── Componentes base ─────────────────────────────────────────────────────────

function NivelBadge({ nivel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${NIVEL_STYLES[nivel] || ''}`}>
      {nivel}
    </span>
  );
}

function ScaleInput({ label, name, value, onChange, max = 5 }) {
  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} <span className="text-primary font-bold ml-1">{value}</span>
      </label>
      <input
        type="range" min="1" max={max} step="1"
        name={name} value={value} onChange={onChange}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        {Array.from({ length: max }, (_, i) => <span key={i + 1}>{i + 1}</span>)}
      </div>
    </div>
  );
}

function InputText({ label, name, value, onChange, placeholder, required, textarea, rows = 2, disabled }) {
  const cls = `w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary p-3 text-sm text-foreground-light dark:text-foreground-dark transition-colors${disabled ? ' opacity-50 cursor-not-allowed' : ''}`;
  return (
    <div>
      <label className="flex items-center text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className={`${cls} resize-none`} disabled={disabled} />
        : <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} disabled={disabled} />
      }
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1 block">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary p-3 text-sm text-foreground-light dark:text-foreground-dark transition-colors">
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm overflow-hidden border border-border-light dark:border-border-dark">
      {(title || action) && (
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between gap-4">
          {title && <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', type = 'button', icon }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  const variants = {
    primary: disabled
      ? 'bg-primary/40 text-white cursor-not-allowed'
      : 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/30',
    success: disabled
      ? 'bg-emerald-300 text-white cursor-not-allowed'
      : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400/40',
    outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40',
    danger:  'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
    ghost:   'text-primary hover:bg-primary/10',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {icon && <span className="material-symbols-outlined leading-none" style={{ fontSize: size === 'sm' ? '14px' : '18px' }}>{icon}</span>}
      {children}
    </button>
  );
}

function IconBtn({ icon, onClick, title, variant = 'ghost', disabled }) {
  const variants = {
    ghost:   'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
    danger:  'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
    primary: 'text-primary hover:bg-primary/10',
  };
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${variants[variant]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

// ─── Guía de paso ─────────────────────────────────────────────────────────────

function StepGuide({ icon, title, description, tip, steps }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/60 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px] text-primary shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1">{title}</span>
        <span className="material-symbols-outlined text-[16px] text-gray-400 transition-transform shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : '' }}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2.5 bg-gray-50/50 dark:bg-gray-800/20">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
          {steps?.length > 0 && (
            <ol className="space-y-1.5">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          )}
          {tip && (
            <p className="flex items-start gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <span className="material-symbols-outlined text-[13px] shrink-0 mt-0.5">lightbulb</span>
              {tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function EmptyState({ icon = 'inventory_2', title, description, action }) {
  return (
    <div className="text-center py-14 px-6 text-gray-400 dark:text-gray-500">
      <span className="material-symbols-outlined text-5xl mb-3 block text-gray-300 dark:text-gray-600">{icon}</span>
      {title && <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>}
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Modal genérico ───────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxW = 'max-w-lg' }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 150); };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={`w-full ${maxW} bg-white dark:bg-background-dark rounded-2xl shadow-2xl
        overflow-hidden max-h-[90vh] flex flex-col
        ${closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-150`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <IconBtn icon="close" onClick={close} title="Cerrar" />
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — ACTIVOS DE INFORMACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

const ACTIVO_INIT = { nombre: '', descripcion: '', tipo: 'hardware', propietario: '' };

function FormActivo({ initial = ACTIVO_INIT, onSubmit, onCancel, isSaving, isEditing }) {
  const [form, setForm] = useState({ ...initial });
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const isValid = form.nombre.trim() && form.tipo;

  return (
    <div className="space-y-4">
      <InputText label="Nombre del activo" name="nombre" value={form.nombre} onChange={handle}
        placeholder="Ej: Servidor de base de datos" required disabled={isEditing} />
      <InputText label="Descripción" name="descripcion" value={form.descripcion} onChange={handle}
        placeholder="Descripción breve del activo" textarea />
      <SelectField label="Tipo de activo" name="tipo" value={form.tipo} onChange={handle} options={TIPOS_ACTIVO} />
      <InputText label="Propietario / Área responsable" name="propietario" value={form.propietario} onChange={handle}
        placeholder="Ej: Área de TI" />
      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Btn type="button" onClick={() => onSubmit(form)} disabled={!isValid || isSaving}
          icon={isSaving ? 'progress_activity' : 'save'}>
          {isSaving ? 'Guardando…' : 'Guardar activo'}
        </Btn>
        {onCancel && (
          <Btn variant="outline" type="button" onClick={onCancel} icon="close">
            Cancelar
          </Btn>
        )}
      </div>
    </div>
  );
}

function TabActivos({ showToast }) {
  const dispatch = useDispatch();
  const activos  = useSelector(selectActivos);
  const loading  = useSelector(selectActivosLoading);
  const saving   = useSelector(selectActivosSaving);
  const [modal, setModal] = useState(null);

  useEffect(() => { dispatch(fetchActivos()); }, [dispatch]);

  const handleSubmit = async (form) => {
    const isEdit = modal !== 'create';
    const result = await (isEdit
      ? dispatch(updateActivo({ id: modal.id_activo, data: form }))
      : dispatch(createActivo(form)));
    const thunk  = isEdit ? updateActivo : createActivo;
    if (thunk.fulfilled.match(result)) {
      showToast('success', isEdit ? 'Activo actualizado' : 'Activo creado');
      setModal(null);
    } else {
      showToast('error', result.payload  || result.error || result.msg|| 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este activo? Esta acción no se puede deshacer.')) return;
    const result = await dispatch(deleteActivo(id));
    if (deleteActivo.fulfilled.match(result)) showToast('success', 'Activo eliminado');
    else showToast('error', result.payload  || result.error || result.msg|| 'Error al eliminar');
  };

  return (
    <>
      <StepGuide
        icon="dns"
        title="Registra los activos de información de la organización"
        description="Los activos son recursos valiosos que deben protegerse: servidores, bases de datos, sistemas, documentos, personas clave, etc. Deben estar registrados antes de poder asociar riesgos."
        tip="Sé específico en el nombre y clasifica bien el tipo. El campo Propietario identifica al área responsable de cada activo."
      />

      <SectionCard
        title={`Activos registrados (${activos.length})`}
        action={
          <Btn size="sm" onClick={() => setModal('create')} icon="add">
            Nuevo activo
          </Btn>
        }
      >
        {loading ? <Spinner /> : !activos.length ? (
          <EmptyState
            icon="dns"
            title="Sin activos registrados"
            description="Agrega el primer activo de información para continuar con el análisis de riesgos."
            action={
              <Btn onClick={() => setModal('create')} icon="add">
                Registrar primer activo
              </Btn>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Propietario</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3 w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {activos.map((a) => (
                  <tr key={a.id_activo} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{a.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">{a.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.propietario || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{a.descripcion || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <IconBtn icon="edit" title="Editar activo" onClick={() => setModal(a)} />
                        <IconBtn icon="delete" title="Eliminar activo" variant="danger" onClick={() => handleDelete(a.id_activo)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Nuevo activo de información' : `Editar: ${modal.nombre}`}
          onClose={() => setModal(null)}
        >
          <FormActivo
            initial={modal !== 'create' ? modal : ACTIVO_INIT}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            isSaving={saving}
            isEditing={modal !== 'create'}
          />
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — VULNERABILIDADES Y AMENAZAS
// ═══════════════════════════════════════════════════════════════════════════════

const TIPO_OPTIONS = [
  { value: 'amenaza_natural',              label: 'Amenaza natural',                 group: 'amenaza' },
  { value: 'amenaza_humana',               label: 'Amenaza causada por el hombre',   group: 'amenaza' },
  { value: 'vulnerabilidad_personas',      label: 'Vulnerabilidad en personas',      group: 'vulnerabilidad' },
  { value: 'vulnerabilidad_proceso',       label: 'Vulnerabilidad en proceso',       group: 'vulnerabilidad' },
  { value: 'vulnerabilidad_tecnologia',    label: 'Vulnerabilidad en tecnología',    group: 'vulnerabilidad' },
  { value: 'vulnerabilidad_infraestructura', label: 'Vulnerabilidad en infraestructura', group: 'vulnerabilidad' },
];

const getGrupo = (tipo) => {
  if (!tipo) return '';
  if (tipo === 'amenaza' || tipo.startsWith('amenaza')) return 'amenaza';
  if (tipo === 'vulnerabilidad' || tipo.startsWith('vulnerabilidad')) return 'vulnerabilidad';
  return '';
};

const getTipoLabel = (tipo) => {
  const found = TIPO_OPTIONS.find(o => o.value === tipo);
  if (found) return found.label;
  if (tipo === 'amenaza') return 'Amenaza';
  if (tipo === 'vulnerabilidad') return 'Vulnerabilidad';
  return tipo || '—';
};

const VULN_INIT = { nombre: '', descripcion: '', tipo: 'amenaza_natural' };

const selectCls = 'w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary p-3 text-sm text-foreground-light dark:text-foreground-dark transition-colors';

function FormVulnerabilidad({ initial = VULN_INIT, onSubmit, onCancel, isSaving, isEditing }) {
  const [form, setForm] = useState({ ...initial });
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const isValid = form.nombre.trim() && form.tipo;

  return (
    <div className="space-y-4">
      <InputText label="Vulnerabilidad / Amenaza" name="nombre" value={form.nombre} onChange={handle}
        placeholder="Ej: Acceso no autorizado a sistemas" required disabled={isEditing} />

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Tipo</label>
        <select name="tipo" value={form.tipo} onChange={handle} className={selectCls}>
          <optgroup label="Amenazas">
            <option value="amenaza_natural">Amenaza natural</option>
            <option value="amenaza_humana">Amenaza causada por el hombre</option>
          </optgroup>
          <optgroup label="Vulnerabilidades">
            <option value="vulnerabilidad_personas">Vulnerabilidad en personas</option>
            <option value="vulnerabilidad_proceso">Vulnerabilidad en proceso</option>
            <option value="vulnerabilidad_tecnologia">Vulnerabilidad en tecnología</option>
            <option value="vulnerabilidad_infraestructura">Vulnerabilidad en infraestructura</option>
          </optgroup>
        </select>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Btn type="button" onClick={() => onSubmit(form)} disabled={!isValid || isSaving}
          icon={isSaving ? 'progress_activity' : 'save'}>
          {isSaving ? 'Guardando…' : 'Guardar'}
        </Btn>
        {onCancel && <Btn variant="outline" type="button" onClick={onCancel} icon="close">Cancelar</Btn>}
      </div>
    </div>
  );
}

function TabVulnerabilidades({ showToast }) {
  const dispatch   = useDispatch();
  const vulns      = useSelector(selectVulnerabilidades);
  const loading    = useSelector(selectVulnerabilidadesLoading);
  const saving     = useSelector(selectVulnerabilidadesSaving);
  const [modal, setModal]     = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => { dispatch(fetchVulnerabilidades()); }, [dispatch]);

  const handleSubmit = async (form) => {
    const isEdit = modal !== 'create';
    const result = await (isEdit
      ? dispatch(updateVulnerabilidad({ id: modal.id_vulnerabilidad, data: form }))
      : dispatch(createVulnerabilidad(form)));
    const thunk  = isEdit ? updateVulnerabilidad : createVulnerabilidad;
    if (thunk.fulfilled.match(result)) {
      showToast('success', isEdit ? 'Actualizado correctamente' : 'Creado correctamente');
      setModal(null);
    } else {
      showToast('error', result.payload || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    const result = await dispatch(deleteVulnerabilidad(id));
    if (deleteVulnerabilidad.fulfilled.match(result)) showToast('success', 'Eliminado');
    else showToast('error', result.payload || 'Error al eliminar');
  };

  const lista = filtroTipo ? vulns.filter(v => getGrupo(v.tipo) === filtroTipo) : vulns;
  const countAmenazas = vulns.filter(v => getGrupo(v.tipo) === 'amenaza').length;
  const countVulns    = vulns.filter(v => getGrupo(v.tipo) === 'vulnerabilidad').length;

  return (
    <>
      <StepGuide
        icon="bug_report"
        title="Registra las vulnerabilidades y amenazas identificadas"
        description="Las amenazas son factores externos (hackers, desastres, errores humanos). Las vulnerabilidades son debilidades internas (falta de cifrado, accesos sin control). Necesitas al menos una para crear un riesgo."
        tip="Distingue bien entre amenaza (qué puede ocurrir) y vulnerabilidad (qué lo hace posible). Puedes reutilizar estos registros en múltiples riesgos."
      />

      <SectionCard
        title={`Vulnerabilidades y Amenazas (${vulns.length})`}
        action={
          <div className="flex items-center gap-3">
            {vulns.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 px-2 py-0.5 rounded-full">{countAmenazas} amenazas</span>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">{countVulns} vulnerabilidades</span>
              </div>
            )}
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Todos</option>
              <option value="amenaza">Amenazas</option>
              <option value="vulnerabilidad">Vulnerabilidades</option>
            </select>
            <Btn size="sm" onClick={() => setModal('create')} icon="add">
              Nuevo
            </Btn>
          </div>
        }
      >
        {loading ? <Spinner /> : !lista.length ? (
          <EmptyState
            icon="bug_report"
            title="Sin registros"
            description={filtroTipo ? `No hay ${filtroTipo}s registradas.` : 'Agrega vulnerabilidades y amenazas para continuar con el análisis.'}
            action={!filtroTipo ? (
              <Btn onClick={() => setModal('create')} icon="add">
                Registrar primera entrada
              </Btn>
            ) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3 w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {lista.map((v) => (
                  <tr key={v.id_vulnerabilidad} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{v.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${getGrupo(v.tipo) === 'amenaza'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                        {getTipoLabel(v.tipo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{v.descripcion || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <IconBtn icon="edit" title="Editar" onClick={() => setModal(v)} />
                        <IconBtn icon="delete" title="Eliminar" variant="danger" onClick={() => handleDelete(v.id_vulnerabilidad)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Nueva vulnerabilidad / amenaza' : `Editar: ${modal.nombre}`}
          onClose={() => setModal(null)}
        >
          <FormVulnerabilidad
            initial={modal !== 'create' ? modal : VULN_INIT}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            isSaving={saving}
            isEditing={modal !== 'create'}
          />
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — RIESGOS + CONTROLES
// ═══════════════════════════════════════════════════════════════════════════════

const RIESGO_INIT = {
  activo_id: '',
  vulnerabilidad_ids: [],
  consecuencia: '',
  probabilidad_inherente: '1',
  impacto_inherente: '1',
  tratamiento: 'Reducir',
};

const CONTROL_INIT = {
  descripcion: '',
  tipo_control: 'preventivo',
  nivel_efectividad: 'Automático',
  frecuencia_control: 'continuo',
  probabilidad_residual: '1',
  impacto_residual: '1',
};

function FormRiesgo({ activos, vulnerabilidades, onSubmit, onCancel, isSaving }) {
  const [form, setForm] = useState({ ...RIESGO_INIT });
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleVuln = (id) => {
    setForm(p => ({
      ...p,
      vulnerabilidad_ids: p.vulnerabilidad_ids.includes(id)
        ? p.vulnerabilidad_ids.filter(v => v !== id)
        : [...p.vulnerabilidad_ids, id],
    }));
  };

  const ri = calcRiesgo(form.probabilidad_inherente, form.impacto_inherente);
  const isValid = form.activo_id && form.consecuencia.trim() && form.vulnerabilidad_ids.length > 0;

  return (
    <div className="space-y-6">
      {/* Activo */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
          Activo de información <span className="text-red-400">*</span>
        </label>
        {!activos.length ? (
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">warning</span>
            No hay activos registrados. Ve al Paso 1 primero.
          </p>
        ) : (
          <select name="activo_id" value={form.activo_id} onChange={handle}
            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary p-3 text-sm text-foreground-light dark:text-foreground-dark transition-colors">
            <option value="">— Selecciona un activo —</option>
            {activos.map(a => (
              <option key={a.id_activo} value={a.id_activo}>{a.nombre} ({a.tipo})</option>
            ))}
          </select>
        )}
      </div>

      {/* Vulnerabilidades (chips multi-select) */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
          Vulnerabilidades / Amenazas asociadas <span className="text-red-400">*</span>
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {form.vulnerabilidad_ids.length > 0
              ? `${form.vulnerabilidad_ids.length} seleccionada${form.vulnerabilidad_ids.length !== 1 ? 's' : ''}`
              : 'Selecciona una o más'}
          </span>
        </label>
        {!vulnerabilidades.length ? (
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">warning</span>
            No hay vulnerabilidades registradas. Ve al Paso 2 primero.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {vulnerabilidades.map(v => {
              const sel = form.vulnerabilidad_ids.includes(v.id_vulnerabilidad);
              const isAmenaza = getGrupo(v.tipo) === 'amenaza';
              return (
                <button key={v.id_vulnerabilidad} type="button" onClick={() => toggleVuln(v.id_vulnerabilidad)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1
                    ${sel
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[12px]">
                    {isAmenaza ? 'warning' : 'lock_open'}
                  </span>
                  <span>{v.nombre}</span>
                  <span className="opacity-50 text-[10px]">({getTipoLabel(v.tipo)})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Consecuencia */}
      <InputText label="Descripción del riesgo / consecuencia" name="consecuencia" value={form.consecuencia} onChange={handle}
        placeholder="Describe el impacto potencial si el riesgo se materializa" textarea rows={3} required />

      {/* Riesgo inherente */}
      <div className="bg-background-light dark:bg-gray-800/60 rounded-xl p-4 space-y-4 border border-border-light dark:border-border-dark">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Evaluación del Riesgo Inherente (sin controles)
        </p>
        <div className="grid grid-cols-2 gap-5">
          <ScaleInput label="Probabilidad" name="probabilidad_inherente" value={form.probabilidad_inherente} onChange={handle} />
          <ScaleInput label="Impacto" name="impacto_inherente" value={form.impacto_inherente} onChange={handle} />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Riesgo Inherente =</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{ri}</span>
          <NivelBadge nivel={nivelRiesgo(ri)} />
        </div>
      </div>

      {/* Tratamiento */}
      <SelectField label="Tratamiento del riesgo" name="tratamiento" value={form.tratamiento} onChange={handle}
        options={TRATAMIENTOS} />

      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Btn type="button" onClick={() => onSubmit(form)} disabled={!isValid || isSaving}
          icon={isSaving ? 'progress_activity' : 'shield'}>
          {isSaving ? 'Guardando…' : 'Registrar riesgo'}
        </Btn>
        {onCancel && <Btn variant="outline" type="button" onClick={onCancel} icon="close">Cancelar</Btn>}
      </div>

      {!isValid && (activos.length > 0 && vulnerabilidades.length > 0) && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Selecciona un activo, al menos una vulnerabilidad y describe la consecuencia.
        </p>
      )}
    </div>
  );
}

function FormControl({ riesgoInherente, onSubmit, onCancel, isSaving }) {
  const [form, setForm] = useState({ ...CONTROL_INIT });
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const rr = calcRiesgo(form.probabilidad_residual, form.impacto_residual);
  const excede = rr > riesgoInherente;
  const isValid = form.descripcion.trim() && !excede;

  return (
    <div className="space-y-5">
      <InputText label="Descripción del control" name="descripcion" value={form.descripcion} onChange={handle}
        placeholder="Ej: Autenticación multifactor obligatoria para accesos remotos" textarea rows={2} required />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField label="Tipo de control" name="tipo_control" value={form.tipo_control} onChange={handle} options={TIPOS_CONTROL} />
        <SelectField label="Nivel de implementación" name="nivel_efectividad" value={form.nivel_efectividad} onChange={handle} options={NIVELES_CTRL} />
        <SelectField label="Frecuencia" name="frecuencia_control" value={form.frecuencia_control} onChange={handle} options={FRECUENCIAS} />
      </div>

      <div className="bg-background-light dark:bg-gray-800/60 rounded-xl p-4 space-y-4 border border-border-light dark:border-border-dark">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Riesgo Residual (después de este control)
        </p>
        <div className="grid grid-cols-2 gap-5">
          <ScaleInput label="Probabilidad residual" name="probabilidad_residual" value={form.probabilidad_residual} onChange={handle} />
          <ScaleInput label="Impacto residual" name="impacto_residual" value={form.impacto_residual} onChange={handle} />
        </div>
        <div className={`flex flex-wrap items-center gap-3 pt-1 ${excede ? 'text-red-600 dark:text-red-400' : ''}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">Riesgo Residual =</span>
          <span className="text-2xl font-bold">{rr}</span>
          <NivelBadge nivel={nivelRiesgo(rr)} />
          {excede ? (
            <span className="text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Supera el inherente ({riesgoInherente}). Ajusta los valores.
            </span>
          ) : rr < riesgoInherente ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              Reducción de {riesgoInherente - rr} puntos
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <Btn type="button" onClick={() => onSubmit(form)} disabled={!isValid || isSaving}
          icon={isSaving ? 'progress_activity' : 'add_circle'}>
          {isSaving ? 'Guardando…' : 'Agregar control'}
        </Btn>
        {onCancel && <Btn variant="outline" type="button" onClick={onCancel} icon="close">Cancelar</Btn>}
      </div>
    </div>
  );
}

function RiesgoDetallePanel({ riesgo, onPublicar, isSaving, showToast }) {
  const dispatch  = useDispatch();
  const [addCtrl, setAddCtrl] = useState(false);

  const ri = calcRiesgo(riesgo.probabilidad_inherente, riesgo.impacto_inherente);
  const controles = riesgo.controles || [];
  const lastControl = controles[controles.length - 1];
  const rr = lastControl
    ? calcRiesgo(lastControl.probabilidad_residual, lastControl.impacto_residual)
    : ri;
  const reduccion = ri - rr;

  const handleAddControl = async (form) => {
    const result = await dispatch(createControl({ riesgoId: riesgo.id_riesgo, data: form }));
    if (createControl.fulfilled.match(result)) {
      showToast('success', 'Control agregado');
      setAddCtrl(false);
    } else {
      showToast('error', result.payload || 'Error al agregar control');
    }
  };

  const handleDeleteControl = async (controlId) => {
    if (!confirm('¿Eliminar este control?')) return;
    const result = await dispatch(deleteControl({ riesgoId: riesgo.id_riesgo, controlId }));
    if (deleteControl.fulfilled.match(result)) showToast('success', 'Control eliminado');
    else showToast('error', result.payload || 'Error al eliminar');
  };

  const activo = riesgo.activoInfo || riesgo.activo || {};
  const vulns  = riesgo.vulnerabilidades || [];

  return (
    <div className="space-y-3">

      {/* ── Cabecera: activo + consecuencia + evaluación ── */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">

        {/* Activo */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">dns</span>
              Activo de información
            </p>
            <p className="font-bold text-foreground-light dark:text-foreground-dark text-sm leading-tight">
              {activo.nombre || riesgo.activo?.nombre || `Activo #${riesgo.activo_id}`}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {(activo.tipo || riesgo.activo?.tipo) && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-muted-light dark:text-muted-dark px-2 py-0.5 rounded-full capitalize">
                  {activo.tipo || riesgo.activo?.tipo}
                </span>
              )}
              {(activo.propietario || riesgo.activo?.propietario) && (
                <span className="text-[10px] text-muted-light dark:text-muted-dark flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]">person</span>
                  {activo.propietario || riesgo.activo?.propietario}
                </span>
              )}
            </div>
          </div>
          <NivelBadge nivel={nivelRiesgo(ri)} />
        </div>

        {/* Consecuencia */}
        {riesgo.consecuencia && (
          <div className="px-4 pb-3 border-t border-border-light dark:border-border-dark pt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">report_problem</span>
              Consecuencia potencial
            </p>
            <p className="text-xs text-foreground-light dark:text-foreground-dark leading-relaxed">{riesgo.consecuencia}</p>
          </div>
        )}

        {/* Vulnerabilidades / Amenazas */}
        {vulns.length > 0 && (
          <div className="px-4 pb-3 border-t border-border-light dark:border-border-dark pt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">bug_report</span>
              Vulnerabilidades / Amenazas asociadas ({vulns.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {vulns.map(v => (
                <span key={v.id_vulnerabilidad}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border
                    ${getGrupo(v.tipo) === 'amenaza'
                      ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30'
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30'}`}>
                  <span className="material-symbols-outlined text-[11px]">
                    {getGrupo(v.tipo) === 'amenaza' ? 'warning' : 'lock_open'}
                  </span>
                  {v.nombre}
                  <span className="opacity-50 text-[9px]">({getTipoLabel(v.tipo)})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Evaluación inherente → residual */}
        <div className="px-4 pb-4 border-t border-border-light dark:border-border-dark pt-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-2">Evaluación del riesgo</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { label: 'Riesgo Inherente', sub: `P ${riesgo.probabilidad_inherente} × I ${riesgo.impacto_inherente}`, val: ri },
              { label: 'Riesgo Residual',  sub: controles.length ? `después de ${controles.length} control${controles.length !== 1 ? 'es' : ''}` : 'sin controles aún', val: rr },
            ].map(({ label, sub, val }) => (
              <div key={label} className="bg-background-light dark:bg-gray-800/60 rounded-xl p-3 text-center border border-border-light dark:border-border-dark">
                <p className="text-[10px] uppercase tracking-wider text-muted-light dark:text-muted-dark mb-0.5">{label}</p>
                <p className="text-[10px] text-muted-light dark:text-muted-dark mb-1">{sub}</p>
                <p className="text-2xl font-bold text-foreground-light dark:text-foreground-dark leading-none">{val}</p>
                <div className="mt-2 flex justify-center">
                  <NivelBadge nivel={nivelRiesgo(val)} />
                </div>
              </div>
            ))}
          </div>
          {reduccion > 0 && (
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="material-symbols-outlined text-[13px]">trending_down</span>
              Reducción de {reduccion} punto{reduccion !== 1 ? 's' : ''} gracias a los controles
            </div>
          )}
        </div>

        {/* Tratamiento */}
        <div className="px-4 py-2.5 bg-background-light dark:bg-gray-800/40 border-t border-border-light dark:border-border-dark flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-wider">Tratamiento del riesgo:</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 border border-primary/20 dark:border-primary/30 px-2.5 py-0.5 rounded-full font-semibold">
            <span className="material-symbols-outlined text-[11px]">shield</span>
            {riesgo.tratamiento}
          </span>
        </div>
      </div>

      {/* ── Controles ── */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-muted-light dark:text-muted-dark">security</span>
            Controles
            <span className="text-xs font-normal text-muted-light dark:text-muted-dark">({controles.length})</span>
          </p>
          {!riesgo.en_matriz && (
            <Btn size="sm" onClick={() => setAddCtrl(true)} icon="add">Agregar control</Btn>
          )}
        </div>

        {!controles.length && (
          <div className="text-center py-8 px-4">
            <span className="material-symbols-outlined text-4xl text-gray-200 dark:text-gray-700 block mb-2">shield</span>
            <p className="text-xs text-muted-light dark:text-muted-dark font-medium">Sin controles aún</p>
            <p className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">Agrega al menos uno para poder publicar.</p>
            {!riesgo.en_matriz && (
              <div className="mt-3">
                <Btn size="sm" onClick={() => setAddCtrl(true)} icon="add">Agregar primer control</Btn>
              </div>
            )}
          </div>
        )}

        <div className="divide-y divide-border-light dark:divide-border-dark">
          {controles.map((c, idx) => {
            const crr = calcRiesgo(c.probabilidad_residual, c.impacto_residual);
            return (
              <div key={c.id_control ?? idx} className="px-4 py-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-foreground-light dark:text-foreground-dark flex-1 leading-relaxed">{c.descripcion}</p>
                  {!riesgo.en_matriz && (
                    <IconBtn icon="delete" title="Eliminar control" variant="danger"
                      onClick={() => handleDeleteControl(c.id_control)} />
                  )}
                </div>
                <div className="ml-7 grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5">Tipo</p>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-foreground-light dark:text-foreground-dark px-2 py-0.5 rounded-full capitalize">{c.tipo_control}</span>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5">Nivel</p>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-foreground-light dark:text-foreground-dark px-2 py-0.5 rounded-full">{c.nivel_efectividad}</span>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5">Frecuencia</p>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-foreground-light dark:text-foreground-dark px-2 py-0.5 rounded-full capitalize">{c.frecuencia_control}</span>
                  </div>
                </div>
                <div className="ml-7 bg-background-light dark:bg-gray-800/60 rounded-xl px-3 py-2 flex items-center gap-2">
                  <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark shrink-0">Riesgo residual:</p>
                  <span className="text-[11px] text-muted-light dark:text-muted-dark">{c.probabilidad_residual} × {c.impacto_residual} =</span>
                  <span className="text-sm font-bold text-foreground-light dark:text-foreground-dark">{crr}</span>
                  <NivelBadge nivel={nivelRiesgo(crr)} />
                  {crr < ri && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 ml-1">
                      <span className="material-symbols-outlined text-[11px]">trending_down</span>
                      −{ri - crr}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Publicar ── */}
      {!riesgo.en_matriz && controles.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 p-4">
          <Btn variant="success" size="lg" onClick={() => onPublicar(riesgo.id_riesgo)} disabled={isSaving}
            icon={isSaving ? 'progress_activity' : 'publish'}>
            {isSaving ? 'Publicando…' : 'Publicar en la Matriz'}
          </Btn>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">info</span>
            Una vez publicado, el riesgo no podrá editarse.
          </p>
        </div>
      )}

      {!riesgo.en_matriz && controles.length === 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Necesitas agregar al menos un control para poder publicar este riesgo.
          </p>
        </div>
      )}

      {riesgo.en_matriz && (
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-base">verified</span>
          <span className="font-medium">Publicado en la Matriz</span>
          <span className="text-muted-light dark:text-muted-dark text-xs ml-1">— este riesgo es solo lectura</span>
        </div>
      )}

      {/* ── Modal: nuevo control ── */}
      {addCtrl && (
        <Modal title="Agregar control" onClose={() => setAddCtrl(false)} maxW="max-w-2xl">
          {/* Contexto del riesgo */}
          <div className="mb-5 bg-background-light dark:bg-gray-800/60 rounded-xl border border-border-light dark:border-border-dark px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">dns</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5">Activo afectado</p>
              <p className="text-sm font-semibold text-foreground-light dark:text-foreground-dark truncate">
                {activo.nombre || `Activo #${riesgo.activo_id}`}
              </p>
              {activo.tipo && <p className="text-[11px] text-muted-light dark:text-muted-dark capitalize mt-0.5">{activo.tipo}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-1">Riesgo inherente</p>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-lg font-bold text-foreground-light dark:text-foreground-dark">{ri}</span>
                <NivelBadge nivel={nivelRiesgo(ri)} />
              </div>
            </div>
          </div>
          <FormControl
            riesgoInherente={ri}
            onSubmit={handleAddControl}
            onCancel={() => setAddCtrl(false)}
            isSaving={isSaving}
          />
        </Modal>
      )}
    </div>
  );
}

function TabRiesgos({ showToast }) {
  const dispatch         = useDispatch();
  const riesgos          = useSelector(selectRiesgos);
  const activos          = useSelector(selectActivos);
  const vulnerabilidades = useSelector(selectVulnerabilidades);
  const loading          = useSelector(selectIsLoading);
  const isCreating       = useSelector(selectIsCreating);
  const isUpdating       = useSelector(selectIsUpdating);

  const [modal, setModal]     = useState(null);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    dispatch(fetchRiesgos({ en_matriz: false }));
    dispatch(fetchActivos());
    dispatch(fetchVulnerabilidades());
  }, [dispatch]);

  useEffect(() => {
    if (detalle) {
      const updated = riesgos.find(r => r.id_riesgo === detalle.id_riesgo);
      if (updated) setDetalle(updated);
    }
  }, [riesgos]);

  const handleCreate = async (form) => {
    const result = await dispatch(createRiesgo(form));
    if (createRiesgo.fulfilled.match(result)) {
      showToast('success', 'Riesgo registrado. Ahora agrega controles.');
      setModal(null);
      const nuevo = result.payload.riesgo || result.payload;
      if (nuevo) setDetalle(nuevo);
    } else {
      showToast('error', result.payload  || result.error || result.msg|| 'Error al crear');
    }
  };

  const handlePublicar = async (id) => {
    const result = await dispatch(publicarRiesgo(id));
    if (publicarRiesgo.fulfilled.match(result)) {
      showToast('success', 'Riesgo publicado en la Matriz');
      setDetalle(null);
    } else {
      showToast('error', result.payload  || result.error || result.msg|| 'Error al publicar');
    }
  };

  const pendientes = riesgos.filter(r => !r.en_matriz);

  return (
    <>
      <StepGuide
        icon="shield_question"
        title="Registra riesgos y define controles para mitigarlos"
        description="Un riesgo vincula un activo con vulnerabilidades o amenazas. Calcula el riesgo inherente, luego agrega controles para reducirlo hasta obtener un riesgo residual aceptable."
        steps={[
          'Haz clic en "Nuevo riesgo" y completa el formulario',
          'Selecciona el riesgo de la lista para ver su detalle',
          'Agrega controles para reducir el nivel de riesgo',
          'Cuando el riesgo residual sea aceptable, publícalo en la Matriz',
        ]}
        tip="El riesgo residual no puede superar al inherente. Puedes agregar varios controles antes de publicar."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de riesgos pendientes */}
        <SectionCard
          title={`En proceso (${pendientes.length})`}
          action={
            <Btn size="sm" onClick={() => { setModal('create'); setDetalle(null); }} icon="add">
              Nuevo riesgo
            </Btn>
          }
        >
          {loading ? <Spinner /> : !pendientes.length ? (
            <EmptyState
              icon="shield"
              title="Sin riesgos pendientes"
              description="Crea un riesgo para comenzar el análisis."
              action={
                <Btn onClick={() => setModal('create')} icon="add">
                  Registrar primer riesgo
                </Btn>
              }
            />
          ) : (
            <div className="space-y-2">
              {pendientes.map(r => {
                const ri = calcRiesgo(r.probabilidad_inherente, r.impacto_inherente);
                const controles = r.controles || [];
                const lastCtrl = controles[controles.length - 1];
                const rr = lastCtrl ? calcRiesgo(lastCtrl.probabilidad_residual, lastCtrl.impacto_residual) : null;
                const isSelected = detalle?.id_riesgo === r.id_riesgo;
                const listoParaPublicar = controles.length > 0;

                const vulns = r.vulnerabilidades || [];

                return (
                  <button key={r.id_riesgo} onClick={() => setDetalle(isSelected ? null : r)}
                    className={`w-full text-left rounded-xl border p-4 transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/20'
                        : 'border-border-light dark:border-border-dark hover:border-primary/40 hover:shadow-sm'}`}>

                    {/* Fila superior: activo + badge */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">dns</span>
                          Activo de información
                        </p>
                        <p className="font-semibold text-sm text-foreground-light dark:text-foreground-dark truncate">
                          {r.activo?.nombre || `Activo #${r.activo_id}`}
                        </p>
                        {r.activo?.tipo && (
                          <span className="text-[10px] text-muted-light dark:text-muted-dark capitalize">{r.activo.tipo}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <NivelBadge nivel={nivelRiesgo(ri)} />
                        <span className="text-[9px] text-muted-light dark:text-muted-dark">inherente {ri}</span>
                      </div>
                    </div>

                    {/* Vulnerabilidades / Amenazas */}
                    {vulns.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">bug_report</span>
                          Vulnerabilidades / Amenazas
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {vulns.map(v => (
                            <span key={v.id_vulnerabilidad}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5 border
                                ${getGrupo(v.tipo) === 'amenaza'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30'}`}>
                              <span className="material-symbols-outlined text-[10px]">
                                {getGrupo(v.tipo) === 'amenaza' ? 'warning' : 'lock_open'}
                              </span>
                              {v.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Consecuencia */}
                    <div className="mb-2">
                      <p className="text-[9px] uppercase tracking-widest text-muted-light dark:text-muted-dark mb-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">report_problem</span>
                        Consecuencia
                      </p>
                      <p className="text-[11px] text-muted-light dark:text-muted-dark line-clamp-2 leading-relaxed">{r.consecuencia}</p>
                    </div>

                    {/* Footer: scores + controles + tratamiento */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-light dark:border-border-dark">
                      <span className="text-[10px] text-muted-light dark:text-muted-dark">
                        R. Inherente: <strong className="text-foreground-light dark:text-foreground-dark">{ri}</strong>
                      </span>
                      {rr !== null && (
                        <>
                          <span className="material-symbols-outlined text-[11px] text-muted-light dark:text-muted-dark">arrow_forward</span>
                          <span className="text-[10px] text-muted-light dark:text-muted-dark">
                            Residual: <strong className="text-foreground-light dark:text-foreground-dark">{rr}</strong>
                          </span>
                        </>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        <span className="material-symbols-outlined text-[11px]">shield</span>
                        {r.tratamiento}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-light dark:text-muted-dark">
                        <span className="material-symbols-outlined text-[11px]">security</span>
                        {controles.length} control{controles.length !== 1 ? 'es' : ''}
                      </span>
                      {listoParaPublicar && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="material-symbols-outlined text-[11px]">check_circle</span>
                          Listo para publicar
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Panel detalle */}
        <div>
          {detalle ? (
            <SectionCard
              title="Detalle y controles"
              action={
                <button onClick={() => setDetalle(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  Cerrar
                </button>
              }
            >
              <RiesgoDetallePanel
                riesgo={detalle}
                onPublicar={handlePublicar}
                isSaving={isUpdating}
                showToast={showToast}
              />
            </SectionCard>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[340px]
              border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl
              text-gray-400 dark:text-gray-500 gap-2 p-6 text-center">
              <span className="material-symbols-outlined text-5xl mb-1 text-gray-300 dark:text-gray-600">touch_app</span>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selecciona un riesgo</p>
              <p className="text-xs">Elige un riesgo de la lista para ver su detalle, agregar controles y publicarlo.</p>
            </div>
          )}
        </div>
      </div>

      {modal === 'create' && (
        <Modal title="Registrar nuevo riesgo" onClose={() => setModal(null)} maxW="max-w-2xl">
          <FormRiesgo
            activos={activos}
            vulnerabilidades={vulnerabilidades}
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
            isSaving={isCreating}
          />
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — MATRIZ (riesgos publicados)
// ═══════════════════════════════════════════════════════════════════════════════

function MatrizDetalleModal({ riesgo, onClose }) {
  const controles = riesgo.controles || [];
  const activo    = riesgo.activoInfo || riesgo.activo || {};
  const vulns     = riesgo.vulnerabilidades || [];
  const usuario   = riesgo.usuario;

  const ri = calcRiesgo(riesgo.probabilidad_inherente, riesgo.impacto_inherente);
  const nivelInherente = riesgo.nivel_riesgo_inherente || nivelRiesgo(ri);

  const fmtFecha = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const efectividadStyle = (n) =>
    n === 'Alto'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : n === 'Satisfactorio'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';

  const SectionTitle = ({ icon, children }) => (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[13px]">{icon}</span>
      {children}
    </p>
  );

  const Divider = () => <div className="border-t border-gray-100 dark:border-gray-700" />;

  return (
    <Modal title={`Riesgo #${riesgo.numero ?? riesgo.id_riesgo}`} onClose={onClose} maxW="max-w-2xl">
      <div className="space-y-3">

        {/* Publicado */}
        <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl px-4 py-2.5">
          <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-base">verified</span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex-1">Publicado en la Matriz</span>
          {fmtFecha(riesgo.updated_at || riesgo.created_at) && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[11px]">calendar_today</span>
              {fmtFecha(riesgo.updated_at || riesgo.created_at)}
            </span>
          )}
        </div>

        {/* Activo */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">dns</span>
              Activo de información
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-50 dark:divide-gray-700/50">
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Nombre</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{activo.nombre || `#${riesgo.activo_id}`}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Tipo</p>
              <span className="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize">{activo.tipo || '—'}</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Propietario / Área</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{activo.propietario || '—'}</p>
            </div>
          </div>
        </div>

        {/* Amenazas / Vulnerabilidades */}
        {vulns.length > 0 && (
          <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">bug_report</span>
              Amenazas y vulnerabilidades asociadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {vulns.map((v) => (
                <span key={v.id_vulnerabilidad}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border
                    ${getGrupo(v.tipo) === 'amenaza'
                      ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30'
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30'}`}>
                  <span className="material-symbols-outlined text-[11px]">
                    {getGrupo(v.tipo) === 'amenaza' ? 'warning' : 'lock_open'}
                  </span>
                  {v.nombre}
                  <span className="opacity-40 text-[10px]">({getTipoLabel(v.tipo)})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Consecuencia + Tratamiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">report_problem</span>
              Consecuencia potencial
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{riesgo.consecuencia}</p>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">tune</span>
              Tratamiento
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[13px] text-primary">shield</span>
              {riesgo.tratamiento}
            </span>
          </div>
        </div>

        {/* Evaluación inherente */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">analytics</span>
              Evaluación del riesgo inherente
            </p>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-50 dark:divide-gray-700/50">
            {[
              { label: 'Probabilidad (P)', value: riesgo.probabilidad_inherente, sub: '/ 5' },
              { label: 'Impacto (I)',       value: riesgo.impacto_inherente,      sub: '/ 5' },
              { label: 'R. Inherente',      value: ri,                            sub: null  },
            ].map(({ label, value, sub }) => (
              <div key={label} className="px-4 py-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 leading-tight">{label}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white leading-none">{value}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
              </div>
            ))}
            <div className="px-4 py-4 flex flex-col items-center justify-center gap-1.5">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Nivel</p>
              <NivelBadge nivel={nivelInherente} />
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">security</span>
              Controles implementados
            </p>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold">{controles.length}</span>
          </div>

          {controles.length === 0 ? (
            <p className="text-xs text-gray-400 italic px-4 py-5">Sin controles registrados.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/40">
              {controles.map((c, idx) => {
                const crr     = calcRiesgo(c.probabilidad_residual, c.impacto_residual);
                const nivelRR = c.nivel_riesgo_residual || nivelRiesgo(crr);
                return (
                  <div key={c.id_control ?? idx} className="px-4 py-3">
                    <div className="flex items-start gap-2 mb-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex-1 leading-relaxed">{c.descripcion}</p>
                      {fmtFecha(c.created_at) && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0">
                          <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                          {fmtFecha(c.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="ml-7 flex flex-wrap gap-1.5 mb-2.5">
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize">{c.tipo_control}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${efectividadStyle(c.nivel_efectividad)}`}>{c.nivel_efectividad}</span>
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize">{c.frecuencia_control}</span>
                    </div>
                    <div className="ml-7 bg-background-light dark:bg-gray-800/60 rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 shrink-0">Riesgo residual:</p>
                      <span className="text-[11px] text-gray-500">{c.probabilidad_residual} × {c.impacto_residual} =</span>
                      <span className="text-base font-bold text-gray-800 dark:text-white">{crr}</span>
                      <NivelBadge nivel={nivelRR} />
                      {crr < ri && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 ml-1">
                          <span className="material-symbols-outlined text-[11px]">trending_down</span>
                          −{ri - crr}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registrado por */}
        {(usuario || riesgo.created_at) && (
          <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">manage_accounts</span>
              Registrado por
            </p>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 uppercase">
                {((usuario?.nombre?.[0] || '') + (usuario?.apellido_paterno?.[0] || '')) || '?'}
              </span>
              <div className="min-w-0">
                {usuario ? (
                  <>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                      {[usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno].filter(Boolean).join(' ')}
                    </p>
                    {usuario.email && <p className="text-xs text-gray-400 mt-0.5">{usuario.email}</p>}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">Usuario no disponible</p>
                )}
                {fmtFecha(riesgo.created_at) && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[11px]">calendar_today</span>
                    {fmtFecha(riesgo.created_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}

const NIVEL_CELL = {
  Bajo:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Moderado: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Alto:     'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Extremo:  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

const TH_GROUP  = 'border border-primary/20 px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider bg-primary text-white';
const TH_SUB    = 'border border-gray-200 dark:border-gray-600/50 px-3 py-2 text-center text-[10px] font-semibold uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300';
const TD_BASE   = 'border border-gray-100 dark:border-gray-700/60 px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 align-top';
const TD_CENTER = `${TD_BASE} text-center`;

// ─── Mapa de calor 5×5 ────────────────────────────────────────────────────────

function HeatMatrix({ riesgos }) {
  const [open, setOpen] = useState(true);

  const map = {};
  riesgos.forEach(r => {
    const key = `${r.probabilidad_inherente}-${r.impacto_inherente}`;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });

  const cellStyle = (p, i) => {
    const v = p * i;
    if (v <= 5)  return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300' };
    if (v <= 12) return { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-800 dark:text-amber-300' };
    if (v <= 20) return { bg: 'bg-orange-100 dark:bg-orange-900/40',   text: 'text-orange-800 dark:text-orange-300' };
    return             { bg: 'bg-rose-100 dark:bg-rose-900/40',       text: 'text-rose-800 dark:text-rose-300' };
  };

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">grid_on</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white flex-1">Mapa de Calor</span>
        <span
          className="material-symbols-outlined text-[16px] text-gray-400 shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : '' }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-3 items-start">
            {/* Etiqueta eje Y */}
            <div className="flex items-center justify-center shrink-0 self-stretch">
              <span
                className="text-[9px] text-gray-400 uppercase tracking-widest select-none"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Probabilidad
              </span>
            </div>

            {/* Grid + ejes */}
            <div className="flex flex-col gap-[3px]">
              {[5,4,3,2,1].map(p => (
                <div key={p} className="flex items-center gap-[3px]">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 w-3 text-right shrink-0 tabular-nums font-medium">{p}</span>
                  {[1,2,3,4,5].map(i => {
                    const list = map[`${p}-${i}`] || [];
                    const val = p * i;
                    const { bg, text } = cellStyle(p, i);
                    return (
                      <div
                        key={i}
                        className={`relative w-10 h-10 rounded-md ${bg} flex items-center justify-center`}
                        title={`P=${p} × I=${i} = ${val} — ${nivelRiesgo(val)}${list.length ? ` · ${list.length} riesgo${list.length !== 1 ? 's' : ''}` : ''}`}
                      >
                        <span className={`${text} text-xs font-bold tabular-nums leading-none`}>{val}</span>
                        {list.length > 0 && (
                          <span className="absolute top-0.5 right-0.5 w-[14px] h-[14px] rounded-full bg-white/80 dark:bg-black/50 text-[8px] font-bold text-gray-800 dark:text-white flex items-center justify-center leading-none shadow-sm">
                            {list.length}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Eje X */}
              <div className="flex items-center gap-[3px] mt-0.5">
                <span className="w-3 shrink-0" />
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="w-10 text-center text-[10px] text-gray-500 dark:text-gray-400 tabular-nums font-medium">{i}</span>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest text-center mt-1 select-none">Impacto</p>
            </div>

            {/* Leyenda */}
            <div className="flex flex-col gap-2 ml-2 shrink-0 self-center">
              {[
                { label: 'Extremo',  bg: 'bg-rose-100 dark:bg-rose-900/40',       text: 'text-rose-800 dark:text-rose-300' },
                { label: 'Alto',     bg: 'bg-orange-100 dark:bg-orange-900/40',   text: 'text-orange-800 dark:text-orange-300' },
                { label: 'Moderado', bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-800 dark:text-amber-300' },
                { label: 'Bajo',     bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300' },
              ].map(({ label, bg, text }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${bg} border border-gray-200 dark:border-gray-600 shrink-0`} />
                  <span className={`text-[10px] ${text}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabMatriz() {
  const dispatch = useDispatch();
  const riesgos  = useSelector(selectRiesgos);
  const loading  = useSelector(selectIsLoading);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => { dispatch(fetchRiesgos({ en_matriz: true })); }, [dispatch]);

  const publicados = [...(riesgos.filter(r => r.en_matriz))].sort((a, b) =>
    calcRiesgo(b.probabilidad_inherente, b.impacto_inherente) -
    calcRiesgo(a.probabilidad_inherente, a.impacto_inherente)
  );

  const exportToExcel = () => {
    const rows = publicados.map((r) => {
      const ri       = calcRiesgo(r.probabilidad_inherente, r.impacto_inherente);
      const controles = r.controles || [];
      const lastCtrl  = controles[controles.length - 1];
      const rr        = lastCtrl
        ? calcRiesgo(lastCtrl.probabilidad_residual, lastCtrl.impacto_residual)
        : ri;
      const activo  = r.activoInfo || r.activo || {};
      const vulns   = r.vulnerabilidades || [];
      const usuario = r.usuario;
      const nombreCompleto = usuario
        ? [usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno].filter(Boolean).join(' ')
        : '—';

      return {
        '#':                           r.numero ?? r.id_riesgo,
        'Activo de Información':       activo.nombre  || `#${r.activo_id}`,
        'Tipo de Activo':              activo.tipo    || '—',
        'Amenazas / Vulnerabilidades': vulns.map(v => v.nombre).join(', ') || '—',
        'Consecuencia':                r.consecuencia || '—',
        'P Inherente':                 r.probabilidad_inherente,
        'I Inherente':                 r.impacto_inherente,
        'Riesgo Inherente':            ri,
        'Nivel Riesgo Inherente':      nivelRiesgo(ri),
        'Tratamiento':                 r.tratamiento  || '—',
        'Control Implementado':        lastCtrl?.descripcion        || '—',
        'Tipo de Control':             lastCtrl?.tipo_control       || '—',
        'Nivel de implementación':        lastCtrl?.nivel_efectividad  || '—',
        'Frecuencia del Control':      lastCtrl?.frecuencia_control || '—',
        'P Residual':                  lastCtrl ? lastCtrl.probabilidad_residual : '—',
        'I Residual':                  lastCtrl ? lastCtrl.impacto_residual      : '—',
        'Riesgo Residual':             lastCtrl ? rr : '—',
        'Nivel Riesgo Residual':       lastCtrl?.nivel_riesgo_residual || (lastCtrl ? nivelRiesgo(rr) : '—'),
        'Registrado por':              nombreCompleto,
        'Email':                       usuario?.email || '—',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 }, { wch: 26 }, { wch: 13 }, { wch: 36 }, { wch: 36 },
      { wch: 8 }, { wch: 8 },  { wch: 10 }, { wch: 14 }, { wch: 13 },
      { wch: 36 }, { wch: 15 }, { wch: 18 }, { wch: 16 },
      { wch: 8 }, { wch: 8 },  { wch: 10 }, { wch: 14 },
      { wch: 26 }, { wch: 32 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matriz de Riesgos');
    XLSX.writeFile(wb, `matriz-riesgos-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <Spinner />;

  return (
    <>
      <StepGuide
        icon="grid_view"
        title="Matriz de riesgos — Vista consolidada"
        description="Todos los riesgos publicados, ordenados de mayor a menor criticidad. Haz clic en el ícono de ojo para ver el detalle completo."
        tip="Para agregar más riesgos, regresa al Paso 3. Solo los riesgos con al menos un control pueden publicarse."
      />

      {!publicados.length ? (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <EmptyState
            icon="grid_view"
            title="La matriz está vacía"
            description="Publica riesgos desde el Paso 3 (Riesgos) para verlos aquí."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen + mapa de calor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Tarjetas de nivel */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { nivel: 'Extremo', icon: 'crisis_alert',  bg: 'bg-rose-100 dark:bg-rose-900/40',     text: 'text-rose-800 dark:text-rose-300' },
                { nivel: 'Alto',    icon: 'warning',       bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300' },
                { nivel: 'Moderado',icon: 'info',          bg: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-800 dark:text-amber-300' },
                { nivel: 'Bajo',    icon: 'check_circle',  bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300' },
              ].map(({ nivel, icon, bg, text }) => {
                const count = publicados.filter(r =>
                  nivelRiesgo(calcRiesgo(r.probabilidad_inherente, r.impacto_inherente)) === nivel
                ).length;
                return (
                  <div key={nivel} className={`${bg} ${text} rounded-2xl p-5 flex flex-col gap-0.5 shadow-sm`}>
                    <span className="material-symbols-outlined text-[22px] opacity-75">{icon}</span>
                    <p className="text-4xl font-bold leading-none mt-1">{count}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-widest opacity-75 mt-1">{nivel}</p>
                  </div>
                );
              })}
            </div>
            {/* Mapa de calor */}
            <HeatMatrix riesgos={publicados} />
          </div>

          {/* Tabla estilo Excel */}
          <div className="bg-white dark:bg-background-dark/50 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  Matriz de Análisis de Riesgos
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Seguridad de la Información</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">grid_view</span>
                  {publicados.length} riesgo{publicados.length !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={exportToExcel}
                  title="Exportar a Excel"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">download</span>
                  Exportar Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="text-xs border-collapse w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  {/* Fila 1 — grupos */}
                  <tr>
                    <th className={TH_GROUP} rowSpan={2}>#</th>
                    <th className={TH_GROUP} colSpan={2}>Activos</th>
                    <th className={TH_GROUP} rowSpan={2}>Identificación<br/><span className="font-normal text-[9px] opacity-80">Amenaza / Vulnerabilidad</span></th>
                    <th className={TH_GROUP} rowSpan={2}>Valoración<br/><span className="font-normal text-[9px] opacity-80">Riesgo y Consecuencia</span></th>
                    <th className={TH_GROUP} rowSpan={2}>P</th>
                    <th className={TH_GROUP} rowSpan={2}>I</th>
                    <th className={TH_GROUP} colSpan={2}>Evaluación del Riesgo Inherente</th>
                    <th className={TH_GROUP} rowSpan={2}>Medición<br/><span className="font-normal text-[9px] opacity-80">Tratamiento</span></th>
                    <th className={TH_GROUP} rowSpan={2}>Controles a Implementar</th>
                    <th className={TH_GROUP} colSpan={3}>Eficiencia del Control</th>
                    <th className={TH_GROUP} colSpan={4}>Riesgo Residual</th>
                    <th className={TH_GROUP} rowSpan={2}>Registrado por</th>
                    <th className={TH_GROUP} rowSpan={2}></th>
                  </tr>
                  {/* Fila 2 — sub-columnas */}
                  <tr>
                    <th className={TH_SUB}>Activo de Información</th>
                    <th className={TH_SUB}>Tipo</th>
                    <th className={TH_SUB}>R. Inherente</th>
                    <th className={TH_SUB}>Nivel de Riesgo</th>
                    <th className={TH_SUB}>Tipo<br/><span className="font-normal opacity-70">(P,D,C,Di)</span></th>
                    <th className={TH_SUB}>Nivel<br/><span className="font-normal opacity-70">(A,S,M)</span></th>
                    <th className={TH_SUB}>Frecuencia</th>
                    <th className={TH_SUB}>P</th>
                    <th className={TH_SUB}>I</th>
                    <th className={TH_SUB}>R. Residual</th>
                    <th className={TH_SUB}>Nivel</th>
                  </tr>
                </thead>

                <tbody>
                  {publicados.map((r, rowIdx) => {
                    const ri       = calcRiesgo(r.probabilidad_inherente, r.impacto_inherente);
                    const nri      = nivelRiesgo(ri);
                    const controles = r.controles || [];
                    const lastCtrl  = controles[controles.length - 1];
                    const rr        = lastCtrl
                      ? calcRiesgo(lastCtrl.probabilidad_residual, lastCtrl.impacto_residual)
                      : ri;
                    const nrr  = lastCtrl?.nivel_riesgo_residual || nivelRiesgo(rr);
                    const activo = r.activoInfo || r.activo || {};
                    const vulns  = r.vulnerabilidades || [];
                    const usuario = r.usuario;
                    const rowBg = rowIdx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50/60 dark:bg-gray-800/20';

                    return (
                      <tr key={r.id_riesgo} className={`${rowBg} hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-default`}>
                        {/* # */}
                        <td className={`${TD_CENTER} font-bold text-gray-500 w-8`}>
                          {r.numero ?? r.id_riesgo}
                        </td>

                        {/* Activo nombre */}
                        <td className={`${TD_BASE} min-w-[120px] font-semibold text-gray-800 dark:text-gray-200`}>
                          {activo.nombre || `#${r.activo_id}`}
                        </td>

                        {/* Tipo */}
                        <td className={`${TD_CENTER} capitalize`}>
                          {activo.tipo || '—'}
                        </td>

                        {/* Identificación: Amenaza / Vulnerabilidad */}
                        <td className={`${TD_BASE} min-w-[130px]`}>
                          {!vulns.length ? <span className="text-gray-300">—</span> : (
                            <div className="space-y-0.5">
                              {vulns.map(v => (
                                <div key={v.id_vulnerabilidad} className="flex items-center gap-1">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${getGrupo(v.tipo) === 'amenaza' ? 'bg-orange-300' : 'bg-blue-300'}`} />
                                  <span className="leading-snug">{v.nombre}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Consecuencia */}
                        <td className={`${TD_BASE} min-w-[160px] leading-relaxed`}>
                          {r.consecuencia}
                        </td>

                        {/* P inherente */}
                        <td className={`${TD_CENTER} font-bold`}>{r.probabilidad_inherente}</td>

                        {/* I inherente */}
                        <td className={`${TD_CENTER} font-bold`}>{r.impacto_inherente}</td>

                        {/* R. Inherente */}
                        <td className={`${TD_CENTER} font-bold text-sm`}>{ri}</td>

                        {/* Nivel inherente (celda coloreada) */}
                        <td className={`${TD_CENTER} font-bold ${NIVEL_CELL[nri]}`}>
                          {nri}
                        </td>

                        {/* Tratamiento */}
                        <td className={`${TD_CENTER}`}>{r.tratamiento}</td>

                        {/* Descripción del control */}
                        <td className={`${TD_BASE} min-w-[180px] leading-relaxed`}>
                          {lastCtrl ? lastCtrl.descripcion : <span className="text-gray-300 italic">Sin control</span>}
                          {controles.length > 1 && (
                            <span className="block text-[10px] text-gray-400 mt-0.5">+{controles.length - 1} más</span>
                          )}
                        </td>

                        {/* Tipo control */}
                        <td className={`${TD_CENTER} capitalize`}>
                          {lastCtrl ? lastCtrl.tipo_control?.charAt(0).toUpperCase() : '—'}
                        </td>

                        {/* Nivel/Efectividad */}
                        <td className={`${TD_CENTER}`}>
                          {lastCtrl ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold
                              ${(lastCtrl.nivel_efectividad)}`}>
                              {lastCtrl.nivel_efectividad?.charAt(0).toUpperCase()}
                            </span>
                          ) : '—'}
                        </td>

                        {/* Frecuencia */}
                        <td className={`${TD_CENTER} capitalize`}>
                          {lastCtrl ? lastCtrl.frecuencia_control : '—'}
                        </td>

                        {/* P residual */}
                        <td className={`${TD_CENTER} font-bold`}>
                          {lastCtrl ? lastCtrl.probabilidad_residual : '—'}
                        </td>

                        {/* I residual */}
                        <td className={`${TD_CENTER} font-bold`}>
                          {lastCtrl ? lastCtrl.impacto_residual : '—'}
                        </td>

                        {/* R. Residual */}
                        <td className={`${TD_CENTER} font-bold text-sm`}>
                          {lastCtrl ? rr : '—'}
                        </td>

                        {/* Nivel residual (celda coloreada) */}
                        <td className={`${TD_CENTER} font-bold ${lastCtrl ? NIVEL_CELL[nrr] : ''}`}>
                          {lastCtrl ? nrr : '—'}
                        </td>

                        {/* Registrado por */}
                        <td className={`${TD_BASE} min-w-[130px]`}>
                          {usuario ? (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                                {(usuario.nombre?.[0] || '') + (usuario.apellido_paterno?.[0] || '')}
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug truncate">
                                  {[usuario.nombre, usuario.apellido_paterno].filter(Boolean).join(' ')}
                                </p>
                                {usuario.email && (
                                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{usuario.email}</p>
                                )}
                              </div>
                            </div>
                          ) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Acciones */}
                        <td className={`${TD_CENTER} w-10`}>
                          <IconBtn
                            icon="visibility"
                            title="Ver detalle completo"
                            variant="primary"
                            onClick={() => setDetalle(r)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detalle && <MatrizDetalleModal riesgo={detalle} onClose={() => setDetalle(null)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY BAR
// ═══════════════════════════════════════════════════════════════════════════════

function SummaryBar({ activos, vulns, riesgos }) {
  const enProceso  = riesgos.filter(r => !r.en_matriz).length;
  const publicados = riesgos.filter(r =>  r.en_matriz).length;
  const amenazas   = vulns.filter(v => getGrupo(v.tipo) === 'amenaza').length;
  const vulnCount  = vulns.filter(v => getGrupo(v.tipo) === 'vulnerabilidad').length;

  const items = [
    { label: 'Activos',          value: activos.length, icon: 'dns',       cls: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300' },
    { label: 'Amenazas',         value: amenazas,        icon: 'warning',   cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'Vulnerabilidades', value: vulnCount,       icon: 'lock_open', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'En proceso',       value: enProceso,       icon: 'pending',   cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { label: 'Publicados',       value: publicados,      icon: 'verified',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {items.map(({ label, value, icon, cls }) => (
        <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${cls}`}>
          <span className="material-symbols-outlined text-xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
            <p className="text-[11px] font-medium opacity-75 mt-0.5 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

const STEP_KEYS = ['activos', 'vulnerabilidades', 'riesgos', 'matriz'];

export default function MatrizRiesgos() {
  const dispatch   = useDispatch();
  const activos    = useSelector(selectActivos);
  const vulns      = useSelector(selectVulnerabilidades);
  const riesgos    = useSelector(selectRiesgos);

  const [activeTab, setActiveTab] = useState('activos');
  const [toast, setToast]         = useState(null);

  const showToast = (type, raw) => {
    const message = typeof raw === 'string' ? raw : raw?.msg ?? raw?.message ?? 'Error desconocido';
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    dispatch(fetchActivos());
    dispatch(fetchVulnerabilidades());
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const stepStatus = (key) => {
    if (key === 'activos')          return activos.length > 0;
    if (key === 'vulnerabilidades') return vulns.length > 0;
    if (key === 'riesgos')          return riesgos.some(r => !r.en_matriz);
    if (key === 'matriz')           return riesgos.some(r => r.en_matriz);
    return false;
  };

  const stepLabels = {
    activos:          'Activos',
    vulnerabilidades: 'Vulnerabilidades',
    riesgos:          'Riesgos y Controles',
    matriz:           'Matriz',
  };

  const activeIdx = STEP_KEYS.indexOf(activeTab);

  return (
    <Layout title="Matriz de Análisis de Riesgos">
      {/* Stepper de flujo */}
      <div className="mb-6 bg-white dark:bg-background-dark/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 px-4 py-3 flex items-center overflow-x-auto gap-1">
        {STEP_KEYS.map((key, idx) => {
          const isActive = activeTab === key;
          const isDone   = stepStatus(key);

          return (
            <div key={key} className="flex items-center shrink-0">
              <button
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'text-primary bg-primary/5 dark:bg-primary/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${isActive
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                    : isDone
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-gray-100 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500'}`}>
                  {isDone && !isActive
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : idx + 1}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{stepLabels[key]}</span>
              </button>
              {idx < STEP_KEYS.length - 1 && (
                <div className={`h-0.5 w-6 mx-1 shrink-0 rounded-full transition-colors ${
                  stepStatus(STEP_KEYS[idx]) ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <SummaryBar activos={activos} vulns={vulns} riesgos={riesgos} />

      {activeTab === 'activos'          && <TabActivos showToast={showToast} />}
      {activeTab === 'vulnerabilidades' && <TabVulnerabilidades showToast={showToast} />}
      {activeTab === 'riesgos'          && <TabRiesgos showToast={showToast} />}
      {activeTab === 'matriz'           && <TabMatriz />}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
}
