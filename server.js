const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 8000;

// Proxy API requests to Flask backend
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove /api prefix when proxying
  },
}));

// Serve React static files (after build)
// For development, this serves index.html for client-side routing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sip&Link</title>
        <script>
          const API = '/api'; // Use relative /api path that proxies to Flask
          window.__API__ = API;
        </script>
      </head>
      <body>
        <div id="root"></div>
        <p style="text-align: center; margin-top: 50px; font-family: Arial;">
          ☕ <strong>Sip&Link</strong><br>
          <small>Redirecting to React app at localhost:3000...</small>
        </p>
        <script>
          // In dev, redirect to frontend server
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.location.href = 'http://localhost:3000';
          }
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://127.0.0.1:${PORT}`);
  console.log(`API requests to /api will proxy to Flask on port 5000`);
});
