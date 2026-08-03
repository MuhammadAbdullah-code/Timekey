import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, ChevronUp } from 'lucide-react';
import './Footer.css';

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const IconTwitter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Footer = () => {
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* Only real pages that exist in the app */
  const exploreLinks = [
    { label: 'Home',       to: '/'           },
    { label: 'Categories', to: '/categories' },
    { label: 'About Us',   to: '/about'      },
    { label: 'Contact',    to: '/contact'    },
  ];

  const accountLinks = [
    { label: 'Sign In',   to: '/login'     },
    { label: 'Register',  to: '/register'  },
    { label: 'My Cart',   to: '/cart'      },
    { label: 'Wishlist',  to: '/wishlist'  },
  ];

  const legalLinks = [
    { label: 'Privacy Policy',   to: '/privacy-policy'    },
    { label: 'Terms of Service', to: '/terms-of-service'  },
    { label: 'Cookie Policy',    to: '/cookie-policy'     },
  ];

  const socialLinks = [
    { icon: IconInstagram, label: 'Instagram', href: '#', cls: 'social-ig' },
    { icon: IconTwitter,   label: 'Twitter',   href: '#', cls: 'social-tw' },
    { icon: IconFacebook,  label: 'Facebook',  href: '#', cls: 'social-fb' },
  ];

  return (
    <footer className="site-footer">

      {/* Accent line */}
      <div className="footer-accent-line" aria-hidden="true" />

      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container footer-newsletter-inner">
          <div className="newsletter-copy">
            <p className="newsletter-eyebrow">Stay in the loop</p>
            <h3 className="newsletter-heading">Get exclusive offers &amp; updates</h3>
            <p className="newsletter-sub">Join 50,000+ subscribers. No spam, ever.</p>
          </div>

          {subscribed ? (
            <div className="newsletter-success">
              <span className="newsletter-checkmark">✓</span>
              <p>You're subscribed! Welcome aboard.</p>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrap">
                <Mail className="newsletter-input-icon" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="newsletter-input"
                />
              </div>
              <button type="submit" className="newsletter-btn">
                Subscribe <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="footer-body">
        <div className="container footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">T</div>
              <span className="footer-logo-text">Timekey</span>
            </Link>

            <p className="footer-brand-desc">
              A premium destination for those who appreciate quality, elegance,
              and timeless style. Crafted with care, delivered with love.
            </p>

            <ul className="footer-contact-list">
              {[
                { Icon: MapPin, text: '123 Luxury Ave, New York, NY 10001' },
                { Icon: Phone,  text: '+1 (800) 123-4567'                  },
                { Icon: Mail,   text: 'hello@timekey.com'               },
              ].map(({ Icon, text }) => (
                <li key={text} className="footer-contact-item">
                  <Icon size={14} className="footer-contact-icon" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="footer-socials">
              {socialLinks.map(({ icon: Icon, label, href, cls }) => (
                <a key={label} href={href} aria-label={label} className={`footer-social-btn ${cls}`}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Explore</h4>
            <ul className="footer-link-list">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer-link">
                    <span className="footer-link-bar" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h4 className="footer-col-heading">My Account</h4>
            <ul className="footer-link-list">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer-link">
                    <span className="footer-link-bar" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Legal</h4>
            <ul className="footer-link-list">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer-link">
                    <span className="footer-link-bar" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Timekey. All rights reserved.
          </p>
          <div className="footer-legal-links">
            {legalLinks.map((l, i) => (
              <React.Fragment key={l.label}>
                {i > 0 && <span className="footer-dot" aria-hidden="true">·</span>}
                <Link to={l.to} className="footer-legal-link">{l.label}</Link>
              </React.Fragment>
            ))}
          </div>
          <div className="footer-payments">
            <span className="footer-payment-badge">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <button onClick={scrollToTop} aria-label="Scroll to top" className="scroll-top-btn">
        <ChevronUp size={20} />
      </button>

    </footer>
  );
};

export default Footer;
