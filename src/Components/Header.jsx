import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlistCount } = useShop();
  const [isMenuOpen,    setIsMenuOpen]    = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    closeAll();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch(e);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  /* Close mobile menu + dropdown whenever the route changes */
  useEffect(() => {
    closeAll();
  }, [location.pathname, location.search]);

  const navigationItems = [
    { label: 'Home',       to: '/'           },
    { label: 'Categories', to: '/categories' },
    { label: 'Products',   to: '/products'   },
    { label: 'About',      to: '/about'      },
    { label: 'Contact',    to: '/contact'    },
  ];

  return (
    <header className="site-header">
      <div className="header-inner container">

        {/* Logo */}
        <Link to="/" className="header-logo" onClick={closeAll}>
          <div className="header-logo-icon">T</div>
          <span className="header-logo-text">Timekey</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav" aria-label="Main navigation">
          <ul className="header-nav-list">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="header-nav-link">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search bar */}
        <form className="header-search" onSubmit={handleSearch} role="search">
          <Search className="header-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            className="header-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search products"
          />
        </form>

        {/* Right actions */}
        <div className="header-actions">

          {/* Mobile search */}
          <button className="header-icon-btn header-search-mobile" aria-label="Search">
            <Search size={20} />
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="header-icon-btn" aria-label={`Wishlist (${wishlistCount})`} onClick={closeAll}>
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="header-badge">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="header-icon-btn" aria-label={`Cart (${cartCount})`} onClick={closeAll}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="header-badge">{cartCount}</span>
            )}
          </Link>

          {/* ── LOGGED IN ── */}
          {user ? (
            <div className="header-profile">
              <button
                className="header-profile-btn header-avatar-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="Profile"
                aria-expanded={isProfileOpen}
              >
                <span className="header-avatar-initials">
                  {(user.full_name || user.email || 'U')
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </button>

              {isProfileOpen && (
                <div className="header-dropdown">
                  <div className="header-dropdown-user">
                    <p className="header-dropdown-email">{user.email}</p>
                  </div>
                  <div className="header-dropdown-divider" />
                  <Link to="/account" className="header-dropdown-item" onClick={closeAll}>My Account</Link>
                  <Link to="/orders" className="header-dropdown-item" onClick={closeAll}>Order History</Link>
                  <Link to="/wishlist" className="header-dropdown-item" onClick={closeAll}>Wishlist</Link>
                  <div className="header-dropdown-divider" />
                  <button
                    className="header-dropdown-item header-dropdown-logout"
                    onClick={() => { closeAll(); onLogout?.(); navigate('/'); }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── LOGGED OUT ── */
            <div className="header-auth-btns">
              <Link to="/login"    className="header-auth-link"    onClick={closeAll}>Sign In</Link>
              <Link to="/register" className="header-auth-register" onClick={closeAll}>Register</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="header-icon-btn header-hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="header-mobile-menu">
          <form className="mobile-search-wrap" onSubmit={handleSearch} role="search">
            <Search className="mobile-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="mobile-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search products"
            />
          </form>

          <nav aria-label="Mobile navigation">
            <ul className="mobile-nav-list">
              {navigationItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="mobile-nav-link" onClick={closeAll}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-profile-section">
            {user ? (
              <>
                <p className="mobile-user-email">{user.email}</p>
                <Link to="/account" className="mobile-nav-link" onClick={closeAll}>My Account</Link>
                <Link to="/orders" className="mobile-nav-link" onClick={closeAll}>Order History</Link>
                <Link to="/wishlist" className="mobile-nav-link" onClick={closeAll}>Wishlist</Link>
                <Link to="/cart"     className="mobile-nav-link" onClick={closeAll}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
                <button
                  className="mobile-nav-link mobile-logout-btn"
                  onClick={() => { closeAll(); onLogout?.(); navigate('/'); }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="mobile-nav-link" onClick={closeAll}>Sign In</Link>
                <Link to="/register" className="mobile-nav-link" onClick={closeAll}>Create Account</Link>
                <Link to="/wishlist" className="mobile-nav-link" onClick={closeAll}>Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
                <Link to="/cart"     className="mobile-nav-link" onClick={closeAll}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isProfileOpen && (
        <div className="header-overlay" onClick={() => setIsProfileOpen(false)} aria-hidden="true" />
      )}
    </header>
  );
};

export default Header;
