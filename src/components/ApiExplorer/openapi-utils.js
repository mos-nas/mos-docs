// Pure helpers for turning an OpenAPI 3 spec into renderable data.
// All functions take the parsed `spec` so they can resolve $ref pointers.

export function resolveRef(spec, node) {
  if (!node || typeof node !== 'object') return node;
  if (node.$ref) {
    const parts = node.$ref.replace(/^#\//, '').split('/');
    let cur = spec;
    for (const p of parts) cur = cur && cur[p];
    return cur;
  }
  return node;
}

export function refName(node) {
  if (!node) return undefined;
  if (node.$ref) return node.$ref.split('/').pop();
  return undefined;
}

export function typeStr(spec, schema) {
  if (!schema) return '-';
  const name = refName(schema);
  if (name) return name;
  const s = resolveRef(spec, schema);
  if (s.type) {
    if (s.type === 'array') return `array[${typeStr(spec, s.items)}]`;
    if (s.type === 'object' && s.title) return s.title;
    return s.type;
  }
  if (s.properties) return 'object';
  return '-';
}

export function exampleFor(spec, schema, seen = new Set()) {
  const s = resolveRef(spec, schema);
  if (!s) return null;
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined) return s.default;
  if (Array.isArray(s.enum) && s.enum.length) return s.enum[0];

  if (s.allOf) {
    const obj = {};
    for (const sub of s.allOf) {
      const r = resolveRef(spec, sub);
      if (r && r.properties) {
        for (const [k, v] of Object.entries(r.properties)) obj[k] = exampleFor(spec, v, seen);
      }
    }
    return obj;
  }
  if (s.oneOf || s.anyOf) return exampleFor(spec, (s.oneOf || s.anyOf)[0], seen);

  if (s.type === 'object' || s.properties) {
    if (seen.has(s)) return null;
    seen.add(s);
    const obj = {};
    if (s.properties) {
      for (const [k, v] of Object.entries(s.properties)) obj[k] = exampleFor(spec, v, seen);
    }
    if (s.additionalProperties && typeof s.additionalProperties === 'object') {
      obj['<key>'] = exampleFor(spec, s.additionalProperties, seen);
    }
    seen.delete(s);
    return obj;
  }
  if (s.type === 'array') return [exampleFor(spec, s.items, seen)];
  if (s.type === 'string') return 'string';
  if (s.type === 'integer' || s.type === 'number') return 0;
  if (s.type === 'boolean') return false;
  return null;
}
export function paramRows(spec, params) {
  if (!params || !params.length) return [];
  return params.map((p) => {
    const r = resolveRef(spec, p);
    const s = resolveRef(spec, r.schema);
    let t = typeStr(spec, r.schema);
    if (s && s.enum) t += ' ' + JSON.stringify(s.enum);
    return {
      name: r.name,
      in: r.in,
      type: t,
      required: !!r.required,
      description: r.description || '',
    };
  });
}

export function schemaRows(spec, schema) {
  const s = resolveRef(spec, schema);
  if (!s || (!s.properties && !s.allOf && !s.oneOf && !s.anyOf)) return [];
  let props = {};
  if (s.properties) props = s.properties;
  if (s.allOf) {
    for (const sub of s.allOf) {
      const r = resolveRef(spec, sub);
      if (r && r.properties) props = { ...props, ...r.properties };
    }
  }
  const required = new Set(s.required || []);
  return Object.entries(props).map(([k, v]) => {
    const rs = resolveRef(spec, v);
    let t = typeStr(spec, v);
    if (rs && rs.enum) t += ' ' + JSON.stringify(rs.enum);
    return { field: k, type: t, required: required.has(k), description: (rs && rs.description) || '' };
  });
}

const DEFAULT_BASE = 'http://<MOS-IP>/api/v1';
const DEFAULT_TOKEN = '<TOKEN>';

// Effective auth for an operation: an explicit empty `security: []` makes the
// endpoint public; otherwise the global `security` applies.
export function authMode(spec, op) {
  if (Array.isArray(op.security)) {
    return op.security.length > 0 ? 'bearer' : 'public';
  }
  if (spec.security && spec.security.length) return 'bearer';
  return 'public';
}

export function buildCurl(spec, method, path, op, opts = {}) {
  const base = opts.baseUrl || DEFAULT_BASE;
  const token = opts.token || DEFAULT_TOKEN;
  const auth = opts.auth || authMode(spec, op);
  const url = base + path;
  const rb = op.requestBody ? resolveRef(spec, op.requestBody) : null;
  const hasBody = rb && rb.content && Object.keys(rb.content).length;
  const lines = [`curl -X ${method.toUpperCase()} "${url}"`];
  if (auth === 'bearer') lines.push(`  -H "Authorization: Bearer ${token}"`);
  if (hasBody) {
    const ct = rb.content['application/json'] || Object.values(rb.content)[0];
    if (ct) {
      const ex = ct.example !== undefined ? ct.example : exampleFor(spec, ct.schema);
      lines.push('  -H "Content-Type: application/json"');
      lines.push(`  -d '${JSON.stringify(ex)}'`);
    }
  }
  return lines.join(' \\\n');
}

export function buildFetch(spec, method, path, op, opts = {}) {
  const base = opts.baseUrl || DEFAULT_BASE;
  const token = opts.token || DEFAULT_TOKEN;
  const auth = opts.auth || authMode(spec, op);
  const url = base + path;
  const rb = op.requestBody ? resolveRef(spec, op.requestBody) : null;
  const hasBody = rb && rb.content && Object.keys(rb.content).length;
  const headers = {};
  if (auth === 'bearer') headers.Authorization = `Bearer ${token}`;
  const optsArr = [`  method: '${method.toUpperCase()}'`];
  if (hasBody) {
    const ct = rb.content['application/json'] || Object.values(rb.content)[0];
    if (ct) {
      headers['Content-Type'] = 'application/json';
      const ex = ct.example !== undefined ? ct.example : exampleFor(spec, ct.schema);
      optsArr.push(`  headers: ${JSON.stringify(headers)}`);
      optsArr.push(`  body: JSON.stringify(${JSON.stringify(ex)})`);
    } else {
      optsArr.push(`  headers: ${JSON.stringify(headers)}`);
    }
  } else {
    optsArr.push(`  headers: ${JSON.stringify(headers)}`);
  }
  return `const res = await fetch("${url}", {\n${optsArr.join(',\n')}\n});\nconst data = await res.json();\nconsole.log(data);`;
}

export function responseEntries(spec, op) {
  if (!op.responses) return [];
  return Object.entries(op.responses).map(([code, resp]) => {
    const r = resolveRef(spec, resp) || { description: '' };
    const sc = r.content && (r.content['application/json'] || Object.values(r.content)[0]);
    return {
      code,
      description: r.description || '',
      schema: sc ? typeStr(spec, sc.schema) : '-',
      example: sc ? (sc.example !== undefined ? sc.example : exampleFor(spec, sc.schema)) : undefined,
    };
  });
}

export function requestBody(spec, op) {
  if (!op.requestBody) return null;
  const rb = resolveRef(spec, op.requestBody);
  const content = rb.content || {};
  const ct = content['application/json'] || Object.values(content)[0];
  if (!ct) return { description: rb.description || '', example: undefined, rows: [] };
  const ex = ct.example !== undefined ? ct.example : exampleFor(spec, ct.schema);
  return { description: rb.description || '', example: ex, rows: schemaRows(spec, ct.schema) };
}

export function groupByTag(spec) {
  const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
  const tagOrder = (spec.tags || []).map((t) => t.name);
  const tagDesc = {};
  (spec.tags || []).forEach((t) => { tagDesc[t.name] = t.description; });
  const byTag = {};
  for (const path of Object.keys(spec.paths || {})) {
    const item = spec.paths[path];
    for (const m of METHODS) {
      if (item[m]) {
        const op = item[m];
        const tags = op.tags && op.tags.length ? op.tags : ['default'];
        const tag = tags[0];
        if (!byTag[tag]) byTag[tag] = [];
        byTag[tag].push({ method: m, path, op });
      }
    }
  }
  const groups = tagOrder
    .filter((t) => byTag[t])
    .map((t) => ({ tag: t, description: tagDesc[t] || '', endpoints: byTag[t] }));
  if (byTag.default) {
    groups.push({ tag: 'Other', description: '', endpoints: byTag.default });
  }
  return groups;
}