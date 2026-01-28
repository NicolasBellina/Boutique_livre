// Middleware de logging simple
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;

  console.log(`[${timestamp}] ${method} ${path}`);

  // Capturer la fin de la requête
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? '❌' : '✅';
    console.log(`  ${statusColor} ${statusCode}`);
  });

  next();
};

export default loggingMiddleware;
