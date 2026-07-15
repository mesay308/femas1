const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

/** Trim and strip accidental wrapping quotes (Windows CRLF / .env typos). */
function envString(key, altKey) {
    const raw = process.env[key] ?? (altKey ? process.env[altKey] : undefined);
    if (raw == null || raw === '') return undefined;
    let s = String(raw).trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1);
    }
    return s;
}

const dbUser = envString('DB_USER');
const dbHost = envString('DB_HOST');
const dbName = envString('DB_NAME');
const dbPassword = envString('DB_PASSWORD', 'DB_PASS');
const dbPort = parseInt(envString('DB_PORT') || '3306', 10);

const dbSsl = envString('DB_SSL') === 'true' || !!envString('DB_SSL_CA_PATH') || !!envString('DB_SSL_CA');
let sslConfig = null;

if (dbSsl) {
    const fs = require('fs');
    sslConfig = {
        rejectUnauthorized: true
    };
    const caString = envString('DB_SSL_CA');
    if (caString) {
        sslConfig.ca = caString.replace(/\\n/g, '\n');
    } else {
        try {
            sslConfig.ca = require('./ca.js');
        } catch (e) {
            console.warn('[DB] WARNING: Fallback CA module not found.', e.message);
        }
    }
}

if (!dbName) {
    console.warn('[DB] WARNING: DB_NAME is missing — MySQL may use the server default schema for this user.');
} else {
    console.log(`[DB] Pool configured for database: ${dbName} @ ${dbHost || '(default host)'}${dbSsl ? ' (SSL Enabled)' : ''}`);
}

const pool = mysql.createPool({
    user: dbUser,
    host: dbHost,
    database: dbName || undefined,
    password: dbPassword,
    port: dbPort,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
    connectTimeout: 30000,        // 30 second connection timeout
    enableKeepAlive: true,        // Keep connections alive
    keepAliveInitialDelay: 10000, // Start keep alive after 10s
    idleTimeout: 60000,           // Close idle connections after 60s
    maxIdle: 20                    // Keep up to 20 idle connections
});

// Log pool connection events
pool.on('connection', () => {
    console.log('[DB] New connection established');
});

// Wrapper to make mysql2 behave like pg (postgres)
// Converts queries with `$1`, `$2` into `?`, `?`
// Returns { rows, rowCount }
const queryWrapper = async (text, params = [], retries = 2) => {
    const mysqlQuery = text.replace(/\$\d+/g, '?');
    const safeParams = (params || []).map(p => p === undefined ? null : p);

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const [rows, fields] = await pool.query(mysqlQuery, safeParams);

            // Handle result object for insert/update/delete operations vs select operations
            if (Array.isArray(rows)) {
                return { rows, rowCount: rows.length };
            } else {
                // For INSERT, UPDATE, DELETE
                return { rows: [], rowCount: rows.affectedRows, insertId: rows.insertId };
            }
        } catch (err) {
            const isRetryable = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_CON_COUNT_ERROR'].includes(err.code);

            if (isRetryable && attempt < retries) {
                console.warn(`[DB] Query failed (attempt ${attempt + 1}/${retries + 1}), retrying...`, err.code);
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }

            console.error(`[DB] Query error:`, err.message);
            console.error(`[DB] Query:`, mysqlQuery.substring(0, 200));
            throw err;
        }
    }
};

module.exports = {
    query: queryWrapper,
    pool: pool,
    envString
};
