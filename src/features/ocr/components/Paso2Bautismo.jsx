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

export default function Paso2Bautismo() {
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

  // bautizado → rol 1 en backend (PersonaSacramento rol_sacramento_id = 1)
  // el backend busca en relaciones: relaciones.find(r => r.rol_sacramento_id === 1)
  const [bautizado, setBautizado] = useState(null);
  const [padrinos, setPadrinos] = useState([]);
  const [errorPersona, setErrorPersona] = useState('');

  const handleCampo = (field, value) => setCampos((prev) => ({ ...prev, [field]: value }));

  const agregarPadrino = () =>
    setPadrinos((prev) => [...prev, { persona: null, rol_sacramento_id: 5 }]);

  const setPadrinoPersona = (idx, persona) =>
    setPadrinos((prev) => prev.map((p, i) => (i === idx ? { ...p, persona } : p)));

  const removePadrino = (idx) =>
    setPadrinos((prev) => prev.filter((_, i) => i !== idx));

  const handleRechazar = () => {
    if (confirm('¿Seguro que deseas rechazar este registro OCR?')) {
      dispatch(rechazarOcr(historicoId));
    }
  };

  const handleConfirmar = () => {
    dispatch(clearError());
    setErrorPersona('');

    if (!bautizado) {
      setErrorPersona('Debes seleccionar o crear la persona bautizada.');
      return;
    }

    const fechaISO = parseFecha(campos.fecha_sacramento);
    if (!fechaISO) {
      setErrorPersona('La fecha de bautismo no es válida. Usa el formato dd/mm/aaaa.');
      return;
    }

    // rol 1 = bautizado (según backend: relaciones.find(r => r.rol_sacramento_id === 1))
    const relaciones = [{ rol_sacramento_id: 1, persona_id: bautizado.id_persona }];
    padrinos.forEach((p) => {
      if (p.persona?.id_persona) {
        relaciones.push({ rol_sacramento_id: p.rol_sacramento_id, persona_id: p.persona.id_persona });
      }
    });

    dispatch(
      confirmarOcr({
        historico_id: historicoId,
        fecha_sacramento: fechaISO,
        foja: campos.foja,
        numero: campos.numero,
        relaciones,
      })
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader icon="church" title="Bautismo — Revisión de datos" />

      <Section title="Datos del documento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre del bautizado">
            <input
              type="text"
              value={campos.nombre}
              onChange={(e) => handleCampo('nombre', e.target.value)}
              className={inputCls()}
            />
          </Field>
          <Field label="Fecha de bautismo">
            <input
              type="text"
              value={campos.fecha_sacramento}
              onChange={(e) => handleCampo('fecha_sacramento', e.target.value)}
              placeholder="dd/mm/aaaa"
              className={inputCls()}
            />
          </Field>
          <Field label="Foja">
            <input
              type="text"
              value={campos.foja}
              onChange={(e) => handleCampo('foja', e.target.value)}
              className={inputCls()}
            />
          </Field>
          <Field label="Número">
            <input
              type="text"
              value={campos.numero}
              onChange={(e) => handleCampo('numero', e.target.value)}
              className={inputCls()}
            />
          </Field>
          <Field label="Parroquia detectada">
            <input
              type="text"
              value={campos.parroquia}
              readOnly
              className={inputCls() + ' bg-gray-50 dark:bg-gray-800/60 cursor-default'}
            />
          </Field>
        </div>
      </Section>

      <Section title="Persona bautizada">
        <PersonaBuscador
          label="Buscar persona bautizada *"
          placeholder="Escribir nombre o CI (mín. 3 caracteres)..."
          initialQuery={campos.nombre}
          datosOcr={{
            nombre_completo: campos.nombre,
            fecha_nacimiento: datosDetectados?.fecha_nacimiento,
            lugar_nacimiento: datosDetectados?.lugar_nacimiento,
          }}
          rol="bautismo"
          tipo="sacramento"
          onSelect={(p) => { setBautizado(p); setErrorPersona(''); }}
          onClear={() => setBautizado(null)}
          personaSeleccionada={bautizado}
          error={!bautizado ? errorPersona : ''}
          permitirCrear={true}
        />
      </Section>

      <Section
        title="Padrinos / otras relaciones"
        action={
          <button
            onClick={agregarPadrino}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Agregar padrino
          </button>
        }
      >
        {padrinos.length === 0 && (
          <p className="text-xs text-gray-400">Sin padrinos u otras relaciones agregadas.</p>
        )}
        {padrinos.map((p, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1">
              <PersonaBuscador
                label={`Padrino ${idx + 1}`}
                placeholder="Buscar padrino..."
                datosOcr={{}}
                rol="bautismo"
                onSelect={(persona) => setPadrinoPersona(idx, persona)}
                onClear={() => setPadrinoPersona(idx, null)}
                personaSeleccionada={p.persona}
                permitirCrear={false}
              />
            </div>
            <button
              onClick={() => removePadrino(idx)}
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

function inputCls() {
  return 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors';
}
