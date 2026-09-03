import SearchField from './SearchField';
import CamposComunes from './CamposComunes';
import Toast from '../ui/Toast';

/**
 * FormAgregar — formulario de alta de sacramento.
 * Recibe todo lo necesario del hook useSacramentos vía props.
 */
export default function FormAgregar({ ctx }) {
  const {
    tipoSacramento,
    form, matrimonio,
    handleChange, handleMatChange,
    resetForm,
    handleSubmitAgregar,

    // Persona
    queryPersona, setQueryPersona,
    personaSelected, setPersonaSelected,
    personaSearch,

    // Padrino
    queryPadrino, setQueryPadrino,
    padrinoSelected, setPadrinoSelected,
    padrinoSearch,

    // Madrina
    queryMadrina, setQueryMadrina,
    madrinaSelected, setMadrinaSelected,
    madrinaSearch,

    // Ministro
    queryMinistro, setQueryMinistro,
    ministroSelected, setMinistroSelected,
    ministroSearch,

    // Parroquia
    queryParroquia, setQueryParroquia,
    parroquiaSelected, setParroquiaSelected,
    parroquiaSearch,

    // Matrimonio
    queryEsposo, setQueryEsposo, esposoSearch,
    queryEsposa, setQueryEsposa, esposaSearch,
  } = ctx;

  const LABELS_TIPO = {
    bautizo: 'Bautizo',
    comunion: 'Primera Comunión',
    confirmacion: 'Confirmación',
    matrimonio: 'Matrimonio',
  };
  const labelTipo = LABELS_TIPO[tipoSacramento]
    || tipoSacramento.charAt(0).toUpperCase() + tipoSacramento.slice(1);

  // Helpers de selección reutilizables
  const nombreCompleto = (p) => `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`;

  // ---------------------------------------------------------------------------
  // Validación — todos los campos obligatorios según tipo
  // ---------------------------------------------------------------------------
  // Padrino y madrina son opcionales — no bloquean el envío del formulario
  const camposBase = form.parroquiaId && form.ministroId &&
    form.foja?.trim() && form.numero?.trim() && form.fecha_sacramento;

  const isFormValid = (() => {
    if (tipoSacramento !== 'matrimonio') {
      return !!(form.personaId && camposBase);
    }
    if (tipoSacramento === 'matrimonio') {
      return !!(
        matrimonio.esposoId &&
        matrimonio.esposaId &&
        matrimonio.lugar_ceremonia?.trim() &&
        matrimonio.reg_civil?.trim() &&
        matrimonio.numero_acta?.trim() &&
        camposBase
      );
    }
    return false;
  })();

  // Campos faltantes para mostrar en el tooltip
  const camposFaltantes = (() => {
    const faltantes = [];
    if (tipoSacramento !== 'matrimonio') {
      if (!form.personaId)        faltantes.push('Persona');
    }
    if (tipoSacramento === 'matrimonio') {
      if (!matrimonio.esposoId)               faltantes.push('Esposo');
      if (!matrimonio.esposaId)               faltantes.push('Esposa');
      if (!matrimonio.lugar_ceremonia?.trim()) faltantes.push('Lugar de ceremonia');
      if (!matrimonio.reg_civil?.trim())       faltantes.push('Acta del registro civil');
      if (!matrimonio.numero_acta?.trim())     faltantes.push('Número de acta');
    }
    if (!form.ministroId)         faltantes.push('Ministro');
    if (!form.parroquiaId)        faltantes.push('Parroquia');
    if (!form.foja?.trim())       faltantes.push('Foja');
    if (!form.numero?.trim())     faltantes.push('Número');
    if (!form.fecha_sacramento)   faltantes.push('Fecha del Sacramento');
    return faltantes;
  })();

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos del Sacramento</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{labelTipo}</span>
      </div>

      <form className="p-6 space-y-8" onSubmit={handleSubmitAgregar}>

        {/* ── Persona principal (Bautizo / Comunión / Confirmación) ── */}
        {tipoSacramento !== 'matrimonio' && (
          <section>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Persona que recibió el {labelTipo}
            </h4>
            <SearchField
              label="Persona"
              placeholder="Buscar persona por nombre o CI"
              value={queryPersona}
              onChange={(v) => {
                setQueryPersona(v);
                setPersonaSelected(false);
              }}
              onSelect={(p) => {
                handleChange('personaId', p.id_persona);
                setQueryPersona(nombreCompleto(p));
                setPersonaSelected(true);
                personaSearch.setOpen(false);
              }}
              items={personaSearch.lista}
              loading={personaSearch.loading}
              open={personaSearch.open}
              selected={personaSelected}
              getKey={(p) => p.id_persona}
              getTitle={nombreCompleto}
              getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
              emptyMessage="No se encontraron personas con ese valor."
              helpText="Busque la persona registrada que recibió el sacramento."
            />
          </section>
        )}

        {/* ── Detalles Bautizo / Comunión / Confirmación ── */}
        {tipoSacramento !== 'matrimonio' && (
          <section>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Detalles de {labelTipo}
            </h4>
            <CamposComunes
              form={form}
              onFormChange={handleChange}
              queryPadrino={queryPadrino} setQueryPadrino={setQueryPadrino}
              padrinoSelected={padrinoSelected} setPadrinoSelected={setPadrinoSelected}
              padrinoSearch={padrinoSearch}
              onSelectPadrino={(p) => {
                handleChange('padrinoId', p.id_persona);
                setQueryPadrino(nombreCompleto(p));
                setPadrinoSelected(true);
                padrinoSearch.setOpen(false);
              }}
              queryMadrina={queryMadrina} setQueryMadrina={setQueryMadrina}
              madrinaSelected={madrinaSelected} setMadrinaSelected={setMadrinaSelected}
              madrinaSearch={madrinaSearch}
              onSelectMadrina={(p) => {
                handleChange('madrinaId', p.id_persona);
                setQueryMadrina(nombreCompleto(p));
                setMadrinaSelected(true);
                madrinaSearch.setOpen(false);
              }}
              queryMinistro={queryMinistro} setQueryMinistro={setQueryMinistro}
              ministroSelected={ministroSelected} setMinistroSelected={setMinistroSelected}
              ministroSearch={ministroSearch}
              onSelectMinistro={(p) => {
                handleChange('ministroId', p.id_persona);
                setQueryMinistro(nombreCompleto(p));
                setMinistroSelected(true);
                ministroSearch.setOpen(false);
              }}
              queryParroquia={queryParroquia} setQueryParroquia={setQueryParroquia}
              parroquiaSelected={parroquiaSelected} setParroquiaSelected={setParroquiaSelected}
              parroquiaSearch={parroquiaSearch}
              onSelectParroquia={(p) => {
                handleChange('parroquiaId', p.id_parroquia);
                setQueryParroquia(p.nombre);
                setParroquiaSelected(true);
                parroquiaSearch.setOpen(false);
              }}
            />
          </section>
        )}

        {/* ── Matrimonio ── */}
        {tipoSacramento === 'matrimonio' && (
          <section>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Detalles del Matrimonio
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Esposo */}
              <SearchField
                label="Esposo"
                placeholder="Buscar esposo por nombre o CI"
                value={queryEsposo}
                onChange={(v) => {
                  setQueryEsposo(v);
                  esposoSearch.setOpen(true);
                }}
                onSelect={(p) => {
                  handleMatChange('esposoId', p.id_persona);
                  setQueryEsposo(nombreCompleto(p));
                  esposoSearch.setOpen(false);
                }}
                items={esposoSearch.lista}
                loading={esposoSearch.loading}
                open={esposoSearch.open}
                selected={false}
                getKey={(p) => p.id_persona}
                getTitle={nombreCompleto}
                getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
                helpText="Busque la persona registrada que se casó."
              />

              {/* Esposa */}
              <SearchField
                label="Esposa"
                placeholder="Buscar esposa por nombre o CI"
                value={queryEsposa}
                onChange={(v) => {
                  setQueryEsposa(v);
                  esposaSearch.setOpen(true);
                }}
                onSelect={(p) => {
                  handleMatChange('esposaId', p.id_persona);
                  setQueryEsposa(nombreCompleto(p));
                  esposaSearch.setOpen(false);
                }}
                items={esposaSearch.lista}
                loading={esposaSearch.loading}
                open={esposaSearch.open}
                selected={false}
                getKey={(p) => p.id_persona}
                getTitle={nombreCompleto}
                getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
                helpText="Busque la persona registrada que se casó."
              />

              {/* Lugar de ceremonia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lugar de la Ceremonia
                </label>
                <input
                  type="text"
                  placeholder="Lugar donde se realizó el matrimonio"
                  value={matrimonio.lugar_ceremonia}
                  onChange={(e) => handleMatChange('lugar_ceremonia', e.target.value)}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>

              {/* Acta registro civil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acta del Registro Civil
                </label>
                <input
                  type="text"
                  placeholder="Ej. 123/2025 - Oficialía X"
                  value={matrimonio.reg_civil}
                  onChange={(e) => handleMatChange('reg_civil', e.target.value)}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>

              {/* Número de acta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Acta
                </label>
                <input
                  type="text"
                  placeholder="Ej. 0456 / Libro 23"
                  value={matrimonio.numero_acta}
                  onChange={(e) => handleMatChange('numero_acta', e.target.value)}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
            </div>

            {/* Padrino / Ministro / Parroquia / Foja / Número / Fecha del matrimonio */}
            <div className="mt-6">
              <CamposComunes
                form={form}
                onFormChange={handleChange}
                queryPadrino={queryPadrino} setQueryPadrino={setQueryPadrino}
                padrinoSelected={padrinoSelected} setPadrinoSelected={setPadrinoSelected}
                padrinoSearch={padrinoSearch}
                onSelectPadrino={(p) => {
                  handleChange('padrinoId', p.id_persona);
                  setQueryPadrino(nombreCompleto(p));
                  setPadrinoSelected(true);
                  padrinoSearch.setOpen(false);
                }}
                queryMadrina={queryMadrina} setQueryMadrina={setQueryMadrina}
                madrinaSelected={madrinaSelected} setMadrinaSelected={setMadrinaSelected}
                madrinaSearch={madrinaSearch}
                onSelectMadrina={(p) => {
                  handleChange('madrinaId', p.id_persona);
                  setQueryMadrina(nombreCompleto(p));
                  setMadrinaSelected(true);
                  madrinaSearch.setOpen(false);
                }}
                queryMinistro={queryMinistro} setQueryMinistro={setQueryMinistro}
                ministroSelected={ministroSelected} setMinistroSelected={setMinistroSelected}
                ministroSearch={ministroSearch}
                onSelectMinistro={(p) => {
                  handleChange('ministroId', p.id_persona);
                  setQueryMinistro(nombreCompleto(p));
                  setMinistroSelected(true);
                  ministroSearch.setOpen(false);
                }}
                queryParroquia={queryParroquia} setQueryParroquia={setQueryParroquia}
                parroquiaSelected={parroquiaSelected} setParroquiaSelected={setParroquiaSelected}
                parroquiaSearch={parroquiaSearch}
                onSelectParroquia={(p) => {
                  handleChange('parroquiaId', p.id_parroquia);
                  setQueryParroquia(p.nombre);
                  setParroquiaSelected(true);
                  parroquiaSearch.setOpen(false);
                }}
              />
            </div>
          </section>
        )}

        {/* Botones */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative group">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                isFormValid
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-primary/40 cursor-not-allowed'
              }`}
            >
              Registrar Sacramento
            </button>

            {/* Tooltip con campos faltantes */}
            {!isFormValid && camposFaltantes.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-56">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                  <p className="font-semibold mb-1">Campos requeridos:</p>
                  <ul className="space-y-0.5">
                    {camposFaltantes.map((c) => (
                      <li key={c} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                  {/* Flecha del tooltip */}
                  <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}