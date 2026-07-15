const db = require('../config/db');

async function testConnection() {
    console.log('Testing database connection...');
    try {
        const { rows } = await db.query('SELECT 1 + 1 AS result');
        console.log('Successfully connected to the database!');
        console.log('Test query result:', rows[0].result);
        
        const { rows: dbNameRow } = await db.query('SELECT DATABASE() AS current_db');
        console.log('Connected to database schema:', dbNameRow[0].current_db);
        
        process.exit(0);
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1);
    }
}

testConnection();
