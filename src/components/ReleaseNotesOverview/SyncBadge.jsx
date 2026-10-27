import React from 'react';
import meta from '@site/release-sync.json';

// Build-time display of the last release-notes auto-sync. Reads pre-formatted
// Austrian-time (Europe/Vienna) metadata baked into release-sync.json by the
// sync script, so there is no client-side date math (hydration-safe).
export default function SyncBadge() {
  const display = meta.syncedAtDisplay || 'unknown';
  const mode = meta.syncedTrigger === 'schedule' ? 'automatic' : 'manual';
  const from = meta.syncedFrom || 'unknown';
  const count = meta.syncedReleases != null ? meta.syncedReleases : 0;
  return (
    <p>
      <strong>Last sync:</strong> {display} | <strong>mode:</strong> {mode} |{' '}
      <strong>source:</strong> mos-releases@{from} ({count} releases checked)
    </p>
  );
}