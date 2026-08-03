import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Sparkles } from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useShop } from '../context/ShopContext';
import './Wishlist.css';

const Wishlist = ({ user, onLogout }) => {
  const { wishlist, wishlistLoading, removeFromWishlist, moveToCart } = useShop();

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main className="wl-main">

        {/* ── Hero Banner ── */}
        <div className="wl-hero">
          <div className="wl-hero-overlay" aria-hidden="true" />
          <div className="container wl-hero-content">
            <p className="wl-hero-eyebrow">Your Saved Items</p>
            <h1 className="wl-hero-title">My Wishlist</h1>
            {wishlist.length > 0 && (
              <p className="wl-hero-sub">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            )}
          </div>
        </div>

        <div className="container wl-body">

          {wishlistLoading ? (
            <div className="wl-loading">
              <div className="wl-loading-spinner" />
              <p className="wl-loading-text">Loading your wishlist…</p>
            </div>
          ) : wishlist.length === 0 ? (
            /* ── Empty state ── */
            <div className="wl-empty">
              <div className="wl-empty-illustration">
                <div className="wl-empty-circle wl-empty-circle--outer" />
                <div className="wl-empty-circle wl-empty-circle--inner" />
                <Heart size={52} className="wl-empty-heart-icon" />
              </div>
              <h2 className="wl-empty-title">Nothing saved yet</h2>
              <p className="wl-empty-sub">
                Tap the heart on any product to save it here.<br />
                Your personal edit, curated by you.
              </p>
              <div className="wl-empty-actions">
                <Link to="/" className="wl-empty-btn-primary">EXPLORE PRODUCTS</Link>
                <Link to="/categories" className="wl-empty-btn-ghost">Browse Categories</Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Info bar ── */}
              <div className="wl-info-bar">
                <div className="wl-info-bar-left">
                  <Heart size={16} className="wl-info-bar-icon" />
                  <span>{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</span>
                </div>
                <button
                  className="wl-move-all-btn"
                  onClick={() => wishlist.forEach((p) => moveToCart(p))}
                >
                  <ShoppingCart size={14} />
                  Move all to cart
                </button>
              </div>

              {/* ── Grid ── */}
              <div className="wl-grid">
                {wishlist.map((product) => (
                  <div key={product.id} className="wl-card">

                    {/* Image */}
                    <div className="wl-card-img-outer">
                      <Link to={`/product/${product.id}`} className="wl-img-wrap">
                        {product.badge && (
                          <span className={`wl-badge ${product.badge === 'LIMITED' ? 'wl-badge--limited' : 'wl-badge--new'}`}>
                            {product.badge}
                          </span>
                        )}
                        <img src={product.img} alt={product.name} className="wl-img" />
                        <div className="wl-img-hover-overlay">
                          <span className="wl-quick-view">View Product</span>
                        </div>
                      </Link>

                      {/* Remove button on image */}
                      <button
                        className="wl-card-remove"
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="wl-info">
                      <p className="wl-category">{product.category}</p>
                      <Link to={`/product/${product.id}`} className="wl-name">
                        {product.name}
                      </Link>

                      {/* Rating dots */}
                      <div className="wl-rating">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className={`wl-star ${s <= Math.round(product.rating) ? 'wl-star--on' : ''}`}>★</span>
                        ))}
                        <span className="wl-rating-count">({product.reviewCount})</span>
                      </div>

                      <div className="wl-price-row">
                        <span className="wl-price">${product.price}</span>
                        {product.oldPrice && (
                          <>
                            <span className="wl-old-price">${product.oldPrice}</span>
                            <span className="wl-discount-tag">
                              {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Color swatches */}
                      {product.colors?.length > 0 && (
                        <div className="wl-swatches">
                          {product.colors.map((c) => (
                            <span
                              key={c.hex}
                              className="wl-swatch"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <button
                        className="wl-cart-btn"
                        onClick={() => moveToCart(product)}
                      >
                        <ShoppingCart size={14} />
                        MOVE TO CART
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Bottom banner ── */}
              <div className="wl-bottom-banner">
                <div className="wl-bottom-banner-text">
                  <Sparkles size={18} className="wl-bottom-banner-icon" />
                  <div>
                    <p className="wl-bottom-banner-title">Members get early access</p>
                    <p className="wl-bottom-banner-sub">Sign in to sync your wishlist across devices and get notified when items go on sale.</p>
                  </div>
                </div>
                <Link to="/register" className="wl-bottom-banner-btn">JOIN NOW</Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
