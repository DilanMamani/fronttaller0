import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import FormFields from '../pages/FormFields';

const STYLES = `
  @keyframes eem-backdrop-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes eem-panel-in {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes eem-panel-out {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to { opacity: 0; transform: scale(0.96) translateY(10px); }
  }

  .eem-backdrop {
    animation: eem-backdrop-in 180ms ease forwards;
  }

  .eem-panel {
    animation: eem-panel-in 220ms ease forwards;
  }

  .eem-panel.closing {
    animation: eem-panel-out 160ms ease forwards;
  }
`;

function EditEntityModal({
  title = 'Editar registro',
  entity = {},
  fields = [],
  onSave,
  onClose,
  isSaving = false,
  loading = false,
  confirmText = 'Guardar Cambios',
  cancelText = 'Cancelar',
  maxWidth = 900,
}) {
  const [formData, setFormData] = useState({ ...entity });
  const [closing, setClosing] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);

  useEffect(() => {
    setFormData({ ...entity });
  }, [entity]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 160);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  const handleSave = async () => {
    if (!onSave || loading) return;

    try {
      setLocalSaving(true);

      const saved = await onSave(formData);

      if (saved === true) {
        handleClose();
      }
    } finally {
      setLocalSaving(false);
    }
  };

  const saving = isSaving || localSaving;

  return createPortal(
    <div
      className="eem-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`eem-panel ${closing ? 'closing' : ''} w-full bg-white dark:bg-background-dark rounded-2xl shadow-2xl overflow-hidden`}
        style={{ maxWidth }}
      >
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading
                ? 'Estamos cargando la información del registro.'
                : 'Modifique los campos necesarios y guarde los cambios.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined animate-spin text-4xl mb-3">
                progress_activity
              </span>
              <p className="text-sm font-medium">Cargando datos...</p>
            </div>
          ) : (
            <FormFields
              fields={fields}
              values={formData}
              setValues={setFormData}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className={`px-6 py-2.5 rounded-lg text-white font-semibold ${
              saving || loading
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {saving ? 'Guardando...' : confirmText}
          </button>
        </div>
      </div>

      <style>{STYLES}</style>
    </div>,
    document.body
  );
}

export function useEditEntityModal() {
  const [modalState, setModalState] = useState(null);

  const open = useCallback((config) => {
    setModalState(config);
  }, []);

  const close = useCallback(() => {
    setModalState(null);
  }, []);

  const modal = modalState ? (
    <EditEntityModal {...modalState} onClose={close} />
  ) : null;

  return { open, close, modal };
}