// Vercel serverless function entry point
const app = require('../src/app');

// Export handler for Vercel
module.exports = (req, res) => {
  // CRITICAL: Set CORS headers FIRST, before anything else
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS preflight immediately
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // For all other requests, pass to Express
  app(req, res);
};

