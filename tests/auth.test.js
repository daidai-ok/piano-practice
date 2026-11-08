import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../worker/index.js';

const user = 'root';
const password = 'test-only:password';
const authorization = (username = user, secret = password) =>
  `Basic ${Buffer.from(`${username}:${secret}`).toString('base64')}`;

function setup(overrides = {}) {
  const requests = [];
  const env = {
    BASIC_AUTH_USER: user,
    BASIC_AUTH_PASSWORD: password,
    ASSETS: {
      async fetch(request) {
        requests.push(request);
        return new Response(request.method === 'HEAD' ? null : 'private asset', {
          headers: { 'Content-Type': 'text/javascript', 'Cache-Control': 'public, max-age=3600', 'Vary': 'Accept-Encoding' },
        });
      },
    },
    ...overrides,
  };
  return { env, requests };
}

test('all paths and methods require authentication before fetching any asset', async () => {
  const { env, requests } = setup();
  for (const path of ['/', '/index.html', '/src/app.js', '/src/styles.css', '/favicon.svg', '/missing']) {
    for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS']) {
      const response = await worker.fetch(new Request(`https://example.test${path}`, { method }), env);
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.match(response.headers.get('WWW-Authenticate'), /^Basic /);
      assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
      if (method === 'HEAD') assert.equal(await response.text(), '');
    }
  }
  assert.equal(requests.length, 0);
});

test('wrong credentials and malformed authorization headers do not reach assets', async () => {
  const { env, requests } = setup();
  for (const header of [
    authorization('someone-else'), authorization(user, 'wrong'), authorization(user, ''),
    'Bearer token', 'Basic', 'Basic !!!', 'Basic A', `Basic ${btoa('root')}`,
    `${authorization()}, ${authorization()}`, `${authorization()} extra`,
  ]) {
    const response = await worker.fetch(new Request('https://example.test/', { headers: { Authorization: header } }), env);
    assert.equal(response.status, 401);
  }
  assert.equal(requests.length, 0);
});

test('valid credentials serve assets without forwarding credentials or permitting caching', async () => {
  const { env, requests } = setup();
  const response = await worker.fetch(new Request('https://example.test/src/app.js?v=1', {
    headers: { Authorization: authorization().replace('Basic', 'basic'), 'If-None-Match': 'test-etag' },
  }), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'private asset');
  assert.equal(response.headers.get('Content-Type'), 'text/javascript');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.match(response.headers.get('Vary'), /Accept-Encoding/);
  assert.match(response.headers.get('Vary'), /Authorization/);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://example.test/src/app.js?v=1');
  assert.equal(requests[0].headers.get('Authorization'), null);
  assert.equal(requests[0].headers.get('If-None-Match'), 'test-etag');
});

test('missing or empty runtime credentials fail closed', async () => {
  for (const overrides of [
    { BASIC_AUTH_PASSWORD: undefined }, { BASIC_AUTH_PASSWORD: '' },
    { BASIC_AUTH_USER: undefined }, { BASIC_AUTH_USER: '' },
  ]) {
    const { env, requests } = setup(overrides);
    const response = await worker.fetch(new Request('https://example.test/', { headers: { Authorization: authorization() } }), env);
    assert.equal(response.status, 503);
    assert.equal(requests.length, 0);
  }
});

test('authenticated HEAD responses have no body', async () => {
  const { env } = setup();
  const response = await worker.fetch(new Request('https://example.test/', {
    method: 'HEAD', headers: { Authorization: authorization() },
  }), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('asset status codes are preserved after authentication', async () => {
  const { env } = setup({ ASSETS: { fetch: async () => new Response(null, { status: 404 }) } });
  const response = await worker.fetch(new Request('https://example.test/missing', { headers: { Authorization: authorization() } }), env);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});

test('Workers configuration routes every static asset through authentication', async () => {
  const source = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  const config = JSON.parse(source.replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(config.main, 'worker/index.js');
  assert.equal(config.assets.directory, './dist');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.vars.BASIC_AUTH_USER, user);
  assert.equal(config.vars.BASIC_AUTH_PASSWORD, undefined);
});
