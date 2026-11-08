import { timingSafeEqual } from 'node:crypto';

const encoder = new TextEncoder();
const challenge = 'Basic realm="voicing", charset="UTF-8"';

function credentialsFrom(request) {
  const match = /^Basic +([A-Za-z0-9+/]+={0,2})$/i.exec(request.headers.get('Authorization') ?? '');
  if (!match) return null;
  try {
    return Uint8Array.from(atob(match[1]), character => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function authenticated(request, user, password) {
  const credentials = credentialsFrom(request);
  if (!credentials) return false;
  // Compare fixed-size digests so comparison time does not expose a secret prefix.
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', credentials),
    crypto.subtle.digest('SHA-256', encoder.encode(`${user}:${password}`)),
  ]);
  return timingSafeEqual(new Uint8Array(actual), new Uint8Array(expected));
}

function deny(request, status, message) {
  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'Vary': 'Authorization',
  };
  if (status === 401) headers['WWW-Authenticate'] = challenge;
  return new Response(request.method === 'HEAD' ? null : message, { status, headers });
}

export default {
  async fetch(request, env) {
    // Fail closed if the runtime secret has not been configured.
    if (typeof env.BASIC_AUTH_USER !== 'string' || !env.BASIC_AUTH_USER ||
        typeof env.BASIC_AUTH_PASSWORD !== 'string' || !env.BASIC_AUTH_PASSWORD) {
      return deny(request, 503, 'Service unavailable.');
    }
    if (!await authenticated(request, env.BASIC_AUTH_USER, env.BASIC_AUTH_PASSWORD)) {
      return deny(request, 401, 'Authentication required.');
    }

    const assetRequest = new Request(request);
    assetRequest.headers.delete('Authorization');
    const asset = await env.ASSETS.fetch(assetRequest);
    const response = new Response(asset.body, asset);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.append('Vary', 'Authorization');
    return response;
  },
};
