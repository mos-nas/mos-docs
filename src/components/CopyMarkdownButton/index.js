import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

/**
 * Returns the Markdown copy of the current documentation page that the
 * `llms-txt` plugin writes next to the rendered HTML at build time.
 *
 *   /docs/Pools/Create-Storage-Pool -> /docs/Pools/Create-Storage-Pool.md
 *   /docs/Filebrowser/              -> /docs/Filebrowser/index.md
 */
function getMarkdownUrl() {
  const {pathname} = window.location;
  return pathname.endsWith('/') ? `${pathname}index.md` : `${pathname}.md`;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for plain HTTP setups where the Clipboard API is unavailable.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error('Copy command was rejected');
  }
}

export default function CopyMarkdownButton() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setUrl(getMarkdownUrl());
  }, []);

  const handleCopy = async () => {
    try {
      const response = await fetch(url || getMarkdownUrl());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      await copyText(await response.text());
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    window.setTimeout(() => setStatus('idle'), 2500);
  };

  const label =
    status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed' : 'Copy page as Markdown';

  return (
    <div className={styles.toolbar}>
      <button type="button" className={styles.button} onClick={handleCopy}>
        <span aria-hidden="true">{status === 'copied' ? '✓' : '⧉'}</span>
        {label}
      </button>
      {url && (
        <a className={styles.link} href={url} target="_blank" rel="noreferrer">
          View raw
        </a>
      )}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {status === 'copied'
          ? 'Markdown copied to clipboard'
          : status === 'error'
            ? 'Copy failed'
            : ''}
      </span>
    </div>
  );
}
