const IORedis = require('ioredis');

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      maxRetriesPerRequest: null,
    });

connection.on('connect', () => {
  console.log('✓ Redis connection established');
});

connection.on('error', (err) => {
  console.error('✗ Redis connection error:', err.message);
});

module.exports = connection;

