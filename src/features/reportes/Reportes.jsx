import { useState } from 'react';
import { gql } from 'graphql-request';
import getGraphQLClient from '../../lib/client';
import Swal from 'sweetalert2';
import Layout from '../../shared/components/layout/Layout';
import FiltrosReporte from './componentes/FiltrosReporte';
import SeleccionCampos from './componentes/SeleccionCampos';
import ConfiguracionReporte from './componentes/ConfiguracionReporte';

const ESTADISTICAS_SACRAMENTOS = gql`
  query EstadisticasSacramentos($filter: SacramentoFilter) {
    estadisticasSacramentos(filter: $filter) {
      total
      por_tipo {
        tipo_sacramento
        cantidad
      }
      por_parroquia {
        parroquia
        cantidad
      }
      por_mes {
        periodo
        cantidad
      }
      activos
      inactivos
    }
  }
`;

const GENERAR_REPORTE_PDF = gql`
  mutation GenerarReportePDF(
    $filter: SacramentoFilter
    $fields: [String]
    $titulo: String
    $incluirEstadisticas: Boolean
  ) {
    generarReportePDF(
      filter: $filter
      fields: $fields
      titulo: $titulo
      incluirEstadisticas: $incluirEstadisticas
    ) {
      fileName
      downloadUrl
      totalRegistros
      filtrosAplicados
    }
  }
`;

export default function Reportes() {
  const [filtros, setFiltros] = useState({
    tipo_sacramento_id_tipo: null,
    institucion_parroquia_id_parroquia: null,
    usuario_id_usuario: null,
    activo: null,
    foja: '',
    numero_desde: null,
    numero_hasta: null,
    anio_sacramento: null,
    mes_sacramento: null,
    fecha_sacramento_desde: '',
    fecha_sacramento_hasta: '',
    fecha_registro_desde: '',
    fecha_registro_hasta: '',
    search: ''
  });

  const [campos, setCampos] = useState([
    'fecha_sacramento',
    'foja',
    'numero',
    'tipo_sacramento',
    'activo'
  ]);

  const [config, setConfig] = useState({
    titulo: 'Reporte de Sacramentos',
    incluirEstadisticas: true
  });

  const [estadisticas, setEstadisticas] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const construirFiltros = () => {
    const filtrosLimpios = {};
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {

        // Int a numerico
        if (['tipo_sacramento_id_tipo', 'institucion_parroquia_id_parroquia', 'usuario_id_usuario', 
             'numero_desde', 'numero_hasta', 'anio_sacramento', 'mes_sacramento', 'numero', 
             'anio_registro', 'limit', 'offset'].includes(key)) {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            filtrosLimpios[key] = numValue;
          }
        }
        // Booleano a numerico
        else if (key === 'activo') {
          filtrosLimpios[key] = value === true || value === 'true';
        }
        // Para strings 
        else {
          filtrosLimpios[key] = value;
        }
      }
    });

    return filtrosLimpios;
  };

  const cargarEstadisticas = async () => {
    try {
      const client = getGraphQLClient();
      const filtrosLimpios = construirFiltros();
      
      const data = await client.request(ESTADISTICAS_SACRAMENTOS, {
        filter: Object.keys(filtrosLimpios).length > 0 ? filtrosLimpios : undefined
      });
      
      setEstadisticas(data.estadisticasSacramentos);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las estadísticas.'
      });
    }
  };

  const generarReporte = async () => {
    if (campos.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debes seleccionar al menos un campo para incluir en el reporte.'
      });
    }

    if (!config.titulo.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'Por favor ingresa un título para el reporte.'
      });
    }

    try {
      setGenerando(true);
      const client = getGraphQLClient();
      const filtrosLimpios = construirFiltros();

      const variables = {
        filter: Object.keys(filtrosLimpios).length > 0 ? filtrosLimpios : undefined,
        fields: campos,
        titulo: config.titulo,
        incluirEstadisticas: config.incluirEstadisticas
      };

      const data = await client.request(GENERAR_REPORTE_PDF, variables);

      if (data?.generarReportePDF?.downloadUrl) {
        const url = `http://localhost:4001${data.generarReportePDF.downloadUrl}`;
        setDownloadUrl(url);
        
        Swal.fire({
          icon: 'success',
          title: '¡Reporte generado!',
          html: `
            <p>Se generaron <strong>${data.generarReportePDF.totalRegistros}</strong> registros</p>
            <p class="text-sm text-gray-600 mt-2">${data.generarReportePDF.fileName}</p>
          `,
          confirmButtonText: 'Descargar PDF',
          showCancelButton: true,
          cancelButtonText: 'Cerrar'
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(url, '_blank');
          }
        });
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al generar el PDF',
        text: error.response?.errors?.[0]?.message || 'Revisa los datos ingresados o intenta nuevamente más tarde.'
      });
    } finally {
      setGenerando(false);
    }
  };

  const contarFiltrosActivos = () => {
    return Object.values(filtros).filter(v => v !== null && v !== '').length;
  };

  return (
    <Layout title="Generación de Reportes">
      {/* filtros*/}
      <div className="mb-6">
        <FiltrosReporte filtros={filtros} setFiltros={setFiltros} />
      </div>

      {/* campos y configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SeleccionCampos campos={campos} setCampos={setCampos} />
        <ConfiguracionReporte config={config} setConfig={setConfig} />
      </div>

      {/* resumen y accion */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Reporte</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-primary">filter_alt</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Filtros Aplicados</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{contarFiltrosActivos()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-primary">table_chart</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Campos Seleccionados</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{campos.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estadísticas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {config.incluirEstadisticas ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* vista previa de estadísticas */}
          {config.incluirEstadisticas && (
            <div className="mb-4">
              <button
                onClick={cargarEstadisticas}
                className="text-sm px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-sm align-middle mr-1">preview</span>
                Vista Previa de Estadísticas
              </button>
            </div>
          )}

          {/* Mostrar estadísticas */}
          {estadisticas && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Vista Previa de Estadísticas
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 dark:text-blue-400">Total:</p>
                  <p className="font-bold text-blue-900 dark:text-blue-200">{estadisticas.total}</p>
                </div>
                <div>
                  <p className="text-green-600 dark:text-green-400">Activos:</p>
                  <p className="font-bold text-green-900 dark:text-green-200">{estadisticas.activos}</p>
                </div>
                <div>
                  <p className="text-red-600 dark:text-red-400">Inactivos:</p>
                  <p className="font-bold text-red-900 dark:text-red-200">{estadisticas.inactivos}</p>
                </div>
                <div>
                  <p className="text-purple-600 dark:text-purple-400">Tipos:</p>
                  <p className="font-bold text-purple-900 dark:text-purple-200">
                    {estadisticas.por_tipo?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El reporte se generará en formato PDF con los filtros y campos seleccionados
            </p>
            <button
              onClick={generarReporte}
              disabled={generando || campos.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generando ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Generando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">picture_as_pdf</span>
                  Generar Reporte PDF
                </>
              )}
            </button>
          </div>

          {/* mostrar enlace de descarga */}
          {downloadUrl && !generando && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  <div>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                      Reporte disponible para descarga
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      El archivo estará disponible por 24 horas
                    </p>
                  </div>
                </div>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 