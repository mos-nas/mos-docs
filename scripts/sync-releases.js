#!/usr/bin/env node
// scripts/sync-releases.js
// Syncs MOS release notes from github.com/mos-nas/mos-releases into the docs.
//  * Creates a MDX page per release not yet present locally (never overwrites).
//  * Maintains release-index.json (seeded from Overview.mdx on first run).
//  * Maintains release-announcement.json (read by docusaurus.config.js).
// Idempotent. Set GITHUB_TOKEN / GH_TOKEN for a higher API rate limit.
// Usage:
//   node scripts/sync-releases.js [--check] [--tag <tag>] [--repo <owner/repo>]

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const RELEASE_DIR = path.join(DOCS, 'Release-Notes');
const OVERVIEW_FILE = path.join(RELEASE_DIR, 'Overview.mdx');
const INDEX_FILE = path.join(ROOT, 'release-index.json');
const ANNOUNCE_FILE = path.join(ROOT, 'release-announcement.json');
const SYNC_FILE = path.join(ROOT, 'release-sync.json');
const SITE_URL = 'https://docs.mos-official.net';

function parseArgs(argv) {
  const out = {check: false, tag: null, repo: 'mos-nas/mos-releases', trigger: 'manual'};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') out.check = true;
    else if (a === '--tag') out.tag = argv[++i];
    else if (a.startsWith('--tag=')) out.tag = a.slice(6);
    else if (a === '--repo') out.repo = argv[++i];
    else if (a.startsWith('--repo=')) out.repo = a.slice(7);
    else if (a === '--trigger') out.trigger = argv[++i];
    else if (a.startsWith('--trigger=')) out.trigger = a.slice(10);
    else if (a === '-h' || a === '--help') {
      console.log('Usage: node scripts/sync-releases.js [--check] [--tag <tag>] [--repo <owner/repo>] [--trigger schedule|manual]');
      process.exit(0);
    }
  }
  return out;
}

function ghRequest(pathname, token) {
  return new Promise((resolve, reject) => {
    const headers = {'User-Agent': 'mos-docs-sync-releases', Accept: 'application/vnd.github+json'};
    if (token) headers.Authorization = `Bearer ${token}`;
    const req = https.request({hostname: 'api.github.com', path: pathname, headers, timeout: 30000}, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode === 404) return resolve(null);
        if (res.statusCode >= 400) return reject(new Error(`GitHub API ${res.statusCode}: ${data.slice(0, 200)}`));
        resolve(data);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('request timeout')));
    req.end();
  });
}

async function fetchReleases(repo, token, onlyTag) {
  if (onlyTag) {
    const raw = await ghRequest(`/repos/${repo}/releases/tags/${encodeURIComponent(onlyTag)}`, token);
    return raw ? [JSON.parse(raw)] : [];
  }
  const all = [];
  let page = 1;
  while (page <= 20) {
    const raw = await ghRequest(`/repos/${repo}/releases?per_page=100&page=${page}`, token);
    if (!raw) break;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) break;
    all.push(...arr);
    if (arr.length < 100) break;
    page++;
  }
  return all;
}
function extractChanges(body) {
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  let start = lines.findIndex((l) => /^changes\s*:/i.test(l.trim()));
  if (start < 0) {
    start = lines.findIndex((l) => /^\s*[-*]\s+/.test(l));
  } else {
    start += 1;
  }
  if (start < 0) return [];
  const bullets = [];
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*[-*]\s+/.test(l)) {
      bullets.push(l.replace(/^\s*[-*]\s+/, '').trim());
    } else if (l.trim() === '') {
      continue;
    } else if (/^(contributors|assets|all reactions)/i.test(l.trim())) {
      break;
    } else {
      break;
    }
  }
  return bullets;
}

const SYS_RE = /^(recommended\s+kernel|kernel|update\s+\S[^,]*v?\d|bump|docker|node\.?js|qemu|snapraid|rsync|wsddn|edk2?|mergerfs|update\s+\w+\s+to)\b/i;
const FIX_RE = /\b(fix|fixed|bugfix|workaround|regression)\b/i;

function categorize(bullets) {
  const system = [];
  const features = [];
  const fixes = [];
  for (const b of bullets) {
    if (FIX_RE.test(b)) fixes.push(b);
    else if (SYS_RE.test(b)) system.push(b);
    else features.push(b);
  }
  return {system, features, fixes};
}

function cleanHi(b) {
  return b.replace(/`/g, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}

function buildHighlights(bullets) {
  const picks = [];
  const sys = bullets.filter((b) => SYS_RE.test(b));
  for (const b of sys.slice(0, 4)) picks.push(cleanHi(b));
  const feat = bullets.filter((b) => !SYS_RE.test(b) && !FIX_RE.test(b));
  for (const b of feat.slice(0, 3)) picks.push(cleanHi(b));
  if (picks.length === 0) return 'see release notes';
  let h = picks.join(', ');
  if (h.length > 180) h = h.slice(0, 177).replace(/,\s*[^,]*$/, '') + '…';
  return h;
}

function normTag(t) {
  return String(t).replace(/^v/i, '');
}

function channelOf(release) {
  return release && release.prerelease ? 'Beta' : 'Stable';
}

function versionKey(v) {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)] : [0, 0, 0];
}

function cmpVersion(a, b) {
  const ka = versionKey(a);
  const kb = versionKey(b);
  for (let i = 0; i < 3; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
  return 0;
}
function listChannelTags(channel) {
  const dir = path.join(RELEASE_DIR, channel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).map((f) => f.slice(0, -4));
}

function readFrontmatter(file) {
  if (!fs.existsSync(file)) return {};
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  return fm;
}

function minSidebarPosition(channel) {
  let min = Infinity;
  for (const tag of listChannelTags(channel)) {
    const fm = readFrontmatter(path.join(RELEASE_DIR, channel, `${tag}.mdx`));
    const p = parseFloat(fm.sidebar_position);
    if (Number.isFinite(p) && p < min) min = p;
  }
  return Number.isFinite(min) ? min : 1;
}

// Newest existing MDX tag in a channel (by semver), or null if channel empty.
function newestExistingTag(channel) {
  const tags = listChannelTags(channel);
  if (tags.length === 0) return null;
  return tags.reduce((best, t) => (best === null || cmpVersion(t, best) > 0 ? t : best), null);
}

// Seed the index from the curated table in Overview.mdx (first run only).
function seedIndexFromOverview() {
  if (!fs.existsSync(OVERVIEW_FILE)) return new Map();
  const text = fs.readFileSync(OVERVIEW_FILE, 'utf8');
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/);
    if (!m) continue;
    const version = m[1];
    const link = m[2];
    const badge = m[3].trim();
    const highlights = m[4].trim();
    const chMatch = link.match(/\.\/(Stable|Beta)\//);
    const channel = chMatch ? chMatch[1] : badge.includes('Beta') ? 'Beta' : 'Stable';
    map.set(version, {version, channel, badge, highlights, date: null});
  }
  return map;
}
function renderMdx({tag, channel, release, prevTag, position, highlights}) {
  const emoji = channel === 'Stable' ? '🎉' : '🧪';
  const bullets = extractChanges(release.body);
  const {system, features, fixes} = categorize(bullets);
  const desc = `MOS ${tag}: ${highlights}`.replace(/"/g, "'");
  const htmlUrl = release.html_url || `https://github.com/mos-nas/mos-releases/releases/tag/${tag}`;
  const L = [];
  L.push('---');
  L.push(`title: ${tag}`);
  L.push(`sidebar_label: ${emoji} ${tag}`);
  L.push(`sidebar_position: ${position}`);
  L.push(`description: "${desc}"`);
  L.push('---');
  L.push('');
  L.push(`# ${tag}`);
  L.push('');
  L.push(':::tip[Download]');
  L.push(`Download this release on the [GitHub Releases](${htmlUrl}) page.`);
  L.push(':::');
  L.push('');
  L.push('{/* ## Important — bei Bedarf einkommentieren und kritische Hinweise ergänzen */}');
  L.push('');
  if (system.length) {
    L.push('## System');
    L.push('');
    system.forEach((b) => L.push(`- ${b}`));
    L.push('');
  }
  if (features.length) {
    L.push('## New Features');
    L.push('');
    features.forEach((b) => L.push(`- ${b}`));
    L.push('');
  }
  if (fixes.length) {
    L.push('## Bugfixes');
    L.push('');
    fixes.forEach((b) => L.push(`- ${b}`));
    L.push('');
  }
  L.push('---');
  L.push('');
  if (prevTag) {
    L.push(`[📋 Release Notes Overview](../Overview) | **[Previous: ${prevTag} ←](../${channel}/${prevTag})**`);
  } else {
    L.push('[📋 Release Notes Overview](../Overview)');
  }
  L.push('');
  return L.join('\n');
}

// Index = only releases that actually have an MDX page (curated + newly
// created). Old uncurated releases from the API are deliberately excluded so
// the Overview stays focused on documented releases.
function buildIndex(releases, existingIndex) {
  const relByTag = new Map(releases.map((r) => [normTag(r.tag_name), r]));
  const byKey = new Map();
  for (const channel of ['Stable', 'Beta']) {
    for (const tag of listChannelTags(channel)) {
      const prev = existingIndex.get(tag);
      const r = relByTag.get(tag);
      let highlights;
      if (prev) {
        highlights = prev.highlights;
      } else {
        const fm = readFrontmatter(path.join(RELEASE_DIR, channel, `${tag}.mdx`));
        const d = (fm.description || '').replace(/^MOS\s+\S+:\s*/, '').replace(/^"|"$/g, '');
        highlights = d && !/^download this release/i.test(d) ? d : r ? buildHighlights(extractChanges(r.body)) : 'release notes';
      }
      byKey.set(tag, {
        version: tag,
        channel,
        badge: channel === 'Stable' ? '🎉 Stable' : '🧪 Beta',
        highlights,
        date: r && (r.published_at || null),
      });
    }
  }
  const stable = [...byKey.values()].filter((e) => e.channel === 'Stable').sort((a, b) => cmpVersion(b.version, a.version));
  const beta = [...byKey.values()].filter((e) => e.channel === 'Beta').sort((a, b) => cmpVersion(b.version, a.version));
  return [...stable, ...beta];
}
function buildAnnouncement(index, releases) {
  if (index.length === 0) return null;
  let latest = null;
  let best = -1;
  const byVer = new Map(index.map((e) => [e.version, e]));
  for (const r of releases) {
    const t = normTag(r.tag_name);
    if (!byVer.has(t)) continue;
    const ts = Date.parse(r.published_at || r.created_at || 0);
    if (ts > best) {
      best = ts;
      latest = {tag: t, release: r};
    }
  }
  if (!latest) {
    latest = {tag: index[0].version, release: {html_url: `https://github.com/mos-nas/mos-releases/releases/tag/${index[0].version}`}};
  }
  const entry = byVer.get(latest.tag);
  const channel = entry.channel;
  const emoji = channel === 'Stable' ? '🎉' : '🧪';
  const permalink = `${SITE_URL}/docs/Release-Notes/${channel}/${latest.tag}`;
  const content =
    `${emoji} <strong>MOS ${latest.tag} is out!</strong> — ${entry.highlights}  ` +
    `<a href="${permalink}" style="color:#ffffff;">Release Notes →</a>`;
  return {
    id: `release-${latest.tag}`,
    content,
    backgroundColor: channel === 'Stable' ? '#fa9725' : '#2470d7',
    textColor: '#ffffff',
  };
}

// Build the last-sync metadata written to release-sync.json and shown by the
// SyncBadge component on the Overview page (mirrors the OpenAPI x-synced-*
// fields). All display strings are pre-formatted server-side (Europe/Vienna)
// so the badge is hydration-safe.
function buildSyncMeta(releases, opts) {
  const sorted = [...releases].sort((a, b) => Date.parse(b.published_at || 0) - Date.parse(a.published_at || 0));
  const newest = sorted[0];
  const syncedAt = new Date();
  return {
    syncedAt: syncedAt.toISOString(),
    syncedAtDisplay: new Intl.DateTimeFormat('de-AT', {
      timeZone: 'Europe/Vienna',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'shortOffset',
    }).format(syncedAt),
    syncedTrigger: opts.trigger,
    syncedFrom: newest ? normTag(newest.tag_name) : 'unknown',
    syncedRepo: opts.repo,
    syncedReleases: releases.length,
  };
}

async function main() {
  const opts = parseArgs(process.argv);
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  console.log(`▶ Fetching releases from ${opts.repo}${opts.tag ? ` (tag: ${opts.tag})` : ''} ...`);
  const releases = await fetchReleases(opts.repo, token, opts.tag);
  console.log(`  fetched ${releases.length} release(s)`);

  const existingIndex = fs.existsSync(INDEX_FILE)
    ? new Map(JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')).map((e) => [e.version, e]))
    : seedIndexFromOverview();
  if (existingIndex.size) console.log(`  index entries: ${existingIndex.size} (existing/seeded)`);

  const sortedReleases = [...releases].sort((a, b) => Date.parse(b.published_at || 0) - Date.parse(a.published_at || 0));

  // Only auto-create MDX for releases NEWER than the newest already-documented
  // release in their channel. Old, never-curated releases are left untouched
  // (their pages would be low-quality and clutter the sidebar).
  const newestByChannel = {Stable: newestExistingTag('Stable'), Beta: newestExistingTag('Beta')};

  const created = [];
  for (const r of sortedReleases) {
    const tag = normTag(r.tag_name);
    const channel = channelOf(r);
    const file = path.join(RELEASE_DIR, channel, `${tag}.mdx`);
    if (fs.existsSync(file)) continue;
    const newest = newestByChannel[channel];
    if (newest && cmpVersion(tag, newest) <= 0) continue; // not newer -> skip
    const pos = minSidebarPosition(channel) - 1;
    let prevTag = null;
    let prevMin = Infinity;
    for (const t of listChannelTags(channel)) {
      const fm = readFrontmatter(path.join(RELEASE_DIR, channel, `${t}.mdx`));
      const p = parseFloat(fm.sidebar_position);
      if (Number.isFinite(p) && p < prevMin) {
        prevMin = p;
        prevTag = t;
      }
    }
    const highlights = buildHighlights(extractChanges(r.body));
    const content = renderMdx({tag, channel, release: r, prevTag, position: pos, highlights});
    if (opts.check) {
      created.push(file);
      console.log(`  + would create: ${path.relative(ROOT, file)}`);
    } else {
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(file, content);
      created.push(file);
      console.log(`  + created: ${path.relative(ROOT, file)}`);
    }
  }

  const index = buildIndex(sortedReleases, existingIndex);
  const indexContent = JSON.stringify(index, null, 2) + '\n';
  const indexChanged = !fs.existsSync(INDEX_FILE) || fs.readFileSync(INDEX_FILE, 'utf8') !== indexContent;
  if (indexChanged) {
    if (opts.check) console.log('  ~ release-index.json would change');
    else {
      fs.writeFileSync(INDEX_FILE, indexContent);
      console.log(`✔ Wrote ${path.relative(ROOT, INDEX_FILE)} (${index.length} entries)`);
    }
  }

  const announcement = buildAnnouncement(index, sortedReleases);
  const annContent = JSON.stringify(announcement, null, 2) + '\n';
  const annChanged = !fs.existsSync(ANNOUNCE_FILE) || fs.readFileSync(ANNOUNCE_FILE, 'utf8') !== annContent;
  if (annChanged) {
    if (opts.check) console.log('  ~ release-announcement.json would change');
    else {
      fs.writeFileSync(ANNOUNCE_FILE, annContent);
      console.log(`✔ Wrote ${path.relative(ROOT, ANNOUNCE_FILE)} (id: ${announcement.id})`);
    }
  }

  // Maintain release-sync.json (last-sync metadata shown by the SyncBadge on
  // the Overview page). It is written whenever release content changed, or on
  // the first run so the badge never shows "unknown" once committed. This
  // avoids timestamp-only commits/deployments on no-op runs.
  const contentChanged = created.length > 0 || indexChanged || annChanged;
  const syncMissing = !fs.existsSync(SYNC_FILE);
  let syncChanged = false;
  if (contentChanged || syncMissing) {
    syncChanged = true;
    if (opts.check) {
      console.log('  ~ release-sync.json would change');
    } else {
      const sync = buildSyncMeta(sortedReleases, opts);
      fs.writeFileSync(SYNC_FILE, JSON.stringify(sync, null, 2) + '\n');
      console.log(`✔ Wrote ${path.relative(ROOT, SYNC_FILE)} (trigger: ${sync.syncedTrigger}, from: ${sync.syncedFrom})`);
    }
  }

  if (opts.check) {
    if (created.length || indexChanged || annChanged || syncChanged) {
      console.log('✖ Drift detected.');
      process.exit(1);
    }
    console.log('✔ Release notes are up to date.');
  } else if (created.length === 0 && !indexChanged && !annChanged && !syncChanged) {
    console.log('✔ Nothing to do — everything up to date.');
  }
}

main().catch((e) => {
  console.error('✖ sync-releases failed:', e.message);
  process.exit(1);
});