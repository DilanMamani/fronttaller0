import { createPortal } from 'react-dom';
import { useEffect, useState, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import CamposComunes from './CamposComunes';

const STYLES = `
  @keyframes sem-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sem-panel-in {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
  }
  @keyframes sem-panel-out {
    from { opacity: 1; transform: scale(1)    translateY(0);    }
    to   { opacity: 0; transform: scale(0.96) translateY(10px); }
  }
  .sem-backdrop { animation: sem-backdrop-in  180ms ease forwards; }
  .sem-panel    { animation: sem-panel-in     220ms ease forwards; }
  .sem-panel.closing { animation: sem-panel-out 160ms ease forwards; }
`;

/**
 * SacramentoEditModal
 *
 * Misma estructura visual que EditEntityModal pero con los campos
 * específicos del sacramento: persona (solo lectura), padrino,
 * ministro, parroquia, foja, número, fecha, activo y —si es
 * matrimonio— esposo, esposa y detalles.
 */
export default function SacramentoEditModal({ ctx, onClose }) {
  const {
    tipoSacramento,
    editForm: form, editMatrimonio: matrimonio,
    handleEditChange: handleChange, handleEditMatChange: handleMatChange,
    isUpdating, forceUpdateLoading,
    handleGuardarEdicion,

    editQueryPersona: queryPersona,
    editQueryPadrino: queryPadrino,     setEditQueryPadrino: setQueryPadrino,     editPadrinoSelected: padrinoSelected,     setEditPadrinoSelected: setPadrinoSelected,     editPadrinoSearch: padrinoSearch,
    editQueryMadrina: queryMadrina,     setEditQueryMadrina: setQueryMadrina,     editMadrinaSelected: madrinaSelected,     setEditMadrinaSelected: setMadrinaSelected,     editMadrinaSearch: madrinaSearch,
    editQueryMinistro: queryMinistro,   setEditQueryMinistro: setQueryMinistro,   editMinistroSelected: ministroSelected,   setEditMinistroSelected: setMinistroSelected,   editMinistroSearch: ministroSearch,
    editQueryParroquia: queryParroquia, setEditQueryParroquia: setQueryParroquia, editParroquiaSelected: parroquiaSelected, setEditParroquiaSelected: setParroquiaSelected, editParroquiaSearch: parroquiaSearch,
    editQueryEsposo: queryEsposo,
    editQueryEsposa: queryEsposa,
  } = ctx;

  const [closing, setClosing] = useState(false);
  const isBusy = isUpdating || forceUpdateLoading;

  const nombreCompleto = (p) =>
    `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`;

  const handleClose = useCallback(() => {
    if (isBusy) return;
    setClosing(true);
    setTimeout(onClose, 160);
  }, [isBusy, onClose]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  // Wrapper que adapta el submit del form al contrato del modal
  const handleSubmit = (e) => {
    e.preventDefault();
    handleGuardarEdicion(e);
  };

  return createPortal(
    <div
      className="sem-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`sem-panel ${closing ? 'closing' : ''} w-full bg-white dark:bg-background-dark rounded-2xl shadow-2xl overflow-hidden`}
        style={{ maxWidth: 860 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Editar Sacramento
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Modifique los campos necesarios y guarde los cambios.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form
          id="sacramento-edit-form"
          onSubmit={handleSubmit}
          className="px-6 py-6 max-h-[65vh] overflow-y-auto space-y-6"
        >
          {/* Persona (solo lectura) — oculto en matrimonio porque ya aparece como esposo/esposa */}
          {tipoSacramento !== 'matrimonio' && (
            <section>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Persona que recibió el Sacramento
              </h4>
              <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-700 dark:text-gray-300">
                {queryPersona || '—'}
              </div>
            </section>
          )}

          {/* Detalles de matrimonio */}
          {tipoSacramento === 'matrimonio' && (
            <section>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Detalles del Matrimonio
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Esposo (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Esposo
                  </label>
                  <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-600 dark:text-gray-300">
                    {queryEsposo || '—'}
                  </div>
                </div>

                {/* Esposa (solo lectura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Esposa
                  </label>
                  <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-600 dark:text-gray-300">
                    {queryEsposa || '—'}
                  </div>
                </div>

                {/* Campos editables del matrimonio */}
                {[
                  { key: 'lugar_ceremonia', label: 'Lugar de la ceremonia' },
                  { key: 'reg_civil',       label: 'Registro civil'        },
                  { key: 'numero_acta',     label: 'Número de acta'        },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={matrimonio[key]}
                      onChange={(e) => handleMatChange(key, e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Padrino, Ministro, Parroquia, Foja, Número, Fecha */}
          <CamposComunes
            form={form}
            onFormChange={handleChange}
            modoEdicion

            queryPadrino={queryPadrino}     setQueryPadrino={setQueryPadrino}
            padrinoSelected={padrinoSelected} setPadrinoSelected={setPadrinoSelected}
            padrinoSearch={padrinoSearch}
            onSelectPadrino={(p) => {
              handleChange('padrinoId', p.id_persona);
              setQueryPadrino(nombreCompleto(p));
              setPadrinoSelected(true);
              padrinoSearch.setOpen(false);
            }}

            queryMadrina={queryMadrina}     setQueryMadrina={setQueryMadrina}
            madrinaSelected={madrinaSelected} setMadrinaSelected={setMadrinaSelected}
            madrinaSearch={madrinaSearch}
            onSelectMadrina={(p) => {
              handleChange('madrinaId', p.id_persona);
              setQueryMadrina(nombreCompleto(p));
              setMadrinaSelected(true);
              madrinaSearch.setOpen(false);
            }}

            queryMinistro={queryMinistro}     setQueryMinistro={setQueryMinistro}
            ministroSelected={ministroSelected} setMinistroSelected={setMinistroSelected}
            ministroSearch={ministroSearch}
            onSelectMinistro={(p) => {
              handleChange('ministroId', p.id_persona);
              setQueryMinistro(nombreCompleto(p));
              setMinistroSelected(true);
              ministroSearch.setOpen(false);
            }}

            queryParroquia={queryParroquia}     setQueryParroquia={setQueryParroquia}
            parroquiaSelected={parroquiaSelected} setParroquiaSelected={setParroquiaSelected}
            parroquiaSearch={parroquiaSearch}
            onSelectParroquia={(p) => {
              handleChange('parroquiaId', p.id_parroquia);
              setQueryParroquia(p.nombre);
              setParroquiaSelected(true);
              parroquiaSearch.setOpen(false);
            }}
          />

          {/* Activo — toggle pill */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado del registro</span>
            <button
              type="button"
              onClick={() => handleChange('activo', !form.activo)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                form.activo
                  ? 'bg-emerald-500 border-emerald-500 focus:ring-emerald-400'
                  : 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600 focus:ring-gray-400'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  form.activo ? 'translate-x-7' : 'translate-x-0.5'
                } mt-px`}
              />
            </button>
            <span className={`text-sm font-semibold ${form.activo ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {form.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="sacramento-edit-form"
            disabled={isBusy}
            className={`px-6 py-2.5 rounded-lg text-white font-semibold flex items-center gap-2 ${
              isBusy ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isBusy && <ClipLoader size={16} color="#ffffff" />}
            {isBusy ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <style>{STYLES}</style>
    </div>,
    document.body
  );
}