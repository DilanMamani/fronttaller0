import { useEffect, useState } from 'react';
import Layout from '../../shared/components/layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Mail, Lock, Users, Smartphone, Globe, Plus, CheckCircle, XCircle } from 'lucide-react';

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
} from './slicesDominio/dominiosPermitidosThunk';
import {
  selectDominiosPermitidos,
  selectDominiosPermitidosLoading,
  selectDominiosPermitidosCreating,
  selectDominiosPermitidosUpdating,
} from './slicesDominio/dominiosPermitidosSlice';

// ── Componentes base ──────────────────────────────────────────────

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-xl border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
      <div className="flex items-center gap-3 border-b border-border-light px-6 py-4 dark:border-border-dark">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">{title}</h4>
          {description && (
            <p className="text-xs text-muted-light dark:text-muted-dark">{description}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min = 0, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
        {label}
      </label>
      {hint && <p className="text-xs text-muted-light dark:text-muted-dark mb-1">{hint}</p>}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border-light bg-background-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
      />
    </div>
  );
}

function SwitchInput({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-light bg-background-light px-4 py-3 dark:border-border-dark dark:bg-background-dark">
      <div>
        <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark">{label}</p>
        {description && (
          <p className="text-xs text-muted-light dark:text-muted-dark">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white transition-all ${
      toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
    }`}>
      {toast.type === 'success'
        ? <CheckCircle className="h-4 w-4" />
        : <XCircle className="h-4 w-4" />
      }
      {toast.message}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────

export default function ConfiguracionSeguridad() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('password');
  const config       = useSelector(selectConfigSeguridad);
  const isLoading    = useSelector(selectConfigSeguridadLoading);
  const isUpdating   = useSelector(selectConfigSeguridadUpdating);
  const dominios     = useSelector(selectDominiosPermitidos);
  const loadingDominios  = useSelector(selectDominiosPermitidosLoading);
  const creatingDominio  = useSelector(selectDominiosPermitidosCreating);
  const updatingDominio  = useSelector(selectDominiosPermitidosUpdating);

  const [form, setForm]           = useState(null);
  const [toast, setToast]         = useState(null);
  const [formDominio, setFormDominio] = useState({ dominio: '', descripcion: '' });

  useEffect(() => { dispatch(fetchConfiguracionSeguridad()); }, [dispatch]);
  useEffect(() => { dispatch(fetchDominiosPermitidos()); }, [dispatch]);

  useEffect(() => {
    if (config) {
      setForm({
        longitud_minima:            config.longitud_minima ?? 8,
        longitud_maxima:            config.longitud_maxima ?? 64,
        requiere_mayuscula:         !!config.requiere_mayuscula,
        requiere_minuscula:         !!config.requiere_minuscula,
        requiere_numero:            !!config.requiere_numero,
        requiere_caracter_especial: !!config.requiere_caracter_especial,
        max_intentos_fallidos:      config.max_intentos_fallidos ?? 5,
        tiempo_bloqueo_minutos:     config.tiempo_bloqueo_minutos ?? 15,
        historial_passwords:        config.historial_passwords ?? 5,
        vida_util_password_dias:    config.vida_util_password_dias ?? 90,
        permite_reutilizacion:      !!config.permite_reutilizacion,
        usa_2fa:                    !!config.usa_2fa,
        usa_captcha:                !!config.usa_captcha,
        activo:                     !!config.activo,
      });
    }
  }, [config]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const handleChange       = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleNumberChange = (field, value) => setForm(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!config?.id_config) return showToast('error', 'No se encontró el ID de la configuración.');
    if (form.longitud_minima < 6) return showToast('error', 'La longitud mínima debe ser al menos 6.');
    if (form.longitud_maxima < form.longitud_minima) return showToast('error', 'La longitud máxima no puede ser menor a la mínima.');

    const action = await dispatch(updateConfiguracionSeguridad({ data: form }));
    if (action.meta.requestStatus === 'fulfilled') {
      showToast('success', 'Configuración actualizada correctamente.');
      dispatch(fetchConfiguracionSeguridad());
    } else {
      showToast('error', 'No se pudo actualizar la configuración.');
    }
  };

  const handleCreateDominio = async (e) => {
    e.preventDefault();
    if (!formDominio.dominio.trim()) return showToast('error', 'El dominio es obligatorio.');

    const action = await dispatch(createDominioPermitido({
      dominio:     formDominio.dominio.trim().toLowerCase(),
      descripcion: formDominio.descripcion.trim(),
      activo:      true,
    }));

    if (action.meta.requestStatus === 'fulfilled') {
      showToast('success', 'Dominio agregado correctamente.');
      setFormDominio({ dominio: '', descripcion: '' });
      dispatch(fetchDominiosPermitidos());
    } else {
      showToast('error', action.payload?.msg || 'No se pudo agregar el dominio.');
    }
  };

  const handleToggleDominio = async (dominio) => {
    const action = await dispatch(updateDominioPermitido({
      id: dominio.id_dominio,
      data: { ...dominio, activo: !dominio.activo },
    }));
    if (action.meta.requestStatus === 'fulfilled') {
      showToast('success', dominio.activo ? 'Dominio desactivado.' : 'Dominio activado.');
      dispatch(fetchDominiosPermitidos());
    } else {
      showToast('error', 'No se pudo actualizar el dominio.');
    }
  };

  if (isLoading || !form) {
    return (
      <Layout title="Configuración de Seguridad">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const TABS = [
    { key: 'password', label: 'Contraseñas y Seguridad', icon: Lock },
    { key: 'correo',   label: 'Correo y Dominios',       icon: Mail },
  ];

  return (
    <Layout title="Configuración de Seguridad">
      <div className="space-y-6">

        {/* TABS */}
        <div className="flex gap-1 border-b border-border-light dark:border-border-dark">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg border transition-colors ${
                activeTab === key
                  ? 'bg-card-light dark:bg-card-dark text-primary border-border-light dark:border-border-dark border-b-transparent -mb-px'
                  : 'text-muted-light dark:text-muted-dark border-transparent hover:text-foreground-light dark:hover:text-foreground-dark'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTRASEÑAS ── */}
        {activeTab === 'password' && (
          <form onSubmit={handleSubmit} className="space-y-4">

            <SectionCard icon={Lock} title="Reglas de contraseña" description="Define los requisitos mínimos que debe cumplir una contraseña.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput
                  label="Longitud mínima"
                  hint="Recomendado: 8 o más caracteres"
                  value={form.longitud_minima}
                  onChange={v => handleNumberChange('longitud_minima', v)}
                  min={6}
                />
                <NumberInput
                  label="Longitud máxima"
                  value={form.longitud_maxima}
                  onChange={v => handleNumberChange('longitud_maxima', v)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <SwitchInput label="Requiere mayúscula"        checked={form.requiere_mayuscula}         onChange={v => handleChange('requiere_mayuscula', v)} />
                <SwitchInput label="Requiere minúscula"        checked={form.requiere_minuscula}         onChange={v => handleChange('requiere_minuscula', v)} />
                <SwitchInput label="Requiere número"           checked={form.requiere_numero}            onChange={v => handleChange('requiere_numero', v)} />
                <SwitchInput label="Requiere carácter especial" checked={form.requiere_caracter_especial} onChange={v => handleChange('requiere_caracter_especial', v)} />
              </div>
            </SectionCard>

            <SectionCard icon={Users} title="Historial y expiración" description="Controla la reutilización y la vigencia de las contraseñas.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput
                  label="Historial de contraseñas"
                  hint="Número de contraseñas anteriores que no se pueden reutilizar"
                  value={form.historial_passwords}
                  onChange={v => handleNumberChange('historial_passwords', v)}
                />
                <NumberInput
                  label="Vida útil (días)"
                  hint="Días antes de que expire la contraseña"
                  value={form.vida_util_password_dias}
                  onChange={v => handleNumberChange('vida_util_password_dias', v)}
                />
              </div>
              <div className="mt-4">
                <SwitchInput
                  label="Permitir reutilización"
                  description="Si está activo, el usuario puede reutilizar contraseñas anteriores"
                  checked={form.permite_reutilizacion}
                  onChange={v => handleChange('permite_reutilizacion', v)}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Shield} title="Bloqueo de cuenta" description="Configura cuántos intentos fallidos bloquean una cuenta.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput
                  label="Intentos fallidos permitidos"
                  hint="La cuenta se bloqueará al superar este límite"
                  value={form.max_intentos_fallidos}
                  onChange={v => handleNumberChange('max_intentos_fallidos', v)}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Smartphone} title="Verificación adicional" description="Capas extra de seguridad para el inicio de sesión.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SwitchInput
                  label="Autenticación 2FA"
                  description="Envía un código al correo al iniciar sesión"
                  checked={form.usa_2fa}
                  onChange={v => handleChange('usa_2fa', v)}
                />
                <SwitchInput
                  label="Captcha"
                  description="Requiere verificación humana en el login"
                  checked={form.usa_captcha}
                  onChange={v => handleChange('usa_captcha', v)}
                />
                <SwitchInput
                  label="Configuración activa"
                  description="Desactiva para usar valores por defecto"
                  checked={form.activo}
                  onChange={v => handleChange('activo', v)}
                />
              </div>
            </SectionCard>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => dispatch(fetchConfiguracionSeguridad())}
                className="rounded-lg border border-border-light bg-card-light px-5 py-2 text-sm font-medium text-foreground-light transition-colors hover:bg-background-light dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:hover:bg-background-dark"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdating ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB CORREO ── */}
        {activeTab === 'correo' && (
          <div className="space-y-4">

            <SectionCard icon={Globe} title="Agregar dominio" description="Solo usuarios con correos de estos dominios podrán registrarse.">
              <form onSubmit={handleCreateDominio} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                    Dominio
                  </label>
                  <input
                    type="text"
                    placeholder="ucb.edu.bo"
                    value={formDominio.dominio}
                    onChange={e => setFormDominio({ ...formDominio, dominio: e.target.value })}
                    className="w-full rounded-md border border-border-light bg-background-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    placeholder="Correos institucionales"
                    value={formDominio.descripcion}
                    onChange={e => setFormDominio({ ...formDominio, descripcion: e.target.value })}
                    className="w-full rounded-md border border-border-light bg-background-light px-3 py-2 text-sm text-foreground-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingDominio}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {creatingDominio ? 'Agregando...' : 'Agregar'}
                </button>
              </form>
            </SectionCard>

            <SectionCard icon={Mail} title="Dominios registrados" description={`${dominios.length} dominio${dominios.length !== 1 ? 's' : ''} configurado${dominios.length !== 1 ? 's' : ''}`}>
              {loadingDominios ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : dominios.length === 0 ? (
                <p className="text-center text-sm text-muted-light dark:text-muted-dark py-6">
                  No hay dominios registrados.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border-light dark:border-border-dark">
                  <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                    <thead className="bg-background-light dark:bg-background-dark">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">Dominio</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">Descripción</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">Estado</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light bg-card-light dark:divide-border-dark dark:bg-card-dark">
                      {dominios.map(d => (
                        <tr key={d.id_dominio} className="hover:bg-background-light dark:hover:bg-background-dark">
                          <td className="px-4 py-3 text-sm font-medium text-foreground-light dark:text-foreground-dark">
                            {d.dominio}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-light dark:text-muted-dark">
                            {d.descripcion || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              d.activo
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                            }`}>
                              {d.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              disabled={updatingDominio}
                              onClick={() => handleToggleDominio(d)}
                              className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50 ${
                                d.activo
                                  ? 'bg-rose-600 hover:bg-rose-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700'
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
              )}
            </SectionCard>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </Layout>
  );
}