const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// 1. Initialize a standard Node-Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
  console.log('✓ Postgres connection pool established');
});

pool.on('error', (err) => {
  console.error('✗ Postgres connection pool error:', err.message);
});

// 2. Wrap it with Prisma's dedicated v7 Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Instantiate PrismaClient by injecting the adapter
const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => {
    console.log('✓ Prisma connected to Postgres');
  })
  .catch((err) => {
    console.error('✗ Prisma connection error:', err.message);
  });

module.exports = prisma;

