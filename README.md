# Log Downloader — GitHub Pages Setup

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full app — deploy this to GitHub Pages |
| `worker.js` | Cloudflare Worker CORS proxy — deploy this once |

---

## Step 1 — Deploy the Cloudflare Worker (one-time)

This is needed because browsers block cross-origin requests to the log server.
The Worker acts as a proxy that adds the required CORS headers.

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) (free account)
2. Click **Create a Service**
3. Choose **HTTP handler**, paste the entire contents of `worker.js`
4. Click **Save and Deploy**
5. Copy your Worker URL — looks like:
   ```
   https://log-proxy.yourname.workers.dev
   ```

The Worker only proxies requests to:
- `files-io-preprod.eus1-n.itemoptix.com`
- `files-io-prod.eus1-n.itemoptix.com`
- `files-io-pr.eus1-n.itemoptix.com`

All other targets are blocked (403).

---

## Step 2 — Deploy to GitHub Pages

1. Create a new GitHub repository
2. Add `index.html` to the root
3. Go to **Settings → Pages → Source → Deploy from branch → main / root**
4. Your app is live at `https://<you>.github.io/<repo>/`

Only `index.html` is needed. No build step, no Node, no Python.

---

## Step 3 — Use the app

1. Open the GitHub Pages URL
2. Paste your **Cloudflare Worker URL** into the "worker url" field (saved automatically)
3. Select environment, fill in sub path, add target dates
4. Click **↓ fetch from url** to load UUIDs as a dropdown, or add them manually
5. Click **run & download**

Each completed run produces:
- `<uuid>__<server>__merged.txt` — per-server merged log, sorted oldest → newest
- `<uuid>__merged_all_servers.txt` — all servers combined, sorted oldest → newest
- **Download all as zip** bundles every file into `logs.zip`
