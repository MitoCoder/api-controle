const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';

export function applyCors(req, res) {
  const requestOrigin = req.headers.origin;
  const allowOrigin = requestOrigin || '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  const requestedHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Headers', requestedHeaders || DEFAULT_ALLOWED_HEADERS);

  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Max-Age', '86400');
}

export function isPreflight(req) {
  return req.method === 'OPTIONS';
}

export function jsonError(res, status, message, details) {
  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}
