import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const root = await realpath(resolve(project, process.argv.includes('--dist') ? 'dist' : '.'));
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 5173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff': 'font/woff' };

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    // Only expose public application assets, never repository metadata or scripts.
    if (!(pathname === '/' || pathname === '/index.html' || pathname === '/favicon.svg' || pathname.startsWith('/src/'))) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const file = await realpath(resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname)));
    const isPublic = file === resolve(root, 'index.html') || file === resolve(root, 'favicon.svg') || file.startsWith(resolve(root, 'src') + sep);
    if (!isPublic || !(await stat(file)).isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});

server.on('error', error => { console.error(`起動できませんでした: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`  voicing. → http://localhost:${server.address().port}\n  Ctrl+C で終了`));
