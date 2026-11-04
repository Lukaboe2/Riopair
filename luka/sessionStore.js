const crypto = require('crypto');

let storageBackend = null;
let mongoModel = null;
let pgPool = null;

function generateShortId() {
    return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

function detectDbType(url = '') {
    if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) return 'mongodb';
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgresql';
    return null;
}

async function init(config) {
    const dbType = detectDbType(config.DATABASE_URL);
    if (!dbType) {
        console.log('Session storage: inline session fallback (DATABASE_URL not configured)');
        return;
    }

    try {
        if (dbType === 'mongodb') {
            const mongoose = require('mongoose');
            await mongoose.connect(config.DATABASE_URL);
            const schema = new mongoose.Schema({
                shortId: { type: String, required: true, unique: true, index: true },
                data: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            });
            mongoModel = mongoose.models.LukaSession || mongoose.model('LukaSession', schema);
            storageBackend = 'mongodb';
            console.log('Session storage: MongoDB connected');
        } else {
            const { Pool } = require('pg');
            pgPool = new Pool({
                connectionString: config.DATABASE_URL,
                ssl: config.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
            });
            await pgPool.query(`CREATE TABLE IF NOT EXISTS luka_sessions (
                short_id VARCHAR(20) PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )`);
            storageBackend = 'postgresql';
            console.log('Session storage: PostgreSQL connected');
        }
    } catch (error) {
        storageBackend = null;
        console.error(`Session database connection failed: ${error.message}`);
    }
}

function isConfigured() {
    return storageBackend !== null;
}

async function saveSession(fullSessionString) {
    if (!isConfigured()) throw new Error('Session database is not configured');
    const shortId = generateShortId();
    if (storageBackend === 'mongodb') {
        await mongoModel.create({ shortId, data: fullSessionString });
    } else {
        await pgPool.query(
            'INSERT INTO luka_sessions (short_id, data) VALUES ($1, $2)',
            [shortId, fullSessionString]
        );
    }
    return shortId;
}

async function getSession(id) {
    const safeId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeId || !isConfigured()) return null;
    if (storageBackend === 'mongodb') {
        const doc = await mongoModel.findOne({ shortId: safeId });
        return doc ? doc.data : null;
    }
    const result = await pgPool.query(
        'SELECT data FROM luka_sessions WHERE short_id = $1',
        [safeId]
    );
    return result.rows[0] ? result.rows[0].data : null;
}

module.exports = { init, isConfigured, saveSession, getSession };
