# Sacramentos Digitales — Frontend

Sistema de gestión parroquial para el registro, consulta y emisión de certificados de sacramentos (bautizo, primera comunión y matrimonio). Incluye administración de parroquias, personas, usuarios, roles, auditoría y análisis de riesgos de seguridad.

## Tecnologías

| Categoría | Librería / Herramienta |
|---|---|
| Framework UI | React 19 + Vite 7 |
| Estado global | Redux Toolkit + Redux Persist |
| Routing | React Router DOM 7 |
| Estilos | Tailwind CSS 3 |
| HTTP | Axios |
| Mapas | Leaflet + React Leaflet |
| Gráficas | Recharts |
| Iconos | Material Symbols Outlined (Google Fonts) + Lucide React |
| Exportación | xlsx |
| Testing | Vitest + Testing Library |
| Alertas | SweetAlert2 |

## Módulos

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs de personas, sacramentos y parroquias; línea de tiempo y gráfica de combinaciones |
| **Sacramentos** | Registro y edición de bautizos, primeras comuniones y matrimonios con búsqueda paginada |
| **Certificados** | Emisión de certificados en PDF vía Lambda (previsualización + descarga); historial persistente en localStorage |
| **Parroquias** | CRUD de parroquias con geocodificación automática por dirección y mapa interactivo de resumen |
| **Personas** | Gestión del registro de personas físicas |
| **Usuarios** | Administración de cuentas de usuario y asignación de párroco |
| **Roles & Permisos** | Control de acceso por roles y módulos |
| **OCR** | Digitalización de actas físicas mediante reconocimiento óptico de caracteres |
| **Reportes** | Exportación de datos |
| **Auditoría** | Registro de actividad de la aplicación y eventos de seguridad |
| **Matriz de Riesgo** | Gestión de activos, vulnerabilidades, amenazas y controles de seguridad |
| **Seguridad** | Configuración de políticas de seguridad y dominios de correo permitidos |

## Requisitos previos

- Node.js ≥ 18
- npm ≥ 9
- Backend de la API corriendo (ver repositorio `backend`)

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3001/api
VITE_LAMBDA_URL=https://<id>.execute-api.<region>.amazonaws.com/<stage>
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend REST |
| `VITE_LAMBDA_URL` | URL base de las funciones Lambda (previsualización y generación de certificados PDF) |

## Scripts

```bash
# Servidor de desarrollo con HMR
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Tests
npm run test

# Tests con UI
npm run test:ui
```

## Estructura del proyecto

```
src/
├── features/               # Módulos de negocio (uno por página)
│   ├── certificados/
│   ├── dashboard/
│   ├── login/
│   ├── matrizRiesgo/
│   ├── ocr/
│   ├── parroquias/
│   │   └── components/
│   │       ├── GeoPreviewMap.jsx   # Mini-mapa con geocodificación
│   │       └── MapaParroquias.jsx  # Mapa interactivo de resumen
│   ├── personas/
│   ├── reportes/
│   ├── roles/
│   ├── sacramentos/
│   ├── seguridad/
│   └── usuarios/
├── shared/
│   ├── components/
│   │   ├── layout/         # Layout, Sidebar, Header
│   │   ├── pages/          # Componentes de página reutilizables
│   │   └── ui/             # Toast, modales, etc.
│   └── utils/
├── lib/
│   └── api.js              # Cliente Axios + todos los endpoints
├── store/
│   └── index.js            # Configuración Redux + persistencia
└── main.jsx
```

## Autenticación

El sistema usa JWT. El token se almacena en Redux Persist (localStorage) y se adjunta automáticamente en cada petición mediante un interceptor de Axios. Las sesiones expiradas redirigen al login automáticamente.

El login incluye verificación 2FA con código de un solo uso.

## Mapa de parroquias

Las parroquias muestran su ubicación en un mapa interactivo (pestaña **Mapa** en Gestión de Parroquias). Al crear una parroquia, la dirección se geocodifica automáticamente usando la API de [Nominatim / OpenStreetMap](https://nominatim.org/) — sin necesidad de API key. El marcador es arrastrable para ajustar la ubicación manualmente antes de guardar.
