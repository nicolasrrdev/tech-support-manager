const mongoose = require("mongoose");

const Solicitud = require("../models/solicitud.model");

const {
  TRANSICIONES_ESTADO,
  CATEGORIAS,
  PRIORIDADES,
  ESTADOS
} = require("../models/solicitud.constants");

const {
  lanzarErrorValidacion
} = require("../utils/validation");

const {
  validarCrearSolicitud,
  validarActualizarSolicitud,
  validarCambiarEstado
} = require("../validators/solicitud.validator");

const {
  crearSolicitudDTO,
  actualizarSolicitudDTO,
  cambiarEstadoDTO
} = require("../dtos/solicitud.dto");

const crearSolicitud = async (data) => {
  const errores = validarCrearSolicitud(data);

  lanzarErrorValidacion(errores);

  const solicitudData = crearSolicitudDTO(data);

  const solicitud = new Solicitud({
    ...solicitudData,
    estado: "Pendiente",
    historial: [
      {
        estadoAnterior: null,
        estadoNuevo: "Pendiente",
        fechaHora: new Date(),
        usuarioResponsable: data.usuarioSolicitante,
        observacion: "Solicitud creada"
      }
    ]
  });

  return await solicitud.save();
};

const obtenerSolicitudes = async (filtros) => {
  const {
    busqueda,
    estado,
    prioridad,
    categoria,
    orden = "fechaCreacion",
    direccion = "desc",
    pagina = 1,
    limite = 10
  } = filtros;

  const paginaNumero = Number(pagina);
  const limiteNumero = Number(limite);

  if (
    !Number.isInteger(paginaNumero) ||
    paginaNumero < 1
  ) {
    const error = new Error(
      "El parámetro pagina debe ser un número entero mayor o igual a 1"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !Number.isInteger(limiteNumero) ||
    limiteNumero < 1 ||
    limiteNumero > 100
  ) {
    const error = new Error(
      "El parámetro limite debe ser un número entre 1 y 100"
    );

    error.statusCode = 400;

    throw error;
  }

  const camposOrdenPermitidos = [
    "titulo",
    "prioridad",
    "estado",
    "categoria",
    "fechaCreacion",
    "fechaActualizacion"
  ];

  if (!camposOrdenPermitidos.includes(orden)) {
    const error = new Error(
      `El campo de ordenamiento "${orden}" no es válido`
    );

    error.statusCode = 400;

    throw error;
  }

  if (!["asc", "desc"].includes(direccion)) {
    const error = new Error(
      'El parámetro direccion debe ser "asc" o "desc"'
    );

    error.statusCode = 400;

    throw error;
  }

  const filtroMongo = {};

  if (estado) {
    if (!ESTADOS.includes(estado)) {
      const error = new Error(
        "El estado utilizado como filtro no es válido"
      );

      error.statusCode = 400;

      throw error;
    }

    filtroMongo.estado = estado;
  }

  if (prioridad) {
    if (!PRIORIDADES.includes(prioridad)) {
      const error = new Error(
        "La prioridad utilizada como filtro no es válida"
      );

      error.statusCode = 400;

      throw error;
    }

    filtroMongo.prioridad = prioridad;
  }

  if (categoria) {
    if (!CATEGORIAS.includes(categoria)) {
      const error = new Error(
        "La categoría utilizada como filtro no es válida"
      );

      error.statusCode = 400;

      throw error;
    }

    filtroMongo.categoria = categoria;
  }

  if (busqueda && busqueda.trim()) {
    const textoBusqueda = busqueda.trim();

    filtroMongo.$or = [
      {
        titulo: {
          $regex: textoBusqueda,
          $options: "i"
        }
      },
      {
        descripcion: {
          $regex: textoBusqueda,
          $options: "i"
        }
      },
      {
        usuarioSolicitante: {
          $regex: textoBusqueda,
          $options: "i"
        }
      }
    ];
  }

  const salto = (paginaNumero - 1) * limiteNumero;

  const direccionOrden =
    direccion === "asc" ? 1 : -1;

  const [solicitudes, total] = await Promise.all([
    Solicitud.find(filtroMongo)
      .sort({
        [orden]: direccionOrden
      })
      .skip(salto)
      .limit(limiteNumero),

    Solicitud.countDocuments(filtroMongo)
  ]);

  const totalPaginas = Math.ceil(
    total / limiteNumero
  );

  return {
    solicitudes,
    paginacion: {
      total,
      pagina: paginaNumero,
      limite: limiteNumero,
      totalPaginas,
      tienePaginaAnterior: paginaNumero > 1,
      tienePaginaSiguiente:
        paginaNumero < totalPaginas
    }
  };
};

const obtenerSolicitudPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID de la solicitud no es válido"
    );

    error.statusCode = 400;

    throw error;
  }

  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    const error = new Error(
      "Solicitud no encontrada"
    );

    error.statusCode = 404;

    throw error;
  }

  return solicitud;
};

const actualizarSolicitud = async (id, data) => {
  const errores = validarActualizarSolicitud(data);

  lanzarErrorValidacion(errores);

  const solicitud = await obtenerSolicitudPorId(id);

  const solicitudData = actualizarSolicitudDTO(data);

  solicitud.titulo = solicitudData.titulo;
  solicitud.descripcion = solicitudData.descripcion;
  solicitud.usuarioSolicitante =
    solicitudData.usuarioSolicitante;
  solicitud.categoria = solicitudData.categoria;
  solicitud.prioridad = solicitudData.prioridad;

  return await solicitud.save();
};

const validarTransicionEstado = (
  estadoActual,
  estadoNuevo
) => {
  if (estadoActual === estadoNuevo) {
    const error = new Error(
      "La solicitud ya se encuentra en el estado seleccionado"
    );

    error.statusCode = 400;

    throw error;
  }

  const estadosPermitidos =
    TRANSICIONES_ESTADO[estadoActual] || [];

  if (!estadosPermitidos.includes(estadoNuevo)) {
    const error = new Error(
      `No es posible cambiar una solicitud de "${estadoActual}" a "${estadoNuevo}"`
    );

    error.statusCode = 400;

    throw error;
  }
};

const cambiarEstadoSolicitud = async (id, data) => {
  const errores = validarCambiarEstado(data);

  lanzarErrorValidacion(errores);

  const solicitud = await obtenerSolicitudPorId(id);

  const {
    estado,
    usuarioResponsable,
    observacion
  } = cambiarEstadoDTO(data);

  validarTransicionEstado(
    solicitud.estado,
    estado
  );

  if (
    solicitud.prioridad === "Crítica" &&
    estado === "Resuelta" &&
    (!observacion || !observacion.trim())
  ) {
    const error = new Error(
      "Una solicitud con prioridad Crítica requiere una observación para ser resuelta"
    );

    error.statusCode = 400;

    throw error;
  }

  solicitud.historial.push({
    estadoAnterior: solicitud.estado,
    estadoNuevo: estado,
    fechaHora: new Date(),
    usuarioResponsable,
    observacion:
      observacion?.trim() || undefined
  });

  solicitud.estado = estado;

  return await solicitud.save();
};

const eliminarSolicitud = async (id) => {
  const solicitud = await obtenerSolicitudPorId(id);

  if (
    solicitud.estado !== "Pendiente" &&
    solicitud.estado !== "Cancelada"
  ) {
    const error = new Error(
      "Solo se pueden eliminar solicitudes Pendientes o Canceladas"
    );

    error.statusCode = 400;

    throw error;
  }

  await Solicitud.findByIdAndDelete(id);
};

const obtenerHistorial = async (id) => {
  const solicitud = await obtenerSolicitudPorId(id);

  return solicitud.historial;
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud,
  obtenerHistorial,
  validarTransicionEstado
};