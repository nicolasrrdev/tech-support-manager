const express = require("express");

const router = express.Router();

const solicitudController = require("../controllers/solicitud.controller");

router.post(
  "/",
  solicitudController.crearSolicitud
);

router.get(
  "/",
  solicitudController.obtenerSolicitudes
);

router.get(
  "/:id/historial",
  solicitudController.obtenerHistorial
);

router.get(
  "/:id",
  solicitudController.obtenerSolicitudPorId
);

router.put(
  "/:id",
  solicitudController.actualizarSolicitud
);

router.patch(
  "/:id/estado",
  solicitudController.cambiarEstadoSolicitud
);

router.delete(
  "/:id",
  solicitudController.eliminarSolicitud
);

module.exports = router;