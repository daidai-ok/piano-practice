/** Shared route table for the browser app, local server, and Cloudflare Worker. */
export const VIEW_PATHS = Object.freeze({
  chords: '/chords',
  circle: '/circle',
  scales: '/scales',
  reading: '/reading',
});

export const ENTRY_PATHS = Object.freeze(['/', '/index.html']);
export const APP_PATHS = Object.freeze([...ENTRY_PATHS, ...Object.values(VIEW_PATHS)]);

export function viewForPath(pathname) {
  return Object.entries(VIEW_PATHS).find(([, path]) => path === pathname)?.[0] ?? null;
}

export function pathForView(view) {
  return VIEW_PATHS[view] ?? VIEW_PATHS.chords;
}

export function isAppPath(pathname) {
  return APP_PATHS.includes(pathname);
}
