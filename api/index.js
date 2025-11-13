// Vercel serverless function entry point
require('dotenv').config();

// Import app directly (not server.js which has app.listen())
const app = require('../src/app');

// Vercel handler - sets CORS and delegates to Express
module.exports = (req, res) => {
  // CORS headers must be set before any processing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Preflight requests get immediate 200 response
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // All other requests go to Express app
  try {
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

