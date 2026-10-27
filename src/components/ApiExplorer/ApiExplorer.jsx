import React, {useEffect, useMemo, useState} from 'react';
import styles from './styles.module.css';
import specData from './openapi.json';
import {
  groupByTag,
  paramRows,
  requestBody,
  responseEntries,
  buildCurl,
  buildFetch,
  authMode,
} from './openapi-utils';

const METHOD_CLASS = {
  get: styles.badgeGet,
  post: styles.badgePost,
  put: styles.badgePut,
  delete: styles.badgeDelete,
  patch: styles.badgePatch,
  head: styles.badgeHead,
  options: styles.badgeOptions,
};

// --- tiny, dependency-free markdown -> HTML renderer for descriptions ---
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function inlineMd(s) {
  let h = escapeHtml(s);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return h;
}
function mdToHtml(text) {
  if (!text) return '';
  const blocks = [];
  let work = String(text).replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, code) => {
    const i = blocks.length;
    blocks.push(
      `<pre class="${styles.mdPre}"><code>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`,
    );
    return `\u0000B${i}\u0000`;
  });
  const lines = work.split('\n');
  let html = '';
  let para = [];
  let list = [];
  const flushPara = () => {
    if (para.length) html += `<p>${inlineMd(para.join(' '))}</p>`;
    para = [];
  };
  const flushList = () => {
    if (list.length)
      html += `<ul>${list.map((li) => `<li>${inlineMd(li)}</li>`).join('')}</ul>`;
    list = [];
  };
  for (const line of lines) {
    if (/^\u0000B\d+\u0000$/.test(line)) {
      flushPara();
      flushList();
      html += line;
      continue;
    }
    if (/^\s*$/.test(line)) {
      flushPara();
      flushList();
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }
    if (list.length) flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return html.replace(/\u0000B(\d+)\u0000/g, (_m, i) => blocks[+i]);
}

function plainText(text) {
  if (!text) return '';
  return String(text)
    .replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, code) => ' ' + code + ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Visually hidden but present in the SSR HTML so the local search index
// (@cmfcmf/docusaurus-search-local, which reads rendered article text) can
// index every endpoint, path, parameter and description.
function SearchIndex({groups}) {
  return (
    <div className={styles.searchIndex} aria-hidden="true">
      {groups.map((g) => (
        <div key={g.tag}>
          <p>{g.tag}. {plainText(g.description)}</p>
          {g.endpoints.map((e) => {
            const params = paramRows(specData, e.op.parameters || []);
            const responses = responseEntries(specData, e.op);
            const body = requestBody(specData, e.op);
            return (
              <p key={e.method + e.path}>
                {e.method.toUpperCase()} {e.path}. {plainText(e.op.summary)}.{' '}
                {plainText(e.op.description)}{' '}
                {params.length ? 'Parameters: ' + params.map((p) => p.name).join(', ') + '.' : ''}{' '}
                {body && body.rows.length ? 'Body: ' + body.rows.map((r) => r.field).join(', ') + '.' : ''}{' '}
                {responses.length ? 'Responses: ' + responses.map((r) => r.code).join(', ') + '.' : ''}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CodeBlock({code}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className={styles.codeBlock}>
      <button className={styles.copyBtn} type="button" onClick={copy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
function ParamTable({rows}) {
  if (!rows.length) return null;
  return (
    <div className={styles.section}>
      <h5>Parameters</h5>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>In</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name + r.in}>
              <td><code>{r.name}</code></td>
              <td>{r.in}</td>
              <td><code>{r.type}</code></td>
              <td>{r.required ? <span className={styles.req}>Yes</span> : 'No'}</td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchemaTable({rows}) {
  if (!rows.length) return null;
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Required</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.field}>
            <td><code>{r.field}</code></td>
            <td><code>{r.type}</code></td>
            <td>{r.required ? <span className={styles.req}>Yes</span> : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function AnchorLink({id}) {
  const [copied, setCopied] = useState(false);
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${id}`);
    }
  };
  return (
    <a
      className={styles.anchorLink}
      href={`#${id}`}
      onClick={onClick}
      title="Copy link to share"
      aria-label="Copy link to share">
      {copied ? '✓' : '#'}
    </a>
  );
}

function AuthBadge({mode}) {
  const isPublic = mode === 'public';
  return (
    <span
      className={`${styles.authBadge} ${isPublic ? styles.authPublic : styles.authBearer}`}
      title={isPublic ? 'Public — no authentication required' : 'Requires a Bearer token'}>
      {isPublic ? 'Public' : 'Bearer'}
    </span>
  );
}

function Endpoint({method, path, op, spec, id, open, onToggle, baseUrl, token}) {
  const params = paramRows(spec, op.parameters || []);
  const body = requestBody(spec, op);
  const responses = responseEntries(spec, op);
  const auth = authMode(spec, op);
  const exOpts = {baseUrl, token, auth};
  const curl = buildCurl(spec, method, path, op, exOpts);
  const fetchCode = buildFetch(spec, method, path, op, exOpts);
  const examples = responses.filter((r) => r.example !== undefined);
  return (
    <div className={styles.endpoint} id={id}>
      <div className={styles.endpointHeader}>
        <button
          type="button"
          className={styles.endpointToggle}
          onClick={onToggle}
          aria-expanded={open}>
          <span className={`${styles.badge} ${METHOD_CLASS[method] || styles.badgeDefault}`}>
            {method.toUpperCase()}
          </span>
          <code className={styles.path}>{path}</code>
          {op.summary ? <span className={styles.summary}>{op.summary}</span> : null}
          <AuthBadge mode={auth} />
          <span className={styles.chevron}>{open ? '▼' : '▶'}</span>
        </button>
        <AnchorLink id={id} />
      </div>
      {open && (
        <div className={styles.endpointBody}>
          {op.description ? (
            <div className={styles.description} dangerouslySetInnerHTML={{__html: mdToHtml(op.description)}} />
          ) : null}
          <ParamTable rows={params} />
          {body && body.example !== undefined ? (
            <div className={styles.section}>
              <h5>Request body <span className={styles.muted}>(application/json)</span></h5>
              <CodeBlock code={JSON.stringify(body.example, null, 2)} />
              <SchemaTable rows={body.rows} />
            </div>
          ) : null}
          {responses.length ? (
            <div className={styles.section}>
              <h5>Responses</h5>
              <table className={styles.table}>
                <thead>
                  <tr><th>Status</th><th>Description</th><th>Schema</th></tr>
                </thead>
                <tbody>
                  {responses.map((r) => (
                    <tr key={r.code}>
                      <td><span className={`${styles.statusBadge} ${r.code.startsWith('2') ? styles.status2xx : r.code.startsWith('3') ? styles.status3xx : r.code.startsWith('4') ? styles.status4xx : styles.status5xx}`}>{r.code}</span></td>
                      <td>{r.description}</td>
                      <td><code>{r.schema}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {examples.map((r) => (
                <div key={r.code} className={styles.responseExample}>
                  <div className={styles.muted}>Example response {r.code} ({r.schema})</div>
                  <CodeBlock code={JSON.stringify(r.example, null, 2)} />
                </div>
              ))}
            </div>
          ) : null}
          <div className={styles.section}>
            <h5>Example request</h5>
            <div className={styles.muted}>cURL</div>
            <CodeBlock code={curl} />
            <div className={styles.muted}>JavaScript (fetch)</div>
            <CodeBlock code={fetchCode} />
          </div>
        </div>
      )}
    </div>
  );
}

function TagSection({tag, description, endpoints, spec, id, open, onToggle, baseUrl, token, endpointOpen, onToggleEndpoint}) {
  return (
    <div className={styles.tagSection} id={id}>
      <div className={styles.tagHeader}>
        <button
          type="button"
          className={styles.tagToggle}
          onClick={onToggle}
          aria-expanded={open}>
          <span className={styles.chevron}>{open ? '▼' : '▶'}</span>
          <span className={styles.tagTitle}>{tag}</span>
          <span className={styles.tagCount}>{endpoints.length}</span>
          {description ? <span className={styles.tagDesc}>{description}</span> : null}
        </button>
        <AnchorLink id={id} />
      </div>
      {open && (
        <div className={styles.tagBody}>
          {endpoints.map((e) => (
            <Endpoint
              key={e._id}
              method={e.method}
              path={e.path}
              op={e.op}
              spec={spec}
              id={e._id}
              open={endpointOpen(e._id)}
              onToggle={() => onToggleEndpoint(e._id, id)}
              baseUrl={baseUrl}
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function resolveBaseUrl(serverUrl, host) {
  let url = serverUrl || '/api/v1';
  const h = host && host.trim() ? host.trim() : '<MOS-IP>';
  url = url.replace(/\{host\}/g, h);
  if (url.startsWith('/')) url = `http://${h}${url}`;
  return url.replace(/\/+$/, '');
}

function FilterBar({query, setQuery, methods, activeMethods, toggleMethod, onClear, matchCount}) {
  return (
    <div className={styles.filterBar}>
      <input
        className={styles.filterInput}
        type="search"
        placeholder="Filter by path, summary, parameter…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Filter endpoints" />
      <div className={styles.methodChips}>
        {methods.map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.methodChip} ${activeMethods.has(m) ? styles.methodChipActive : ''}`}
            onClick={() => toggleMethod(m)}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      {(query || activeMethods.size > 0) && (
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          Clear ({matchCount})
        </button>
      )}
    </div>
  );
}

function ConfigBar({servers, config, setConfig, baseUrl}) {
  const [open, setOpen] = useState(false);
  const url = servers[config.serverIndex]?.url || '';
  const needsHost = url.includes('{host}') || url.startsWith('/');
  const update = (patch) => setConfig((c) => ({...c, ...patch}));
  const reset = () => setConfig((c) => ({serverIndex: c.serverIndex, host: '', token: ''}));
  return (
    <div className={styles.configBar}>
      <button type="button" className={styles.configToggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Connection settings {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className={styles.configBody}>
          <label className={styles.configField}>
            <span>Server</span>
            <select value={config.serverIndex} onChange={(e) => update({serverIndex: Number(e.target.value)})}>
              {servers.map((s, i) => (
                <option key={i} value={i}>{s.description || s.url} — {s.url}</option>
              ))}
            </select>
          </label>
          {needsHost && (
            <label className={styles.configField}>
              <span>Host / IP</span>
              <input type="text" placeholder="e.g. 192.168.1.10" value={config.host} onChange={(e) => update({host: e.target.value})} />
            </label>
          )}
          <label className={styles.configField}>
            <span>Admin API token</span>
            <input type="password" placeholder="<TOKEN>" value={config.token} onChange={(e) => update({token: e.target.value})} />
          </label>
          <div className={styles.configPreview}>
            Base URL: <code>{baseUrl}</code>
          </div>
          <div className={styles.configHint}>
            Values are stored only in your browser (localStorage) and never sent anywhere.
          </div>
          <button type="button" className={styles.clearBtn} onClick={reset}>Reset</button>
        </div>
      )}
    </div>
  );
}

function TagJumpBar({groups}) {
  return (
    <nav className={styles.jumpBar} aria-label="Jump to category">
      {groups.map((g) => (
        <a key={g._id} className={styles.jumpChip} href={`#${g._id}`}>
          {g.tag} <span className={styles.jumpCount}>{g.endpoints.length}</span>
        </a>
      ))}
    </nav>
  );
}

function ListControls({onExpandAll, onCollapseAll}) {
  return (
    <div className={styles.listControls}>
      <button type="button" onClick={onExpandAll}>Expand all</button>
      <button type="button" onClick={onCollapseAll}>Collapse all</button>
    </div>
  );
}

export default function ApiExplorer() {
  const servers = specData.servers || [];
  const absoluteServerIndex = useMemo(() => {
    const i = servers.findIndex((s) => /^https?:\/\//.test(s.url));
    return i >= 0 ? i : 0;
  }, [servers]);

  const {groups, endpointIndex, tagIds, allTagIds, allEndpointIds} = useMemo(() => {
    const raw = groupByTag(specData);
    const endpointIndex = {};
    const tagIds = new Set();
    const allTagIds = new Set();
    const allEndpointIds = new Set();
    const out = raw.map((g) => {
      const tagId = `tag-${slug(g.tag)}`;
      tagIds.add(tagId);
      allTagIds.add(tagId);
      const endpoints = g.endpoints.map((e) => {
        const id = `${slug(e.method)}-${slug(e.path)}`;
        endpointIndex[id] = tagId;
        allEndpointIds.add(id);
        return {...e, _id: id};
      });
      return {...g, _id: tagId, endpoints};
    });
    return {groups: out, endpointIndex, tagIds, allTagIds, allEndpointIds};
  }, []);

  const [openTags, setOpenTags] = useState(() => new Set());
  const [openEndpoints, setOpenEndpoints] = useState(() => new Set());
  const [config, setConfig] = useState({serverIndex: absoluteServerIndex, host: '', token: ''});

  // Load connection settings from localStorage after mount (SSR-safe).
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mos-api-config');
      if (raw) {
        const c = JSON.parse(raw);
        setConfig((prev) => ({
          ...prev,
          serverIndex: typeof c.serverIndex === 'number' ? c.serverIndex : prev.serverIndex,
          host: typeof c.host === 'string' ? c.host : '',
          token: typeof c.token === 'string' ? c.token : '',
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('mos-api-config', JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  const baseUrl = useMemo(
    () => resolveBaseUrl(servers[config.serverIndex]?.url || '/api/v1', config.host),
    [servers, config.serverIndex, config.host],
  );

  const methods = ['get', 'post', 'put', 'patch', 'delete'];
  const [query, setQuery] = useState('');
  const [activeMethods, setActiveMethods] = useState(() => new Set());
  const toggleMethod = (m) =>
    setActiveMethods((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  const clearFilter = () => {
    setQuery('');
    setActiveMethods(new Set());
  };

  const {filteredGroups, filtering, textFiltering, matchedEndpointIds, matchedTagIds} = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = q ? q.split(/\s+/) : [];
    const hasMethodFilter = activeMethods.size > 0;
    const filtering = tokens.length > 0 || hasMethodFilter;
    const textFiltering = tokens.length > 0;
    const matchedEndpointIds = new Set();
    const matchedTagIds = new Set();
    const out = [];
    for (const g of groups) {
      const eps = [];
      for (const e of g.endpoints) {
        if (hasMethodFilter && !activeMethods.has(e.method)) continue;
        if (tokens.length) {
          const params = paramRows(specData, e.op.parameters || []);
          const hay = [
            e.method, e.path, e.op.summary || '', e.op.description || '',
            g.tag, g.description || '',
            ...params.map((p) => p.name), ...params.map((p) => p.description || ''),
          ].join(' ').toLowerCase();
          if (!tokens.every((t) => hay.includes(t))) continue;
        }
        eps.push(e);
        matchedEndpointIds.add(e._id);
      }
      if (eps.length) {
        out.push({...g, endpoints: eps});
        matchedTagIds.add(g._id);
      }
    }
    return {filteredGroups: out, filtering, textFiltering, matchedEndpointIds, matchedTagIds};
  }, [groups, query, activeMethods]);

  const toggleTag = (id) =>
    setOpenTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleEndpoint = (id, tagId) => {
    const willOpen = !openEndpoints.has(id);
    setOpenEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (willOpen) {
      setOpenTags((prev) => new Set(prev).add(tagId));
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#${id}`);
      }
    }
  };

  const expandAll = () => {
    setOpenTags(new Set(allTagIds));
    setOpenEndpoints(new Set(allEndpointIds));
  };
  const collapseAll = () => {
    setOpenTags(new Set());
    setOpenEndpoints(new Set());
  };

  const tagOpen = (id) => openTags.has(id) || (filtering && matchedTagIds.has(id));
  const endpointOpen = (id) => openEndpoints.has(id) || (textFiltering && matchedEndpointIds.has(id));

  // Deep-linking: open + scroll to the endpoint/tag referenced by the URL hash.
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      const tagId = endpointIndex[hash];
      let scrollToId = hash;
      if (tagId) {
        // hash is an endpoint id -> open its tag + the endpoint
        setOpenTags((prev) => new Set(prev).add(tagId));
        setOpenEndpoints((prev) => new Set(prev).add(hash));
      } else if (tagIds.has(hash)) {
        // hash is a tag id -> open the tag
        setOpenTags((prev) => new Set(prev).add(hash));
      } else {
        scrollToId = null;
      }
      if (scrollToId) {
        requestAnimationFrame(() => {
          const el = document.getElementById(scrollToId);
          if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [endpointIndex, tagIds]);

  const info = specData.info || {};
  const matchCount = matchedEndpointIds.size;

  return (
    <div className={styles.explorer}>
      <div className={styles.intro}>
        <p>
          Interactive reference for the <strong>{info.title}</strong> (v{info.version}). Base path:{' '}
          <code>/api/v1</code>. Configure your server and token below to make every example
          copy-ready, or leave the defaults to use <code>&lt;MOS-IP&gt;</code> / <code>&lt;TOKEN&gt;</code> placeholders.
        </p>
        <p className={styles.muted}>
          Filter to find endpoints fast, click a category to expand it, then open an endpoint for
          parameters, schemas and example requests. Use the <code>#</code> on any endpoint or category
          to copy a direct, shareable link.
        </p>
        {specData['x-synced-at'] &&
          (() => {
            const s = String(specData['x-synced-at']);
            const sha = String(specData['x-synced-from'] || '').slice(0, 10);
            return (
              <p className={styles.muted}>
                Last synced {s.slice(0, 10)} {s.slice(11, 16)} UTC
                {sha ? ` from mos-api@${sha}` : ''}. Auto-updated weekly from the mos-api repository.
              </p>
            );
          })()}
      </div>
      <ConfigBar servers={servers} config={config} setConfig={setConfig} baseUrl={baseUrl} />
      <FilterBar
        query={query}
        setQuery={setQuery}
        methods={methods}
        activeMethods={activeMethods}
        toggleMethod={toggleMethod}
        onClear={clearFilter}
        matchCount={matchCount} />
      <div className={styles.toolbar}>
        <ListControls onExpandAll={expandAll} onCollapseAll={collapseAll} />
        <TagJumpBar groups={groups} />
      </div>
      {filteredGroups.length === 0 ? (
        <div className={styles.noResults}>No endpoints match your filter.</div>
      ) : (
        filteredGroups.map((g) => (
          <TagSection
            key={g._id}
            tag={g.tag}
            description={g.description}
            endpoints={g.endpoints}
            spec={specData}
            id={g._id}
            open={tagOpen(g._id)}
            onToggle={() => toggleTag(g._id)}
            baseUrl={baseUrl}
            token={config.token}
            endpointOpen={endpointOpen}
            onToggleEndpoint={toggleEndpoint}
          />
        ))
      )}
      <SearchIndex groups={groups} />
    </div>
  );
}