import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ClipLoader } from "react-spinners";
//const CERT_API = import.meta.env.VITE_AWS_CERTIFICADOS;
const CERT_API = "https://pfahqjigyhquxqqve4niyarkxq0gvgsk.lambda-url.us-east-1.on.aws";
import Layout from '../../shared/components/layout/Layout';

// === IMPORTACIONES DE CONSTANTES Y REDUX ===
import { ROL_IDS } from '../sacramentos/config/sacramentos.constants';
import { buscarSacramentos } from '../sacramentos/slices/sacramentosTrunk';
import Toast from '../../shared/components/ui/Toast';

const HISTORIAL_KEY = 'certificados_historial';
const TIPO_ICONS = {
  'Bautizo': 'water_drop',
  'Primera Comunión': 'volunteer_activism',
  'Matrimonio': 'favorite',
};
const TIPO_COLORS = {
  'Bautizo': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'Primera Comunión': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Matrimonio': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function Certificados() {
  const dispatch = useDispatch();

  const TIPO_SACRAMENTO_IDS = {
    Bautizo: 1,
    Matrimonio: 2,
    'Primera Comunión': 3
  };

  const [tipo, setTipo] = useState('Bautizo'); 
  
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCI, setSearchCI] = useState('');
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [listaResultados, setListaResultados] = useState([]); 
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const [sacramentoSeleccionado, setSacramentoSeleccionado] = useState(null);

  const [plantilla, setPlantilla] = useState('templates/plantilla-bautizo.pdf');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORIAL_KEY)) || []; }
    catch { return []; }
  });
  const [modalUrl, setModalUrl] = useState(null);
  const [loadingHistorialId, setLoadingHistorialId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Sincroniza dinámicamente la clave S3 de la plantilla según el sacramento activo
  useEffect(() => {
    if (tipo === 'Bautizo') setPlantilla('templates/plantilla-bautizo.pdf');
    if (tipo === 'Primera Comunión') setPlantilla('templates/plantilla-comunion.pdf');
    if (tipo === 'Matrimonio') setPlantilla('templates/plantilla-matrimonio.pdf');
  }, [tipo]);

  const previsualizarCertificado = async (datos) => {
    try {
      setLoading(true);
      const response = await fetch(`${CERT_API}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos), 
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Lambda /preview status:', response.status, '| body:', errorBody);
        throw new Error(`Error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      if (data.ok && data.url) {
        return data.url; 
      } else {
        throw new Error('La respuesta del servidor no contiene la URL');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setToast({ type: 'error', message: 'No se pudo generar el certificado' });
    } finally {
      setLoading(false);
    }
  };
  
  const descargarCertificado = async (datos) => {
    try {
      setLoading(true);
      const response = await fetch(`${CERT_API}/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (!response.ok) throw new Error('Error al generar certificado para descarga');

      const data = await response.json();
      
      if (data.ok && data.url) {
        const s3Response = await fetch(data.url);
        const blob = await s3Response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Certificado_${datos.nombre || 'Sacramento'}_${datos.apellidoPaterno || ''}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
        return true;
      } else {
        throw new Error('No se recibió la URL de descarga');
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({ type: 'error', message: 'No se pudo descargar el certificado' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarSacramento = (e) => {
    e.preventDefault();
    if (!searchNombre && !searchCI) {
      setToast({ type: 'error', message: "Ingresa al menos un nombre o CI para buscar." });
      return;
    }

    setIsLoadingSearch(true);
    setSacramentoSeleccionado(null);
    setBusquedaRealizada(true);

    let tipoKey = tipo; 
    let rolBusqueda = ROL_IDS.COMULGADO;
    if(tipo === 'Comunion') {
        rolBusqueda = ROL_IDS.COMULGADO;
    } 
    else if( tipo === 'Bautizo'){
        rolBusqueda = ROL_IDS.BAUTIZADO;
    }
    else if (tipo === 'Matrimonio') {
        rolBusqueda = ROL_IDS.ESPOSO;
    }

    const notasPorDefecto = {
      'Bautizo': "Renacido por el agua y el Espíritu Santo, incorporado a la santa Iglesia de Cristo.",
      'Primera Comunión': "Ha recibido el Sagrado Cuerpo de Cristo por primera vez, como alimento para su alma.",
      'Matrimonio': "La unión por la Iglesia es el acto sagrado de unir dos vidas en la comunidad de Dios."
    };

    const payload = {
      ...(searchNombre.trim() && { nombre: searchNombre.trim() }),
      ...(searchCI.trim() && { carnet_identidad: searchCI.trim() }),
      activo: 'true',
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoKey] || 1,
      rol_sacramento_id_rol_sacra: rolBusqueda,
    };

    dispatch(buscarSacramentos(payload))
      .unwrap()
      .then(async (res) => {
        const resultadosProcesados = [];
        const formatearNombre = (p) => p ? `${p.nombre} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.trim() : "";

        const tipoEsperado = TIPO_SACRAMENTO_IDS[tipo];
        const resultadosFiltrados = (res.resultados || []).filter(
          sac => sac.tipo_sacramento_id_tipo === tipoEsperado
        );
        console.log(`[Certificados] Recibidos: ${res.resultados?.length} | Tipo esperado: ${tipoEsperado} (${tipo}) | Después de filtro: ${resultadosFiltrados.length}`);

        for (const sac of resultadosFiltrados) {
          const relaciones = sac.todasRelaciones || [];
          console.log(`[Certificados] Sacramento #${sac.id_sacramento} | tipo: ${sac.tipo_sacramento_id_tipo} | relaciones:`, relaciones.map(r => ({ rol: r.rol_sacramento_id_rol_sacra, persona: r.persona?.nombre })));

          const relEsposo = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSO);
          const relEsposa = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSA);

          const rolesTitularPorTipo = tipo === 'Bautizo'
            ? [ROL_IDS.BAUTIZADO]
            : tipo === 'Primera Comunión'
              ? [ROL_IDS.COMULGADO, ROL_IDS.CONFIRMADO]
              : [ROL_IDS.ESPOSO, ROL_IDS.ESPOSA];

          const relTitular = relaciones.find(r => rolesTitularPorTipo.includes(r.rol_sacramento_id_rol_sacra));
          const relMinistro = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.MINISTRO);
          const relPadrino = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.PADRINO);
          
          const nombreEsposoCalculado = formatearNombre(relEsposo?.persona);
          const nombreEsposaCalculada = formatearNombre(relEsposa?.persona);
          const nombreMinistroCalculado = formatearNombre(relMinistro?.persona);
          const nombrePadrinoCalculado = formatearNombre(relPadrino?.persona);

          const nacEsposo = relEsposo?.persona?.fecha_nacimiento || "";
          const nacEsposa = relEsposa?.persona?.fecha_nacimiento || "";
          const nacTitular = relTitular?.persona?.fecha_nacimiento || "";
          const lugarNacTitular = relTitular?.persona?.lugar_nacimiento || "La Paz";

          const padreCalculado = relTitular?.persona?.nombre_padre || "";
          const madreCalculada = relTitular?.persona?.nombre_madre || "";

          const madrinaFinal = sac.nombre_madrina || "";

          sac.personaSacramentos.forEach((rel) => {
            if (!rel.persona) return;

            const rolId = rel.rol_sacramento_id_rol_sacra;
            if (!rolesTitularPorTipo.includes(rolId)) return;

            let nombreRolUI = 'Participante / Titular';
            if ([ROL_IDS.ESPOSO, ROL_IDS.ESPOSA].includes(rolId)) nombreRolUI = 'Contrayente (Esposo/a)';
            if ([ROL_IDS.COMULGADO].includes(rolId)) nombreRolUI = 'Comulgante';
            if ([ROL_IDS.BAUTIZADO].includes(rolId)) nombreRolUI = 'Bautizado';

            const fechaActual = new Date();
            const diaStr = fechaActual.getDate().toString();
            const mesStrLetras = fechaActual.toLocaleString('es-ES', { month: 'long' });
            const mesStrNum = (fechaActual.getMonth() + 1).toString();
            const anioStr = fechaActual.getFullYear().toString();

            resultadosProcesados.push({
              id_sacramento: sac.id_sacramento,
              nombre_completo: formatearNombre(rel.persona),
              ci: rel.persona.carnet_identidad,
              fecha: sac.fecha_sacramento,
              rol: nombreRolUI,
              
              numero: sac.numero || Math.floor(100000 + Math.random() * 900000).toString() || "",
              iglesia: sac.parroquia?.nombre || "Parroquia", 
              presbitero: nombreMinistroCalculado || sac.sacerdote || "Pbro.", 
              libro: sac.libro?.toString() || "", 
              pagina: sac.foja?.toString() || "",
              partida: sac.numero?.toString() || "",
              
              apellidoPaterno: relTitular?.persona?.apellido_paterno || rel.persona.apellido_paterno || "",
              apellidoMaterno: relTitular?.persona?.apellido_materno || rel.persona.apellido_materno || "",
              nombre: relTitular?.persona?.nombre || rel.persona.nombre || "",
              fechaNacimientoPrincipal: nacTitular, 
              lugarNacimientoPrincipal: lugarNacTitular,
              
              padre: padreCalculado || sac.nombre_padre || "",
              madre: madreCalculada || sac.nombre_madre || "",
              padrino: nombrePadrinoCalculado || sac.nombre_padrino || "",
              madrina: madrinaFinal || "",
              
              catequista: sac.nombre_catequista || "",
              parroco: nombreMinistroCalculado || sac.nombre_parroco || "",
              testigos1: sac.testigo_uno || "",
              testigos2: sac.testigo_dos || "",
              
              oficialiaRC: sac.matrimonioDetalle?.reg_civil || sac.oficialia || "",
              libroRC: sac.libro_rc || "",
              partidaRC: sac.partida_rc || "",
              notas1: sac.observaciones || notasPorDefecto[tipo] || "",
              
              ciudadExpedicion: "La Paz",
              diaExpedicion: diaStr,
              mesExpedicionLetras: mesStrLetras,
              mesExpedicionNum: mesStrNum,
              anioExpedicion: anioStr,

              nombreEsposoMatrimonio: nombreEsposoCalculado,
              nombreEsposaMatrimonio: nombreEsposaCalculada,
              fechaNacimientoEsposo: nacEsposo,   
              fechaNacimientoEsposa: nacEsposa,
            });
          });
        }
        
        const resultadosUnicos = resultadosProcesados.filter((v, i, a) => 
            a.findIndex(t => (t.id_sacramento === v.id_sacramento && t.nombre_completo === v.nombre_completo)) === i
        );
        
        setListaResultados(resultadosUnicos);
      })
      .catch((err) => {
        console.error("Error buscando sacramentos:", err);
        setListaResultados([]);
      })
      .finally(() => {
        setIsLoadingSearch(false);
      });
  };

  const handleSeleccionar = (item) => {
    setSacramentoSeleccionado(item);
  };

  // Convierte undefined/null a "" para que JSON.stringify no elimine campos
  const sanitize = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v ?? '']));

  // === AUXILIAR DE CONSTRUCCIÓN DINÁMICA DE PAYLOAD ===
  const construirPayloadLambda = () => {
    if (!sacramentoSeleccionado) return null;

    // Campos transversales obligatorios en todas las plantillas
    const basePayload = {
      templateKey: plantilla,
      numero: sacramentoSeleccionado.numero,
      iglesia: sacramentoSeleccionado.iglesia,
      presbitero: sacramentoSeleccionado.presbitero,
      libro: sacramentoSeleccionado.libro,
      pagina: sacramentoSeleccionado.pagina,
      partida: sacramentoSeleccionado.partida,
      oficialiaRC: sacramentoSeleccionado.oficialiaRC,
      libroRC: sacramentoSeleccionado.libroRC,
      partidaRC: sacramentoSeleccionado.partidaRC,
      firmado: sacramentoSeleccionado.presbitero 
    };

    if (tipo === 'Bautizo') {
      return sanitize({
        ...basePayload,
        apellidoPaterno: sacramentoSeleccionado.apellidoPaterno,
        apellidoMaterno: sacramentoSeleccionado.apellidoMaterno,
        nombre: sacramentoSeleccionado.nombre,
        lugarFechaBautismo: `La Paz, ${sacramentoSeleccionado.fecha ?? ''}`,
        fechaNacimiento: sacramentoSeleccionado.fechaNacimientoPrincipal,
        lugarNacimiento: sacramentoSeleccionado.lugarNacimientoPrincipal,
        padre: sacramentoSeleccionado.padre,
        madre: sacramentoSeleccionado.madre,
        padrino: sacramentoSeleccionado.padrino,
        madrina: sacramentoSeleccionado.madrina,
        notas: sacramentoSeleccionado.notas1,
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion,
        diaExpedicion: sacramentoSeleccionado.diaExpedicion,
        mesExpedicion: sacramentoSeleccionado.mesExpedicionLetras,
        anioExpedicion: sacramentoSeleccionado.anioExpedicion,
      });
    }

    if (tipo === 'Primera Comunión') {
      return sanitize({
        ...basePayload,
        apellidoPaterno: sacramentoSeleccionado.apellidoPaterno,
        apellidoMaterno: sacramentoSeleccionado.apellidoMaterno,
        nombre: sacramentoSeleccionado.nombre,
        lugarFechaComunion1: `La Paz, ${sacramentoSeleccionado.fecha ?? ''}`,
        lugarFechaComunion2: '',
        padre: sacramentoSeleccionado.padre,
        madre: sacramentoSeleccionado.madre,
        catequista: sacramentoSeleccionado.catequista,
        parroco: sacramentoSeleccionado.parroco,
        notas: sacramentoSeleccionado.notas1,
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion,
        diaExpedicion: sacramentoSeleccionado.diaExpedicion,
        mesExpedicion: sacramentoSeleccionado.mesExpedicionLetras,
        anioExpedicion: sacramentoSeleccionado.anioExpedicion,
      });
    }

    if (tipo === 'Matrimonio') {
      return sanitize({
        ...basePayload,
        nombreEsposo: sacramentoSeleccionado.nombreEsposoMatrimonio,
        fechaNacimientoEsposo: sacramentoSeleccionado.fechaNacimientoEsposo,
        nombreEsposa: sacramentoSeleccionado.nombreEsposaMatrimonio,
        fechaNacimientoEsposa: sacramentoSeleccionado.fechaNacimientoEsposa,
        lugarFechaMatrimonio: `La Paz, ${sacramentoSeleccionado.fecha ?? ''}`,
        celebradoPor: sacramentoSeleccionado.presbitero,
        testigos1: sacramentoSeleccionado.testigos1,
        testigos2: sacramentoSeleccionado.testigos2,
        notas1: sacramentoSeleccionado.notas1,
        notas2: '',
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion,
        diaExpedicion: sacramentoSeleccionado.diaExpedicion,
        mesExpedicion: sacramentoSeleccionado.mesExpedicionLetras,
        anioExpedicion: sacramentoSeleccionado.anioExpedicion,
      });
    }

    return sanitize(basePayload);
  };

  const handlePrevisualizar = async () => {
    if (!sacramentoSeleccionado) {
      setToast({ type: 'error', message: "Primero debes buscar y SELECCIONAR un sacramento de la lista." });
      return;
    }
    setLoadingPdf(true);
    
    const payloadLambda = construirPayloadLambda();
    console.log('[Certificados] Payload a Lambda:', payloadLambda);
    const url = await previsualizarCertificado(payloadLambda);
    if (url) setPdfUrl(url); 
    setLoadingPdf(false);
  };

  const handleGenerar = async () => {
    if (!sacramentoSeleccionado) {
      setToast({ type: 'error', message: "Primero debes buscar y SELECCIONAR un sacramento de la lista." });
      return;
    }
    const payloadLambda = construirPayloadLambda();
    const exito = await descargarCertificado(payloadLambda);
    if (!exito) return;

    const entrada = {
      id: Date.now(),
      tipo,
      nombre: sacramentoSeleccionado.nombre_completo,
      ci: sacramentoSeleccionado.ci || '—',
      fechaSacramento: sacramentoSeleccionado.fecha,
      fechaGenerado: new Date().toLocaleString('es-BO'),
      partida: sacramentoSeleccionado.partida,
      payload: payloadLambda,
    };
    setHistorial(prev => {
      const nuevo = [entrada, ...prev].slice(0, 50);
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const handleVerDesdeHistorial = async (entry) => {
    if (!entry.payload) {
      setToast({ type: 'error', message: "Este registro no tiene datos suficientes para regenerar el certificado." });
      return;
    }
    setLoadingHistorialId(entry.id);
    try {
      const response = await fetch(`${CERT_API}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry.payload),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      if (data.ok && data.url) {
        setModalUrl(data.url);
      } else {
        throw new Error('Sin URL en la respuesta');
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: "No se pudo cargar el certificado." });
    } finally {
      setLoadingHistorialId(null);
    }
  };

  const getTemplateStyle = (targetTipo, currentTipo, isSelected) => {
    const isActiveType = targetTipo === currentTipo;
    let base = "border rounded-lg p-3 flex items-center gap-3 transition-all duration-200 ";
    
    if (!isActiveType) {
      return base + "border-gray-100 bg-gray-50 opacity-40 grayscale cursor-not-allowed";
    }

    if (isSelected) {
      return base + "border-primary ring-1 ring-primary bg-primary/5 cursor-pointer shadow-sm";
    }

    return base + "border-gray-200 hover:border-gray-300 hover:bg-white cursor-pointer";
  };

  return (
    <>
    <Layout title="Emisión de Certificados">
      <div className="space-y-6">

        {/* === ENCABEZADO DE PÁGINA === */}
        <div className="flex items-center gap-3 pb-2 border-b border-border-light dark:border-border-dark">
          <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl">
            <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Genera y descarga certificados sacramentales oficiales</p>
          </div>
        </div>

        {/* === PANELES PRINCIPALES === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* === PANEL IZQUIERDO === */}
          <section className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">1</span>
                <h3 className="font-semibold text-gray-800 dark:text-white">Buscar Sacramento</h3>
              </div>

              <form onSubmit={handleBuscarSacramento} className="space-y-4">

                {/* Tipo de certificado como botones */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tipo de Certificado</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Bautizo', 'Primera Comunión', 'Matrimonio'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTipo(t);
                          setSacramentoSeleccionado(null);
                          setListaResultados([]);
                          setBusquedaRealizada(false);
                          setPdfUrl(null);
                        }}
                        className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-xs font-medium transition-all ${
                          tipo === t
                            ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{TIPO_ICONS[t]}</span>
                        <span className="leading-tight text-center">{t === 'Primera Comunión' ? 'P. Comunión' : t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={searchNombre}
                      onChange={(e) => setSearchNombre(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Carnet de Identidad</label>
                    <input
                      type="text"
                      placeholder="Ej. 123456"
                      value={searchCI}
                      onChange={(e) => setSearchCI(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingSearch}
                  className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-sm shadow-primary/30"
                >
                  {isLoadingSearch
                    ? <><ClipLoader size={16} color="#fff" /> Buscando...</>
                    : <><span className="material-symbols-outlined text-sm">search</span> Buscar en Base de Datos</>
                  }
                </button>
              </form>
            </div>

            {/* === LISTA DE RESULTADOS === */}
            {busquedaRealizada && (
              <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resultados</span>
                  {listaResultados.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{listaResultados.length}</span>
                  )}
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {listaResultados.length === 0 && !isLoadingSearch ? (
                    <div className="p-5 text-center text-sm text-gray-400">
                      <span className="material-symbols-outlined text-3xl block mb-1 opacity-40">search_off</span>
                      Sin resultados para <strong>{tipo}</strong>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {listaResultados.map((item) => (
                        <li
                          key={item.id_sacramento + item.nombre_completo}
                          onClick={() => handleSeleccionar(item)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            sacramentoSeleccionado?.id_sacramento === item.id_sacramento
                              ? 'bg-primary/5 border-l-[3px] border-primary'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-[3px] border-transparent'
                          }`}
                        >
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{item.nombre_completo}</p>
                          <div className="flex justify-between mt-0.5 text-xs text-gray-400">
                            <span>CI: {item.ci || 'S/N'}</span>
                            <span>{item.fecha}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* === PANEL DERECHO: VISTA PREVIA Y ACCIONES === */}
          <section className="lg:col-span-2">
            <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col min-h-[520px]">

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">2</span>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Vista Previa del Certificado</h3>
                </div>
                {sacramentoSeleccionado && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Registro verificado
                  </span>
                )}
              </div>

              <div className="flex-grow p-6">
                {!sacramentoSeleccionado ? (
                  <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                    <span className="material-symbols-outlined text-5xl mb-3 opacity-60">plagiarism</span>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Selecciona un registro</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Busca una persona a la izquierda para cargar sus datos.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* DATOS RECUPERADOS */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${TIPO_COLORS[tipo]}`}>
                          <span className="material-symbols-outlined text-xs">{TIPO_ICONS[tipo]}</span>
                          {tipo}
                        </span>
                        <span className="text-xs text-gray-400">Datos del registro</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-gray-400 text-xs uppercase tracking-wide mb-0.5">Nombre Completo</span>
                          <span className="font-bold text-gray-900 dark:text-white text-base">{sacramentoSeleccionado.nombre_completo}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400 text-xs uppercase tracking-wide mb-0.5">Fecha del Sacramento</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{sacramentoSeleccionado.fecha}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[['Página', sacramentoSeleccionado.pagina], ['Partida', sacramentoSeleccionado.partida]].map(([label, val]) => (
                            <div key={label} className="bg-white dark:bg-gray-800 rounded-lg px-2.5 py-2 text-center shadow-sm">
                              <span className="block text-gray-400 text-[10px] uppercase">{label}</span>
                              <span className="font-bold text-gray-800 dark:text-white text-sm">{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <span className="block text-gray-400 text-xs uppercase tracking-wide mb-0.5">Carnet (CI)</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{sacramentoSeleccionado.ci || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* PLANTILLA ASIGNADA */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Plantilla asignada por sistema
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { t: 'Bautizo', key: 'templates/plantilla-bautizo.pdf', label: 'Bautizo' },
                          { t: 'Primera Comunión', key: 'templates/plantilla-comunion.pdf', label: 'P. Comunión' },
                          { t: 'Matrimonio', key: 'templates/plantilla-matrimonio.pdf', label: 'Matrimonio' },
                        ].map(({ t, key, label }) => (
                          <div key={t} className={getTemplateStyle(t, tipo, plantilla === key)}>
                            <div className="h-10 w-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] text-gray-500 font-bold shrink-0">PDF</div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">{label}</div>
                              <div className="text-[10px] text-gray-400 truncate">...{t.toLowerCase().replace(' ', '')}.pdf</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* IFRAME VISTA PREVIA */}
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/30">
                      {pdfUrl ? (
                        <iframe
                          src={pdfUrl}
                          title="Vista previa del certificado"
                          width="100%"
                          height="450px"
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">picture_as_pdf</span>
                          <p className="text-sm">Haz clic en <strong className="text-gray-600 dark:text-gray-300">Previsualizar</strong> para ver el certificado.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER DE ACCIONES */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  disabled={!sacramentoSeleccionado || loadingPdf}
                  onClick={handlePrevisualizar}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">visibility</span>
                  {loadingPdf ? 'Generando...' : 'Previsualizar'}
                </button>
                <button
                  disabled={!sacramentoSeleccionado || loading}
                  onClick={handleGenerar}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] shadow-md shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {loading ? <ClipLoader size={16} color="#fff" /> : <span className="material-symbols-outlined text-base">download</span>}
                  Generar Certificado
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* === HISTORIAL DE CERTIFICADOS GENERADOS === */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">history</span>
              <h3 className="font-semibold text-gray-800 dark:text-white">Historial de Certificados Generados</h3>
              {historial.length > 0 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{historial.length}</span>
              )}
            </div>
            {historial.length > 0 && (
              <button
                onClick={() => {
                  setHistorial([]);
                  localStorage.removeItem(HISTORIAL_KEY);
                }}
                className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Limpiar historial
              </button>
            )}
          </div>

          {historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-60">content_paste_off</span>
              <p className="text-sm text-gray-400 dark:text-gray-500">Aún no se han generado certificados en esta sesión.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Los certificados generados aparecerán aquí para seguimiento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">CI</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha Sacramento</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Partida</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Generado el</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {historial.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{historial.length - idx}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLORS[entry.tipo] || 'bg-gray-100 text-gray-600'}`}>
                          <span className="material-symbols-outlined text-[10px]">{TIPO_ICONS[entry.tipo]}</span>
                          {entry.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{entry.nombre}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.ci}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.fechaSacramento}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {entry.partida || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{entry.fechaGenerado}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleVerDesdeHistorial(entry)}
                          disabled={loadingHistorialId === entry.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          {loadingHistorialId === entry.id
                            ? <ClipLoader size={12} color="currentColor" />
                            : <span className="material-symbols-outlined text-sm">visibility</span>
                          }
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </Layout>

    {/* === MODAL VISTA PREVIA DESDE HISTORIAL === */}
    {modalUrl && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setModalUrl(null)}
      >
        <div
          className="bg-white dark:bg-background-dark rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              <span className="font-semibold text-gray-800 dark:text-white">Vista previa del certificado</span>
            </div>
            <button
              onClick={() => setModalUrl(null)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <iframe
              src={modalUrl}
              title="Certificado desde historial"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ height: 'calc(90vh - 100px)' }}
            />
          </div>
        </div>
      </div>
    )}

    <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
