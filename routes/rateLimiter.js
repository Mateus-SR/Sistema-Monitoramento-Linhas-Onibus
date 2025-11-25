const rateLimit = require('express-rate-limit');

// Set up rate limiter: 100 requests per 15 minutes per IP
const perfilLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    error: 'Muitas requisições feitas deste IP. Por favor, tente novamente mais tarde.'
  }
});

module.exports = perfilLimiter;