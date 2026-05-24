import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rechazarOcr, confirmarOcr } from '../slices/ocrThunk';
import {
  selectOcrHistoricoId,
  selectOcrDatosDetectados,
  selectOcrIsConfirming,
  selectOcrIsRechazando,
  selectOcrError,
  clearError,
} from '../slices/ocrSlice';
import PersonaBuscador from './PersonaBuscador';

const ADV_MATRIMONIO =
  'Esta persona debe tener bautismo y confirmación registrados. Si no los tiene, el registro fallará.';

export default function Paso2Matrimonio() {
  const dispatch = useDispatch();
  const historicoId = useSelector(selectOcrHistoricoId);
  const dd = useSelector(selectOcrDatosDetectados);
  const isConfirming = useSelector(selectOcrIsConfirming);
  const isRechazando = useSelector(selectOcrIsRechazando);
  const errorGlobal = useSelector(selectOcrError);

  const [campos, setCampos] = useState({
    fecha_sacramento: dd?.fecha_sacramento || '',
    foja: dd?.foja || '',
    numero: dd?.numero || '',
    parroquia: dd?.parroquia || '',
    nombre_contrayente: dd?.nombre_contrayente || '',
    nombre_contrayenta: dd?.nombre_contrayenta || '',
    lugar_ceremonia: dd?.lugar_ceremonia || '',
    reg_civil: dd?.reg_civil || '',
    numero_acta: dd?.numero_acta || '',
    testigo1: dd?.testigo1 || '',
    testigo2: dd?.testigo2 || '',
  });

  const [contrayente, setContrayente] = useState(null);
  const [contrayenta, setContrayenta] = useState(null);
  const [relaciones, setRelaciones] = useState([]);
  const [errores, setErrores] = useState({});

  const handleCampo = (f, v) => setCampos((p) => ({ ...p, [f]: v }));

  const agregarRelacion = () =>
    setRelaciones((prev) => [...prev, { persona: null, rol_sacramento_id: 5 }]);

  const setRelPersona = (idx, persona) =>
    setRelaciones((prev) => prev.map((r, i) => (i === idx ? { ...r, persona } : r)));

  const removeRelacion = (idx) =>
    setRelaciones((prev) => prev.filter((_, i) => i !== idx));

  const handleRechazar = () => {
    if (confirm('¿Rechazar este registro OCR?')) dispatch(rechazarOcr(historicoId));
  };

  const handleConfirmar = () => {
    dispatch(clearError());
    const newErrors = {};
    if (!contrayente) newErrors.contrayente = 'Selecciona el contrayente (él).';
    if (!contrayenta) newErrors.contrayenta = 'Selecciona la contrayenta (ella).';
    if (Object.keys(newErrors).length) return setErrores(newErrors);
    setErrores({});

    const rels = relaciones
      .filter((r) => r.persona?.id_persona)
      .map((r) => ({ rol_sacramento_id: r.rol_sacramento_id, persona_id: r.persona.id_persona }));

    dispatch(
      confirmarOcr({
        historico_id: historicoId,
        fecha_sacramento: campos.fecha_sacramento,
        foja: campos.foja,
        numero: campos.numero,
        lugar_ceremonia: campos.lugar_ceremonia,
        reg_civil: campos.reg_civil,
        numero_acta: campos.numero_acta,
        novio_1: { nombre_completo: campos.nombre_contrayente, persona_id: contrayente.id_persona },
        novio_2: { nombre_completo: campos.nombre_contrayenta, persona_id: contrayenta.id_persona },
        relaciones: rels,
      })
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader icon="favorite" title="Matrimonio — Revisión de datos" />

      {/* Datos del documento */}
      <Section title="Datos del documento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha del matrimonio">
            <input type="text" value={campos.fecha_sacramento} onChange={(e) => handleCampo('fecha_sacramento', e.target.value)} placeholder="dd/mm/aaaa" className={ic()} />
          </Field>
          <Field label="Foja">
            <input type="text" value={campos.foja} onChange={(e) => handleCampo('foja', e.target.value)} className={ic()} />
          </Field>
          <Field label="Número">
            <input type="text" value={campos.numero} onChange={(e) => handleCampo('numero', e.target.value)} className={ic()} />
          </Field>
          <Field label="Parroquia detectada">
            <input type="text" value={campos.parroquia} readOnly className={ic() + ' bg-gray-50 dark:bg-gray-800/60 cursor-default'} />
          </Field>
          <Field label="Nombre del contrayente (él)">
            <input type="text" value={campos.nombre_contrayente} onChange={(e) => handleCampo('nombre_contrayente', e.target.value)} className={ic()} />
          </Field>
          <Field label="Nombre de la contrayenta (ella)">
            <input type="text" value={campos.nombre_contrayenta} onChange={(e) => handleCampo('nombre_contrayenta', e.target.value)} className={ic()} />
          </Field>
          <Field label="Lugar de la ceremonia">
            <input type="text" value={campos.lugar_ceremonia} onChange={(e) => handleCampo('lugar_ceremonia', e.target.value)} className={ic()} />
          </Field>
          <Field label="Registro civil">
            <input type="text" value={campos.reg_civil} onChange={(e) => handleCampo('reg_civil', e.target.value)} className={ic()} />
          </Field>
          <Field label="Número de acta">
            <input type="text" value={campos.numero_acta} onChange={(e) => handleCampo('numero_acta', e.target.value)} className={ic()} />
          </Field>
          <Field label="Testigo 1">
            <input type="text" value={campos.testigo1} onChange={(e) => handleCampo('testigo1', e.target.value)} className={ic()} />
          </Field>
          <Field label="Testigo 2">
            <input type="text" value={campos.testigo2} onChange={(e) => handleCampo('testigo2', e.target.value)} className={ic()} />
          </Field>
        </div>
      </Section>

      {/* Contrayente (él) */}
      <Section title="Contrayente (él)">
        <PersonaBuscador
          label="Buscar contrayente *"
          placeholder="Nombre o CI..."
          initialQuery={campos.nombre_contrayente}
          datosOcr={{ nombre_completo: campos.nombre_contrayente }}
          onSelect={(p) => { setContrayente(p); setErrores((e) => ({ ...e, contrayente: '' })); }}
          onClear={() => setContrayente(null)}
          personaSeleccionada={contrayente}
          advertencia={ADV_MATRIMONIO}
          error={errores.contrayente}
        />
        {errorGlobal?.toLowerCase().includes('contrayente') && (
          <p className="text-xs text-red-600 mt-1">{errorGlobal}</p>
        )}
      </Section>

      {/* Contrayenta (ella) */}
      <Section title="Contrayenta (ella)">
        <PersonaBuscador
          label="Buscar contrayenta *"
          placeholder="Nombre o CI..."
          initialQuery={campos.nombre_contrayenta}
          datosOcr={{ nombre_completo: campos.nombre_contrayenta }}
          onSelect={(p) => { setContrayenta(p); setErrores((e) => ({ ...e, contrayenta: '' })); }}
          onClear={() => setContrayenta(null)}
          personaSeleccionada={contrayenta}
          advertencia={ADV_MATRIMONIO}
          error={errores.contrayenta}
        />
        {errorGlobal?.toLowerCase().includes('contrayenta') && (
          <p className="text-xs text-red-600 mt-1">{errorGlobal}</p>
        )}
      </Section>

      {/* Otras relaciones */}
      <Section
        title="Sacerdote / testigos / otras relaciones"
        action={
          <button onClick={agregarRelacion} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
            <span className="material-symbols-outlined text-[15px]">add</span>Agregar
          </button>
        }
      >
        {relaciones.length === 0 && <p className="text-xs text-gray-400">Sin relaciones adicionales.</p>}
        {relaciones.map((r, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1 space-y-2">
              <PersonaBuscador
                label={`Relación ${idx + 1}`}
                datosOcr={{}}
                onSelect={(p) => setRelPersona(idx, p)}
                onClear={() => setRelPersona(idx, null)}
                personaSeleccionada={r.persona}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Rol</label>
                <select
                  value={r.rol_sacramento_id}
                  onChange={(e) =>
                    setRelaciones((prev) =>
                      prev.map((rel, i) =>
                        i === idx ? { ...rel, rol_sacramento_id: Number(e.target.value) } : rel
                      )
                    )
                  }
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value={5}>Sacerdote celebrante</option>
                  <option value={6}>Testigo</option>
                  <option value={7}>Otro</option>
                </select>
              </div>
            </div>
            <button onClick={() => removeRelacion(idx)} className="mt-5 text-gray-400 hover:text-red-500">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        ))}
      </Section>

      {/* Error global */}
      {errorGlobal && !errorGlobal.toLowerCase().includes('contrayent') && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 rounded-lg">
          <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
          <p className="text-sm text-red-700 dark:text-red-400">{errorGlobal}</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={handleRechazar} disabled={isRechazando}
          className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2">
          {isRechazando && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
          Rechazar
        </button>
        <button onClick={handleConfirmar} disabled={isConfirming}
          className="px-5 py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
          {isConfirming && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
          Continuar
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        {action}
      </div>
      {children}
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

const ic = () =>
  'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors';
