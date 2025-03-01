const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL) {
  // For production with Vercel, using REDIS_URL
  redis = new Redis(process.env.REDIS_URL);
} else {
  // For local development
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  });
}

module.exports = redis;