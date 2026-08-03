import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import './LegalPage.css';
import './pages.css';

const LAST_UPDATED = 'July 2026';

const cookieTable = [
  { name: 'session_id',        type: 'Strictly Necessary', purpose: 'Maintains your logged-in session.',                       duration: 'Session'    },
  { name: 'cart_token',        type: 'Strictly Necessary', purpose: 'Preserves cart contents between pages.',                  duration: '30 days'    },
  { name: '_lr_locale',        type: 'Functional',         purpose: 'Remembers your language and region preference.',          duration: '1 year'     },
  { name: '_ga, _ga_*',        type: 'Analytics',          purpose: 'Google Analytics — measures site traffic and behaviour.', duration: '2 years'    },
  { name: '_fbp',              type: 'Marketing',          purpose: 'Facebook Pixel — supports advertising attribution.',      duration: '90 days'    },
  { name: 'wishlist_persist',  type: 'Functional',         purpose: 'Saves your wishlist across sessions.',                   duration: '90 days'    },
];

const sections = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies?',
    body: 'Cookies are small text files placed on your device when you visit a website. They allow the site to remember information about your visit — such as your preferred language or cart contents — making your next visit easier and the site more useful to you.',
  },
  {
    id: 'types-we-use',
    title: '2. Types of Cookies We Use',
    types: [
      {
        name: 'Strictly Necessary',
        icon: '🔒',
        desc: 'Essential for the website to function. They cannot be switched off. Examples include cookies that enable login sessions and shopping cart functionality.',
      },
      {
        name: 'Functional',
        icon: '⚙️',
        desc: 'Allow us to remember choices you make (such as language or region) to provide a more personalised experience. Disabling these may affect site behaviour.',
      },
      {
        name: 'Analytics',
        icon: '📊',
        desc: 'Help us understand how visitors interact with our site by collecting and reporting information anonymously. We use Google Analytics for this purpose.',
      },
      {
        name: 'Marketing',
        icon: '📢',
        desc: 'Used to track visitors across websites and display ads relevant to your interests. These are set by our advertising partners.',
      },
    ],
  },
  {
    id: 'cookie-table',
    title: '3. Cookies We Set',
    isTable: true,
  },
  {
    id: 'third-party',
    title: '4. Third-Party Cookies',
    body: 'Some cookies are placed by third-party services that appear on our pages, including Google Analytics, Facebook Pixel, and payment processors. These third parties have their own privacy policies and we do not control their cookies. We encourage you to review their policies directly.',
  },
  {
    id: 'managing',
    title: '5. Managing Your Cookie Preferences',
    content: [
      {
        heading: 'Browser settings',
        body: 'Most browsers allow you to refuse or delete cookies via their settings. Blocking all cookies may affect your ability to use certain site features, including the shopping cart and account login.',
      },
      {
        heading: 'Opt-out tools',
        body: 'You can opt out of Google Analytics tracking using the Google Analytics Opt-out Browser Add-on. For interest-based advertising, visit the Digital Advertising Alliance (optout.aboutads.info) or the Network Advertising Initiative (optout.networkadvertising.org).',
      },
    ],
  },
  {
    id: 'changes',
    title: '6. Changes to This Policy',
    body: 'We may update this Cookie Policy periodically. When we do, we will revise the "Last updated" date at the top of this page. Continued use of the site constitutes acceptance of any changes.',
  },
  {
    id: 'contact',
    title: '7. Contact Us',
    body: 'Questions about our use of cookies? Contact us at privacy@timekey.com or write to: Timekey, 123 Business Ave, Suite 100.',
  },
];

const CookiePolicy = ({ user, onLogout }) => (
  <div className="page-wrapper">
    <Header user={user} onLogout={onLogout} />

    <main>
      {/* ── Hero ── */}
      <section className="legal-hero">
        <div className="container legal-hero-inner">
          <p className="legal-hero-eyebrow">Legal</p>
          <h1 className="legal-hero-title">Cookie Policy</h1>
          <p className="legal-hero-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container legal-layout">

        {/* Sidebar TOC */}
        <aside className="legal-toc" aria-label="Table of contents">
          <p className="legal-toc-heading">On this page</p>
          <ul className="legal-toc-list">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="legal-toc-link">{s.title}</a>
              </li>
            ))}
          </ul>
          <div className="legal-toc-divider" />
          <p className="legal-toc-also">See also</p>
          <Link to="/privacy-policy" className="legal-toc-link">Privacy Policy</Link>
          <br />
          <Link to="/terms-of-service" className="legal-toc-link">Terms of Service</Link>
        </aside>

        {/* Main content */}
        <article className="legal-content">
          <p className="legal-intro">
            This Cookie Policy explains how Timekey uses cookies and similar
            tracking technologies on our website. It should be read alongside our{' '}
            <Link to="/privacy-policy" className="legal-inline-link">Privacy Policy</Link>.
          </p>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="legal-section">
              <h2 className="legal-section-title">{s.title}</h2>

              {s.body && <p className="legal-body">{s.body}</p>}

              {s.types && (
                <div className="cookie-types-grid">
                  {s.types.map((t) => (
                    <div key={t.name} className="cookie-type-card">
                      <div className="cookie-type-header">
                        <span className="cookie-type-icon" aria-hidden="true">{t.icon}</span>
                        <span className="cookie-type-name">{t.name}</span>
                      </div>
                      <p className="cookie-type-desc">{t.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {s.isTable && (
                <div className="cookie-table-wrap">
                  <table className="cookie-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Purpose</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieTable.map((row) => (
                        <tr key={row.name}>
                          <td><code className="cookie-code">{row.name}</code></td>
                          <td><span className={`cookie-type-badge cookie-type-badge--${row.type.toLowerCase().replace(' ', '-')}`}>{row.type}</span></td>
                          <td>{row.purpose}</td>
                          <td>{row.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {s.content && s.content.map((block) => (
                <div key={block.heading} className="legal-block">
                  <h3 className="legal-block-heading">{block.heading}</h3>
                  <p className="legal-body">{block.body}</p>
                </div>
              ))}
            </section>
          ))}
        </article>
      </div>
    </main>

    <Footer />
  </div>
);

export default CookiePolicy;
