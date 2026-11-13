const http = require('http');
const { executeCode } = require('./runner');

const PORT = process.env.RUNNER_PORT || 6000;

const server = http.createServer(async (req, res) => {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'CodeQuest Runner Sandbox' }));
    return;
  }

  // Route d'exécution de code
  if (req.method === 'POST' && req.url === '/execute') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const result = await executeCode(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Erreur dans la requête : ${err.message}` }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route introuvable' }));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[CodeQuest Runner] Écoute sur le port ${PORT}`);
  });
}

module.exports = { server };
