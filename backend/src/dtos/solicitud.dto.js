const crearSolicitudDTO = (body) => {
  return {
    titulo: body.titulo,
    descripcion: body.descripcion,
    usuarioSolicitante: body.usuarioSolicitante,
    categoria: body.categoria,
    prioridad: body.prioridad
  };
};

const actualizarSolicitudDTO = (body) => {
  return {
    titulo: body.titulo,
    descripcion: body.descripcion,
    usuarioSolicitante: body.usuarioSolicitante,
    categoria: body.categoria,
    prioridad: body.prioridad
  };
};

const cambiarEstadoDTO = (body) => {
  return {
    estado: body.estado,
    usuarioResponsable: body.usuarioResponsable,
    observacion: body.observacion
  };
};

module.exports = {
  crearSolicitudDTO,
  actualizarSolicitudDTO,
  cambiarEstadoDTO
};