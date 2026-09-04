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
 * Roles adicionales para matrimonio
 * tipo=rol → testigo, ministro
 */
const ROLES_ADICIONALES_MATRIMONIO = [
  { value: 'testigo',  label: 'Testigo',             rol_sacramento_id: 6 },
  { value: 'ministro', label: 'Ministro / Sacerdote', rol_sacramento_id: 9 },
  { value: 'padrino',  label: 'Padrino',             rol_sacramento_id: 5 },
];

const ADV_MATRIMONIO =
  'Esta persona debe tener bautismo y primera comunión registrados en el sistema.';

export default function Paso2Matrimonio() {
  const dispatch = useDispatch();
  const historicoId = useSelector(selectOcrHistoricoId);
  const dd = useSelector(selectOcrDatosDetectados);
  const isConfirming = useSelector(selectOcrIsConfirming);
  const isRechazando = useSelector(selectOcrIsRechazando);
  const errorGlobal = useSelector(selectOcrError);

  // Si el sistema marcó un campo como dudoso y propuso una corrección, el
  // campo arranca ya con esa corrección puesta — "· verificar" avisa que fue
  // así, pero sigue siendo editable.
  const conSugerencia = (campo) => dd?._revision?.[campo]?.sugerencia || dd?.[campo] || '';

  const [campos, setCampos] = useState({
    fecha_sacramento:    conSugerencia('fecha_sacramento'),
    foja:               conSugerencia('foja'),
    numero:             conSugerencia('numero'),
    parroquia:          dd?.parroquia          || '',
    nombre_contrayente: conSugerencia('nombre_contrayente'),
    nombre_contrayenta: conSugerencia('nombre_contrayenta'),
    lugar_ceremonia:    conSugerencia('lugar_ceremonia'),
    reg_civil:          conSugerencia('reg_civil'),
    numero_acta:        conSugerencia('numero_acta'),
  });

  const [contrayente, setContrayente] = useState(null);
  const [contrayenta, setContrayenta] = useState(null);
  const [relaciones, setRelaciones] = useState([]);
  const [errores, setErrores] = useState({});

  const confianza = dd?._confianza || {};
  const revision = dd?._revision || {};
  const esVacio = (campo) => confianza[campo] === false;
  const esDudoso = (campo) => !!revision[campo]?.dudoso;
  const necesitaRevision = (campo) => esVacio(campo) || esDudoso(campo);
  const motivoDe = (campo) => (esDudoso(campo) ? revision[campo]?.motivo : null);

  const handleCampo = (f, v) => setCampos((p) => ({ ...p, [f]: v }));

  const agregarRelacion = () =>
    setRelaciones((prev) => [
      ...prev,
      { rolKey: 'testigo', persona: null, rol_sacramento_id: 6 },
    ]);

  const updateRelacion = (idx, changes) =>
    setRelaciones((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));

  const removeRelacion = (idx) =>
    setRelaciones((prev) => prev.filter((_, i) => i !== idx));

  const handleRolChange = (idx, rolKey) => {
    const def = ROLES_ADICIONALES_MATRIMONIO.find((r) => r.value === rolKey);
    updateRelacion(idx, { rolKey, rol_sacramento_id: def?.rol_sacramento_id ?? 6, persona: null });
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
    const newErrors = {};
    if (!contrayente) newErrors.contrayente = 'Selecciona el contrayente (él).';
    if (!contrayenta) newErrors.contrayenta = 'Selecciona la contrayenta (ella).';
    if (Object.keys(newErrors).length) { setErrores(newErrors); return; }

    const fechaISO = parseFecha(campos.fecha_sacramento);
    if (!fechaISO) {
      setErrores({ general: 'La fecha del matrimonio no es válida. Usa dd/mm/aaaa.' });
      return;
    }

    setErrores({});

    const rels = relaciones
      .filter((r) => r.persona?.id_persona)
      .map((r) => ({ rol_sacramento_id: r.rol_sacramento_id, persona_id: r.persona.id_persona }));

    // El backend busca por nombre_completo en novio_1 y novio_2
    const nombreFull = (p) =>
      p ? [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') : '';

    dispatch(
      confirmarOcr({
        historico_id: historicoId,
        fecha_sacramento: fechaISO,
        foja: campos.foja,
        numero: campos.numero,
        novio_1: { nombre_completo: nombreFull(contrayente), persona_id: contrayente.id_persona },
        novio_2: { nombre_completo: nombreFull(contrayenta), persona_id: contrayenta.id_persona },
        relaciones: rels,
      })
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader icon="favorite" title="Matrimonio — Revisión de datos" />

      {/* ── Datos del documento ── */}
      <Section title="Datos del documento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* El valor ya viene con la corrección aplicada cuando el sistema
              tenía una (ver conSugerencia) — "· verificar" avisa que fue así,
              pero el campo sigue siendo un texto libre editable por completo. */}
          <Field label="Fecha del matrimonio" incierto={necesitaRevision('fecha_sacramento')}
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
              dd?.parroquia_sugerida_nombre
                ? { nombre: dd.parroquia_sugerida_nombre }
                : null
            }
            incierto={necesitaRevision('parroquia')}
          />
          <Field label="Nombre del contrayente (él)" incierto={necesitaRevision('nombre_contrayente')}
            motivo={motivoDe('nombre_contrayente')}>
            <input type="text" value={campos.nombre_contrayente}
              onChange={(e) => handleCampo('nombre_contrayente', e.target.value)} className={ic(necesitaRevision('nombre_contrayente'))} />
          </Field>
          <Field label="Nombre de la contrayenta (ella)" incierto={necesitaRevision('nombre_contrayenta')}
            motivo={motivoDe('nombre_contrayenta')}>
            <input type="text" value={campos.nombre_contrayenta}
              onChange={(e) => handleCampo('nombre_contrayenta', e.target.value)} className={ic(necesitaRevision('nombre_contrayenta'))} />
          </Field>
          <Field label="Lugar de la ceremonia" incierto={necesitaRevision('lugar_ceremonia')}
            motivo={motivoDe('lugar_ceremonia')}>
            <input type="text" value={campos.lugar_ceremonia}
              onChange={(e) => handleCampo('lugar_ceremonia', e.target.value)} className={ic(necesitaRevision('lugar_ceremonia'))} />
          </Field>
          <Field label="Registro civil" incierto={necesitaRevision('reg_civil')}
            motivo={motivoDe('reg_civil')}>
            <input type="text" value={campos.reg_civil}
              onChange={(e) => handleCampo('reg_civil', e.target.value)} className={ic(necesitaRevision('reg_civil'))} />
          </Field>
          <Field label="Número de acta" incierto={necesitaRevision('numero_acta')}
            motivo={motivoDe('numero_acta')}>
            <input type="text" value={campos.numero_acta}
              onChange={(e) => handleCampo('numero_acta', e.target.value)} className={ic(necesitaRevision('numero_acta'))} />
          </Field>
        </div>
      </Section>

      {/* ── Contrayente ── */}
      <Section title="Contrayente (él)">
        <PersonaBuscador
          label="Buscar contrayente *"
          placeholder="Nombre o CI..."
          initialQuery={campos.nombre_contrayente}
          datosOcr={{ nombre_completo: campos.nombre_contrayente }}
          rol="matrimonio"
          tipo="sacramento"
          onSelect={(p) => { setContrayente(p); setErrores((e) => ({ ...e, contrayente: '' })); }}
          onClear={() => setContrayente(null)}
          personaSeleccionada={contrayente}
          advertencia={ADV_MATRIMONIO}
          error={errores.contrayente}
          permitirCrear={false}
        />
      </Section>

      {/* ── Contrayenta ── */}
      <Section title="Contrayenta (ella)">
        <PersonaBuscador
          label="Buscar contrayenta *"
          placeholder="Nombre o CI..."
          initialQuery={campos.nombre_contrayenta}
          datosOcr={{ nombre_completo: campos.nombre_contrayenta }}
          rol="matrimonio"
          tipo="sacramento"
          onSelect={(p) => { setContrayenta(p); setErrores((e) => ({ ...e, contrayenta: '' })); }}
          onClear={() => setContrayenta(null)}
          personaSeleccionada={contrayenta}
          advertencia={ADV_MATRIMONIO}
          error={errores.contrayenta}
          permitirCrear={false}
        />
      </Section>

      {/* ── Relaciones adicionales ── */}
      <Section
        title="Testigos / Ministro / Padrinos (opcional)"
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
          <p className="text-xs text-gray-400">
            Sin relaciones adicionales. Puedes agregar testigos o el ministro celebrante.
          </p>
        )}
        {relaciones.map((r, idx) => (
          <div key={idx}
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-2">
              <Field label="Rol">
                <select value={r.rolKey} onChange={(e) => handleRolChange(idx, e.target.value)}
                  className={ic()}>
                  {ROLES_ADICIONALES_MATRIMONIO.map((opt) => (
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
              label={`Buscar ${ROLES_ADICIONALES_MATRIMONIO.find(x => x.value === r.rolKey)?.label ?? 'persona'}`}
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

      {/* Errores generales */}
      {(errores.general || errorGlobal) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-800 rounded-lg">
          <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
          <p className="text-sm text-red-700 dark:text-red-400">{errores.general || errorGlobal}</p>
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
