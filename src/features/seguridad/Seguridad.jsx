import { useEffect, useState } from 'react';
import Layout from '../../shared/components/layout/Layout';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchConfiguracionSeguridad,
  updateConfiguracionSeguridad,
} from './slices/configuracionSeguridadThunk';

import {
  selectConfigSeguridad,
  selectConfigSeguridadLoading,
  selectConfigSeguridadUpdating,
} from './slices/configuracionSeguridadSlice';

export default function ConfiguracionSeguridad() {
  const dispatch = useDispatch();

  const config = useSelector(selectConfigSeguridad);
  const isLoading = useSelector(selectConfigSeguridadLoading);
  const isUpdating = useSelector(selectConfigSeguridadUpdating);

  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchConfiguracionSeguridad());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setForm({
        longitud_minima: config.longitud_minima ?? 8,
        longitud_maxima: config.longitud_maxima ?? 64,
        requiere_mayuscula: !!config.requiere_mayuscula,
        requiere_minuscula: !!config.requiere_minuscula,
        requiere_numero: !!config.requiere_numero,
        requiere_caracter_especial: !!config.requiere_caracter_especial,
        max_intentos_fallidos: config.max_intentos_fallidos ?? 5,
        tiempo_bloqueo_minutos: config.tiempo_bloqueo_minutos ?? 15,
        historial_passwords: config.historial_passwords ?? 5,
        vida_util_password_dias: config.vida_util_password_dias ?? 90,
        permite_reutilizacion: !!config.permite_reutilizacion,
        usa_2fa: !!config.usa_2fa,
        usa_captcha: !!config.usa_captcha,
        activo: !!config.activo,
      });
    }
  }, [config]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === '' ? '' : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!config?.id_config) {
      setToast({
        type: 'error',
        message: 'No se encontró el ID de la configuración.',
      });
      return;
    }

    if (form.longitud_minima < 6) {
      setToast({
        type: 'error',
        message: 'La longitud mínima debe ser al menos 6.',
      });
      return;
    }

    if (form.longitud_maxima < form.longitud_minima) {
      setToast({
        type: 'error',
        message: 'La longitud máxima no puede ser menor a la mínima.',
      });
      return;
    }

    const action = await dispatch(
      updateConfiguracionSeguridad({
        data: form,
      })
    );

    if (action.meta.requestStatus === 'fulfilled') {
      setToast({
        type: 'success',
        message: 'Configuración actualizada correctamente.',
      });
      dispatch(fetchConfiguracionSeguridad());
    } else {
      setToast({
        type: 'error',
        message: 'No se pudo actualizar la configuración.',
      });
    }
  };

  if (isLoading || !form) {
    return (
      <Layout title="Configuración de Seguridad">
        <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
          Cargando configuración...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Configuración de Seguridad">
      <div className="space-y-8">
        <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Políticas de Seguridad
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Configure las reglas de contraseñas, bloqueo de cuentas, autenticación de dos pasos y captcha.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reglas de contraseña
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput
                  label="Longitud mínima"
                  value={form.longitud_minima}
                  onChange={(v) => handleNumberChange('longitud_minima', v)}
                />

                <NumberInput
                  label="Longitud máxima"
                  value={form.longitud_maxima}
                  onChange={(v) => handleNumberChange('longitud_maxima', v)}
                />

                <SwitchInput
                  label="Requiere mayúscula"
                  checked={form.requiere_mayuscula}
                  onChange={(v) => handleChange('requiere_mayuscula', v)}
                />

                <SwitchInput
                  label="Requiere minúscula"
                  checked={form.requiere_minuscula}
                  onChange={(v) => handleChange('requiere_minuscula', v)}
                />

                <SwitchInput
                  label="Requiere número"
                  checked={form.requiere_numero}
                  onChange={(v) => handleChange('requiere_numero', v)}
                />

                <SwitchInput
                  label="Requiere carácter especial"
                  checked={form.requiere_caracter_especial}
                  onChange={(v) => handleChange('requiere_caracter_especial', v)}
                />

                <NumberInput
                  label="Contraseñas anteriores a recordar"
                  value={form.historial_passwords}
                  onChange={(v) => handleNumberChange('historial_passwords', v)}
                />

                <NumberInput
                  label="Vida útil de contraseña (días)"
                  value={form.vida_util_password_dias}
                  onChange={(v) => handleNumberChange('vida_util_password_dias', v)}
                />

                <SwitchInput
                  label="Permitir reutilización de contraseñas"
                  checked={form.permite_reutilizacion}
                  onChange={(v) => handleChange('permite_reutilizacion', v)}
                />
              </div>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bloqueo de cuenta
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput
                  label="Máximo de intentos fallidos"
                  value={form.max_intentos_fallidos}
                  onChange={(v) => handleNumberChange('max_intentos_fallidos', v)}
                />

                <NumberInput
                  label="Tiempo de bloqueo (minutos)"
                  value={form.tiempo_bloqueo_minutos}
                  onChange={(v) => handleNumberChange('tiempo_bloqueo_minutos', v)}
                />
              </div>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Verificación adicional
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SwitchInput
                  label="Usar autenticación de dos pasos (2FA)"
                  checked={form.usa_2fa}
                  onChange={(v) => handleChange('usa_2fa', v)}
                />

                <SwitchInput
                  label="Usar captcha"
                  checked={form.usa_captcha}
                  onChange={(v) => handleChange('usa_captcha', v)}
                />

                <SwitchInput
                  label="Configuración activa"
                  checked={form.activo}
                  onChange={(v) => handleChange('activo', v)}
                />
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => dispatch(fetchConfiguracionSeguridad())}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar cambios
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdating ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg px-4 py-3 text-white ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </Layout>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
      />
    </div>
  );
}

function SwitchInput({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-background-light dark:bg-gray-800/40">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}