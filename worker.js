// Serves the static site from ./public.
// 1. One canonical URL: http -> https, www -> bare domain, /index.html -> / (301).
// 2. Workers static assets ignore HTTP Range
// requests (always 200 + the whole file), but Safari/iOS will only play <video>
// from a server that answers byte ranges with 206. Video requests are routed
// here first (see run_worker_first in wrangler.jsonc) and sliced to the range.
export default {
  async fetch(request, env) {
    // One canonical URL for search engines: https://ruslanthedirector.online/ (301, one hop).
    // Only page requests reach the Worker (run_worker_first in wrangler.jsonc), which
    // is all search engines need; assets on www still load directly.
    const url = new URL(request.url);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const wantHttps = url.protocol === 'http:' && !isLocal;
    const isWww = url.hostname.startsWith('www.');
    const isIndex = url.pathname === '/index.html' || url.pathname === '/index';
    if (wantHttps || isWww || isIndex) {
      if (wantHttps) url.protocol = 'https:';
      if (isWww) url.hostname = url.hostname.slice(4);
      if (isIndex) url.pathname = '/';
      return Response.redirect(url.toString(), 301);   // one hop to https://ruslanthedirector.online/...
    }
    if (!url.pathname.startsWith('/assets/video/')) return env.ASSETS.fetch(request);

    const res = await env.ASSETS.fetch(request);
    if (res.status !== 200) return res;

    const headers = new Headers(res.headers);
    headers.set('Accept-Ranges', 'bytes');

    const range = request.headers.get('Range');
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === '' && m[2] === '')) return new Response(res.body, { status: 200, headers });

    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    let start, end;
    if (m[1] === '') {                       // bytes=-N : the last N bytes
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (start >= size || start > end) {
      headers.set('Content-Range', `bytes */${size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(buf.slice(start, end + 1), { status: 206, headers });
  },
};
