/**
 * Cloudflare Worker — CORS Proxy for Log Downloader
 * ===================================================
 * Uses ?url=<encoded-target> instead of /proxy/<target>
 * to avoid Cloudflare path-stripping/re-encoding issues.
 *
 * Deploy:
 *   1. workers.cloudflare.com → Create a Service
 *   2. Paste this file → Save and Deploy
 *   3. Copy your .workers.dev URL into the app
 */

const ALLOWED_HOSTNAMES = [
  "files-io-preprod.eus1-n.itemoptix.com",
  "files-io-prod.eus1-n.itemoptix.com",
  "files-io-pr.eus1-n.itemoptix.com",
];

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const incoming = new URL(request.url);

    // Health-check ping: GET /ping → 200 OK
    if (incoming.pathname === "/ping") {
      return new Response("ok", { status: 200, headers: CORS });
    }

    // Target is passed as ?url=<fully-encoded URL>
    const targetStr = incoming.searchParams.get("url");
    if (!targetStr) {
      return new Response(
        "Missing ?url= parameter. Usage: /proxy?url=https://files-io-prod...",
        { status: 400, headers: CORS }
      );
    }

    let targetUrl;
    try {
      targetUrl = new URL(targetStr);
    } catch {
      return new Response("Invalid URL in ?url= : " + targetStr, {
        status: 400, headers: CORS,
      });
    }

    // Security: only proxy allowed hostnames
    if (!ALLOWED_HOSTNAMES.includes(targetUrl.hostname)) {
      return new Response("Host not allowed: " + targetUrl.hostname, {
        status: 403, headers: CORS,
      });
    }

    try {
      const upstream = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: { "Accept-Encoding": "identity" },
      });

      const headers = new Headers(CORS);
      const ct = upstream.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      const cl = upstream.headers.get("content-length");
      if (cl) headers.set("content-length", cl);

      return new Response(upstream.body, {
        status:  upstream.status,
        headers,
      });
    } catch (err) {
      return new Response("Upstream fetch error: " + err.message, {
        status: 502, headers: CORS,
      });
    }
  },
};
