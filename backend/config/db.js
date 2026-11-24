
const { Pool } = require("pg");
require("dotenv").config();

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

// Check database connection
pool.on("connect", () => {
    console.log("PostgreSQL client connected");
});

// Handle unexpected pool errors
pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err.message);
});

// Export pool for SQL queries
module.exports = pool;
