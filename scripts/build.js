import { cp, mkdir, rm } from 'node:fs/promises';
const out = new URL('../dist/', import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'favicon.svg', 'src']) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, out), { recursive: true });
}
console.log('Built → dist/ (static HTML, CSS, JavaScript)');
