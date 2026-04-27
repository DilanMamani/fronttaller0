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
import {
  fetchDominiosPermitidos,
  createDominioPermitido,
  updateDominioPermitido,
  deleteDominioPermitido,
} from './slicesDominio/dominiosPermitidosThunk';

import {
  selectDominiosPermitidos,
  selectDominiosPermitidosLoading,
  selectDominiosPermitidosCreating,
  selectDominiosPermitidosUpdating,
} from './slicesDominio/dominiosPermitidosSlice';

export default function ConfiguracionSeguridad() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('password');
  const config = useSelector(selectConfigSeguridad);
  const isLoading = useSelector(selectConfigSeguridadLoading);
  const isUpdating = useSelector(selectConfigSeguridadUpdating);
  const dominios = useSelector(selectDominiosPermitidos);

 const loadingDominios = useSelector(selectDominiosPermitidosLoading);

  const creatingDominio = useSelector(selectDominiosPermitidosCreating);

const updatingDominio = useSelector(selectDominiosPermitidosUpdating);

  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(null);
  const [formDominio, setFormDominio] = useState({

  dominio: '',

  descripcion: '',

});

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

  dispatch(fetchDominiosPermitidos());

}, [dispatch]);

const handleCreateDominio = async (e) => {
  e.preventDefault();

  if (!formDominio.dominio.trim()) {
    setToast({ type: 'error', message: 'El dominio es obligatorio.' });
    return;
  }

  const payload = {
    dominio: formDominio.dominio.trim().toLowerCase(),
    descripcion: formDominio.descripcion.trim(),
    activo: true,
  };

  const action = await dispatch(createDominioPermitido(payload));

  if (action.meta.requestStatus === 'fulfilled') {
    setToast({ type: 'success', message: 'Dominio agregado correctamente.' });
    setFormDominio({ dominio: '', descripcion: '' });
    dispatch(fetchDominiosPermitidos());
  } else {
    const msg =
      action.payload?.msg ||
      action.payload?.message ||
      action.error?.message ||
      'No se pudo agregar el dominio.';

    setToast({ type: 'error', message: msg });
  }
};

const handleToggleDominio = async (dominio) => {

  const action = await dispatch(

    updateDominioPermitido({

      id: dominio.id_dominio,

      data: {

        ...dominio,

        activo: !dominio.activo,

      },

    })

  );

  if (action.meta.requestStatus === 'fulfilled') {

    setToast({

      type: 'success',

      message: dominio.activo ? 'Dominio desactivado.' : 'Dominio activado.',

    });

    dispatch(fetchDominiosPermitidos());

  } else {

    setToast({ type: 'error', message: 'No se pudo actualizar el dominio.' });

  }

};

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

      {/* TABS */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors ${
            activeTab === 'password'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border-transparent'
          }`}
        >
          Contraseñas y Seguridad
        </button>

        <button
          onClick={() => setActiveTab('correo')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors ${
            activeTab === 'correo'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border-transparent'
          }`}
        >
          Correo y Dominios
        </button>
      </div>

      {/* ================= TAB CONTRASEÑAS ================= */}
      {activeTab === 'password' && (
        <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Políticas de Seguridad
          </h3>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* REGLAS */}
            <section>
              <h4 className="text-lg font-semibold mb-4">Reglas de contraseña</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput label="Longitud mínima" value={form.longitud_minima} onChange={(v)=>handleNumberChange('longitud_minima', v)} />
                <NumberInput label="Longitud máxima" value={form.longitud_maxima} onChange={(v)=>handleNumberChange('longitud_maxima', v)} />

                <SwitchInput label="Requiere mayúscula" checked={form.requiere_mayuscula} onChange={(v)=>handleChange('requiere_mayuscula', v)} />
                <SwitchInput label="Requiere minúscula" checked={form.requiere_minuscula} onChange={(v)=>handleChange('requiere_minuscula', v)} />
                <SwitchInput label="Requiere número" checked={form.requiere_numero} onChange={(v)=>handleChange('requiere_numero', v)} />
                <SwitchInput label="Requiere carácter especial" checked={form.requiere_caracter_especial} onChange={(v)=>handleChange('requiere_caracter_especial', v)} />

                <NumberInput label="Historial de contraseñas" value={form.historial_passwords} onChange={(v)=>handleNumberChange('historial_passwords', v)} />
                <NumberInput label="Vida útil (días)" value={form.vida_util_password_dias} onChange={(v)=>handleNumberChange('vida_util_password_dias', v)} />

                <SwitchInput label="Permitir reutilización" checked={form.permite_reutilizacion} onChange={(v)=>handleChange('permite_reutilizacion', v)} />
              </div>
            </section>

            {/* BLOQUEO */}
            <section>
              <h4 className="text-lg font-semibold mb-4">Bloqueo de cuenta</h4>

              <div className="grid grid-cols-2 gap-6">
                <NumberInput label="Intentos fallidos" value={form.max_intentos_fallidos} onChange={(v)=>handleNumberChange('max_intentos_fallidos', v)} />
                <NumberInput label="Tiempo bloqueo (min)" value={form.tiempo_bloqueo_minutos} onChange={(v)=>handleNumberChange('tiempo_bloqueo_minutos', v)} />
              </div>
            </section>

            {/* VERIFICACIÓN */}
            <section>
              <h4 className="text-lg font-semibold mb-4">Verificación adicional</h4>

              <div className="grid grid-cols-2 gap-6">
                <SwitchInput label="2FA" checked={form.usa_2fa} onChange={(v)=>handleChange('usa_2fa', v)} />
                <SwitchInput label="Captcha" checked={form.usa_captcha} onChange={(v)=>handleChange('usa_captcha', v)} />
                <SwitchInput label="Configuración activa" checked={form.activo} onChange={(v)=>handleChange('activo', v)} />
              </div>
            </section>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button type="button" onClick={()=>dispatch(fetchConfiguracionSeguridad())} className="px-6 py-2 bg-gray-200 rounded-lg">
                Cancelar
              </button>

              <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-primary text-white rounded-lg">
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB CORREO ================= */}
      {activeTab === 'correo' && (
  <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Dominios permitidos
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Administre los dominios de correo autorizados para registrar usuarios.
      </p>
    </div>

    <form
      onSubmit={handleCreateDominio}
      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end mb-8"
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Dominio
        </label>
        <input
          type="text"
          placeholder="Ej. ucb.edu.bo"
          value={formDominio.dominio}
          onChange={(e) =>
            setFormDominio({ ...formDominio, dominio: e.target.value })
          }
          className="w-full bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block p-2.5"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Descripción
        </label>
        <input
          type="text"
          placeholder="Ej. Correos institucionales"
          value={formDominio.descripcion}
          onChange={(e) =>
            setFormDominio({ ...formDominio, descripcion: e.target.value })
          }
          className="w-full bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block p-2.5"
        />
      </div>

      <button
        type="submit"
        disabled={creatingDominio}
        className="h-[42px] px-8 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        {creatingDominio ? 'Agregando...' : 'Agregar'}
      </button>
    </form>

    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-6 py-3">Dominio</th>
            <th className="px-6 py-3">Descripción</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3 text-right">Acción</th>
          </tr>
        </thead>

        <tbody>
          {loadingDominios && (
            <tr>
              <td className="px-6 py-4" colSpan={4}>
                Cargando dominios...
              </td>
            </tr>
          )}

          {!loadingDominios && dominios.length === 0 && (
            <tr>
              <td className="px-6 py-4" colSpan={4}>
                No hay dominios registrados.
              </td>
            </tr>
          )}

          {!loadingDominios &&
            dominios.map((d) => (
              <tr
                key={d.id_dominio}
                className="bg-white dark:bg-background-dark border-b last:border-b-0 dark:border-gray-700"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {d.dominio}
                </td>

                <td className="px-6 py-4">
                  {d.descripcion || 'Sin descripción'}
                </td>

                <td className="px-6 py-4">
                  {d.activo ? (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Activo
                    </span>
                  ) : (
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    disabled={updatingDominio}
                    onClick={() => handleToggleDominio(d)}
                    className={`px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 ${
                      d.activo
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {d.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}

    </div>
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