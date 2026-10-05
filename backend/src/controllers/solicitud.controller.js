const solicitudService = require("../services/solicitud.service");

const crearSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.crearSolicitud(req.body);

    res.status(201).json({
      ok: true,
      message: "Solicitud creada correctamente",
      data: solicitud
    });
  } catch (error) {
    next(error);
  }
};

const obtenerSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await solicitudService.obtenerSolicitudes();

    res.status(200).json({
      ok: true,
      data: solicitudes
    });
  } catch (error) {
    next(error);
  }
};

const obtenerSolicitudPorId = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.obtenerSolicitudPorId(
      req.params.id
    );

    res.status(200).json({
      ok: true,
      data: solicitud
    });
  } catch (error) {
    next(error);
  }
};

const actualizarSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.actualizarSolicitud(
      req.params.id,
      req.body
    );

    res.status(200).json({
      ok: true,
      message: "Solicitud actualizada correctamente",
      data: solicitud
    });
  } catch (error) {
    next(error);
  }
};

const cambiarEstadoSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.cambiarEstadoSolicitud(
      req.params.id,
      req.body
    );

    res.status(200).json({
      ok: true,
      message: "Estado actualizado correctamente",
      data: solicitud
    });
  } catch (error) {
    next(error);
  }
};

const eliminarSolicitud = async (req, res, next) => {
  try {
    await solicitudService.eliminarSolicitud(req.params.id);

    res.status(200).json({
      ok: true,
      message: "Solicitud eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

const obtenerHistorial = async (req, res, next) => {
  try {
    const historial = await solicitudService.obtenerHistorial(
      req.params.id
    );

    res.status(200).json({
      ok: true,
      data: historial
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud,
  obtenerHistorial
};