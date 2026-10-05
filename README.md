# TechSupport Manager

Sistema web para la gestión de solicitudes de soporte tecnológico.

La aplicación permite registrar, consultar, editar, clasificar, cambiar el estado, cancelar y eliminar solicitudes de soporte, manteniendo un historial de los cambios de estado realizados sobre cada solicitud.

El proyecto está desarrollado con una arquitectura frontend/backend y una API REST para la comunicación entre ambas aplicaciones.

---

## Tecnologías utilizadas

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* CORS
* dotenv
* Nodemon

### Frontend

* Vue.js 3
* Vite
* Pinia
* Vue Router
* Axios
* JavaScript

### Base de datos

MongoDB Atlas utilizando Mongoose como ODM.

---

## Arquitectura

El proyecto está dividido en dos aplicaciones independientes:

```text
tech-support-manager/
│
├── backend/
│   └── API REST
│
├── frontend/
│   └── Aplicación web Vue.js
│
└── README.md
```

La comunicación se realiza mediante HTTP utilizando una API REST.

```text
┌──────────────────────┐
│      Vue.js          │
│      Frontend        │
└──────────┬───────────┘
           │
           │ HTTP / JSON
           ▼
┌──────────────────────┐
│      Express.js      │
│      REST API        │
└──────────┬───────────┘
           │
           │ Mongoose
           ▼
┌──────────────────────┐
│    MongoDB Atlas     │
└──────────────────────┘
```

---

# Requisitos previos

Para ejecutar el proyecto se requiere:

* Node.js
* npm
* Una cuenta de MongoDB Atlas o una instancia local de MongoDB
* Git

Se recomienda utilizar una versión LTS reciente de Node.js.

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd tech-support-manager
```

---

# Configuración del Backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo:

```text
backend/.env
```

con:

```env
PORT=3000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tech_support_manager
```

La variable `MONGODB_URI` debe contener la cadena de conexión correspondiente a la instancia de MongoDB utilizada.

---

# Ejecutar Backend

Modo desarrollo:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

También se puede verificar el estado de la API mediante:

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "TechSupport Manager API funcionando correctamente"
}
```

---

# Configuración del Frontend

Desde la raíz del proyecto:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Crear:

```text
frontend/.env
```

con:

```env
VITE_API_URL=http://localhost:3000/api
```

---

# Ejecutar Frontend

Ejecutar:

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

---

# Funcionalidades

El sistema permite:

* Crear solicitudes.
* Consultar solicitudes.
* Consultar el detalle de una solicitud.
* Editar solicitudes.
* Cambiar el estado.
* Cancelar solicitudes.
* Eliminar solicitudes.
* Consultar el historial.
* Buscar solicitudes.
* Filtrar por estado.
* Filtrar por prioridad.
* Filtrar por categoría.
* Ordenar resultados.
* Paginar resultados.
* Validar reglas de negocio tanto en frontend como backend.

---

# Datos de una solicitud

Cada solicitud contiene:

| Campo                | Descripción                       |
| -------------------- | --------------------------------- |
| `titulo`             | Título de la solicitud            |
| `descripcion`        | Descripción detallada             |
| `usuarioSolicitante` | Usuario que registra la solicitud |
| `categoria`          | Categoría del incidente           |
| `prioridad`          | Prioridad asignada                |
| `estado`             | Estado actual                     |
| `fechaCreacion`      | Fecha de creación                 |
| `fechaActualizacion` | Fecha de última actualización     |
| `historial`          | Historial de cambios de estado    |

---

# Categorías

Las categorías disponibles son:

```text
Hardware
Software
Red
Accesos
Otros
```

---

# Prioridades

Las prioridades disponibles son:

```text
Baja
Media
Alta
Crítica
```

---

# Estados

Los estados disponibles son:

```text
Pendiente
En progreso
Resuelta
Cancelada
```

---

# Reglas de transición de estados

Las transiciones permitidas son:

```text
Pendiente
 ├── En progreso
 └── Cancelada

En progreso
 ├── Resuelta
 └── Cancelada

Resuelta
 └── Sin transiciones

Cancelada
 └── Sin transiciones
```

No es posible regresar una solicitud desde `Resuelta` o `Cancelada` a otro estado.

Tampoco se permite realizar una transición hacia el mismo estado actual.

Las reglas son validadas principalmente en el backend para evitar que puedan ser omitidas realizando llamadas directas a la API.

---

# Reglas de edición

Una solicitud solamente puede editarse cuando se encuentra en:

```text
Pendiente
En progreso
```

No se permite editar solicitudes:

```text
Resuelta
Cancelada
```

---

# Reglas de eliminación

Una solicitud solamente puede eliminarse cuando está en:

```text
Pendiente
Cancelada
```

No se permite eliminar solicitudes:

```text
En progreso
Resuelta
```

---

# Reglas de observaciones

## Cancelación

Para cancelar una solicitud es obligatorio proporcionar una observación.

Ejemplo:

```text
Solicitud cancelada debido a que el usuario ya no requiere el servicio.
```

## Resolución de solicitudes críticas

Cuando una solicitud tiene prioridad:

```text
Crítica
```

es obligatorio proporcionar una observación al cambiarla a:

```text
Resuelta
```

---

# Historial

Cada cambio de estado genera un registro en el historial.

Cada registro contiene:

```text
estadoAnterior
estadoNuevo
fechaHora
usuarioResponsable
observacion
```

Ejemplo:

```json
{
  "estadoAnterior": "Pendiente",
  "estadoNuevo": "En progreso",
  "fechaHora": "2026-10-05T12:30:00.000Z",
  "usuarioResponsable": "Soporte TI",
  "observacion": "Se inició la revisión del equipo"
}
```

También se registra la creación inicial de la solicitud como un evento de historial.

---

# API REST

La API utiliza como prefijo:

```text
/api/solicitudes
```

## Crear solicitud

```http
POST /api/solicitudes
```

Ejemplo:

```json
{
  "titulo": "Equipo no enciende",
  "descripcion": "El equipo del área administrativa no enciende correctamente.",
  "usuarioSolicitante": "Nicolas",
  "categoria": "Hardware",
  "prioridad": "Alta"
}
```

---

## Consultar solicitudes

```http
GET /api/solicitudes
```

Admite los siguientes parámetros:

```text
busqueda
estado
prioridad
categoria
orden
direccion
pagina
limite
```

Ejemplo:

```http
GET /api/solicitudes?estado=Pendiente&prioridad=Alta&pagina=1&limite=10
```

---

## Consultar una solicitud

```http
GET /api/solicitudes/:id
```

---

## Actualizar una solicitud

```http
PUT /api/solicitudes/:id
```

Ejemplo:

```json
{
  "titulo": "Equipo no enciende",
  "descripcion": "El equipo presenta problemas de alimentación.",
  "usuarioSolicitante": "Nicolas",
  "categoria": "Hardware",
  "prioridad": "Crítica"
}
```

---

## Cambiar estado

```http
PATCH /api/solicitudes/:id/estado
```

Ejemplo:

```json
{
  "estado": "En progreso",
  "usuarioResponsable": "Soporte TI",
  "observacion": "Se inició la revisión del equipo."
}
```

---

## Consultar historial

```http
GET /api/solicitudes/:id/historial
```

---

## Eliminar solicitud

```http
DELETE /api/solicitudes/:id
```

La API solamente permite eliminar solicitudes en estado `Pendiente` o `Cancelada`.

---

# Búsqueda, filtros, ordenamiento y paginación

El endpoint de consulta permite combinar diferentes parámetros.

Ejemplo:

```http
GET /api/solicitudes?busqueda=equipo&estado=Pendiente&categoria=Hardware&prioridad=Alta&orden=fechaCreacion&direccion=desc&pagina=1&limite=10
```

### Búsqueda

Busca coincidencias en:

* título
* descripción
* usuario solicitante

### Filtros

Se puede filtrar por:

* estado
* prioridad
* categoría

### Ordenamiento

Se permite ordenar por:

* título
* prioridad
* estado
* categoría
* fecha de creación
* fecha de actualización

### Paginación

Los parámetros utilizados son:

```text
pagina
limite
```

El límite máximo permitido por la API es:

```text
100
```

---

# Estructura del Backend

```text
backend/src/
│
├── config/
│   └── database.js
│
├── controllers/
│   └── solicitud.controller.js
│
├── dtos/
│   └── solicitud.dto.js
│
├── middlewares/
│   └── error.middleware.js
│
├── models/
│   ├── solicitud.constants.js
│   └── solicitud.model.js
│
├── routes/
│   └── solicitud.routes.js
│
├── services/
│   └── solicitud.service.js
│
├── utils/
│   └── validation.js
│
├── validators/
│   └── solicitud.validator.js
│
├── app.js
└── server.js
```

La lógica está separada por responsabilidades:

* **Routes:** definición de endpoints.
* **Controllers:** recepción de solicitudes HTTP y construcción de respuestas.
* **Services:** lógica de negocio.
* **DTOs:** control de los datos recibidos.
* **Validators:** validaciones de entrada.
* **Models:** estructura de persistencia en MongoDB.
* **Middlewares:** manejo centralizado de errores.
* **Config:** conexión con la base de datos.

---

# Estructura del Frontend

```text
frontend/src/
│
├── router/
│   └── index.js
│
├── services/
│   ├── api.js
│   └── solicitud.service.js
│
├── stores/
│   └── solicitud.store.js
│
├── views/
│   ├── SolicitudesView.vue
│   ├── SolicitudFormView.vue
│   └── SolicitudDetalleView.vue
│
├── App.vue
└── main.js
```

### Router

Gestiona las diferentes vistas:

```text
/solicitudes
/solicitudes/nueva
/solicitudes/:id
/solicitudes/:id/editar
```

### Pinia

Centraliza el estado relacionado con las solicitudes y la comunicación con los servicios.

### Axios

Se utiliza para realizar las solicitudes HTTP hacia el backend.

---

# Validaciones

Las validaciones se implementan en diferentes niveles.

## Frontend

Permite proporcionar retroalimentación inmediata al usuario antes de enviar la información.

## Backend

Las validaciones del backend constituyen la capa de seguridad de las reglas de negocio.

Se validan:

* campos obligatorios
* tipos de datos
* longitudes
* categorías permitidas
* prioridades permitidas
* estados permitidos
* transiciones de estado
* observaciones obligatorias
* restricciones de edición
* restricciones de eliminación
* parámetros de búsqueda y paginación

---

# Decisiones técnicas

## Separación frontend/backend

Se decidió utilizar aplicaciones independientes para mantener una separación clara entre presentación, lógica de negocio y persistencia.

## API REST

La comunicación se realiza mediante endpoints REST utilizando JSON.

## MongoDB

MongoDB permite almacenar de forma flexible la información de las solicitudes y su historial.

El historial se almacena como documentos embebidos dentro de cada solicitud, ya que pertenece directamente al ciclo de vida de dicha solicitud.

## DTOs y Validators

Se utilizaron DTOs y validadores para evitar que los controladores reciban directamente toda la responsabilidad sobre la transformación y validación de los datos.

## Backend como fuente de verdad

Aunque el frontend controla la experiencia del usuario y evita mostrar acciones inválidas, las reglas críticas también están implementadas en el backend.

Esto evita que un consumidor externo pueda omitir las restricciones simplemente realizando una llamada HTTP directa a la API.

---

# Supuestos

* No se implementó autenticación porque no forma parte de los requisitos funcionales proporcionados.
* `usuarioSolicitante` y `usuarioResponsable` se manejan actualmente como texto.
* El usuario responsable de la creación inicial se registra utilizando el usuario solicitante.
* La fecha y hora son generadas por el backend.
* No se permite reabrir solicitudes resueltas o canceladas.
* El frontend mantiene algunas reglas de transición para mejorar la experiencia de usuario, pero el backend es quien valida definitivamente las transiciones.

---

# Variables de entorno

Las variables sensibles no deben almacenarse en Git.

### Backend

```env
PORT=3000
MONGODB_URI=...
```

### Frontend

```env
VITE_API_URL=http://localhost:3000/api
```

Los archivos `.env` se encuentran excluidos mediante `.gitignore`.

Se incluyen archivos `.env.example` para mostrar la configuración necesaria sin exponer credenciales.

---

# Git

El desarrollo del proyecto se organiza mediante dos ramas principales:

```text
main
develop
```

### develop

Rama utilizada para el desarrollo y pruebas de nuevas funcionalidades.

### main

Rama destinada a contener la versión estable del proyecto.

El flujo utilizado es:

```text
feature/development
        │
        ▼
     develop
        │
        │ merge
        ▼
      main
```

El proyecto cuenta con commits separados por funcionalidades para mantener trazabilidad sobre la evolución del desarrollo.

---

# Ejecución rápida

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Aplicación:

```text
http://localhost:5173
```

API:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

---

# Autor

Proyecto desarrollado como evaluación técnica para la gestión de solicitudes de soporte tecnológico.
