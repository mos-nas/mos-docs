import React from 'react';
import spec from './openapi.json';

// Build-time display of the last OpenAPI auto-sync. Reads pre-formatted
// Austrian-time (Europe/Vienna) metadata baked into openapi.json by the
// sync script, so there is no client-side date math (hydration-safe).
export default function SyncBadge() {
  const display = spec['x-synced-at-display'] || 'unknown';
  const mode = spec['x-synced-trigger'] === 'schedule' ? 'automatic' : 'manual';
  const sha = String(spec['x-synced-from'] || '').slice(0, 10);
  return (
    <p>
      <strong>Last sync:</strong> {display} | <strong>mode:</strong> {mode} |{' '}
      <strong>source:</strong> mos-api@{sha}
    </p>
  );
}