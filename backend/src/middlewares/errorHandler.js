// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;

  // Logger l'erreur
  console.error(`[${timestamp}] ❌ ERROR ${method} ${path}`);
  console.error(`Message: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(`Stack: ${err.stack}`);
  }

  // Déterminer le statut HTTP
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Erreurs personnalisées
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
  }

  // Répondre au client
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
};

export default errorHandler;
