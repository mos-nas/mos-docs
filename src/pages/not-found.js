import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/hooks/useDocusaurusContext';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

export default function NotFound() {
  const {siteConfig} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <Layout title="Page Not Found" description="The page you are looking for could not be found.">
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div style={{textAlign: 'center'}}>
              <h1 style={{fontSize: '6rem', marginBottom: '0.5rem'}}>
                🖥️ 404
              </h1>
              <h2>Looks like this page wasn't stored in a persistent mount point!</h2>
              <p style={{fontSize: '1.1rem', color: 'var(--ifm-color-emphasis-600)'}}>
                This page rebooted into oblivion — just like a RAM disk after a power cycle.
                <br />
                But don't worry, your data is safe. Let's find what you're looking for.
              </p>

              <div style={{margin: '2rem 0'}}>
                <input
                  type="text"
                  placeholder="🔍 Search the docs..."
                  className="navbar__search-input"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid var(--ifm-color-primary)',
                    fontSize: '1.1rem',
                  }}
                  id="search-input-404"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const event = new KeyboardEvent('keydown', {
                        key: 'k',
                        ctrlKey: true,
                        bubbles: true
                      });
                      document.dispatchEvent(event);
                      setTimeout(() => {
                        const searchInput = document.querySelector('.DocSearch-Input') || document.querySelector('input[aria-label="Search"]');
                        if (searchInput) {
                          searchInput.value = e.target.value;
                          searchInput.dispatchEvent(new Event('input', {bubbles: true}));
                        }
                      }, 200);
                    }
                  }}
                />
                <p style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.5rem'}}>
                  Press Enter to search, or use <kbd>Ctrl + K</kbd> anytime
                </p>
              </div>

              <div style={{marginTop: '2rem'}}>
                <h3>🚀 Quick Links</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem'}}>
                  <Link className="button button--primary button--lg" to="/docs/">
                    📚 Documentation
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/Dashboard/WebUI-Overview">
                    🖥️ WebUI Overview
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/Installation/Create-Bootable-Media">
                    💿 Installation
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/Release-Notes/Overview">
                    📋 Release Notes
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
                  💡 <strong>MOS Tip:</strong> Just like this missing page, anything not stored on a persistent
                  mount won't survive a reboot. Always save your work to a proper storage pool!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
