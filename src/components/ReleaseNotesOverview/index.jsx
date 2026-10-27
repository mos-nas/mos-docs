import React from 'react';
import releases from '@site/release-index.json';

// Renders the curated release-notes overview table from release-index.json,
// which is maintained by scripts/sync-releases.js. Keeping the data in JSON
// (rendered by a React component) avoids Docusaurus SSG "top-level const is
// not defined" issues that occur when computed values are declared directly
// in MDX.
export default function ReleaseNotesOverview() {
  return (
    <table>
      <thead>
        <tr>
          <th>Version</th>
          <th>Status</th>
          <th>Highlights</th>
        </tr>
      </thead>
      <tbody>
        {releases.map((r) => (
          <tr key={r.version}>
            <td>
              <a href={`./${r.channel}/${r.version}`}>{r.version}</a>
            </td>
            <td>{r.badge}</td>
            <td>{r.highlights}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}