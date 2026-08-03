import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/footer';
import './NotFound.css';

const NotFound = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main className="nf-main">
        <div className="container nf-inner">

          {/* Big 404 */}
          <div className="nf-code" aria-hidden="true">404</div>

          {/* Accent line */}
          <div className="nf-accent-line" aria-hidden="true" />

          <h1 className="nf-title">Page Not Found</h1>
          <p className="nf-sub">
            The page you're looking for doesn't exist, was moved, or the
            link may be incorrect. Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="nf-actions">
            <button className="nf-btn nf-btn--primary" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
            <Link to="/" className="nf-btn nf-btn--secondary">
              Back to Home
            </Link>
            <Link to="/products" className="nf-btn nf-btn--ghost">
              Browse Products
            </Link>
          </div>

          {/* Quick links */}
          <div className="nf-links-wrap">
            <p className="nf-links-label">Popular pages</p>
            <div className="nf-links">
              {[
                { label: 'Categories', to: '/categories' },
                { label: 'About',      to: '/about'      },
                { label: 'Contact',    to: '/contact'    },
                { label: 'Cart',       to: '/cart'       },
                { label: 'Wishlist',   to: '/wishlist'   },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="nf-link-pill">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
