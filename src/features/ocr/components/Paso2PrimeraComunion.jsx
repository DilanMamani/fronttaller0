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

const ADVERTENCIA_COMUNION =
  'Para registrar la primera comunión, la persona debe tener un bautismo previamente registrado en el sistema.';

export default function Paso2PrimeraComunion() {
  const dispatch = useDispatch();
  const historicoId = useSelector(selectOcrHistoricoId);
  const datosDetectados = useSelector(selectOcrDatosDetectados);
  const isConfirming = useSelector(selectOcrIsConfirming);
  const isRechazando = useSelector(selectOcrIsRechazando);
  const errorGlobal = useSelector(selectOcrError);

  const parseFecha = (str = '') => {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return isNaN(new Date(iso).getTime()) ? null : iso;
  };

  const [campos, setCampos] = useState({
    nombre: datosDetectados?.nombre || '',
    fecha_sacramento: datosDetectados?.fecha_sacramento || '',
    foja: datosDetectados?.foja || '',
    numero: datosDetectados?.numero || '',
    parroquia: datosDetectados?.parroquia || '',
  });

  const [comulgado, setComulgado] = useState(null);
  const [relaciones, setRelaciones] = useState([]);
  const [errorPersona, setErrorPersona] = useState('');

  const handleCampo = (f, v) => setCampos((p) => ({ ...p, [f]: v }));

  const agregarRelacion = () =>
    setRelaciones((prev) => [...prev, { persona: null, rol_sacramento_id: 7 }]);

  const setRelacionPersona = (idx, persona) =>
    setRelaciones((prev) => prev.map((r, i) => (i === idx ? { ...r, persona } : r)));

  const removeRelacion = (idx) =>
    setRelaciones((prev) => prev.filter((_, i) => i !== idx));

  const handleRechazar = () => {
    if (confirm('¿Rechazar este registro OCR?')) dispatch(rechazarOcr(historicoId));
  };

  const handleConfirmar = () => {
    dispatch(clearError());
    setErrorPersona('');

    if (!comulgado) {
      setErrorPersona('Debes seleccionar la persona que recibió la primera comunión.');
      return;
    }

    const fechaISO = parseFecha(campos.fecha_sacramento);
    if (!fechaISO) {
      setErrorPersona('La fecha no es válida. Usa el formato dd/mm/aaaa.');
      return;
    }

    // rol 4 = persona principal (comulgado), rol 7 = otros
    const rels = [{ rol_sacramento_id: 4, persona_id: comulgado.id_persona }];
    relaciones.forEach((r) => {
      if (r.persona?.id_persona)
        rels.push({ rol_sacramento_id: r.rol_sacramento_id, persona_id: r.persona.id_persona });
    });

    dispatch(
      confirmarOcr({
        historico_id: historicoId,
        fecha_sacramento: fechaISO,
        foja: campos.foja,
        numero: campos.numero,
        relaciones: rels,
        // El backend usa relaciones para encontrar la persona principal con rol 4
        nueva_persona: null,
      })
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader icon="volunteer_activism" title="Primera Comunión — Revisión de datos" />

      <Section title="Datos del documento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre del comulgado">
            <input
              type="text"
              value={campos.nombre}
              onChange={(e) => handleCampo('nombre', e.target.value)}
              className={ic()}
            />
          </Field>
          <Field label="Fecha de la primera comunión">
            <input
              type="text"
              value={campos.fecha_sacramento}
              onChange={(e) => handleCampo('fecha_sacramento', e.target.value)}
              placeholder="dd/mm/aaaa"
              className={ic()}
            />
          </Field>
          <Field label="Foja">
            <input
              type="text"
              value={campos.foja}
              onChange={(e) => handleCampo('foja', e.target.value)}
              className={ic()}
            />
          </Field>
          <Field label="Número">
            <input
              type="text"
              value={campos.numero}
              onChange={(e) => handleCampo('numero', e.target.value)}
              className={ic()}
            />
          </Field>
          <Field label="Parroquia detectada">
            <input
              type="text"
              value={campos.parroquia}
              readOnly
              className={ic() + ' bg-gray-50 dark:bg-gray-800/60 cursor-default'}
            />
          </Field>
        </div>
      </Section>

      <Section title="Persona que recibió la primera comunión">
        <PersonaBuscador
          label="Buscar persona comulgada *"
          placeholder="Nombre o CI (mín. 3 caracteres)..."
          initialQuery={campos.nombre}
          datosOcr={{
            nombre_completo: campos.nombre,
            fecha_nacimiento: datosDetectados?.fecha_nacimiento,
            lugar_nacimiento: datosDetectados?.lugar_nacimiento,
          }}
          rol="primera_comunion"
          tipo="sacramento"
          onSelect={(p) => { setComulgado(p); setErrorPersona(''); }}
          onClear={() => setComulgado(null)}
          personaSeleccionada={comulgado}
          advertencia={ADVERTENCIA_COMUNION}
          error={!comulgado ? errorPersona : ''}
          permitirCrear={false}
        />
      </Section>

      <Section
        title="Sacerdote / padrinos / otras relaciones"
        action={
          <button
            onClick={agregarRelacion}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Agregar
          </button>
        }
      >
        {relaciones.length === 0 && (
          <p className="text-xs text-gray-400">Sin relaciones adicionales.</p>
        )}
        {relaciones.map((r, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1">
              <PersonaBuscador
                label={`Relación ${idx + 1}`}
                datosOcr={{}}
                rol="bautismo"
                onSelect={(p) => setRelacionPersona(idx, p)}
                onClear={() => setRelacionPersona(idx, null)}
                personaSeleccionada={r.persona}
                permitirCrear={false}
              />
            </div>
            <button
              onClick={() => removeRelacion(idx)}
              className="mt-5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        ))}
      </Section>

      {errorGlobal && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-800 rounded-lg">
          <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
          <p className="text-sm text-red-700 dark:text-red-400">{errorGlobal}</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={handleRechazar}
          disabled={isRechazando}
          className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isRechazando && (
            <span className="material-symbols-outlined text-[15px] animate-spin">
              progress_activity
            </span>
          )}
          Rechazar
        </button>
        <button
          onClick={handleConfirmar}
          disabled={isConfirming}
          className="px-5 py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isConfirming && (
            <span className="material-symbols-outlined text-[15px] animate-spin">
              progress_activity
            </span>
          )}
          Confirmar sacramento
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
