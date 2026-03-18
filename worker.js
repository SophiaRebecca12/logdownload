// Cloudflare Worker — CORS Proxy for Log Downloader
// ES Module syntax (compatible with all Cloudflare accounts)
//
// Health: GET https://yourworker.workers.dev           → 200 "proxy ok"
// Usage:  GET https://yourworker.workers.dev?url=<encoded-target-url>

const ALLOWED = [
  "files-io-preprod.eus1-n.itemoptix.com",
  "files-io-prod.eus1-n.itemoptix.com",
  "files-io-pr.eus1-n.itemoptix.com",
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const u = new URL(request.url);
    const targetStr = u.searchParams.get("url");

    // No ?url= param — health check
    if (!targetStr) {
      return new Response("proxy ok", { status: 200, headers: CORS });
    }

    // Parse target URL
    let target;
    try {
      target = new URL(targetStr);
    } catch (e) {
      return new Response("Invalid URL: " + targetStr, { status: 400, headers: CORS });
    }

    // Security check
    if (!ALLOWED.includes(target.hostname)) {
      return new Response("Host not allowed: " + target.hostname, { status: 403, headers: CORS });
    }

    // Fetch upstream
    try {
      const resp = await fetch(target.toString(), {
        method: "GET",
        headers: { "Accept-Encoding": "identity" },
      });

      const headers = new Headers(CORS);
      const ct = resp.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      const cl = resp.headers.get("content-length");
      if (cl) headers.set("content-length", cl);

      return new Response(resp.body, { status: resp.status, headers });
    } catch (err) {
      return new Response("Upstream error: " + err.message, { status: 502, headers: CORS });
    }
  }
};
