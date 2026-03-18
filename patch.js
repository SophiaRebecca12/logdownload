/*
  PATCH for index.html
  ====================
  Find the existing `testProxy()` function and replace it with this one.
  The only change: ping now hits the root URL (no /ping path) with ?url absent,
  which the new worker.js returns 200 "ok" for.

  Also replace the existing `proxied()` function (shown below for reference —
  it should already be correct if you used the last index.html output).
*/


// ── REPLACE your existing proxied() with this ──────────────────────────────
function proxied(targetUrl) {
  const p = getProxy();
  if (!p) return targetUrl;
  // Pass the target as a query param — Cloudflare never mangles query strings
  return `${p}?url=${encodeURIComponent(targetUrl)}`;
}


// ── REPLACE your existing testProxy() with this ────────────────────────────
async function testProxy() {
  const p = getProxy();
  if (!p) { setProxyStatus("paste your worker URL above", "warn"); return; }
  setProxyStatus("testing…", "warn");
  try {
    // Hit the worker root with no ?url — worker returns 200 "ok" as a health check
    const r = await fetch(p);
    const text = await r.text();
    if (r.ok && text.trim() === "ok") {
      setProxyStatus("proxy connected", "ok");
    } else if (r.ok) {
      // Got 200 but unexpected body — worker is reachable, probably fine
      setProxyStatus("proxy reachable (unexpected body: " + text.slice(0, 30) + ")", "warn");
    } else {
      setProxyStatus(`worker returned HTTP ${r.status}`, "err");
    }
  } catch (e) {
    setProxyStatus("cannot reach worker — check URL", "err");
  }
}
