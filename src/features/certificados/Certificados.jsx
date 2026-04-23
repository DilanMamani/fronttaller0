import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners"; 
import Layout from '../../shared/components/layout/Layout';

// === IMPORTACIONES DE REDUX ===
import {
  buscarSacramentos,
  fetchSacramentoCompleto
} from '../sacramentos/slices/sacramentosTrunk';

export default function Certificados() {
  const dispatch = useDispatch();

  // === CONSTANTES DE MAPEO ===
  // Nota: Se eliminó Confirmación como pediste
  const TIPO_SACRAMENTO_IDS = {
    Bautizo: 1,
    Matrimonio: 2,
    Comunion: 3 
  };

  // === ESTADOS ===
  const [tipo, setTipo] = useState('Bautizo'); 
  
  // Busqueda
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCI, setSearchCI] = useState('');
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [listaResultados, setListaResultados] = useState([]); 
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Sacramento Seleccionado
  const [sacramentoSeleccionado, setSacramentoSeleccionado] = useState(null);

  // Estados visuales PDF
  // Inicializamos plantilla en 'bautizo-rellenable' porque el tipo inicial es 'Bautizo'
  const [plantilla, setPlantilla] = useState('bautizo-rellenable');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loading, setLoading] = useState(false);

  // Efecto para cambiar la plantilla seleccionada automáticamente si cambia el tipo
  // Esto evita que te quedes con una plantilla de Bautizo seleccionada si cambias a Matrimonio
  useEffect(() => {
    if (tipo === 'Bautizo') setPlantilla('bautizo-rellenable');
    if (tipo === 'Primera Comunión') setPlantilla('iglesia-rellenable'); // Ajusta este ID según tu backend
    if (tipo === 'Matrimonio') setPlantilla('iglesia-rellenable');     // Ajusta este ID según tu backend
  }, [tipo]);

  const previsualizarCertificado = async (nombre_certificado, nombre_estudiante) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://generador-documentos.onrender.com/mostrar-certificado?filename=${plantilla}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_certificado,
            nombre_estudiante,
          }),
        }
      );

      if (!response.ok) throw new Error('Error al obtener certificado');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo generar el certificado');
    } finally {
      setLoading(false);
    }
  };
  
  const descargarCertificado = async (sacramento_nombre, sacramento_fecha) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://generador-documentos.onrender.com/descargar-certificado?filename=${plantilla}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sacramento_nombre,
            sacramento_fecha,
          }),
        }
      );

      if (!response.ok) throw new Error('Error al descargar certificado');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'certificado.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo descargar el certificado');
    } finally {
      setLoading(false);
    }
  };

  
  // === FUNCIÓN DE BÚSQUEDA ===
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
    if(tipo === 'Primera Comunión') tipoKey = 'Comunion';

    const payload = {
      nombre: searchNombre,
      carnet_identidad: searchCI,
      activo: 'true',
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoKey] || 1, 
    };

    dispatch(buscarSacramentos(payload))
      .unwrap()
      .then((res) => {
        const resultadosProcesados = [];
        res.resultados.forEach((sac) => {
          sac.personaSacramentos.forEach((rel) => {
            if (!rel.persona) return;
            const rolId = rel.rol_sacramento_id_rol_sacra;
            // Filtro de roles protagonistas
            if ([1, 2, 3, 10, 11, 21].includes(rolId)) {
                resultadosProcesados.push({
                  id_sacramento: sac.id_sacramento,
                  nombre_completo: `${rel.persona.nombre} ${rel.persona.apellido_paterno} ${rel.persona.apellido_materno}`,
                  ci: rel.persona.carnet_identidad,
                  fecha: sac.fecha_sacramento,
                  foja: sac.foja,
                  numero: sac.numero,
                  rol: rolId === 11 ? 'Esposo/a' : 'Titular' 
                });
            }
          });
        });
        setListaResultados(resultadosProcesados);
      })
      .catch((err) => {
        console.error("Error buscando:", err);
        setListaResultados([]);
      })
      .finally(() => {
        setIsLoadingSearch(false);
      });
  };

  const handleSeleccionar = (item) => {
    setSacramentoSeleccionado(item);
  };

  const handlePrevisualizar = async () => {
    if (!sacramentoSeleccionado) {
      alert("Primero debes buscar y SELECCIONAR un sacramento de la lista.");
      return;
    }
    setLoadingPdf(true);
    const url = await previsualizarCertificado(sacramentoSeleccionado.nombre_completo, sacramentoSeleccionado.fecha);
    if (url) setPdfUrl(url);
    setLoadingPdf(false);
  };

  const handleGenerar = async () => {
    await descargarCertificado(sacramentoSeleccionado.nombre_completo, sacramentoSeleccionado.fecha);
  };

  // === HELPER PARA DETERMINAR ESTILO DE PLANTILLA ===
  // Esta función decide si la tarjeta está activa o deshabilitada
  const getTemplateStyle = (targetTipo, currentTipo, isSelected) => {
    const isActiveType = targetTipo === currentTipo;
    
    // Base style (siempre presente)
    let base = "border rounded-lg p-3 flex items-center gap-3 transition-all duration-200 ";
    
    if (!isActiveType) {
      // ESTILO DESHABILITADO: Opacidad baja, escala de grises, sin cursor
      return base + "border-gray-100 bg-gray-50 opacity-40 grayscale cursor-not-allowed";
    }

    if (isSelected) {
      // ESTILO SELECCIONADO: Borde primario, fondo suave
      return base + "border-primary ring-1 ring-primary bg-primary/5 cursor-pointer shadow-sm";
    }

    // ESTILO DISPONIBLE (pero no seleccionado): Hover effect
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
              
              {/* Selector de Tipo (SIN CONFIRMACIÓN) */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Tipo de Certificado</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setSacramentoSeleccionado(null);
                    setListaResultados([]);
                    setBusquedaRealizada(false);
                    setPdfUrl(null); // Limpiar PDF anterior al cambiar tipo
                  }}
                  className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="Bautizo">Bautizo</option>
                  <option value="Primera Comunión">Primera Comunión</option>
                  <option value="Matrimonio">Matrimonio</option>
                </select>
              </div>

              {/* Inputs de Búsqueda */}
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
                        {/* DATOS RECUPERADOS */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">verified</span>
                                Datos Recuperados
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Nombre Completo</span>
                                    <span className="font-semibold text-gray-900 dark:text-white text-lg">{sacramentoSeleccionado.nombre_completo}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Fecha del Sacramento</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{sacramentoSeleccionado.fecha}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="block text-gray-500 text-xs">Foja</span>
                                        <span className="font-medium">{sacramentoSeleccionado.foja}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">Número</span>
                                        <span className="font-medium">{sacramentoSeleccionado.numero}</span>
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
                                Seleccionar Diseño / Plantilla
                             </label>
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                
                                {/* 1. TARJETA BAUTIZO */}
                                <div 
                                    onClick={() => tipo === 'Bautizo' && setPlantilla('bautizo-rellenable')}
                                    className={getTemplateStyle('Bautizo', tipo, plantilla === 'bautizo-rellenable')}
                                >
                                    <div className="h-10 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">PDF</div>
                                    <div>
                                        <div className="text-sm font-medium">Oficial Bautizo</div>
                                        {tipo !== 'Bautizo' && <div className="text-[10px] text-red-400">No disponible</div>}
                                    </div>
                                </div>

                                {/* 2. TARJETA PRIMERA COMUNIÓN */}
                                <div 
                                    onClick={() => tipo === 'Primera Comunión' && setPlantilla('iglesia-rellenable')}
                                    className={getTemplateStyle('Primera Comunión', tipo, plantilla === 'iglesia-rellenable' && tipo === 'Primera Comunión')}
                                >
                                    <div className="h-10 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">PDF</div>
                                    <div>
                                        <div className="text-sm font-medium">Oficial P. Comunión</div>
                                        {tipo !== 'Primera Comunión' && <div className="text-[10px] text-red-400">No disponible</div>}
                                    </div>
                                </div>

                                {/* 3. TARJETA MATRIMONIO */}
                                <div 
                                    onClick={() => tipo === 'Matrimonio' && setPlantilla('iglesia-rellenable')}
                                    className={getTemplateStyle('Matrimonio', tipo, plantilla === 'iglesia-rellenable' && tipo === 'Matrimonio')}
                                >
                                    <div className="h-10 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">PDF</div>
                                    <div>
                                        <div className="text-sm font-medium">Oficial Matrimonio</div>
                                        {tipo !== 'Matrimonio' && <div className="text-[10px] text-red-400">No disponible</div>}
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
                              height="300px"
                              className="rounded-lg border"
                            />
                          ) : (
                            <p className="text-center text-muted-foreground-light dark:text-muted-foreground-dark">
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
                    className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingPdf ? 'Cargando...' : 'Previsualizar'}
                </button>
                <button
                    disabled={!sacramentoSeleccionado || loadingPdf}
                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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