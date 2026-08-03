import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/footer';
import './LegalPage.css';
import './pages.css';

const LAST_UPDATED = 'July 2026';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the Timekey website and services you confirm that you are at least 18 years old, have read and understood these Terms, and agree to be bound by them. If you do not agree, please discontinue use immediately.',
  },
  {
    id: 'account',
    title: '2. Your Account',
    content: [
      {
        heading: 'Registration',
        body: 'You may browse our store without an account, but placing orders requires registration. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.',
      },
      {
        heading: 'Accuracy of information',
        body: 'You agree to provide accurate, complete, and up-to-date account information. We reserve the right to suspend or terminate accounts that contain false or misleading information.',
      },
    ],
  },
  {
    id: 'orders',
    title: '3. Orders & Payment',
    list: [
      'All prices are displayed in USD and are inclusive of applicable taxes unless stated otherwise.',
      'We reserve the right to cancel or refuse any order at our discretion, including in cases of suspected fraud.',
      'Payment is charged at the time of order placement.',
      'Order confirmation emails do not constitute acceptance of an order — acceptance occurs when the item is dispatched.',
      'We accept Cash on Delivery (COD) as the payment method.',
    ],
  },
  {
    id: 'shipping',
    title: '4. Shipping & Delivery',
    body: 'Estimated delivery times are provided as guidance only and are not guaranteed. Timekey is not liable for delays caused by customs, carriers, or events outside our control. Risk of loss passes to you upon handover to the carrier.',
  },
  {
    id: 'returns',
    title: '5. Returns & Refunds',
    content: [
      {
        heading: 'Return window',
        body: 'Items may be returned within 30 days of delivery, provided they are unused, in original packaging, and accompanied by proof of purchase.',
      },
      {
        heading: 'Non-returnable items',
        body: 'Personalised items, final-sale products, and items damaged through misuse are not eligible for return.',
      },
      {
        heading: 'Refund process',
        body: 'Approved refunds are processed to the original payment method within 5–10 business days of receiving the returned item.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    body: 'All content on this site — including text, images, logos, and design elements — is the property of Timekey or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.',
  },
  {
    id: 'prohibited-conduct',
    title: '7. Prohibited Conduct',
    list: [
      'Using the site for any unlawful purpose or in violation of these Terms.',
      'Attempting to gain unauthorised access to our systems or data.',
      'Scraping, crawling, or using automated tools to collect data from the site.',
      'Transmitting viruses, malware, or other harmful code.',
      'Submitting false or misleading reviews or content.',
      'Reselling our products without prior written agreement.',
    ],
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimer of Warranties',
    body: 'Our website and services are provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the site will be uninterrupted, error-free, or free of viruses or other harmful components.',
  },
  {
    id: 'limitation',
    title: '9. Limitation of Liability',
    body: 'To the fullest extent permitted by law, Timekey shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our site or services, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount paid for the order giving rise to the claim.',
  },
  {
    id: 'governing-law',
    title: '10. Governing Law',
    body: 'These Terms are governed by and construed in accordance with the laws of the State of New York, USA, without regard to its conflict of law principles. Any disputes shall be resolved exclusively in the courts located in New York County.',
  },
  {
    id: 'changes',
    title: '11. Changes to These Terms',
    body: 'We reserve the right to update these Terms at any time. Material changes will be communicated via email or a prominent notice on our site. Continued use of the site after changes constitutes your acceptance of the revised Terms.',
  },
  {
    id: 'contact',
    title: '12. Contact',
    body: 'Questions about these Terms? Reach us at legal@timekey.com or write to: Timekey, 123 Business Ave, Suite 100.',
  },
];

const TermsOfService = ({ user, onLogout }) => (
  <div className="page-wrapper">
    <Header user={user} onLogout={onLogout} />

    <main>
      {/* ── Hero ── */}
      <section className="legal-hero">
        <div className="container legal-hero-inner">
          <p className="legal-hero-eyebrow">Legal</p>
          <h1 className="legal-hero-title">Terms of Service</h1>
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
          <Link to="/cookie-policy" className="legal-toc-link">Cookie Policy</Link>
        </aside>

        {/* Main content */}
        <article className="legal-content">
          <p className="legal-intro">
            Welcome to Timekey. Please read these Terms of Service carefully before
            using our website at timekey.com. These Terms govern your access to and
            use of all Timekey services.
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

              {s.body && <p className="legal-body">{s.body}</p>}

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

export default TermsOfService;
