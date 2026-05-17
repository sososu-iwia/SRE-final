const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'nodejs_' });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    // Normalize path to avoid high cardinality from IDs
    const path = req.route ? req.route.path : req.path;
    const labels = { method: req.method, path, status: res.statusCode };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });
  next();
}

function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  register.metrics().then(m => res.end(m));
}

module.exports = { metricsMiddleware, metricsHandler };
