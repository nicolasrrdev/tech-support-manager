const mongoose = require("mongoose");

const Solicitud = require("../models/solicitud.model");

const {
  TRANSICIONES_ESTADO
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

const obtenerSolicitudPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la solicitud no es válido");
    error.statusCode = 400;
    throw error;
  }

  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    const error = new Error("Solicitud no encontrada");
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
  solicitud.usuarioSolicitante = solicitudData.usuarioSolicitante;
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
    observacion: observacion?.trim() || undefined
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
  obtenerSolicitudPorId,
  actualizarSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud,
  obtenerHistorial,
  validarTransicionEstado
};
