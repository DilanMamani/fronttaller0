import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import Layout from '../../shared/components/layout/Layout';

//import de slices y trunk
import {
  fetchPersonasParaSacramento,
  fetchParroquias,
  crearSacramentoCompleto,
  actualizarSacramentoCompleto,
  buscarSacramentos,
  fetchSacramentoCompleto,
} from './slices/sacramentosTrunk';

import {
  selectIsLoading,
  selectPersonasBusqueda,     // ← usamos el nuevo selector
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting,
  selectSacramentosEncontrados,
  selectSacramentoSeleccionado,
} from './slices/sacramentosSlices';

export default function Sacramentos() {
  //para empezar a consumir
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const personas = useSelector(selectPersonasBusqueda);
  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);
  const isDeleting = useSelector(selectIsDeleting);

  //busqueda inicial de persona (bautizo/comunión) y para matrimonio (esposo/esposa)
  const [queryEsposo, setQueryEsposo] = useState("");
  const [queryEsposa, setQueryEsposa] = useState("");
  const [queryPersona, setQueryPersona] = useState(""); // keep for bautizo/comunión only
  const [listaEsposo, setListaEsposo] = useState([]);
  const [listaEsposa, setListaEsposa] = useState([]);
  const [listaPersonas, setListaPersonas] = useState([]); // keep for other sacramentos
  const [openPersonaList, setOpenPersonaList] = useState(false); // for bautizo/comunión only
  const [openEsposoList, setOpenEsposoList] = useState(false);
  const [openEsposaList, setOpenEsposaList] = useState(false);
  //busqueda de padrino
  const [queryPadrino, setQueryPadrino] = useState("");
  const [listaPadrinos, setListaPadrinos] = useState([]);
  const [openPadrinoList, setOpenPadrinoList] = useState(false);
  //busqueda de ministro
  const [queryMinistro, setQueryMinistro] = useState("");
  const [listaMinistros, setListaMinistros] = useState([]);
  const [openMinistroList, setOpenMinistroList] = useState(false);
  //busqueda de parroquia
  const [queryParroquia, setQueryParroquia] = useState("");
  const [listaParroquias, setListaParroquias] = useState([]);
  const [openParroquiaList, setOpenParroquiaList] = useState(false);
  // New state flags for selection
  const [personaSelected, setPersonaSelected] = useState(false);
  const [padrinoSelected, setPadrinoSelected] = useState(false);
  const [ministroSelected, setMinistroSelected] = useState(false);
  const [parroquiaSelected, setParroquiaSelected] = useState(false);
  // Estado para forzar loading del update
  const [forceUpdateLoading, setForceUpdateLoading] = useState(false);
// Loading locales para mostrar spinner durante el delay + fetch
const [loadingPersona, setLoadingPersona] = useState(false);
const [loadingPadrino, setLoadingPadrino] = useState(false);
const [loadingMinistro, setLoadingMinistro] = useState(false);
const [loadingParroquia, setLoadingParroquia] = useState(false);
const [loadingSacramento, setLoadingSacramento] = useState(false);
  //para busqueda de sacramento y actualizar
  const [padrinoActual, setPadrinoActual] = useState("");
const [ministroActual, setMinistroActual] = useState("");
  // Loading locales para mostrar spinner durante el delay + fetch

  const [loadingEsposo, setLoadingEsposo] = useState(false);
  const [loadingEsposa, setLoadingEsposa] = useState(false);

    //para busqueda de sacramento y actualizar

  // === MATRIMONIO ===
  const [esposoData, setEsposoData] = useState(null);
  const [esposaData, setEsposaData] = useState(null);


  //diccioinario para roles
  const ROL_IDS = {
    BAUTIZADO: 1,
    COMULGADO: 2,
    CONFIRMADO: 10,
    ESPOSO: 2,
    PADRINO: 5,
    MINISTRO: 9,
    ESPOSA: 3,
  };
  //diccionario para tipo de sacramento
  const TIPO_SACRAMENTO_IDS = {
  bautizo: 1,
  matrimonio: 2,
  comunion: 3,
};
  const ROLES_SACRAMENTO_IDS = {
  bautizo: 1,
  matrimonio: 3,
  comunion: 10,
};
  


  // --- Estados locales ---
  const [mergeOpen, setMergeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('agregar') // pestaña activa
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [tipoSacramento, setTipoSacramento] = useState('bautizo')

  // --- Estados del formulario  para el sacramento
  const [form, setForm] = useState({
    // comunes a todos los sacramentos
    personaId: null,                // persona que recibe el sacramento
    padrinoId: null,                // persona seleccionada como padrino (opcional)
    ministroId: null,                   // ministro en texto por ahora
    parroquiaId: null, 
    foja: '',
    numero: '',
    fecha_sacramento: '',           // yyyy-mm-dd
    activo: true,
  });

  // Extras sólo para matrimonio (tabla matrimonio_detalle)
  const [matrimonio, setMatrimonio] = useState({
    esposoId: null,
    esposaId: null,
    lugar_ceremonia: '',
    reg_civil: '',
    numero_acta: '',
  });

  // Filtros para buscar/editar
  const [filters, setFilters] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    carnet_identidad: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    activo: '',
  });

  // Resultados de búsqueda para la persona
  const [results, setResults] = useState([]);

  // para toast
  const [toast, setToast] = useState(null);
    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
  }, [toast]);

  // --- Helpers ---
  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const handleMatChange = (key, value) => setMatrimonio(prev => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({ personaId: null, padrinoId: null, ministroId: null, parroquiaId: null, foja: '', numero: '', fecha_sacramento: '', activo: true });
    setMatrimonio({ esposoId: null, esposaId: null, lugar_ceremonia: '', reg_civil: '', numero_acta: '' });
    setQueryPersona("");
    setQueryPadrino("");
    setQueryMinistro("");
    setQueryParroquia("");
    setOpenPersonaList(false);
    setOpenPadrinoList(false);
    setOpenMinistroList(false);
    setOpenParroquiaList(false);
  };

useEffect(() => {
  if (queryPersona.trim().length < 2) {
    setListaPersonas([]);
    setLoadingPersona(false);
    return;
  }

  const delay = setTimeout(() => {
    dispatch(fetchPersonasParaSacramento({
      search: queryPersona,
      rol: tipoSacramento,
      tipo: "sacramento"
    }))
      .unwrap()
      .then((data) => {
        setListaPersonas(data.personas || []);
        setOpenPersonaList(true);
      })
      .catch(() => {
        setListaPersonas([]);
      })
      .finally(() => {
        setLoadingPersona(false);  
      });
  }, 300);

  return () => clearTimeout(delay);
}, [queryPersona, tipoSacramento]);

// === Filtro independiente para ESPOSO ===
useEffect(() => {
  if (queryEsposo.trim().length < 2) {
    setListaEsposo([]);
    setLoadingEsposo(false);
    return;
  }

  setLoadingEsposo(true);

  const delay = setTimeout(() => {
    dispatch(fetchPersonasParaSacramento({
      search: queryEsposo,
      rol: tipoSacramento,
      tipo: "sacramento"
    }))
      .unwrap()
      .then((data) => {
        setListaEsposo(data.personas || []);
        setOpenEsposoList(true);
      })
      .catch(() => setListaEsposo([]))
      .finally(() => setLoadingEsposo(false));
  }, 300);

  return () => clearTimeout(delay);
}, [queryEsposo]);

// === Filtro independiente para ESPOSA ===
useEffect(() => {
  if (queryEsposa.trim().length < 2) {
    setListaEsposa([]);
    setLoadingEsposa(false);
    return;
  }

  setLoadingEsposa(true);

  const delay = setTimeout(() => {
    dispatch(fetchPersonasParaSacramento({
      search: queryEsposa,
      rol: tipoSacramento,
      tipo: "sacramento"
    }))
      .unwrap()
      .then((data) => {
        setListaEsposa(data.personas || []);
        setOpenEsposaList(true);
      })
      .catch(() => setListaEsposa([]))
      .finally(() => setLoadingEsposa(false));
  }, 300);

  return () => clearTimeout(delay);
}, [queryEsposa]);

  //filtros de padrino
  useEffect(() => {
    if (queryPadrino.trim().length < 2) {
      setListaPadrinos([]);
      setLoadingPadrino(false);
      return;
    }

    const delay = setTimeout(() => {
      dispatch(fetchPersonasParaSacramento({
        search: queryPadrino,
        rol: "padrino",
        tipo: "rol"
      }))
        .unwrap()
        .then((data) => {
          setListaPadrinos(data.personas || []);
          setOpenPadrinoList(true);
        })
        .catch(() => {
          setListaPadrinos([]);
        })
        .finally(() => setLoadingPadrino(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [queryPadrino, tipoSacramento]);

// filtro para ministro
  useEffect(() => {
    if (queryMinistro.trim().length < 2) {
      setListaMinistros([]);
      setLoadingMinistro(false);
      return;
    }

    const delay = setTimeout(() => {
      dispatch(fetchPersonasParaSacramento({
        search: queryMinistro,
        rol: "ministro",
        tipo: "rol"
      }))
        .unwrap()
        .then((data) => {
          setListaMinistros(data.personas || []);
          setOpenMinistroList(true);
        })
        .catch(() => {
          setListaMinistros([]);
        })
        .finally(() => setLoadingMinistro(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [queryMinistro, tipoSacramento]);

//filtro para parroquias
useEffect(() => {
  if (queryParroquia.trim().length < 2) {
    setListaParroquias([]);
    setLoadingParroquia(false);
    return;
  }

  const delay = setTimeout(() => {
    dispatch(fetchParroquias({ search: queryParroquia }))
      .unwrap()
      .then((data) => {
        setListaParroquias(data.parroquias || []);
        setOpenParroquiaList(true);
      })
      .catch(() => {
        setListaParroquias([]);
      })
      .finally(() => setLoadingParroquia(false));
  }, 300);

  return () => clearTimeout(delay);
}, [queryParroquia]);



  // Construye el payload para CREAR sacramento
  const buildPayloadCrear = () => {
    const relacionesArray = [];

    // Persona que recibe el sacramento
    if (form.personaId) {
      relacionesArray.push({
        persona_id: form.personaId,
        rol_sacramento_id: TIPO_SACRAMENTO_IDS[tipoSacramento] // BAUTIZADO o COMULGADO
      });
    }

    // Padrino (opcional)
    if (form.padrinoId) {
      relacionesArray.push({
        persona_id: form.padrinoId,
        rol_sacramento_id: ROL_IDS.PADRINO
      });
    }

    // Ministro (opcional)
    if (form.ministroId) {
      relacionesArray.push({
        persona_id: form.ministroId,
        rol_sacramento_id: ROL_IDS.MINISTRO
      });
    }

    //para esposo y esposa en matrimonio
    if (tipoSacramento === 'matrimonio') {
      if (matrimonio.esposoId) {
        relacionesArray.push({
          persona_id: matrimonio.esposoId,
          rol_sacramento_id: ROL_IDS.ESPOSO
        });
      }
      if (matrimonio.esposaId) {
        relacionesArray.push({
          persona_id: matrimonio.esposaId,
          rol_sacramento_id: ROL_IDS.ESPOSA
        });
      }
    }

    return {
      fecha_sacramento: form.fecha_sacramento,
      foja: form.foja,
      numero: form.numero,

      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoSacramento],
      parroquiaId: form.parroquiaId,

      //en el caso de matrimonio, enviamos detalles adicionales
      matrimonioDetalle: tipoSacramento === 'matrimonio' ? {
        lugar_ceremonia: matrimonio.lugar_ceremonia,
        reg_civil: matrimonio.reg_civil,
        numero_acta: matrimonio.numero_acta,
      } : null,

      relaciones: relacionesArray
    };
  };

  // Construye el payload para EDITAR sacramento
  const buildPayloadEditar = () => {
  const relacionesArray = [];

  // --- Persona Bautizada 
  if (form.personaId) {
    relacionesArray.push({
      persona_id: form.personaId,
      rol_sacramento_id: ROL_IDS.BAUTIZADO  
    });
  }

  // Relaciones originales para mantener si no cambian
  const relacionesOriginales = selectedPerson?.todasRelaciones || [];

  const relOriginalPadrino = relacionesOriginales.find(
    r => r.rolSacramento?.id_rol_sacra === ROL_IDS.PADRINO
  );

  const relOriginalMinistro = relacionesOriginales.find(
    r => r.rolSacramento?.id_rol_sacra === ROL_IDS.MINISTRO
  );

  // --- Padrino ---
  if (form.padrinoId) {
    relacionesArray.push({
      persona_id: form.padrinoId,
      rol_sacramento_id: ROL_IDS.PADRINO
    });
  } else if (relOriginalPadrino) {
    relacionesArray.push({
      persona_id: relOriginalPadrino.persona_id_persona,
      rol_sacramento_id: ROL_IDS.PADRINO
    });
  }

  // --- Ministro ---
  if (form.ministroId) {
    relacionesArray.push({
      persona_id: form.ministroId,
      rol_sacramento_id: ROL_IDS.MINISTRO
    });
  } else if (relOriginalMinistro) {
    relacionesArray.push({
      persona_id: relOriginalMinistro.persona_id_persona,
      rol_sacramento_id: ROL_IDS.MINISTRO
    });
  }

  const safe = (v) => (v && String(v).trim() !== "" ? v : undefined);

  return {
    fecha_sacramento: safe(form.fecha_sacramento),
    foja: safe(form.foja),
    numero: safe(form.numero),
    tipo_sacramento_id_tipo: selectedPerson.tipoSacramento.id_tipo,
    parroquiaId: safe(form.parroquiaId),
    relaciones: relacionesArray,
    
  };
};

  // Envío de Agregar (simulado)
  const handleSubmitAgregar = (e) => {
    e.preventDefault();

    const payload = buildPayloadCrear();
    // 🛑 SOLO VERIFICAR MATRIMONIO — NO ENVIAR AL BACK
    console.log(payload);

    // 🚀 Integración real con Redux
    dispatch(crearSacramentoCompleto(payload))
      .unwrap()
      .then((res) => {
        console.log("SACRAMENTO CREADO:", res);
        setToast({ type: "success", message: "Sacramento registrado correctamente" });

        resetForm();
        setQueryPersona("");
        setQueryPadrino("");
        setQueryMinistro("");
        setQueryParroquia("");
      })
      .catch((err) => {
        console.error("ERROR AL CREAR SACRAMENTO:", err);
        setToast({ type: "error", message: err?.message || "Error al registrar sacramento" });
      });
  };

  // Buscar sacramentos
  const handleBuscar = (e) => {

    e.preventDefault();
    setLoadingSacramento(true);
    const payload = {
      ...filters,
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoSacramento],
      rol_principal: ROLES_SACRAMENTO_IDS[tipoSacramento],
    };
    dispatch(buscarSacramentos(payload))
      .unwrap()
      .then((res) => {
        const planos = [];
        res.resultados.forEach((sac) => {
          sac.personaSacramentos.forEach((rel) => {
            if (!rel.persona) return;
            planos.push({
              id_sacramento: sac.id_sacramento,
              nombre: rel.persona.nombre,
              apellido_paterno: rel.persona.apellido_paterno,
              apellido_materno: rel.persona.apellido_materno,
              carnet_identidad: rel.persona.carnet_identidad,
              fecha_sacramento: sac.fecha_sacramento,
              rol_nombre: obtenerNombreRol(rel.rol_sacramento_id_rol_sacra),
              foja: sac.foja,
              numero: sac.numero,

              // datos para edición
              persona_id: rel.persona.id_persona,
              persona: rel.persona,

              // AHORA GUARDAMOS TODAS LAS RELACIONES
              todasRelaciones: sac.todasRelaciones,

              parroquia: sac.parroquia,
              tipoSacramento: sac.tipoSacramento,
              matrimonio_detalle: sac.matrimonioDetalle
            });
          });
        });
        console.log("🔎 Buscando sacramentos tipo:", {
          tipoSacramento,
          tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoSacramento],
        });
        setResults(planos);
      })
      .catch((err) => {
        console.error("ERROR buscando sacramentos:", err);
        setToast({ type: "error", message: "No se pudo realizar la búsqueda" });
      })
      .finally(() => setLoadingSacramento(false));
  };

  const handleSelectResultado = (row) => {
    console.log("🟡 Seleccionado para edición:", row);

    setSelectedPerson(row);

    const relaciones = row.todasRelaciones || [];
    console.log("🔗 Relaciones encontradas:", relaciones);

    // =========================
    // PERSONA PRINCIPAL
    // =========================
    const relPrincipal = relaciones.find(
      (rel) => rel.rol_sacramento_id_rol_sacra === ROLES_SACRAMENTO_IDS[tipoSacramento]
    );

    // =========================
    // PADRINO / MINISTRO
    // =========================
    const relPadrino = relaciones.find(
      (rel) => rel.rol_sacramento_id_rol_sacra === ROL_IDS.PADRINO
    );

    const relMinistro = relaciones.find(
      (rel) => rel.rol_sacramento_id_rol_sacra === ROL_IDS.MINISTRO
    );

    // =========================
    // MATRIMONIO: ESPOSO / ESPOSA
    // =========================
    const relEsposo = relaciones.find(
      (rel) => rel.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSO
    );

    const relEsposa = relaciones.find(
      (rel) => rel.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSA
    );

    console.log("👨 Esposo:", relEsposo);
    console.log("👩 Esposa:", relEsposa);

    // =========================
    // FORM PRINCIPAL
    // =========================
    setForm({
      personaId: relPrincipal?.persona_id_persona || row.persona_id || null,
      padrinoId: relPadrino?.persona_id_persona || null,
      ministroId: relMinistro?.persona_id_persona || null,
      parroquiaId: row.parroquia?.id_parroquia || null,
      foja: row.foja || "",
      numero: row.numero || "",
      fecha_sacramento: row.fecha_sacramento || "",
      activo: true,
    });

    // =========================
    // QUERY PERSONA PRINCIPAL
    // =========================
    if (relPrincipal?.persona) {
      const p = relPrincipal.persona;
      setQueryPersona(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
    }

    // =========================
    // QUERY PADRINO
    // =========================
    if (relPadrino?.persona) {
      const p = relPadrino.persona;
      setQueryPadrino(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
    } else {
      setQueryPadrino("");
    }

    // =========================
    // QUERY MINISTRO
    // =========================
    if (relMinistro?.persona) {
      const p = relMinistro.persona;
      setQueryMinistro(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
    } else {
      setQueryMinistro("");
    }

    // =========================
    // QUERY PARROQUIA
    // =========================
    setQueryParroquia(row.parroquia?.nombre || "");

    // =========================
    // MATRIMONIO: CARGAR DATOS
    // =========================
    if (tipoSacramento === "matrimonio") {
      if (relEsposo?.persona) {
        const p = relEsposo.persona;
        setQueryEsposo(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
        handleMatChange("esposoId", relEsposo.persona_id_persona);
      } else {
        setQueryEsposo("");
      }

      if (relEsposa?.persona) {
        const p = relEsposa.persona;
        setQueryEsposa(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
        handleMatChange("esposaId", relEsposa.persona_id_persona);
      } else {
        setQueryEsposa("");
      }

      console.log("📄 Matrimonio detalle recibido:", row.matrimonio_detalle);

      if (row.matrimonio_detalle) {
        setMatrimonio({
          esposoId: relEsposo?.persona_id_persona || null,
          esposaId: relEsposa?.persona_id_persona || null,
          lugar_ceremonia: row.matrimonio_detalle.lugar_ceremonia || "",
          reg_civil: row.matrimonio_detalle.reg_civil || "",
          numero_acta: row.matrimonio_detalle.numero_acta || "",
        });

      } else {
        setMatrimonio({
          esposoId: relEsposo?.persona_id_persona || null,
          esposaId: relEsposa?.persona_id_persona || null,
          lugar_ceremonia: "",
          reg_civil: "",
          numero_acta: "",
        });
      }
    }

    console.log("✅ Formulario cargado para edición");
    console.log("Formulario:", {
      form,
      matrimonio,
    });
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    setForceUpdateLoading(true);
    const payload = buildPayloadEditar();
     console.log(" Payload enviado al backend (EDITAR):", JSON.stringify(payload, null, 2));
    
    dispatch(
      actualizarSacramentoCompleto({
        id: selectedPerson.id_sacramento,
        sacramentoData: payload
      })
    )
      .unwrap()
      .then(() => {
        setToast({
          type: "success",
          message: "Sacramento actualizado correctamente"
        });
        setTimeout(() => setForceUpdateLoading(false), 1000);
        // limpiar campos
        setQueryPersona("");
        setQueryPadrino("");
        setQueryMinistro("");
        setQueryParroquia("");
        resetForm();
        setMatrimonio({
          esposoId: null,
          esposaId: null,
          lugar_ceremonia: "",
          reg_civil: "",
          numero_acta: "",
        });

        // cerrar editor
        setSelectedPerson(null);
        setResults([]);
      })
      .catch((err) => {
        console.error("Error actualizando sacramento:", err);
        setToast({
          type: "error",
          message: "No se pudo actualizar el sacramento"
        });
        setTimeout(() => setForceUpdateLoading(false), 1000);
      });
      };

  // Helper para obtener el nombre del rol
  const obtenerNombreRol = (id) => {
    const roles = {
      1: "Bautizado",
      5: "Padrino",
      9: "Ministro",
      10: "Confirmado",
      2: "Esposo",
      3: "Esposa",
      21: "Comulgado",
    };

    return roles[id] || "Otro";
  };

  return (
    <Layout title="Gestión de Sacramentos">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-[9999] text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
      {/* Selector de tipo de sacramento */}
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center gap-2">
          {[
            { key: 'bautizo', label: 'Bautizo' },
            { key: 'comunion', label: 'Primera Comunión' },
            { key: 'matrimonio', label: 'Matrimonio' },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors select-none ${
                tipoSacramento === opt.key
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <input
                type="radio"
                name="tipoSacramento"
                value={opt.key}
                checked={tipoSacramento === opt.key}
                onChange={() => setTipoSacramento(opt.key)}
                className="hidden"
              />
              <span className="material-symbols-outlined text-base">folder</span>
              <span className="text-sm whitespace-nowrap">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('agregar')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === 'agregar'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          Agregar Sacramento
        </button>
        <button
          onClick={() => setActiveTab('buscar')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === 'buscar'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          Buscar / Editar
        </button>
      </div>

      {/* Contenido dinámico según la pestaña */}
      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos del Sacramento</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{tipoSacramento === 'comunion' ? 'Primera Comunión' : tipoSacramento.charAt(0).toUpperCase() + tipoSacramento.slice(1)}</span>
            </div>
          </div>
          <form className="p-6" onSubmit={handleSubmitAgregar}>
            {/* Campo para buscar la persona que recibió el sacramento (solo Bautizo y Primera Comunión) */}
            {(tipoSacramento === 'bautizo' || tipoSacramento === 'comunion') && (
              <div className="mt-2 mb-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Persona que recibió el {tipoSacramento === 'comunion' ? 'Primera Comunión' : 'Bautizo'}
                </h4>
                <div className="mb-6 relative">
                      <input
                        type="search"
                        placeholder="Buscar persona (nombre o CI registrado)"
                        value={queryPersona}
                        onChange={e => {
                          setQueryPersona(e.target.value);
                          setPersonaSelected(false);
                          setListaPersonas([]);
                        }}
                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                      />
                    {/* DROPDOWN PERSONA */}
{!personaSelected && openPersonaList && (
  <div
    style={{
      position: "absolute",
      background: "white",
      border: "1px solid #dcdcdc",
      borderRadius: "8px",
      marginTop: "4px",
      width: "95%",
      maxHeight: "220px",
      overflowY: "auto",
      zIndex: 9999,
      padding: "5px",
    }}
  >
    {/* Loading */}
    {(loadingPersona || isLoading) && (
      <div className="flex justify-center items-center py-4">
        <ClipLoader size={28} color="#4f46e5" />
      </div>
    )}

    {/* Sin resultados */}
    {!personaSelected && listaPersonas.length === 0 && queryPersona.length > 0 &&  (
      <div className="py-3 text-center text-sm text-gray-500">
        No se encontraron personas con ese valor.
      </div>
    )}

    {/* Resultados */}
    {!isLoading && listaPersonas.length > 0 && (
      listaPersonas.map((p) => (
        <div
          key={p.id_persona}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={() => {
            handleChange("personaId", p.id_persona);
            setQueryPersona(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
            setListaPersonas([]);
            setPersonaSelected(true);
            setOpenPersonaList(false);
          }}
        >
          <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
          <div style={{ fontSize: "13px", color: "#666" }}>
            CI: {p.carnet_identidad}
          </div>
        </div>
      ))
    )}
  </div>
)}

                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    search
                  </span>

                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Busque la persona registrada en la base de datos que se bautizó o realizó la comunión.
                </p>
              </div>
            )}
            {/* Campos específicos para Bautizo y Confirmación (sin foja) */}
            {(tipoSacramento === 'bautizo' || tipoSacramento === 'comunion') && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Detalles de {tipoSacramento === 'comunion' ? 'Primera Comunión' : 'Bautizo'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Padrino</label>
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Buscar padrino (persona registrada)"
                          value={queryPadrino}
                          onChange={e => {
                            setQueryPadrino(e.target.value);
                            setPadrinoSelected(false);
                            setListaPadrinos([]);
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN PADRINO */}
{!padrinoSelected && openPadrinoList && (
  <div
    style={{
      position: "absolute",
      background: "white",
      border: "1px solid #dcdcdc",
      borderRadius: "8px",
      marginTop: "4px",
      width: "95%",
      maxHeight: "220px",
      overflowY: "auto",
      zIndex: 9999,
      padding: "5px",
    }}
  >
    {(loadingPadrino || isLoading) && (
      <div className="flex justify-center items-center py-4">
        <ClipLoader size={28} color="#4f46e5" />
      </div>
    )}

    {!padrinoSelected && listaPadrinos.length === 0 && queryPadrino.length > 0 && (
      <div className="py-3 text-center text-sm text-gray-500">
        No se encontraron padrinos con ese valor.
      </div>
    )}

    {!loadingPadrino && !isLoading && listaPadrinos.length > 0 && (
      listaPadrinos.map((p) => (
        <div
          key={p.id_persona}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={() => {
            handleChange("padrinoId", p.id_persona);
            setQueryPadrino(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
            setListaPadrinos([]);
            setPadrinoSelected(true);
            setOpenPadrinoList(false);
          }}
        >
          <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
          <div style={{ fontSize: "13px", color: "#666" }}>
            CI: {p.carnet_identidad}
          </div>
        </div>
      ))
    )}
  </div>
)}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o CI para buscar en Personas.</p>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ministro</label>
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Buscar ministro (persona registrada)"
                          value={queryMinistro}
                          onChange={e => {
                            setQueryMinistro(e.target.value);
                            setMinistroSelected(false);
                            setListaMinistros([]);
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN MINISTRO */}
{!ministroSelected && openMinistroList && (
  <div
    style={{
      position: "absolute",
      background: "white",
      border: "1px solid #dcdcdc",
      borderRadius: "8px",
      marginTop: "4px",
      width: "95%",
      maxHeight: "220px",
      overflowY: "auto",
      zIndex: 9999,
      padding: "5px",
    }}
  >
    {(loadingMinistro || isLoading) && (
      <div className="flex justify-center items-center py-4">
        <ClipLoader size={28} color="#4f46e5" />
      </div>
    )}

    {!ministroSelected && listaMinistros.length === 0 && queryMinistro.length > 0 && (
      <div className="py-3 text-center text-sm text-gray-500">
        No se encontraron ministros con ese valor.
      </div>
    )}

    {!loadingMinistro && !isLoading && listaMinistros.length > 0 && (
      listaMinistros.map((p) => (
        <div
          key={p.id_persona}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={() => {
            handleChange("ministroId", p.id_persona);
            setQueryMinistro(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
            setListaMinistros([]);
            setMinistroSelected(true);
            setOpenMinistroList(false);
          }}
        >
          <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
          <div style={{ fontSize: "13px", color: "#666" }}>
            CI: {p.carnet_identidad}
          </div>
        </div>
      ))
    )}
  </div>
)}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o CI para buscar en Personas.</p>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parroquia</label>
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Busca parroquia (previamente registrada)"
                          value={queryParroquia}
                          onChange={e => {
                            setQueryParroquia(e.target.value);
                            setParroquiaSelected(false);
                            setListaParroquias([]);
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN PARROQUIA */}
{!parroquiaSelected && openParroquiaList && (
  <div
    style={{
      position: "absolute",
      background: "white",
      border: "1px solid #dcdcdc",
      borderRadius: "8px",
      marginTop: "4px",
      width: "95%",
      maxHeight: "220px",
      overflowY: "auto",
      zIndex: 9999,
      padding: "5px",
    }}
  >
    {(loadingParroquia || isLoading) && (
      <div className="flex justify-center items-center py-4">
        <ClipLoader size={28} color="#4f46e5" />
      </div>
    )}

    {!parroquiaSelected && listaParroquias.length === 0 && queryParroquia.length > 0 && (
      <div className="py-3 text-center text-sm text-gray-500">
        No se encontraron parroquias con ese valor.
      </div>
    )}

    {!loadingParroquia && !isLoading && listaParroquias.length > 0 && (
      listaParroquias.map((p) => (
        <div
          key={p.id_parroquia}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={() => {
            handleChange("parroquiaId", p.id_parroquia);
            setQueryParroquia(`${p.nombre}`);
            setListaParroquias([]);
            setParroquiaSelected(true);
            setOpenParroquiaList(false);
          }}
        >
          <strong>{p.nombre}</strong>
          <div style={{ fontSize: "13px", color: "#666" }}>
            Email: {p.email} – Tel: {p.telefono}
          </div>
        </div>
      ))
    )}
  </div>
)}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o email para buscar en Parroquias.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foja</label>
                    <input
                      type="text"
                      placeholder="Ej. 123-A"
                      value={form.foja}
                      onChange={e => handleChange('foja', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="Ej. 123-A"
                      value={form.numero}
                      onChange={e => handleChange('numero', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha del Sacramento</label>
                    <input
                      type="date"
                      value={form.fecha_sacramento}
                      onChange={e => handleChange('fecha_sacramento', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Campos específicos para Matrimonio */}
            {tipoSacramento === 'matrimonio' && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Detalles del Matrimonio</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Esposo */}
                  <div className="mt-2 mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Esposo 
                    </h4>
                    <div className="mb-6 relative">
                      <input
                        type="search"
                        placeholder="Buscar persona (nombre o CI registrado)"
                        value={queryEsposo}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQueryEsposo(value);
                          if (value.trim().length >= 2) {
                            setLoadingPersona(true);
                            setOpenEsposoList(true);
                          } else {
                            setOpenEsposoList(false);
                            setLoadingPersona(false);
                          }
                        }}
                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                      />
                      {/* DROPDOWN ESPOSO */}
                      {openEsposoList && (
                        <div
                          style={{
                            position: "absolute",
                            background: "white",
                            border: "1px solid #dcdcdc",
                            borderRadius: "8px",
                            marginTop: "4px",
                            width: "95%",
                            maxHeight: "220px",
                            overflowY: "auto",
                            zIndex: 9999,
                            padding: "5px",
                          }}
                        >
                          {/* Loading */}
                          {loadingEsposo && (
                            <div className="flex justify-center items-center py-4">
                              <ClipLoader size={28} color="#4f46e5" />
                            </div>
                          )}
                          {/* Sin resultados */}
                          {!loadingEsposo && listaEsposo.length === 0 && (
                            <div className="py-3 text-center text-sm text-gray-500">
                              No se encontraron personas con ese valor.
                            </div>
                          )}
                          {/* Resultados */}
                          {listaEsposo.length > 0 && (
                            listaEsposo.map((p) => (
                              <div
                                key={p.id_persona}
                                style={{
                                  padding: "10px",
                                  borderBottom: "1px solid #eee",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  handleMatChange("esposoId", p.id_persona);
                                  setQueryEsposo(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
                                  setOpenEsposoList(false);
                                }}
                              >
                                <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
                                <div style={{ fontSize: "13px", color: "#666" }}>
                                  CI: {p.carnet_identidad}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        search
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Busque la persona registrada en la base de datos que se casó.
                    </p>
                  </div>
                  {/* Esposa */}
                  <div className="mt-2 mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Esposa
                    </h4>
                    <div className="mb-6 relative">
                      <input
                        type="search"
                        placeholder="Buscar persona (nombre o CI registrado)"
                        value={queryEsposa}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQueryEsposa(value);
                          if (value.trim().length >= 2) {
                            setLoadingPersona(true);
                            setOpenEsposaList(true);
                          } else {
                            setOpenEsposaList(false);
                            setLoadingPersona(false);
                          }
                        }}
                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                      />
                      {/* DROPDOWN ESPOSA */}
                      {openEsposaList && (
                        <div
                          style={{
                            position: "absolute",
                            background: "white",
                            border: "1px solid #dcdcdc",
                            borderRadius: "8px",
                            marginTop: "4px",
                            width: "95%",
                            maxHeight: "220px",
                            overflowY: "auto",
                            zIndex: 9999,
                            padding: "5px",
                          }}
                        >
                          {/* Loading */}
                          {loadingEsposa && (
                            <div className="flex justify-center items-center py-4">
                              <ClipLoader size={28} color="#4f46e5" />
                            </div>
                          )}
                          {/* Sin resultados */}
                          {!loadingEsposa && listaEsposa.length === 0 && (
                            <div className="py-3 text-center text-sm text-gray-500">
                              No se encontraron personas con ese valor.
                            </div>
                          )}
                          {/* Resultados */}
                          {listaEsposa.length > 0 && (
                            listaEsposa.map((p) => (
                              <div
                                key={p.id_persona}
                                style={{
                                  padding: "10px",
                                  borderBottom: "1px solid #eee",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  handleMatChange("esposaId", p.id_persona);
                                  setQueryEsposa(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
                                  setOpenEsposaList(false);
                                }}
                              >
                                <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
                                <div style={{ fontSize: "13px", color: "#666" }}>
                                  CI: {p.carnet_identidad}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        search
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Busque la persona registrada en la base de datos que se casó.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lugar de la Ceremonia</label>
                    <input
                      type="text"
                      placeholder="Lugar donde se realizó el matrimonio"
                      value={matrimonio.lugar_ceremonia}
                      onChange={e => handleMatChange('lugar_ceremonia', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acta del Registro Civil</label>
                    <input
                      type="text"
                      placeholder="Ej. 123/2025 - Oficialía X"
                      value={matrimonio.reg_civil}
                      onChange={e => handleMatChange('reg_civil', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Acta</label>
                    <input
                      type="text"
                      placeholder="Ej. 0456 / Libro 23"
                      value={matrimonio.numero_acta}
                      onChange={e => handleMatChange('numero_acta', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                  {/* Campos nuevos con la lógica para padrino, ministro, parroquia */}
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Padrino</label>
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Buscar padrino (persona registrada)"
                          value={queryPadrino}
                          onChange={(e) => {
                            const value = e.target.value;
                            setQueryPadrino(value);

                            if (value.trim().length >= 2) {
                              setLoadingPadrino(true);
                              setOpenPadrinoList(true);
                            } else {
                              setLoadingPadrino(false);
                              setOpenPadrinoList(false);
                            }
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN PADRINO */}
                        {openPadrinoList && (
                          <div
                            style={{
                              position: "absolute",
                              background: "white",
                              border: "1px solid #dcdcdc",
                              borderRadius: "8px",
                              marginTop: "4px",
                              width: "95%",
                              maxHeight: "220px",
                              overflowY: "auto",
                              zIndex: 9999,
                              padding: "5px",
                            }}
                          >
                            {(loadingPadrino || isLoading) && (
                              <div className="flex justify-center items-center py-4">
                                <ClipLoader size={28} color="#4f46e5" />
                              </div>
                            )}

                            {openPadrinoList && !loadingPadrino && !isLoading && listaPadrinos.length === 0 && queryPadrino.trim().length >= 2 && (
                              <div className="py-3 text-center text-sm text-gray-500">
                                No se encontraron padrinos con ese valor.
                              </div>
                            )}

                            {!loadingPadrino && !isLoading && listaPadrinos.length > 0 && (
                              listaPadrinos.map((p) => (
                                <div
                                  key={p.id_persona}
                                  style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #eee",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    handleChange("padrinoId", p.id_persona);
                                    setQueryPadrino(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
                                    setOpenPadrinoList(false);
                                  }}
                                >
                                  <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
                                  <div style={{ fontSize: "13px", color: "#666" }}>
                                    CI: {p.carnet_identidad}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o CI para buscar en Personas.</p>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ministro</label>
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Buscar ministro (persona registrada)"
                          value={queryMinistro}
                          onChange={(e) => {
                            const value = e.target.value;
                            setQueryMinistro(value);

                            if (value.trim().length >= 2) {
                              setLoadingMinistro(true);
                              setOpenMinistroList(true);
                            } else {
                              setLoadingMinistro(false);
                              setOpenMinistroList(false);
                            }
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN MINISTRO */}
                        {openMinistroList && (
                          <div
                            style={{
                              position: "absolute",
                              background: "white",
                              border: "1px solid #dcdcdc",
                              borderRadius: "8px",
                              marginTop: "4px",
                              width: "95%",
                              maxHeight: "220px",
                              overflowY: "auto",
                              zIndex: 9999,
                              padding: "5px",
                            }}
                          >
                            {(loadingMinistro || isLoading) && (
                              <div className="flex justify-center items-center py-4">
                                <ClipLoader size={28} color="#4f46e5" />
                              </div>
                            )}

                            {openMinistroList && !loadingMinistro && !isLoading && listaMinistros.length === 0 && queryMinistro.trim().length >= 2 && (
                              <div className="py-3 text-center text-sm text-gray-500">
                                No se encontraron ministros con ese valor.
                              </div>
                            )}

                            {!loadingMinistro && !isLoading && listaMinistros.length > 0 && (
                              listaMinistros.map((p) => (
                                <div
                                  key={p.id_persona}
                                  style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #eee",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    handleChange("ministroId", p.id_persona);
                                    setQueryMinistro(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
                                    setOpenMinistroList(false);
                                  }}
                                >
                                  <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
                                  <div style={{ fontSize: "13px", color: "#666" }}>
                                    CI: {p.carnet_identidad}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o CI para buscar en Personas.</p>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parroquia</label>
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Busca parroquia (previamente registrada)"
                          value={queryParroquia}
                          onChange={(e) => {
                            const value = e.target.value;
                            setQueryParroquia(value);

                            if (value.trim().length >= 2) {
                              setLoadingParroquia(true);
                              setOpenParroquiaList(true);
                            } else {
                              setLoadingParroquia(false);
                              setOpenParroquiaList(false);
                            }
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN PARROQUIA */}
                          {openParroquiaList && (
                            <div
                              style={{
                                position: "absolute",
                                background: "white",
                                border: "1px solid #dcdcdc",
                                borderRadius: "8px",
                                marginTop: "4px",
                                width: "95%",
                                maxHeight: "220px",
                                overflowY: "auto",
                                zIndex: 9999,
                                padding: "5px",
                              }}
                            >
                              {(loadingParroquia || isLoading) && (
                                <div className="flex justify-center items-center py-4">
                                  <ClipLoader size={28} color="#4f46e5" />
                                </div>
                              )}

                              {openParroquiaList && !loadingParroquia && !isLoading && listaParroquias.length === 0 && queryParroquia.trim().length >= 2 && (
                                <div className="py-3 text-center text-sm text-gray-500">
                                  No se encontraron parroquias con ese valor.
                                </div>
                              )}

                              {!loadingParroquia && !isLoading && listaParroquias.length > 0 && (
                                listaParroquias.map((p) => (
                                  <div
                                    key={p.id_parroquia}
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #eee",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      handleChange("parroquiaId", p.id_parroquia);
                                      setQueryParroquia(`${p.nombre}`);
                                      setOpenParroquiaList(false);
                                    }}
                                  >
                                    <strong>{p.nombre}</strong>
                                    <div style={{ fontSize: "13px", color: "#666" }}>
                                      Email: {p.email} – Tel: {p.telefono}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o email para buscar en Parroquias.</p>
                  </div>
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foja</label>
                    <input
                      type="text"
                      placeholder="Ej. 123-A"
                      value={form.foja}
                      onChange={e => handleChange('foja', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="Ej. 123-A"
                      value={form.numero}
                      onChange={e => handleChange('numero', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha del Sacramento</label>
                    <input
                      type="date"
                      value={form.fecha_sacramento}
                      onChange={e => handleChange('fecha_sacramento', e.target.value)}
                      className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Registrar Sacramento
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'buscar' && (
        <>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Buscar Sacramentos</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{tipoSacramento === 'comunion' ? 'Primera Comunión' : tipoSacramento.charAt(0).toUpperCase() + tipoSacramento.slice(1)}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use uno o más campos para filtrar y luego presione Buscar.</p>
            </div>
            <form className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-nombre">Nombre</label>
                  <input id="f-nombre" placeholder="Nombre" type="text"
                    value={filters.nombre}
                    onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-apellido_paterno">Apellido paterno</label>
                  <input id="f-apellido_paterno" placeholder="Apellido paterno" type="text"
                    value={filters.apellido_paterno}
                    onChange={e => setFilters(f => ({ ...f, apellido_paterno: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-apellido_materno">Apellido materno</label>
                  <input id="f-apellido_materno" placeholder="Apellido materno" type="text"
                    value={filters.apellido_materno}
                    onChange={e => setFilters(f => ({ ...f, apellido_materno: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-carnet_identidad">Carnet de identidad</label>
                  <input id="f-carnet_identidad" placeholder="CI" type="text"
                    value={filters.carnet_identidad}
                    onChange={e => setFilters(f => ({ ...f, carnet_identidad: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-fecha_nacimiento">Fecha de nacimiento</label>
                  <input id="f-fecha_nacimiento" type="date"
                    value={filters.fecha_nacimiento}
                    onChange={e => setFilters(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-lugar_nacimiento">Lugar de nacimiento</label>
                  <input id="f-lugar_nacimiento" placeholder="Lugar" type="text"
                    value={filters.lugar_nacimiento}
                    onChange={e => setFilters(f => ({ ...f, lugar_nacimiento: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                {/* Estos campos no están en filters de ejemplo, pero pueden añadirse si se desea */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-nombre_padre">Nombre del padre</label>
                  <input id="f-nombre_padre" placeholder="Padre" type="text"
                    value={filters.nombre_padre || ''}
                    onChange={e => setFilters(f => ({ ...f, nombre_padre: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-nombre_madre">Nombre de la madre</label>
                  <input id="f-nombre_madre" placeholder="Madre" type="text"
                    value={filters.nombre_madre || ''}
                    onChange={e => setFilters(f => ({ ...f, nombre_madre: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3" />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-activo">Estado</label>
                  <select id="f-activo"
                    value={filters.activo}
                    onChange={e => setFilters(f => ({ ...f, activo: e.target.value }))}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3">
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button type="button" onClick={handleBuscar} className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Buscar</button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      nombre: '',
                      apellido_paterno: '',
                      apellido_materno: '',
                      carnet_identidad: '',
                      fecha_nacimiento: '',
                      lugar_nacimiento: '',
                      activo: '',
                    });
                    setResults([]);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mostrando resultados de <strong>{tipoSacramento === 'comunion' ? 'Primera Comunión' : tipoSacramento}</strong>. Seleccione una fila para editar.</p>
            </div>
            <div className="overflow-x-auto">
              {/* Loading Spinner */}
              {loadingSacramento && (
                <div className="flex justify-center items-center py-10">
                  <ClipLoader size={40} color="#4f46e5" />
                </div>
              )}

              {/* No results */}
              {!loadingSacramento && results.length === 0 && (
                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron resultados para esta búsqueda.
                </div>
              )}

              {/* Table */}
              {!loadingSacramento && results.length > 0 && (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 animate__animated animate__fadeIn">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Nombre completo</th>
                      <th className="px-6 py-3">CI</th>
                      <th className="px-6 py-3">Fecha del sacramento</th>
                      <th className="px-6 py-3">Rol</th>
                      <th className="px-6 py-3">Foja</th>
                      <th className="px-6 py-3">Número</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => (
                      <tr
                        key={row.id_sacramento + '-' + row.carnet_identidad}
                        onClick={() => handleSelectResultado(row)}
                        className="cursor-pointer bg-white dark:bg-background-dark/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {row.nombre} {row.apellido_paterno} {row.apellido_materno}
                        </td>
                        <td className="px-6 py-4">{row.carnet_identidad}</td>
                        <td className="px-6 py-4">{row.fecha_sacramento}</td>
                        <td className="px-6 py-4">{row.rol_nombre}</td>
                        <td className="px-6 py-4">{row.foja}</td>
                        <td className="px-6 py-4">{row.numero}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {selectedPerson && (
              <div className="mt-8 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-6 relative">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editar Sacramento</h3>
                {(isUpdating || forceUpdateLoading) && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <ClipLoader size={45} color="#4f46e5" />
                  </div>
                )}
                <form
                  className={`relative p-6 ${(isUpdating || forceUpdateLoading) ? "pointer-events-none opacity-50" : ""}`}
                  onSubmit={handleGuardarEdicion}
                >
                  {/* Persona */}
                  <div className="mt-2 mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Persona que recibió el Sacramento
                    </h4>
                    <div className="mb-6">
                      <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-700 dark:text-gray-300">
                        {queryPersona}
                      </div>
                    </div>
                  </div>

                  {/* Matrimonio: detalles en modo edición */}
                  {tipoSacramento === 'matrimonio' && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Detalles del Matrimonio
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ESPOSO (solo lectura) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Esposo
                          </label>
                          <input
                            type="text"
                            value={queryEsposo}
                            readOnly
                            className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-600 dark:text-gray-300"
                          />
                        </div>

                        {/* ESPOSA (solo lectura) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Esposa
                          </label>
                          <input
                            type="text"
                            value={queryEsposa}
                            readOnly
                            className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 text-gray-600 dark:text-gray-300"
                          />
                        </div>

                        {/* Lugar de la ceremonia */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lugar de la ceremonia
                          </label>
                          <input
                            type="text"
                            value={matrimonio.lugar_ceremonia}
                            onChange={(e) => handleMatChange('lugar_ceremonia', e.target.value)}
                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 p-3"
                          />
                        </div>

                        {/* Registro civil */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Registro civil
                          </label>
                          <input
                            type="text"
                            value={matrimonio.reg_civil}
                            onChange={(e) => handleMatChange('reg_civil', e.target.value)}
                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 p-3"
                          />
                        </div>

                        {/* Número de acta */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Número de acta
                          </label>
                          <input
                            type="text"
                            value={matrimonio.numero_acta}
                            onChange={(e) => handleMatChange('numero_acta', e.target.value)}
                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 p-3"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Padrino, Ministro, Parroquia, Foja, Numero, Fecha, Activo */}
                  {(tipoSacramento === 'bautizo' || tipoSacramento === 'comunion' ||tipoSacramento === 'matrimonio' ) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Padrino */}
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Padrino actual: {padrinoActual}
                        </div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nuevo padrino (opcional)
                        </label>
                        <div className="relative">
                          <input
                            type="search"
                            placeholder="Buscar padrino (persona registrada)"
                            value={queryPadrino}
                            onChange={e => {
                              setQueryPadrino(e.target.value);
                              setPadrinoSelected(false);
                              setListaPadrinos([]);
                            }}
                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                          />
                          {/* DROPDOWN PADRINO */}
                          {!padrinoSelected && openPadrinoList && (
                            <div
                              style={{
                                position: "absolute",
                                background: "white",
                                border: "1px solid #dcdcdc",
                                borderRadius: "8px",
                                marginTop: "4px",
                                width: "95%",
                                maxHeight: "220px",
                                overflowY: "auto",
                                zIndex: 9999,
                                padding: "5px",
                              }}
                            >
                              {(loadingPadrino || isLoading) && (
                                <div className="flex justify-center items-center py-4">
                                  <ClipLoader size={28} color="#4f46e5" />
                                </div>
                              )}
                              {!padrinoSelected && listaPadrinos.length === 0 && queryPadrino.length > 0 && (
                                <div className="py-3 text-center text-sm text-gray-500">
                                  No se encontraron padrinos con ese valor.
                                </div>
                              )}
                              {!loadingPadrino && !isLoading && listaPadrinos.length > 0 && (
                                listaPadrinos.map((p) => (
                                  <div
                                    key={p.id_persona}
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #eee",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      handleChange("padrinoId", p.id_persona);
                                      setQueryPadrino(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
                                      setListaPadrinos([]);
                                      setPadrinoSelected(true);
                                      setOpenPadrinoList(false);
                                    }}
                                  >
                                    <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
                                    <div style={{ fontSize: "13px", color: "#666" }}>
                                      CI: {p.carnet_identidad}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        </div>
                      </div>
                      {/* Ministro */}
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Ministro actual: {ministroActual}
                        </label>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nuevo ministro (opcional)
                        </label>
                        <div className="relative">
                          <input
                            type="search"
                            placeholder="Buscar ministro (persona registrada)"
                            value={queryMinistro}
                            onChange={e => {
                              setQueryMinistro(e.target.value);
                              setMinistroSelected(false);
                              setListaMinistros([]);
                            }}
                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                          />
                          {/* DROPDOWN MINISTRO */}
                          {!ministroSelected && openMinistroList && (
                            <div
                              style={{
                                position: "absolute",
                                background: "white",
                                border: "1px solid #dcdcdc",
                                borderRadius: "8px",
                                marginTop: "4px",
                                width: "95%",
                                maxHeight: "220px",
                                overflowY: "auto",
                                zIndex: 9999,
                                padding: "5px",
                              }}
                            >
                              {(loadingMinistro || isLoading) && (
                                <div className="flex justify-center items-center py-4">
                                  <ClipLoader size={28} color="#4f46e5" />
                                </div>
                              )}
                              {!ministroSelected && listaMinistros.length === 0 && queryMinistro.length > 0 && (
                                <div className="py-3 text-center text-sm text-gray-500">
                                  No se encontraron ministros con ese valor.
                                </div>
                              )}
                              {!loadingMinistro && !isLoading && listaMinistros.length > 0 && (
                                listaMinistros.map((p) => (
                                  <div
                                    key={p.id_persona}
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #eee",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      handleChange("ministroId", p.id_persona);
                                      setQueryMinistro(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
                                      setListaMinistros([]);
                                      setMinistroSelected(true);
                                      setOpenMinistroList(false);
                                    }}
                                  >
                                    <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
                                    <div style={{ fontSize: "13px", color: "#666" }}>
                                      CI: {p.carnet_identidad}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        </div>
                      </div>
                      {/* Parroquia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Parroquia {queryParroquia}
                        </label>
                        <div className="relative">
                          <input
                            type="search"
                            placeholder="Busca parroquia (previamente registrada)"
                            value={queryParroquia}
                            onChange={e => {
                              setQueryParroquia(e.target.value);
                              setParroquiaSelected(false);
                              setListaParroquias([]);
                            }}
                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                          />
                          {/* DROPDOWN PARROQUIA */}
                          {!parroquiaSelected && openParroquiaList && (
                            <div
                              style={{
                                position: "absolute",
                                background: "white",
                                border: "1px solid #dcdcdc",
                                borderRadius: "8px",
                                marginTop: "4px",
                                width: "95%",
                                maxHeight: "220px",
                                overflowY: "auto",
                                zIndex: 9999,
                                padding: "5px",
                              }}
                            >
                              {(loadingParroquia || isLoading) && (
                                <div className="flex justify-center items-center py-4">
                                  <ClipLoader size={28} color="#4f46e5" />
                                </div>
                              )}
                              {!parroquiaSelected && listaParroquias.length === 0 && queryParroquia.length > 0 && (
                                <div className="py-3 text-center text-sm text-gray-500">
                                  No se encontraron parroquias con ese valor.
                                </div>
                              )}
                              {!loadingParroquia && !isLoading && listaParroquias.length > 0 && (
                                listaParroquias.map((p) => (
                                  <div
                                    key={p.id_parroquia}
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #eee",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      handleChange("parroquiaId", p.id_parroquia);
                                      setQueryParroquia(`${p.nombre}`);
                                      setListaParroquias([]);
                                      setParroquiaSelected(true);
                                      setOpenParroquiaList(false);
                                    }}
                                  >
                                    <strong>{p.nombre}</strong>
                                    <div style={{ fontSize: "13px", color: "#666" }}>
                                      Email: {p.email} – Tel: {p.telefono}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        </div>
                      </div>
                      {/* Foja */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Foja
                        </label>
                        <input
                          type="text"
                          value={form.foja}
                          onChange={(e) => handleChange('foja', e.target.value)}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 p-3"
                        />
                      </div>
                      {/* Número */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={form.numero}
                          onChange={(e) => handleChange('numero', e.target.value)}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 p-3"
                        />
                      </div>
                      {/* Fecha */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fecha del Sacramento
                        </label>
                        <input
                          type="date"
                          value={form.fecha_sacramento}
                          onChange={(e) => handleChange('fecha_sacramento', e.target.value)}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 p-3"
                        />
                      </div>
                    </div>
                  )}
                  {/* Activo */}
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      id="e-activo"
                      type="checkbox"
                      checked={form.activo}
                      onChange={(e) => handleChange('activo', e.target.checked)}
                      className="h-4 w-4 border-gray-300 dark:border-gray-700 rounded"
                    />
                    <label htmlFor="e-activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Activo
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPerson(null)}
                      className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-primary text-white flex items-center gap-2"
                    >
                      {(isUpdating || forceUpdateLoading) && <ClipLoader size={18} color="#ffffff" />}
                      {(isUpdating || forceUpdateLoading) ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}