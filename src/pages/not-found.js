import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Translate from '@docusaurus/Translate';

export default function NotFound() {
  return (
    <Layout title="Page Not Found" description="The page you are looking for could not be found.">
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div style={{textAlign: 'center'}}>
              <h1 style={{fontSize: '5rem', marginBottom: '0.5rem'}}>
                🖥️ 404
              </h1>
              <h2>Looks like this page wasn&apos;t stored in a persistent mount point!</h2>
              <p style={{fontSize: '1.1rem', color: 'var(--ifm-color-emphasis-600)'}}>
                This page rebooted into oblivion — just like a RAM disk after a power cycle.
                <br />
                But don&apos;t worry, your data is safe. Let&apos;s find what you&apos;re looking for.
              </p>

              <div style={{marginTop: '2rem'}}>
                <p style={{fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-500)'}}>
                  Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search the docs
                </p>
              </div>

              <div style={{marginTop: '1.5rem'}}>
                <h3>Quick Links</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem'}}>
                  <Link className="button button--primary button--lg" to="/docs/">
                    Documentation
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/Dashboard/WebUI-Overview">
                    WebUI Overview
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/Installation/Create-Bootable-Media">
                    Installation
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/Release-Notes/Overview">
                    Release Notes
                  </Link>
                </div>
              </div>

              <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                borderRadius: '12px',
                background: 'var(--ifm-color-emphasis-100)',
                border: '1px solid var(--ifm-color-emphasis-200)'
              }}>
                <p style={{fontStyle: 'italic', color: 'var(--ifm-color-emphasis-600)', margin: 0}}>
                  <strong>MOS Tip:</strong> Just like this missing page, anything not stored on a persistent
                  mount won&apos;t survive a reboot. Always save your work to a proper storage pool!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
