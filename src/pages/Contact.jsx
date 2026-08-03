import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import './Contact.css';

const contactInfo = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Visit Us',
    value: '123 Luxury Ave, New York, NY 10001',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m2 7 10 7 10-7"/>
      </svg>
    ),
    label: 'Email Us',
    value: 'hello@timekey.com',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.35 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
      </svg>
    ),
    label: 'Call Us',
    value: '+1 (800) 123-4567',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    label: 'Hours',
    value: 'Mon – Sat: 9am – 7pm EST',
  },
];

const Contact = ({ user, onLogout }) => {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                       e.name    = 'Name is required.';
    if (!form.email.trim())                      e.email   = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email   = 'Enter a valid email.';
    if (!form.subject.trim())                    e.subject = 'Subject is required.';
    if (!form.message.trim())                    e.message = 'Message is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1000);
  };

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main>
        {/* ── Page Hero ── */}
        <section className="page-hero contact-hero">
          <div className="page-hero-overlay" aria-hidden="true" />
          <div className="container page-hero-content">
            <p className="page-hero-eyebrow">Get in Touch</p>
            <h1 className="page-hero-title">We'd Love<br />to Hear from You</h1>
            <p className="page-hero-sub">
              Whether it's a question about an order, a collaboration, or just a thought —
              our team is here and happy to help.
            </p>
          </div>
        </section>

        {/* ── Main content ── */}
        <section className="contact-section">
          <div className="container contact-grid">

            {/* Left — info */}
            <div className="contact-info">
              <h2 className="contact-info-title">Contact Information</h2>
              <p className="contact-info-sub">
                Reach us any way that works for you. We aim to respond within one business day.
              </p>

              <ul className="contact-info-list">
                {contactInfo.map((item) => (
                  <li key={item.label} className="contact-info-item">
                    <div className="contact-info-icon">{item.icon}</div>
                    <div>
                      <p className="contact-info-label">{item.label}</p>
                      <p className="contact-info-value">{item.value}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="contact-social">
                <p className="contact-social-label">Follow Us</p>
                <div className="contact-social-links">
                  {['Instagram', 'Twitter', 'Pinterest'].map((s) => (
                    <a key={s} href="#" className="contact-social-btn">{s}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="contact-form-wrap">
              {sent ? (
                <div className="contact-success">
                  <div className="contact-success-icon">✓</div>
                  <h3 className="contact-success-title">Message Sent</h3>
                  <p className="contact-success-sub">
                    Thank you for reaching out. We'll be in touch within one business day.
                  </p>
                  <button
                    className="contact-success-btn"
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <h2 className="contact-form-title">Send a Message</h2>

                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label className="contact-label" htmlFor="c-name">Full Name</label>
                      <input
                        id="c-name" name="name" type="text"
                        placeholder="Your name"
                        className={`contact-input ${errors.name ? 'contact-input--error' : ''}`}
                        value={form.name} onChange={handleChange}
                      />
                      {errors.name && <p className="contact-error">{errors.name}</p>}
                    </div>
                    <div className="contact-field">
                      <label className="contact-label" htmlFor="c-email">Email Address</label>
                      <input
                        id="c-email" name="email" type="email"
                        placeholder="name@example.com"
                        className={`contact-input ${errors.email ? 'contact-input--error' : ''}`}
                        value={form.email} onChange={handleChange}
                      />
                      {errors.email && <p className="contact-error">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="contact-field">
                    <label className="contact-label" htmlFor="c-subject">Subject</label>
                    <input
                      id="c-subject" name="subject" type="text"
                      placeholder="How can we help?"
                      className={`contact-input ${errors.subject ? 'contact-input--error' : ''}`}
                      value={form.subject} onChange={handleChange}
                    />
                    {errors.subject && <p className="contact-error">{errors.subject}</p>}
                  </div>

                  <div className="contact-field">
                    <label className="contact-label" htmlFor="c-message">Message</label>
                    <textarea
                      id="c-message" name="message"
                      placeholder="Tell us more…"
                      rows={5}
                      className={`contact-input contact-textarea ${errors.message ? 'contact-input--error' : ''}`}
                      value={form.message} onChange={handleChange}
                    />
                    {errors.message && <p className="contact-error">{errors.message}</p>}
                  </div>

                  <button type="submit" className="contact-submit" disabled={sending}>
                    {sending ? 'SENDING…' : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
