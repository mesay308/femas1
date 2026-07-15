// Vercel Serverless Function Entrypoint
console.log('Vercel Function: Loading backend app...');

try {
    const app = require('../backend/index');
    module.exports = app;
} catch (error) {
    console.error('Vercel Function: Failed to load backend:', error);
    // Fallback simple express app to show the error if everything else fails
    const express = require('express');
    const fallbackApp = express();
    fallbackApp.get('*', (req, res) => {
        res.status(500).json({
            error: 'Backend failed to load in Vercel environment',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    });
    module.exports = fallbackApp;
}
