const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
}


if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString('utf8');
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
    if (pathname === '/api/messages' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const newMsg = JSON.parse(raw);
      newMsg.id = 'msg_' + Date.now();
      newMsg.timestamp = new Date().toISOString();
      let messages = [];
      if (fs.existsSync(MESSAGES_FILE)) {
        try { messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8')); } catch (e) { messages = []; }
      }
      messages.unshift(newMsg);
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Message recorded' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (pathname === '/api/messages' && req.method === 'GET') {
    try {
      const data = fs.existsSync(MESSAGES_FILE) ? fs.readFileSync(MESSAGES_FILE, 'utf8') : '[]';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { username, password } = JSON.parse(raw);
      if (username === 'admin' && password === 'ella') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token: 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2),
          message: 'Login successful'
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid username or password' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON request' }));
    }
    return;
  }

  if (pathname === '/api/content' && req.method === 'GET') {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'data.json not found' }));
        return;
      }
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read data' }));
    }
    return;
  }

  if (pathname === '/api/content' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const parsed = JSON.parse(raw);
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Changes saved successfully to data.json' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (pathname === '/api/upload' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { filename, base64 } = JSON.parse(raw);
      if (!base64 || !filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Missing filename or base64 data' }));
        return;
      }
      const ext = path.extname(filename).toLowerCase() || '.jpg';
      const cleanName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFilename = cleanName + '_' + Date.now() + ext;
      const targetPath = path.join(UPLOADS_DIR, uniqueFilename);
      
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(targetPath, buffer);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        url: 'uploads/' + uniqueFilename,
        message: 'Image uploaded successfully'
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Static File Serving
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\\.\\|[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('Portfolio Server running at http://localhost:' + PORT);
});
