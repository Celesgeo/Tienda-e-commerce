const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    path: req.originalUrl,
  });
};

module.exports = { notFound, errorHandler };
