const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    ok: false,
    message: error.message || "Error interno del servidor",
    errors: error.errors || undefined
  });
};

module.exports = errorMiddleware;