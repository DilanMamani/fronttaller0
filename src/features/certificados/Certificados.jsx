import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners"; 
const CERT_API = import.meta.env.VITE_AWS_CERTIFICADOS;
import Layout from '../../shared/components/layout/Layout';

// === IMPORTACIONES DE REDUX ===
import {
  buscarSacramentos,
  fetchSacramentoCompleto
} from '../sacramentos/slices/sacramentosTrunk';

import {
  ROL_IDS,
  TIPO_SACRAMENTO_IDS,
  ROLES_SACRAMENTO_IDS,
  obtenerNombreRol,
} from '../sacramentos/config/sacramentos.constants';

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

    // Ajuste de clave para el diccionario de IDs
    let tipoKey = tipo; 
    if(tipo === 'Primera Comunión') tipoKey = 'Comunion';

    const payload = {
      nombre: searchNombre,
      carnet_identidad: searchCI,
      activo: 'true',
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoKey] || 1, 
      // Si en este componente tienes acceso a ROLES_SACRAMENTO_IDS, 
      // puedes agregarlo aquí como en tu código funcional:
      // rol_principal: ROLES_SACRAMENTO_IDS[tipoKey] 
    };

    dispatch(buscarSacramentos(payload))
      .unwrap()
      .then((res) => {
        const resultadosProcesados = [];
        
        res.resultados.forEach((sac) => {
          sac.personaSacramentos.forEach((rel) => {
            // IGUAL QUE TU CÓDIGO FUNCIONAL: Si no hay persona, salta; si la hay, procesa.
            // Eliminamos el IF restrictivo de los IDs de rol.
            if (!rel.persona) return;
            
            const rolId = rel.rol_sacramento_id_rol_sacra;
            
            // Asignación de rol visual amigable para la lista
            let nombreRolUI = 'Participante / Titular';
            if ([4, 5, 10, 11, 12].includes(rolId)) nombreRolUI = 'Contrayente (Esposo/a)';
            if ([20, 21, 22].includes(rolId)) nombreRolUI = 'Comulgante';
            if ([1].includes(rolId)) nombreRolUI = 'Bautizado';
            // Alternativa: Si importas tu función, puedes usar:
            // const nombreRolUI = obtenerNombreRol(rolId);

            resultadosProcesados.push({
              // --- 1. Datos para renderizar la lista en la UI ---
              id_sacramento: sac.id_sacramento,
              nombre_completo: `${rel.persona.nombre} ${rel.persona.apellido_paterno} ${rel.persona.apellido_materno}`,
              ci: rel.persona.carnet_identidad,
              fecha: sac.fecha_sacramento,
              rol: nombreRolUI,
              
              // --- 2. Datos específicos para inyectar en el PDF (Lambda) ---
              numero: sac.numero || sac.numero_registro || "000000", 
              iglesia: sac.parroquia?.nombre || sac.parroquia || "Iglesia San Miguel", 
              presbitero: sac.sacerdote || "Don Mario", 
              libro: sac.libro?.toString() || "12", 
              pagina: sac.foja?.toString() || "3",
              partida: sac.numero?.toString() || "11",
              apellidoPaterno: rel.persona.apellido_paterno || "",
              apellidoMaterno: rel.persona.apellido_materno || "",
              nombre: rel.persona.nombre || "",
              
              // Extracción directa del detalle del sacramento (previniendo nulos)
              padre: sac.nombre_padre || "",
              madre: sac.nombre_madre || "",
              padrino: sac.nombre_padrino || "",
              madrina: sac.nombre_madrina || "",
              catequista: sac.nombre_catequista || "",
              parroco: sac.nombre_parroco || "",
              testigos1: sac.testigo_uno || "",
              testigos2: sac.testigo_dos || "",
              oficialiaRC: sac.oficialia || "",
              libroRC: sac.libro_rc || "",
              partidaRC: sac.partida_rc || "",
              notas1: sac.observaciones || "",
              
              // Datos de expedición
              ciudadExpedicion: "La Paz",
              diaExpedicion: new Date().getDate().toString(),
              mesExpedicion: new Date().toLocaleString('es-ES', { month: 'long' })
            });
          });
        });
        
        // Limpiamos resultados duplicados en caso de que la misma persona 
        // esté vinculada varias veces en el mismo registro por error de BD
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

    // Campos comunes transversales a todos los certificados
    const basePayload = {
      templateKey: plantilla, // Enviamos dinámicamente la ruta S3 guardada en el estado
      numero: sacramentoSeleccionado.numero || "",
      iglesia: sacramentoSeleccionado.iglesia || "",
      presbitero: sacramentoSeleccionado.presbitero || "",
      libro: sacramentoSeleccionado.libro || "",
      pagina: sacramentoSeleccionado.pagina || "",
      partida: sacramentoSeleccionado.partida || "",
      oficialiaRC: sacramentoSeleccionado.oficialiaRC || "",
      libroRC: sacramentoSeleccionado.libroRC || "",
      partidaRC: sacramentoSeleccionado.partidaRC || "",
      firmado: sacramentoSeleccionado.presbitero || ""
    };

    // Estructuras extendidas independientes según el tipo de sacramento
    if (tipo === 'Bautizo') {
      return {
        ...basePayload,
        apellidoPaterno: sacramentoSeleccionado.apellidoPaterno || "",
        apellidoMaterno: sacramentoSeleccionado.apellidoMaterno || "",
        nombre: sacramentoSeleccionado.nombre || "",
        lugarFechaBautismo: `La Paz, ${sacramentoSeleccionado.fecha || ""}`,
        lugarNacimiento: "La Paz",
        fechaNacimiento: "Verificar en BD",
        padre: sacramentoSeleccionado.padre || "",
        madre: sacramentoSeleccionado.madre || "",
        padrino: sacramentoSeleccionado.padrino || "",
        madrina: sacramentoSeleccionado.madrina || "",
        notas: sacramentoSeleccionado.notas1 || ""
      };
    }

    if (tipo === 'Primera Comunión') {
      return {
        ...basePayload,
        apellidoPaterno: sacramentoSeleccionado.apellidoPaterno || "",
        apellidoMaterno: sacramentoSeleccionado.apellidoMaterno || "",
        nombre: sacramentoSeleccionado.nombre || "",
        lugarFechaComunion1: `La Paz, ${sacramentoSeleccionado.fecha || ""}`,
        lugarFechaComunion2: "",
        padre: sacramentoSeleccionado.padre || "",
        madre: sacramentoSeleccionado.madre || "",
        catequista: sacramentoSeleccionado.catequista || "",
        parroco: sacramentoSeleccionado.parroco || "",
        notas1: sacramentoSeleccionado.notas1 || "",
        notas2: "",
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion || "La Paz",
        diaExpedicion: sacramentoSeleccionado.diaExpedicion || "",
        mesExpedicion: sacramentoSeleccionado.mesExpedicion || ""
      };
    }

    if (tipo === 'Matrimonio') {
      return {
        ...basePayload,
        nombreEsposo: sacramentoSeleccionado.rol === 'Esposo/a' ? sacramentoSeleccionado.nombre_completo : "Verificar Contrayente A",
        fechaNacimientoEsposo: "",
        nombreEsposa: sacramentoSeleccionado.rol !== 'Esposo/a' ? sacramentoSeleccionado.nombre_completo : "Verificar Contrayente B",
        fechaNacimientoEsposa: "",
        lugarFechaMatrimonio: `La Paz, ${sacramentoSeleccionado.fecha || ""}`,
        celebradoPor: sacramentoSeleccionado.presbitero || "",
        testigos1: sacramentoSeleccionado.testigos1 || "",
        testigos2: sacramentoSeleccionado.testigos2 || "",
        notas1: sacramentoSeleccionado.notas1 || "",
        notas2: "",
        ciudadExpedicion: sacramentoSeleccionado.ciudadExpedicion || "La Paz",
        diaExpedicion: sacramentoSeleccionado.diaExpedicion || "",
        mesExpedicion: sacramentoSeleccionado.mesExpedicion || ""
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