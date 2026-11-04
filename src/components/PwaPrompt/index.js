import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

const DISMISS_KEY = 'mos-docs-pwa-dismissed';
const OFFLINE_KEY = 'mos-docs-offline-enabled';
const DISMISS_DAYS = 30;

export default function PwaPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const dismissed =
      dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_DAYS * 86400000;
    if (dismissed || localStorage.getItem(OFFLINE_KEY) === '1') return;

    const ua = navigator.userAgent || '';
    const ios =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(ios);

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    const timer = window.setTimeout(() => setVisible(true), 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (_) {
        // ignore
      }
      setDeferredPrompt(null);
      setVisible(false);
    } else if (isIos) {
      setShowIosHelp(true);
    }
  };

  const enableOffline = () => {
    localStorage.setItem(OFFLINE_KEY, '1');
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    const url = new URL(window.location.href);
    url.searchParams.set('offlineMode', 'true');
    window.location.assign(url.toString());
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  const canPrompt = Boolean(deferredPrompt);

  return (
    <aside className={styles.card} role="status" aria-live="polite">
      <button
        type="button"
        className={styles.close}
        onClick={dismiss}
        aria-label="Dismiss">
        ×
      </button>
      <p className={styles.title}>Use MOS Docs as an app</p>
      <p className={styles.text}>
        Install it for quick access, or cache the docs for offline reading
        (about 31 MB).
      </p>
      {showIosHelp && (
        <p className={styles.help}>
          On iPhone/iPad: tap <strong>Share</strong> →{' '}
          <strong>Add to Home Screen</strong>.
        </p>
      )}
      <div className={styles.actions}>
        {(canPrompt || isIos) && (
          <button type="button" className={styles.primary} onClick={install}>
            {canPrompt ? 'Install app' : 'How to install'}
          </button>
        )}
        <button type="button" className={styles.secondary} onClick={enableOffline}>
          Enable offline mode
        </button>
      </div>
      {!canPrompt && !isIos && (
        <p className={styles.help}>
          Or use your browser menu → “Install app”.
        </p>
      )}
    </aside>
  );
}
