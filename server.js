const http = require('http');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
program
    .option('-h, --host <host>', 'Server host', '127.0.0.1')
    .option('-p, --port <port>', 'Server port', parseInt, 3000)
    .option('-c, --cache <cacheDir>', 'Cache directory', './cache')
    .parse(process.argv);

const options = program.opts();
const { host, port, cache } = options;

// Перевіряємо, чи існує директорія кешу, якщо ні — створюємо
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
