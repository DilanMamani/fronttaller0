import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ClipLoader } from "react-spinners"; 
//const CERT_API = import.meta.env.VITE_AWS_CERTIFICADOS;
const CERT_API = "https://3lx4xvmaug4jowyyf5qlavxq2y0rkkou.lambda-url.us-east-2.on.aws";
import Layout from '../../shared/components/layout/Layout';

// === IMPORTACIONES DE CONSTANTES Y REDUX ===
import { ROL_IDS } from '../sacramentos/config/sacramentos.constants';
import { buscarSacramentos } from '../sacramentos/slices/sacramentosTrunk';

export default function Certificados() {
  const dispatch = useDispatch();

  const TIPO_SACRAMENTO_IDS = {
    Bautizo: 1,
    Matrimonio: 2,
    Comunion: 3 
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

      if (!response.ok) throw new Error('Error al obtener certificado');

      const data = await response.json(); 
      if (data.ok && data.url) {
        return data.url; 
      } else {
        throw new Error('La respuesta del servidor no contiene la URL');
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo generar el certificado');
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
      } else {
        throw new Error('No se recibió la URL de descarga');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo descargar el certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarSacramento = (e) => {
    e.preventDefault();
    if (!searchNombre && !searchCI) {
      alert("Ingresa al menos un nombre o CI para buscar.");
      return;
    }

    setIsLoadingSearch(true);
    setSacramentoSeleccionado(null);
    setBusquedaRealizada(true);

    let tipoKey = tipo; 
    let rolBusqueda = ROL_IDS.COMULGADO;
    // Asignación de llaves y roles para el payload de búsqueda
    if(tipo === 'Primera Comunión') {
        rolBusqueda = ROL_IDS.COMULGADO;
    } 
    else if( tipo === 'Bautizo'){
        rolBusqueda = ROL_IDS.BAUTIZADO;
    }
    else if (tipo === 'Matrimonio') {
        rolBusqueda = ROL_IDS.ESPOSO; // Por defecto busca por el esposo
    }

    const payload = {
      nombre: searchNombre,
      carnet_identidad: searchCI,
      activo: 'true',
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoKey] || 1, 
      rol_sacramento_id_rol_sacra: rolBusqueda, 
    };

    dispatch(buscarSacramentos(payload))
      .unwrap()
      .then((res) => {
        const resultadosProcesados = [];
        
        // Helper para dar formato rápido al nombre completo
        const formatearNombre = (p) => p ? `${p.nombre} ${p.apellido_paterno || ''} ${p.apellido_materno || ''}`.trim() : "";

        res.resultados.forEach((sac) => {
          const relaciones = sac.todasRelaciones || [];

          // Extraemos los roles específicos de las relaciones
          const relEsposo = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSO);
          const relEsposa = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSA);
          const relTitular = relaciones.find(r => r.rol_sacramento_id_rol_sacra === ROL_IDS.BAUTIZADO || r.rol_sacramento_id_rol_sacra === ROL_IDS.COMULGADO);
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

          // Extraemos los padres del titular directamente de su registro de persona
          const padreCalculado = relTitular?.persona?.nombre_padre || "";
          const madreCalculada = relTitular?.persona?.nombre_madre || "";

          // Iteramos sobre las personas del sacramento para armar la lista de UI
          sac.personaSacramentos.forEach((rel) => {
            if (!rel.persona) return;
            
            const rolId = rel.rol_sacramento_id_rol_sacra;
            
            // NUEVO FILTRO: Solo procesamos a los titulares principales.
            const rolesTitulares = [ROL_IDS.BAUTIZADO, ROL_IDS.COMULGADO, ROL_IDS.ESPOSO,ROL_IDS.ESPOSA];
            if (!rolesTitulares.includes(rolId)) return;

            let nombreRolUI = 'Participante / Titular';
            if ([ROL_IDS.ESPOSO, ROL_IDS.ESPOSA].includes(rolId)) nombreRolUI = 'Contrayente (Esposo/a)';
            if ([ROL_IDS.COMULGADO].includes(rolId)) nombreRolUI = 'Comulgante';
            if ([ROL_IDS.BAUTIZADO].includes(rolId)) nombreRolUI = 'Bautizado';

            // --- Fechas y desgloses ---
            const fechaActual = new Date();
            const diaStr = fechaActual.getDate().toString();
            const mesStrLetras = fechaActual.toLocaleString('es-ES', { month: 'long' });
            const mesStrNum = (fechaActual.getMonth() + 1).toString();
            const anioStr = fechaActual.getFullYear().toString();

            resultadosProcesados.push({
              // UI Listado
              id_sacramento: sac.id_sacramento,
              nombre_completo: formatearNombre(rel.persona),
              ci: rel.persona.carnet_identidad,
              fecha: sac.fecha_sacramento,
              rol: nombreRolUI,
              
              // Datos Generales Parroquia
              numero: sac.numero || sac.numero_registro || Math.floor(100000 + Math.random() * 900000).toString(),
              iglesia: sac.parroquia?.nombre || "Parroquia", 
              presbitero: nombreMinistroCalculado || sac.sacerdote || "Pbro.", 
              libro: sac.libro?.toString() || "", 
              pagina: sac.foja?.toString() || "",
              partida: sac.numero?.toString() || "",
              
              // Titular Bautizo/Comunion
              apellidoPaterno: relTitular?.persona?.apellido_paterno || rel.persona.apellido_paterno || "",
              apellidoMaterno: relTitular?.persona?.apellido_materno || rel.persona.apellido_materno || "",
              nombre: relTitular?.persona?.nombre || rel.persona.nombre || "",
              fechaNacimientoPrincipal: nacTitular, 
              lugarNacimientoPrincipal: lugarNacTitular,
              
              // Familia / Apoderados (Sacados dinámicamente)
              padre: padreCalculado || sac.nombre_padre || "",
              madre: madreCalculada || sac.nombre_madre || "",
              padrino: nombrePadrinoCalculado || sac.nombre_padrino || "",
              madrina: sac.nombre_madrina || "",
              catequista: sac.nombre_catequista || "",
              parroco: nombreMinistroCalculado || sac.nombre_parroco || "",
              testigos1: sac.testigo_uno || "",
              testigos2: sac.testigo_dos || "",
              
              // Registro Civil
              oficialiaRC: sac.matrimonioDetalle?.reg_civil || sac.oficialia || "",
              libroRC: sac.libro_rc || "",
              partidaRC: sac.partida_rc || "",
              notas1: sac.observaciones || "",
              
              // Expedición
              ciudadExpedicion: "La Paz",
              diaExpedicion: diaStr,
              mesExpedicionLetras: mesStrLetras,
              mesExpedicionNum: mesStrNum,
              anioExpedicion: anioStr,

              // Contrayentes Matrimonio
              nombreEsposoMatrimonio: nombreEsposoCalculado,
              nombreEsposaMatrimonio: nombreEsposaCalculada,
              fechaNacimientoEsposo: nacEsposo,   
              fechaNacimientoEsposa: nacEsposa,
            });
          });
        });
        
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
      return {
        ...basePayload,
        apellidoPaterno: sacramentoSeleccionado.apellidoPaterno,
        apellidoMaterno: sacramentoSeleccionado.apellidoMaterno,
        nombre: sacramentoSeleccionado.nombre,
        lugarFechaBautismo: `La Paz, ${sacramentoSeleccionado.fecha}`,
        fechaNacimiento: sacramentoSeleccionado.fechaNacimientoPrincipal, 
        lugarNacimiento: sacramentoSeleccionado.lugarNacimientoPrincipal,
        padre: sacramentoSeleccionado.padre,
        madre: sacramentoSeleccionado.madre,
        padrino: sacramentoSeleccionado.padrino,
        madrina: sacramentoSeleccionado.madrina,
        notas: sacramentoSeleccionado.notas1,
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion,
        diaExpedicion: sacramentoSeleccionado.mesExpedicionNum,
        mesExpedicion: sacramentoSeleccionado.mesExpedicionLetras,
        anioExpedicion: sacramentoSeleccionado.anioExpedicion,
      };
    }

    if (tipo === 'Primera Comunión') {
      return {
        ...basePayload,
        apellidoPaterno: sacramentoSeleccionado.apellidoPaterno,
        apellidoMaterno: sacramentoSeleccionado.apellidoMaterno,
        nombre: sacramentoSeleccionado.nombre,
        lugarFechaComunion1: `La Paz, ${sacramentoSeleccionado.fecha}`,
        lugarFechaComunion2: "", 
        padre: sacramentoSeleccionado.padre,
        madre: sacramentoSeleccionado.madre,
        catequista: sacramentoSeleccionado.catequista,
        parroco: sacramentoSeleccionado.parroco,
        notas: sacramentoSeleccionado.notas1, 
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion,
        diaExpedicion: sacramentoSeleccionado.diaExpedicion,
        mesExpedicion: sacramentoSeleccionado.mesExpedicionLetras,
        anioExpedicion: sacramentoSeleccionado.anioExpedicion,
      };
    }

    if (tipo === 'Matrimonio') {
      return {
        ...basePayload,
        nombreEsposo: sacramentoSeleccionado.nombreEsposoMatrimonio,
        fechaNacimientoEsposo: sacramentoSeleccionado.fechaNacimientoEsposo,
        nombreEsposa: sacramentoSeleccionado.nombreEsposaMatrimonio,
        fechaNacimientoEsposa: sacramentoSeleccionado.fechaNacimientoEsposa, 
        lugarFechaMatrimonio: `La Paz, ${sacramentoSeleccionado.fecha}`,
        celebradoPor: sacramentoSeleccionado.presbitero,
        testigos1: sacramentoSeleccionado.testigos1,
        testigos2: sacramentoSeleccionado.testigos2,
        notas1: sacramentoSeleccionado.notas1,
        notas2: "", 
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion,
        diaExpedicion: sacramentoSeleccionado.diaExpedicion,
        mesExpedicion: sacramentoSeleccionado.mesExpedicionLetras,
        anioExpedicion: sacramentoSeleccionado.anioExpedicion,
      };
    }

    return basePayload;
  };

  const handlePrevisualizar = async () => {
    if (!sacramentoSeleccionado) {
      alert("Primero debes buscar y SELECCIONAR un sacramento de la lista.");
      return;
    }
    setLoadingPdf(true);
    
    const payloadLambda = construirPayloadLambda();
    const url = await previsualizarCertificado(payloadLambda);
    if (url) setPdfUrl(url); 
    setLoadingPdf(false);
  };

  const handleGenerar = async () => {
    if (!sacramentoSeleccionado) {
      alert("Primero debes buscar y SELECCIONAR un sacramento de la lista.");
      return;
    }
    const payloadLambda = construirPayloadLambda();
    await descargarCertificado(payloadLambda);
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
    <Layout title="Emisión de Certificados">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === PANEL IZQUIERDO === */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">1. Buscar Sacramento</h3>
            
            <form onSubmit={handleBuscarSacramento} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Tipo de Certificado</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setSacramentoSeleccionado(null);
                    setListaResultados([]);
                    setBusquedaRealizada(false);
                    setPdfUrl(null); 
                  }}
                  className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="Bautizo">Bautizo</option>
                  <option value="Primera Comunión">Primera Comunión</option>
                  <option value="Matrimonio">Matrimonio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar por Nombre</label>
                    <input
                        type="text"
                        placeholder="Ej. Juan Perez"
                        value={searchNombre}
                        onChange={(e) => setSearchNombre(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">O por Carnet (CI)</label>
                    <input
                        type="text"
                        placeholder="Ej. 123456"
                        value={searchCI}
                        onChange={(e) => setSearchCI(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingSearch}
                className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
              >
                {isLoadingSearch ? <ClipLoader size={20} color="#fff" /> : <span className="material-symbols-outlined text-sm">search</span>}
                {isLoadingSearch ? 'Buscando...' : 'Buscar en Base de Datos'}
              </button>
            </form>
          </div>

          {/* === LISTA DE RESULTADOS === */}
          {busquedaRealizada && (
            <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-60 overflow-y-auto shadow-inner">
                {listaResultados.length === 0 && !isLoadingSearch ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        No se encontraron registros de <strong>{tipo}</strong> con esos datos.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {listaResultados.map((item) => (
                            <li 
                                key={item.id_sacramento + item.nombre_completo}
                                onClick={() => handleSeleccionar(item)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors ${sacramentoSeleccionado?.id_sacramento === item.id_sacramento ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-primary' : ''}`}
                            >
                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.nombre_completo}</p>
                                <div className="flex justify-between mt-1 text-xs text-gray-500">
                                    <span>CI: {item.ci || 'S/N'}</span>
                                    <span>{item.fecha}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          )}
        </section>

        {/* === PANEL DERECHO: VISTA PREVIA Y ACCIONES === */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark p-6 min-h-[500px] flex flex-col">
            
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                2. Vista Previa del Certificado
              </h3>
              {sacramentoSeleccionado && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                    Registro Verificado
                  </span>
              )}
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-grow">
                {!sacramentoSeleccionado ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <span className="material-symbols-outlined text-6xl mb-2 opacity-50">plagiarism</span>
                        <p>Busca y selecciona una persona a la izquierda</p>
                        <p className="text-sm">para cargar sus datos automáticamente.</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        {/* DATOS RECUPERADOS VISUALES */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">verified</span>
                                Datos Recuperados ({tipo})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Nombre Registrado</span>
                                    <span className="font-semibold text-gray-900 dark:text-white text-lg">{sacramentoSeleccionado.nombre_completo}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Fecha del Sacramento</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{sacramentoSeleccionado.fecha}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="block text-gray-500 text-xs">Libro</span>
                                        <span className="font-medium">{sacramentoSeleccionado.libro}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">Página</span>
                                        <span className="font-medium">{sacramentoSeleccionado.pagina}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">Partida</span>
                                        <span className="font-medium">{sacramentoSeleccionado.partida}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Carnet (CI)</span>
                                    <span className="font-medium">{sacramentoSeleccionado.ci}</span>
                                </div>
                            </div>
                        </div>

                        {/* === SELECCIÓN DE PLANTILLA CONDICIONAL === */}
                        <div>
                             <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Plantilla Asignada por Sistema
                             </label>
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                
                                <div className={getTemplateStyle('Bautizo', tipo, plantilla === 'templates/plantilla-bautizo.pdf')}>
                                    <div className="h-10 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 font-bold">PDF</div>
                                    <div>
                                        <div className="text-sm font-medium">Oficial Bautizo</div>
                                        <div className="text-[10px] text-gray-400">S3: ...bautizo.pdf</div>
                                    </div>
                                </div>

                                <div className={getTemplateStyle('Primera Comunión', tipo, plantilla === 'templates/plantilla-comunion.pdf')}>
                                    <div className="h-10 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 font-bold">PDF</div>
                                    <div>
                                        <div className="text-sm font-medium">Oficial P. Comunión</div>
                                        <div className="text-[10px] text-gray-400">S3: ...comunion.pdf</div>
                                    </div>
                                </div>

                                <div className={getTemplateStyle('Matrimonio', tipo, plantilla === 'templates/plantilla-matrimonio.pdf')}>
                                    <div className="h-10 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 font-bold">PDF</div>
                                    <div>
                                        <div className="text-sm font-medium">Oficial Matrimonio</div>
                                        <div className="text-[10px] text-gray-400">S3: ...matrimonio.pdf</div>
                                    </div>
                                </div>

                             </div>
                        </div>
                        
                        {/* VISTA PREVIA IFRAME */}
                        <div className="rounded-lg border border-dashed border-border-light dark:border-border-dark p-6 bg-background-light dark:bg-background-dark">
                          {pdfUrl ? (
                            <iframe
                              src={pdfUrl}
                              title="Vista previa del certificado"
                              width="100%"
                              height="450px"
                              className="rounded-lg border shadow-inner"
                            />
                          ) : (
                            <p className="text-center text-muted-foreground-light dark:text-muted-foreground-dark py-12">
                              No hay certificado cargado. Verifica los datos y haz clic en <strong>Previsualizar</strong>.
                            </p>
                          )}
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER DE ACCIONES */}
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                    disabled={!sacramentoSeleccionado || loadingPdf}
                    onClick={handlePrevisualizar}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loadingPdf ? 'Generando Preview...' : 'Previsualizar'}
                </button>
                <button
                    disabled={!sacramentoSeleccionado || loadingPdf}
                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    onClick={handleGenerar}
                >
                      <span className="material-symbols-outlined text-lg">print</span>
                      Generar Certificado
                </button>
            </div>

          </div>
        </section>
      </div>
    </Layout>
  );
}
