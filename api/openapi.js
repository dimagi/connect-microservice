const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const schemaPath = path.join(__dirname, 'openapi.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(schema);
};
