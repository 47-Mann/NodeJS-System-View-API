export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: `The route ${req.method} ${req.path} does not exist.`,
    statusCode: 404,
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: err.name || "Error",
    message,
    statusCode,
  });
}
