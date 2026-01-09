
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * THE SAVIOUR - TACTICAL BACKEND
 * Minimalistic JSON store for emergency coordination.
 */

app.use(cors());
app.use(express.json());

// In-memory data store (Reset on restart for privacy)
const missionStore = {};

// Health check
app.get('/', (req, res) => res.send('SAVIOUR NODE ACTIVE'));

// KV Update Endpoint (Matches existing client expectations)
app.post('/api/KeyVal/UpdateValue/:token/:node/:data', (req, res) => {
  const { node, data } = req.params;
  const token = req.params.token;
  
  // Basic validation
  if (!node || !data) return res.status(400).send('INVALID_DATA');
  
  missionStore[node] = decodeURIComponent(data);
  console.log(`[GRID] Hub ${node} updated. Current mission count: ${JSON.parse(missionStore[node]).p?.length || 0}`);
  res.send('UPDATE_OK');
});

// KV Get Endpoint
app.get('/api/KeyVal/GetValue/:token/:node', (req, res) => {
  const { node } = req.params;
  const data = missionStore[node] || null;
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`
  --------------------------------------------------
  THE SAVIOUR - PRIVATE TACTICAL NODE
  Status: OPERATIONAL
  Port: ${PORT}
  Endpoint: /api/KeyVal
  --------------------------------------------------
  `);
});
