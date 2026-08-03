import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import './LegalPage.css';
import './pages.css';

const LAST_UPDATED = 'July 2026';

const sections = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: [
      {
        heading: 'Information you provide directly',
        body: 'When you create an account, place an order, or contact us, we collect your name, email address, shipping address, payment details, and any other information you choose to provide.',
      },
      {
        heading: 'Information collected automatically',
        body: 'When you visit our site we automatically collect certain information about your device and browsing activity, including IP address, browser type, pages visited, time spent on pages, and referring URLs. We use cookies and similar tracking technologies to collect this data.',
      },
      {
        heading: 'Information from third parties',
        body: 'We may receive information about you from payment processors, social media platforms (if you connect them), and analytics providers to improve our services.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    list: [
      'Process and fulfil your orders, including sending order confirmations and shipping updates.',
      'Manage your account and provide customer support.',
      'Send promotional communications, where you have opted in.',
      'Personalise your browsing experience and product recommendations.',
      'Detect, prevent, and investigate fraudulent transactions or security incidents.',
      'Comply with legal obligations and enforce our Terms of Service.',
      'Analyse usage patterns to improve our website, products, and services.',
    ],
  },
  {
    id: 'sharing',
    title: '3. How We Share Your Information',
    content: [
      {
        heading: 'Service providers',
        body: 'We share data with carefully selected third-party service providers (e.g. payment processors, shipping carriers, email platforms) who help us operate our business. These parties are contractually bound to handle your data securely.',
      },
      {
        heading: 'Legal requirements',
        body: 'We may disclose your information where required by law, court order, or governmental authority, or when we believe disclosure is necessary to protect our rights or the safety of others.',
      },
      {
        heading: 'Business transfers',
        body: 'If Timekey is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your data becomes subject to a different privacy policy.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies',
    body: 'We use cookies and similar technologies to remember your preferences, keep items in your cart, and understand how visitors use our site. You can manage your cookie preferences at any time via our Cookie Settings or your browser settings. For more detail, see our Cookie Policy.',
    linkTo: '/cookie-policy',
    linkLabel: 'Cookie Policy',
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    list: [
      'Access — request a copy of the personal data we hold about you.',
      'Rectification — ask us to correct inaccurate or incomplete data.',
      'Erasure — request deletion of your personal data, subject to legal obligations.',
      'Restriction — ask us to limit how we process your data.',
      'Portability — receive your data in a structured, machine-readable format.',
      'Objection — object to processing based on legitimate interests or for direct marketing.',
      'Withdrawal of consent — withdraw consent at any time where processing is based on consent.',
    ],
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    body: 'We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law. Order and transaction data is typically retained for seven years for tax and accounting purposes.',
  },
  {
    id: 'security',
    title: '7. Security',
    body: 'We implement industry-standard security measures — including TLS encryption, access controls, and regular security audits — to protect your information. However, no system is entirely secure, and we cannot guarantee absolute security.',
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    body: 'Our services are not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a minor, please contact us and we will promptly delete it.',
  },
  {
    id: 'contact',
    title: '9. Contact Us',
    body: 'For any questions, requests, or concerns regarding this Privacy Policy, please contact our Data Protection team at privacy@timekey.com or write to us at: Timekey, 123 Business Ave, Suite 100.',
  },
];

const PrivacyPolicy = ({ user, onLogout }) => (
  <div className="page-wrapper">
    <Header user={user} onLogout={onLogout} />

    <main>
      {/* ── Hero ── */}
      <section className="legal-hero">
        <div className="container legal-hero-inner">
          <p className="legal-hero-eyebrow">Legal</p>
          <h1 className="legal-hero-title">Privacy Policy</h1>
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
          <Link to="/terms-of-service" className="legal-toc-link">Terms of Service</Link>
          <br />
          <Link to="/cookie-policy" className="legal-toc-link">Cookie Policy</Link>
        </aside>

        {/* Main content */}
        <article className="legal-content">
          <p className="legal-intro">
            Timekey ("we", "our", "us") is committed to protecting your personal
            information. This Privacy Policy explains what data we collect, how we use
            it, and your rights in relation to it. By using our website and services
            you agree to the practices described below.
          </p>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="legal-section">
              <h2 className="legal-section-title">{s.title}</h2>

              {s.content && s.content.map((block) => (
                <div key={block.heading} className="legal-block">
                  <h3 className="legal-block-heading">{block.heading}</h3>
                  <p className="legal-body">{block.body}</p>
                </div>
              ))}

              {s.body && (
                <p className="legal-body">
                  {s.body}
                  {s.linkTo && (
                    <> Read our full <Link to={s.linkTo} className="legal-inline-link">{s.linkLabel}</Link>.</>
                  )}
                </p>
              )}

              {s.list && (
                <ul className="legal-list">
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </main>

    <Footer />
  </div>
);

export default PrivacyPolicy;
