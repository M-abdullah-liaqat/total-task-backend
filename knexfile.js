// knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + '?sslmode=require',
    migrations: {
      directory: './db/migrations'
    },
    // IMPORTANT: Use a direct (non-pooled) connection for migrations
    // to avoid issues with PgBouncer.
  }
};
