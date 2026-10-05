# MFC Admin — Frontend

Aplicación web interna para administrar un taller de bicicletas: clientes, bicicletas, presupuestos, trabajos, inventario de repuestos, servicios, garantías, notificaciones y caja.

No es una tienda ni una app para clientes: la usan el dueño del taller y sus empleados.

> El backend vive en un repositorio aparte (`MFC-Backend`). Este frontend no funciona sin él.
>
> El plan para convertir el sistema en multi-empresa (varios talleres en una misma plataforma) está documentado en el backend: `MFC-Backend/docs/multi-empresa.md`.

---

## Índice

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pantallas](#pantallas)
- [Arquitectura](#arquitectura)
- [Convenciones](#convenciones)
- [Deploy](#deploy)
- [Problemas conocidos](#problemas-conocidos)

---

## Stack

| Área | Tecnología |
|---|---|
| UI | React 19 + Vite 6 |
| Estilos | Tailwind CSS 4 (plugin `@tailwindcss/vite`, sin archivo de configuración) |
| Ruteo | React Router 7, con cada página cargada bajo demanda (`lazy`) |
| Estado global | Zustand (con `persist` para el borrador de presupuesto) |
| HTTP | Axios |
| Formularios | react-hook-form + zod (en Login y SpareForm; el resto son formularios controlados a mano) |
| Otros | `@hello-pangea/dnd` (tablero de trabajos), `react-select` (buscador de clientes), `react-toastify` (avisos), `react-icons`, `react-spinners` |

## Requisitos

- Node.js 20 o superior
- El backend corriendo (por defecto en `http://localhost:4000`)

## Puesta en marcha

```bash
npm install
cp .env.example .env   # o crear el archivo a mano, ver abajo
npm run dev
```

La app queda en `http://localhost:5173`. El backend tiene que permitir ese origen en su variable `CORS_ORIGIN`.

Para entrar hace falta un usuario. Los usuarios se crean solo por invitación de un administrador (ver la sección de autenticación en el README del backend).

## Variables de entorno

| Variable | Obligatoria | Descripción | Ejemplo |
|---|---|---|---|
| `VITE_API_URL` | Sí en producción | URL base de la API, incluyendo `/api` | `http://localhost:4000/api` |

Si `VITE_API_URL` no está definida, la app usa `http://localhost:4000/api`. En producción eso hace que el build apunte a localhost sin ningún error visible, así que definila siempre en el hosting.

Las variables `VITE_*` se embeben en el bundle en tiempo de build: no pongas secretos ahí.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente para probarlo |
| `npm run lint` | ESLint sobre todo el proyecto |

## Estructura del proyecto

```
src/
├── App.jsx                # Definición de rutas
├── main.jsx               # Punto de entrada: providers (Router, Auth, Search) y ToastContainer
├── components/            # Componentes reutilizables y modales
│   ├── Layout.jsx         # Sidebar fijo + Navbar + contenido
│   ├── ProtectedRoute.jsx # Exige sesión; con `adminOnly` exige rol admin
│   ├── PublicRoute.jsx    # Redirige al dashboard si ya hay sesión
│   ├── ui-primitives.jsx  # Card, Button, Input, Badge con el estilo de la app
│   ├── Modal.jsx          # Modal base (Esc cierra; prop `loading` bloquea y muestra los puntitos)
│   ├── ConfirmToast.jsx   # Confirmación de acciones destructivas
│   └── budgetPricing.js   # Cálculo de precios para la vista previa de presupuestos
├── pages/                 # Una página por ruta
├── services/              # Llamadas a la API, una por recurso (api.js es la instancia de Axios)
├── store/                 # Stores de Zustand
├── context/               # AuthContext (sesión y rol) y SearchContext (buscador del navbar)
├── hooks/                 # useRemoteList: listas paginadas desde el servidor
├── utils/                 # dates.js: formato de fechas en zona horaria de Argentina
└── constants/             # Tipos de repuesto
```

## Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Autenticación | Público |
| `/dashboard` | Resumen: trabajos pendientes, clientes, stock bajo, alertas, caja (solo admin) | Todos |
| `/clientes`, `/clientes/nuevo`, `/clientes/:id` | Clientes, sus bicicletas e historial de presupuestos | Todos |
| `/presupuestos` | Crear presupuesto: cliente, bici, servicios y repuestos | Todos |
| `/trabajos` | Tablero de trabajos por estado (arrastrar para avanzar) | Todos |
| `/garantias`, `/garantias/:id` | Garantías vigentes, revisiones y detalle | Todos |
| `/repuestos` y subrutas | Inventario de repuestos, alta, edición, reposición e importación de precios por Excel | Todos |
| `/notificaciones` | Avisos de revisiones de garantía y stock bajo | Todos |
| `/caja` | Saldo, movimientos y resumen de ingresos/egresos | Solo admin |

## Arquitectura

### Principio general

El backend es la fuente de verdad. El frontend muestra datos y envía acciones, pero las reglas importantes (precios finales, stock, estado de las garantías, permisos) las resuelve el backend. Por ejemplo, el total que se ve al armar un presupuesto es una vista previa: el total real lo calcula el servidor al guardar.

### Autenticación y roles

- El login devuelve un JWT que se guarda en `localStorage`. El interceptor de [`services/api.js`](src/services/api.js) lo agrega como `Authorization: Bearer <token>` en cada request.
- Si la API responde `401` (token vencido o inválido), el interceptor borra la sesión y redirige a `/login`.
- [`AuthContext`](src/context/AuthContext.jsx) expone `employee`, `isAuthenticated`, `isAdmin`, `login` y `logout`. Al hacer logout también se limpian los stores, para no dejar datos en una PC compartida.
- Hay dos roles:
  - **admin**: acceso completo.
  - **employee**: todo menos Caja y la invitación de usuarios.
- Ocultar la caja en el frontend es solo comodidad: el backend también bloquea esas rutas.

### Estado y carga de datos

Para no sobrecargar el servidor, **no se carga nada al iniciar sesión**. Cada pantalla pide lo que necesita:

- **`useInventoryStore`**: cachea clientes (con sus bicis, en una sola request) y repuestos. Solo lo cargan las pantallas que lo usan (Clientes, Detalle de cliente, Inventario), llamando a `fetchBootstrap()`. La segunda vez usa la caché.
- **`useBudgetStore`**: borrador del presupuesto en armado (cliente, bici, servicios, repuestos y garantías aplicadas). Se persiste en `localStorage` para no perderlo al navegar. Cada repuesto guarda una copia de sus datos, porque el catálogo ya no está en memoria.
- **`useRemoteList`** ([`hooks/useRemoteList.js`](src/hooks/useRemoteList.js)): listas paginadas que se piden al servidor con 300 ms de espera mientras el usuario escribe. Lo usan el catálogo de Presupuestos y los buscadores del modal de edición.
- **Dashboard**: usa un endpoint de resumen (`/bootstrap/dashboard`) que devuelve solo conteos y listas cortas.
- **Trabajos**: no trae los presupuestos retirados, porque el tablero no los muestra.

### Buscador del navbar

La barra de búsqueda del navbar solo aparece en las páginas que la registran. Para sumarla a una página:

```jsx
import { useGlobalSearch } from "../context/SearchContext";

const term = useGlobalSearch("Buscar trabajo por cliente, bici o servicio");
// usar `term` para filtrar la lista de la página
```

Al salir de la página, la barra se oculta y el término se limpia solo. Las pantallas que tienen su propio buscador dentro de la página (Inventario, Presupuestos, Garantías) no la usan.

### Precios

- **Servicios**: en pesos (`price_ars`). Los presupuestos anteriores a la migración guardaban `price_usd`; para mostrarlos se convierten con la cotización guardada en el presupuesto (`dollar_rate_used`). [`getServicePriceARS`](src/components/budgetPricing.js) resuelve los dos casos.
- **Repuestos**: pueden estar en ARS o en USD (`currency` + `price`). Los de USD se convierten con el dólar blue del día al armar el presupuesto.
- Cada presupuesto guarda el precio de cada ítem al momento de crearlo, así que un cambio de precio posterior no modifica presupuestos viejos.

### Flujo de un trabajo

1. Se crea el presupuesto en `/presupuestos`. Si la bici tiene una garantía vigente para algún servicio elegido, se ofrece aplicarla (ese servicio queda en $0).
2. En `/trabajos` se arrastra la tarjeta entre estados: `iniciado → en proceso → terminado → pagado → retirado`. Se pueden saltar estados, pero no volver atrás.
3. Al salir de `iniciado` el backend descuenta el stock de los repuestos.
4. Al pasar a `terminado`, `pagado` o `retirado` se puede elegir qué servicios llevan garantía.
5. Al pasar a `pagado`, o directo a `retirado` sin haber pagado antes, se registra el ingreso en caja.
6. Las revisiones de garantía se marcan como hechas desde `/garantias/:id`. Ahí también se puede anular una garantía.

### Estilo visual

- Rojo de marca en degradado (`from-[#D90429] to-[#EF233C]`) para acciones principales; grises para el resto.
- Tarjetas `rounded-2xl border-gray-200 shadow-sm`, inputs `h-11 rounded-xl`.
- Encabezado de página: título `text-2xl font-bold text-gray-900` y subtítulo `text-gray-500`.
- Para mantener la coherencia, usar las primitivas de [`ui-primitives.jsx`](src/components/ui-primitives.jsx) y tomar como referencia Inventario, Presupuestos o Garantías.

## Convenciones

- **Servicios de API**: una función por endpoint en `src/services/`. Ante un error, lanzan `error.response.data` (o un objeto `{ message }`), así la página puede mostrar `err.message` en un toast.
- **Avisos al usuario**: `toast.success` / `toast.error` de react-toastify. No dejar errores solo en `console.error`.
- **Acciones destructivas**: siempre con `confirmToast`.
- **Fechas**: usar `formatDate` de [`utils/dates.js`](src/utils/dates.js) para que se vean en formato y zona horaria de Argentina.
- **Acciones en curso y doble envío**: toda acción que llama al servidor muestra los tres puntitos y bloquea repetirla mientras corre:
  - Botones: `<Button loading={guardando}>` de `ui-primitives`.
  - Modales: `<Modal loading={guardando}>`.
  - Confirmaciones: `confirmToast` ya lo hace solo.
  - Para casos especiales: `<LoadingDots />`.
  El backend además rechaza con `409` un cambio de estado repetido.
- Antes de subir cambios: `npm run lint` y `npm run build` sin errores.

## Deploy

El frontend está en **Vercel**:

- Build: `npm run build`, salida `dist/`.
- Definir `VITE_API_URL` en las variables de entorno del proyecto.
- [`vercel.json`](vercel.json) reescribe todas las rutas a la raíz para que React Router funcione al recargar cualquier página.
- El dominio de Vercel tiene que estar en `CORS_ORIGIN` del backend.

## Problemas conocidos

- Los datos del taller (nombre, dirección, teléfono) están escritos en el código, en el PDF del presupuesto y en el formulario de trabajos.
- El PDF del presupuesto se arma con los precios calculados en el navegador.
- Inventario y Clientes todavía cargan la lista completa y paginan en el navegador (Detalle de cliente ya pide solo ese cliente). Si el catálogo crece mucho, conviene pasarlos a paginado en el servidor, como Presupuestos.
- El token se guarda en `localStorage`, que queda expuesto ante un ataque XSS.
- No hay tests automatizados en el frontend.
