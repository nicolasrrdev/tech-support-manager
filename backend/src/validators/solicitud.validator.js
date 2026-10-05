const {
  CATEGORIAS,
  PRIORIDADES,
  ESTADOS
} = require("../models/solicitud.constants");

const esString = (valor) => {
  return typeof valor === "string";
};

const estaVacio = (valor) => {
  return valor === undefined || valor === null || valor === "";
};

const validarLongitud = (valor, minimo, maximo) => {
  return valor.length >= minimo && valor.length <= maximo;
};

const validarCrearSolicitud = (data) => {
  const errores = {};

  if (estaVacio(data.titulo)) {
    errores.titulo = "El título es obligatorio";
  } else if (!esString(data.titulo)) {
    errores.titulo = "El título debe ser un texto";
  } else if (!validarLongitud(data.titulo.trim(), 5, 150)) {
    errores.titulo = "El título debe tener entre 5 y 150 caracteres";
  }

  if (estaVacio(data.descripcion)) {
    errores.descripcion = "La descripción es obligatoria";
  } else if (!esString(data.descripcion)) {
    errores.descripcion = "La descripción debe ser un texto";
  } else if (!validarLongitud(data.descripcion.trim(), 10, 2000)) {
    errores.descripcion =
      "La descripción debe tener entre 10 y 2000 caracteres";
  }

  if (estaVacio(data.usuarioSolicitante)) {
    errores.usuarioSolicitante =
      "El usuario solicitante es obligatorio";
  } else if (!esString(data.usuarioSolicitante)) {
    errores.usuarioSolicitante =
      "El usuario solicitante debe ser un texto";
  } else if (!validarLongitud(data.usuarioSolicitante.trim(), 2, 100)) {
    errores.usuarioSolicitante =
      "El usuario solicitante debe tener entre 2 y 100 caracteres";
  }

  if (estaVacio(data.categoria)) {
    errores.categoria = "La categoría es obligatoria";
  } else if (!CATEGORIAS.includes(data.categoria)) {
    errores.categoria = "La categoría seleccionada no es válida";
  }

  if (estaVacio(data.prioridad)) {
    errores.prioridad = "La prioridad es obligatoria";
  } else if (!PRIORIDADES.includes(data.prioridad)) {
    errores.prioridad = "La prioridad seleccionada no es válida";
  }

  return errores;
};

const validarActualizarSolicitud = (data) => {
  return validarCrearSolicitud(data);
};

const validarCambiarEstado = (data) => {
  const errores = {};

  if (estaVacio(data.estado)) {
    errores.estado = "El nuevo estado es obligatorio";
  } else if (!ESTADOS.includes(data.estado)) {
    errores.estado = "El nuevo estado no es válido";
  }

  if (estaVacio(data.usuarioResponsable)) {
    errores.usuarioResponsable =
      "El usuario responsable es obligatorio";
  } else if (!esString(data.usuarioResponsable)) {
    errores.usuarioResponsable =
      "El usuario responsable debe ser un texto";
  } else if (
    !validarLongitud(data.usuarioResponsable.trim(), 2, 100)
  ) {
    errores.usuarioResponsable =
      "El usuario responsable debe tener entre 2 y 100 caracteres";
  }

  if (
    data.observacion !== undefined &&
    data.observacion !== null
  ) {
    if (!esString(data.observacion)) {
      errores.observacion = "La observación debe ser un texto";
    } else if (data.observacion.length > 500) {
      errores.observacion =
        "La observación no puede superar los 500 caracteres";
    }
  }

  return errores;
};

module.exports = {
  validarCrearSolicitud,
  validarActualizarSolicitud,
  validarCambiarEstado
};

