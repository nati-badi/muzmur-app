/**
 * One-time / repeatable download of hymn audio from nati-badi/muzmur-assets
 * into assets/audio for offline APK bundling.
 *
 * Usage:
 *   node scripts/fetch-audio-pack.js           # files listed on GitHub (recommended)
 *   node scripts/fetch-audio-pack.js --scan    # also probe every hymn id in mezmurs.json (slow)
 *   node scripts/fetch-audio-pack.js --force   # re-download even if file exists
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'audio');
const mezmurs = require(path.join(root, 'src', 'data', 'mezmurs.json'));
const oroMezmurs = require(path.join(root, 'src', 'data', 'OroMuzmurs.json'));

const GITHUB_TREE =
  'https://api.github.com/repos/nati-badi/muzmur-assets/git/trees/main?recursive=1';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nati-badi/muzmur-assets@main/';
const RAW_BASE = 'https://raw.githubusercontent.com/nati-badi/muzmur-assets/main/';

const CONCURRENCY = 8;
const args = new Set(process.argv.slice(2));
const SCAN_IDS = args.has('--scan');
const FORCE = args.has('--force');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib
      .get(url, { headers: { 'User-Agent': 'muzmur-app-fetch-audio' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchJson(res.headers.location).then(resolve).catch(reject);
        }
        let body = '';
        res.on('data', (c) => {
          body += c;
        });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function headOrGetSize(url) {
  return new Promise((resolve) => {
    https
      .get(url, { method: 'HEAD', headers: { 'User-Agent': 'muzmur-app' } }, (res) => {
        resolve(res.statusCode);
      })
      .on('error', () => resolve(0));
  });
}

function downloadToFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': 'muzmur-app' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlink(dest, () => {});
          return downloadToFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(dest));
        });
      })
      .on('error', (err) => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function listRepoAudioFiles() {
  const tree = await fetchJson(GITHUB_TREE);
  return tree.tree
    .filter((e) => e.type === 'blob' && /\.(m4a|mp3|aac|wav)$/i.test(e.path))
    .map((e) => e.path.replace(/\\/g, '/'));
}

function buildScanTargets() {
  const names = new Set();
  mezmurs.forEach((h) => {
    const id = String(h.id);
    ['m4a', 'mp3'].forEach((ext) => names.add(`${id}.${ext}`));
  });
  oroMezmurs.forEach((h) => {
    const id = String(h.id);
    ['m4a', 'mp3'].forEach((ext) => {
      names.add(`oro_${id}.${ext}`);
      names.add(`${id}.${ext}`);
    });
  });
  return [...names];
}

async function tryDownload(filename) {
  const dest = path.join(outDir, filename);
  if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    return { filename, status: 'skipped' };
  }

  const urls = [CDN_BASE + filename, RAW_BASE + filename];
  for (const url of urls) {
    const ok = await headOrGetSize(url);
    if (ok !== 200) continue;
    try {
      await downloadToFile(url, dest);
      return { filename, status: 'ok', bytes: fs.statSync(dest).size };
    } catch (e) {
      continue;
    }
  }
  return { filename, status: 'missing' };
}

async function runPool(items, worker) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => next());
  await Promise.all(workers);
  return results;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  let filenames = await listRepoAudioFiles();
  console.log(`GitHub repo: ${filenames.length} audio file(s) on main.`);

  if (SCAN_IDS) {
    const scanned = buildScanTargets();
    const merged = new Set([...filenames, ...scanned]);
    filenames = [...merged];
    console.log(`--scan: probing ${filenames.length} candidate filename(s)…`);
  }

  const results = await runPool(filenames, tryDownload);

  const ok = results.filter((r) => r.status === 'ok');
  const skipped = results.filter((r) => r.status === 'skipped');
  const missing = results.filter((r) => r.status === 'missing');

  const manifest = {
    fetchedAt: new Date().toISOString(),
    source: 'nati-badi/muzmur-assets',
    downloaded: ok.map((r) => r.filename),
    skipped: skipped.map((r) => r.filename),
    missing: missing.map((r) => r.filename),
    hymnCount: mezmurs.length,
    oromoCount: oroMezmurs.length,
  };

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const totalBytes = ok.reduce((s, r) => s + (r.bytes || 0), 0);
  console.log(`Done: ${ok.length} downloaded, ${skipped.length} skipped, ${missing.length} not on server.`);
  console.log(`Downloaded ~${(totalBytes / 1024 / 1024).toFixed(1)} MB → assets/audio/`);
  if (missing.length && !SCAN_IDS) {
    console.log('Tip: run with --scan to probe all hymn ids (most are not uploaded yet).');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});