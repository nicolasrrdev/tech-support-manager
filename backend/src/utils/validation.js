const lanzarErrorValidacion = (errores) => {
  if (Object.keys(errores).length > 0) {
    const error = new Error("Error de validación");
    error.statusCode = 400;
    error.errors = errores;

    throw error;
  }
};

module.exports = {
  lanzarErrorValidacion
};