import React, {useEffect, useMemo, useState} from 'react';
import styles from './styles.module.css';
import {
  groupByTag,
  paramRows,
  requestBody,
  responseEntries,
  buildCurl,
  buildFetch,
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
function Endpoint({method, path, op, spec}) {
  const [open, setOpen] = useState(false);
  const params = paramRows(spec, op.parameters || []);
  const body = requestBody(spec, op);
  const responses = responseEntries(spec, op);
  const curl = buildCurl(spec, method, path, op);
  const fetchCode = buildFetch(spec, method, path, op);
  const okExample = responses.find((r) => r.code.startsWith('2') && r.example !== undefined);
  return (
    <div className={styles.endpoint}>
      <button
        type="button"
        className={styles.endpointHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}>
        <span className={`${styles.badge} ${METHOD_CLASS[method] || styles.badgeDefault}`}>
          {method.toUpperCase()}
        </span>
        <code className={styles.path}>{path}</code>
        {op.summary ? <span className={styles.summary}>{op.summary}</span> : null}
        <span className={styles.chevron}>{open ? '▼' : '▶'}</span>
      </button>
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
              {okExample ? (
                <>
                  <div className={styles.muted}>Example response:</div>
                  <CodeBlock code={JSON.stringify(okExample.example, null, 2)} />
                </>
              ) : null}
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
function TagSection({tag, description, endpoints, spec}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.tagSection}>
      <button
        type="button"
        className={styles.tagHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}>
        <span className={styles.chevron}>{open ? '▼' : '▶'}</span>
        <span className={styles.tagTitle}>{tag}</span>
        <span className={styles.tagCount}>{endpoints.length}</span>
        {description ? <span className={styles.tagDesc}>{description}</span> : null}
      </button>
      {open && (
        <div className={styles.tagBody}>
          {endpoints.map((e) => (
            <Endpoint key={e.method + e.path} method={e.method} path={e.path} op={e.op} spec={spec} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApiExplorer({specUrl = '/api/openapi.json'}) {
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(specUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setSpec(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [specUrl]);
  const groups = useMemo(() => (spec ? groupByTag(spec) : []), [spec]);

  if (error) {
    return (
      <div className={styles.error}>
        Failed to load API spec from <code>{specUrl}</code>: {error}
      </div>
    );
  }
  if (!spec) {
    return <div className={styles.loading}>Loading API spec…</div>;
  }
  return (
    <div className={styles.explorer}>
      <div className={styles.intro}>
        <p>
          Interactive reference for the <strong>{spec.info && spec.info.title}</strong>{' '}
          (v{spec.info && spec.info.version}). Base path: <code>/api/v1</code>. Replace{' '}
          <code>&lt;MOS-IP&gt;</code> and <code>&lt;TOKEN&gt;</code> in the examples with your
          server address and Admin API token.
        </p>
        <p className={styles.muted}>
          Click a category to expand its endpoints, then click an endpoint to see parameters,
          request/response schemas and copy-ready example requests.
        </p>
      </div>
      {groups.map((g) => (
        <TagSection key={g.tag} tag={g.tag} description={g.description} endpoints={g.endpoints} spec={spec} />
      ))}
    </div>
  );
}