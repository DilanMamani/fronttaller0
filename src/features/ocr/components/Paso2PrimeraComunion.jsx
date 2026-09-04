import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { rechazarOcr, confirmarOcr } from '../slices/ocrThunk';
import {
  selectOcrHistoricoId,
  selectOcrDatosDetectados,
  selectOcrIsConfirming,
  selectOcrIsRechazando,
  selectOcrError,
  clearError,
  setPaso,
} from '../slices/ocrSlice';
import PersonaBuscador from './PersonaBuscador';
import ParroquiaDetectadaField from './ParroquiaDetectadaField';
import { SectionHeader, Section, Field } from './FormPrimitives';
import { ic, parseFecha } from './formUtils';

/**
 * Roles adicionales para primera comunión
 * tipo=rol → padrino, madrina, ministro
 */
const ROLES_ADICIONALES_COMUNION = [
  { value: 'padrino',  label: 'Padrino',             rol_sacramento_id: 5 },
  { value: 'madrina',  label: 'Madrina',             rol_sacramento_id: 6 },
  { value: 'ministro', label: 'Ministro / Sacerdote', rol_sacramento_id: 9 },
];

const ADVERTENCIA_COMUNION =
  'La persona debe tener un bautismo registrado en el sistema para poder recibir la primera comunión.';

export default function Paso2PrimeraComunion() {
  const dispatch = useDispatch();
  const historicoId = useSelector(selectOcrHistoricoId);
  const datosDetectados = useSelector(selectOcrDatosDetectados);
  const isConfirming = useSelector(selectOcrIsConfirming);
  const isRechazando = useSelector(selectOcrIsRechazando);
  const errorGlobal = useSelector(selectOcrError);

  // Si el sistema marcó un campo como dudoso y propuso una corrección, el
  // campo arranca ya con esa corrección puesta — "· verificar" avisa que fue
  // así, pero sigue siendo editable.
  const conSugerencia = (campo) =>
    datosDetectados?._revision?.[campo]?.sugerencia || datosDetectados?.[campo] || '';

  const [campos, setCampos] = useState({
    nombre: conSugerencia('nombre'),
    fecha_sacramento: conSugerencia('fecha_sacramento'),
    foja: conSugerencia('foja'),
    numero: conSugerencia('numero'),
    parroquia: datosDetectados?.parroquia || '',
  });

  const [comulgado, setComulgado] = useState(null);
  const [relaciones, setRelaciones] = useState([]);
  const [errorPersona, setErrorPersona] = useState('');

  const confianza = datosDetectados?._confianza || {};
  const revision = datosDetectados?._revision || {};
  const esVacio = (campo) => confianza[campo] === false;
  const esDudoso = (campo) => !!revision[campo]?.dudoso;
  const necesitaRevision = (campo) => esVacio(campo) || esDudoso(campo);
  const motivoDe = (campo) => (esDudoso(campo) ? revision[campo]?.motivo : null);

  const handleCampo = (f, v) => setCampos((p) => ({ ...p, [f]: v }));

  const agregarRelacion = () =>
    setRelaciones((prev) => [
      ...prev,
      { rolKey: 'padrino', persona: null, rol_sacramento_id: 5 },
    ]);

  const updateRelacion = (idx, changes) =>
    setRelaciones((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));

  const removeRelacion = (idx) =>
    setRelaciones((prev) => prev.filter((_, i) => i !== idx));

  const handleRolChange = (idx, rolKey) => {
    const def = ROLES_ADICIONALES_COMUNION.find((r) => r.value === rolKey);
    updateRelacion(idx, { rolKey, rol_sacramento_id: def?.rol_sacramento_id ?? 5, persona: null });
  };

  const handleRechazar = async () => {
    const { isConfirmed } = await Swal.fire({
      icon: 'warning',
      title: '¿Rechazar este registro OCR?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });
    if (isConfirmed) dispatch(rechazarOcr(historicoId));
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

    // rol 4 = comulgado (backend: relaciones.find(r => r.rol_sacramento_id === 4))
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
      })
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader icon="volunteer_activism" title="Primera Comunión — Revisión de datos" />

      <Section title="Datos del documento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* El valor ya viene con la corrección aplicada cuando el sistema
              tenía una (ver conSugerencia) — "· verificar" avisa que fue así,
              pero el campo sigue siendo un texto libre editable por completo. */}
          <Field label="Nombre del comulgado" incierto={necesitaRevision('nombre')}
            motivo={motivoDe('nombre')}>
            <input type="text" value={campos.nombre}
              onChange={(e) => handleCampo('nombre', e.target.value)} className={ic(necesitaRevision('nombre'))} />
          </Field>
          <Field label="Fecha de la primera comunión" incierto={necesitaRevision('fecha_sacramento')}
            motivo={motivoDe('fecha_sacramento')}>
            <input type="text" value={campos.fecha_sacramento}
              onChange={(e) => handleCampo('fecha_sacramento', e.target.value)}
              placeholder="dd/mm/aaaa" className={ic(necesitaRevision('fecha_sacramento'))} />
          </Field>
          <Field label="Foja" incierto={necesitaRevision('foja')}
            motivo={motivoDe('foja')}>
            <input type="text" value={campos.foja}
              onChange={(e) => handleCampo('foja', e.target.value)} className={ic(necesitaRevision('foja'))} />
          </Field>
          <Field label="Número" incierto={necesitaRevision('numero')}
            motivo={motivoDe('numero')}>
            <input type="text" value={campos.numero}
              onChange={(e) => handleCampo('numero', e.target.value)} className={ic(necesitaRevision('numero'))} />
          </Field>
          <ParroquiaDetectadaField
            value={campos.parroquia}
            onChange={(v) => handleCampo('parroquia', v)}
            sugerencia={
              datosDetectados?.parroquia_sugerida_nombre
                ? { nombre: datosDetectados.parroquia_sugerida_nombre }
                : null
            }
            incierto={necesitaRevision('parroquia')}
          />
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
          rol="comunion"
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
        title="Padrino / Madrina / Ministro (opcional)"
        optional
        action={
          <button onClick={agregarRelacion}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
            <span className="material-symbols-outlined text-[15px]">add</span>
            Agregar
          </button>
        }
      >
        {relaciones.length === 0 && (
          <p className="text-xs text-gray-400">Sin relaciones adicionales.</p>
        )}
        {relaciones.map((r, idx) => (
          <div key={idx}
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-2">
              <Field label="Rol">
                <select value={r.rolKey} onChange={(e) => handleRolChange(idx, e.target.value)}
                  className={ic()}>
                  {ROLES_ADICIONALES_COMUNION.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Field>
              <button onClick={() => removeRelacion(idx)}
                className="mt-5 text-gray-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
            <PersonaBuscador
              key={r.rolKey}
              label={`Buscar ${ROLES_ADICIONALES_COMUNION.find(x => x.value === r.rolKey)?.label ?? 'persona'}`}
              datosOcr={{}}
              rol={r.rolKey}
              tipo="rol"
              onSelect={(p) => updateRelacion(idx, { persona: p })}
              onClear={() => updateRelacion(idx, { persona: null })}
              personaSeleccionada={r.persona}
              permitirCrear={false}
            />
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
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => dispatch(setPaso(3))}
            className="px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Atrás
          </button>
          <button onClick={handleRechazar} disabled={isRechazando}
            className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition-colors flex items-center gap-2">
            {isRechazando && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
            Rechazar
          </button>
        </div>
        <button onClick={handleConfirmar} disabled={isConfirming}
          className="px-5 py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2">
          {isConfirming && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
          Confirmar sacramento
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
