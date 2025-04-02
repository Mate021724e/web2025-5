const http = require('http');
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');

program
  .option('-h, --host <host>', 'Server host', '127.0.0.1')
  .option('-p, --port <port>', 'Server port', parseInt, 3000)
  .option('-c, --cache <cacheDir>', 'Cache directory', './cache')
  .parse();

const options = program.opts();
const cacheDir = path.resolve(options.cache);

// Function to ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch (err) {
    console.error('Error creating cache directory:', err);
  }
}

const server = http.createServer(async (req, res) => {
  const match = req.url.match(/^\/(\d{3})$/);
  if (!match) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Invalid request format');
  }

  const statusCode = match[1];
  const filePath = path.join(cacheDir, `${statusCode}.jpg`);

  if (req.method === 'GET') {
    // 🔹 Get image
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (err) {
      // If image not found in cache
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else if (req.method === 'PUT') {
    // 🔹 Save image
    try {
      const fileStream = await fs.writeFile(filePath, await streamToBuffer(req));
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end('File saved');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('File write error');
    }
  } else if (req.method === 'DELETE') {
    // 🔹 Delete image
    try {
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('File deleted');
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else {
    
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
});

// Function to read stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Start the server
ensureCacheDir().then(() => {
  server.listen(options.port, options.host, () => {
    console.log(`Server running on ${options.host}:${options.port}`);
  });
});
