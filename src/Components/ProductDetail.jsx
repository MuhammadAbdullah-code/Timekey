import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { getProductById, products } from '../data/products';
import { useShop } from '../context/ShopContext';
import cartService from '../services/cartService';
import productService from '../services/productService';
import Header from './Header';
import Footer from './footer';
import './ProductDetail.css';

const StarRating = ({ rating }) => (
  <div className="pd-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        className={s <= Math.round(rating) ? 'pd-star pd-star--filled' : 'pd-star'}
        fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
      />
    ))}
  </div>
);

/* Normalize an API product response into the shape this component uses */
const normalizeApiProduct = (p) => ({
  id:          p.id,
  name:        p.name        ?? 'Product',
  price:       p.price       ?? 0,
  oldPrice:    p.old_price   ?? null,
  badge:       p.badge       ?? null,
  category:    p.category_id ?? p.category ?? '',
  rating:      p.rating      ?? 0,
  reviewCount: p.review_count ?? 0,
  img:         p.image_url   ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
  gallery:     p.image_url   ? [p.image_url] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop'],
  colors:      Array.isArray(p.colors)  ? p.colors  : [],
  sizes:       Array.isArray(p.sizes)   ? p.sizes   : [],
  details:     Array.isArray(p.details) ? p.details : [],
  description: p.description ?? '',
  inStock:     p.stock > 0,
});

const ProductDetail = ({ user, onLogout }) => {
  const { product_id } = useParams();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);

  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [qty,           setQty]           = useState(1);
  const [addedToCart,   setAddedToCart]   = useState(false);
  const [sizeError,     setSizeError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setSelectedColor(0);
    setSelectedSize(null);

    const staticProduct = getProductById(product_id);
    if (staticProduct) {
      setProduct(staticProduct);
      setLoading(false);
      return;
    }

    // Not in static data — fetch from API
    productService.getProduct(product_id)
      .then((data) => {
        if (!cancelled) {
          setProduct(normalizeApiProduct(data));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [product_id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.sizes.length > 1 && selectedSize === null) {
      setSizeError(true);
      return;
    }
    try {
      await cartService.addItem(product.id, qty);
    } catch {
      // API failed — still update local state so UI stays consistent
    }
    addToCart(product, {
      size:  selectedSize,
      color: product.colors[selectedColor] ?? null,
      qty,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Related products — only from static data (API products don't have this)
  const related = product
    ? products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3)
    : [];

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="pd-page">
        <Header user={user} onLogout={onLogout} />
        <div className="pd-not-found" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 24px' }}>
          <div style={{
            width: 36, height: 36,
            border: '3px solid #e5e7eb',
            borderTopColor: '#0B1328',
            borderRadius: '50%',
            animation: 'pd-spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes pd-spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Loading product…</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Not found state ── */
  if (notFound || !product) {
    return (
      <div className="pd-page">
        <Header user={user} onLogout={onLogout} />
        <div className="pd-not-found">
          <p className="pd-not-found-text">Product not found.</p>
          <Link to="/" className="pd-back-link">← Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pd-page">
      <Header user={user} onLogout={onLogout} />

      <main className="pd-main">
        {/* Breadcrumb */}
        <div className="container">
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="pd-breadcrumb-link">Home</Link>
            <span className="pd-breadcrumb-sep">/</span>
            <span className="pd-breadcrumb-link">{product.category}</span>
            <span className="pd-breadcrumb-sep">/</span>
            <span className="pd-breadcrumb-current">{product.name}</span>
          </nav>
        </div>

        {/* Main product grid */}
        <div className="container pd-grid">

          {/* ── LEFT: Gallery ── */}
          <div className="pd-gallery">
            {/* Thumbnails — only show if more than 1 image */}
            {product.gallery.length > 1 && (
              <div className="pd-thumbs">
                {product.gallery.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${activeImg === i ? 'pd-thumb--active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="pd-main-img-wrap">
              {product.badge && (
                <span className={`pd-badge ${product.badge === 'LIMITED' ? 'pd-badge--limited' : 'pd-badge--new'}`}>
                  {product.badge}
                </span>
              )}
              <img
                src={product.gallery[activeImg] ?? product.img}
                alt={product.name}
                className="pd-main-img"
              />
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="pd-info">
            {/* Category + name */}
            <p className="pd-category">{product.category}</p>
            <h1 className="pd-name">{product.name}</h1>

            {/* Rating */}
            <div className="pd-rating-row">
              <StarRating rating={product.rating} />
              <span className="pd-rating-num">{product.rating}</span>
              <span className="pd-rating-count">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="pd-price-row">
              <span className="pd-price">${product.price}</span>
              {product.oldPrice && (
                <span className="pd-old-price">${product.oldPrice}</span>
              )}
              {product.oldPrice && (
                <span className="pd-discount">
                  {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <div className="pd-divider" />

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div className="pd-option-group">
                <p className="pd-option-label">
                  Colour: <strong>{product.colors[selectedColor]?.name ?? ''}</strong>
                </p>
                <div className="pd-color-list">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name ?? i}
                      className={`pd-color-btn ${selectedColor === i ? 'pd-color-btn--active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setSelectedColor(i)}
                      aria-label={c.name}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length > 1 && (
              <div className="pd-option-group">
                <p className={`pd-option-label ${sizeError ? 'pd-option-label--error' : ''}`}>
                  {sizeError ? 'Please select a size' : 'Size'}
                </p>
                <div className="pd-size-list">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`pd-size-btn ${selectedSize === s ? 'pd-size-btn--active' : ''}`}
                      onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="pd-option-group">
              <p className="pd-option-label">Quantity</p>
              <div className="pd-qty">
                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span className="pd-qty-val">{qty}</span>
                <button className="pd-qty-btn" onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="pd-cta">
              <button
                className={`pd-add-btn ${addedToCart ? 'pd-add-btn--success' : ''}`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                {addedToCart ? 'Added to Cart!' : 'ADD TO CART'}
              </button>
              <button
                className={`pd-wish-btn ${isWishlisted(product.id) ? 'pd-wish-btn--active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="pd-trust">
              <div className="pd-trust-item">
                <Truck size={16} className="pd-trust-icon" />
                <span>Free shipping over $200</span>
              </div>
              <div className="pd-trust-item">
                <RefreshCw size={16} className="pd-trust-icon" />
                <span>30-day returns</span>
              </div>
              <div className="pd-trust-item">
                <Shield size={16} className="pd-trust-icon" />
                <span>Secure checkout</span>
              </div>
            </div>

            <div className="pd-divider" />

            {/* Description */}
            {product.description && (
              <div className="pd-description">
                <h3 className="pd-section-title">Description</h3>
                <p className="pd-description-text">{product.description}</p>
              </div>
            )}

            {/* Details */}
            {product.details.length > 0 && (
              <div className="pd-details">
                <h3 className="pd-section-title">Product Details</h3>
                <ul className="pd-details-list">
                  {product.details.map((d, i) => (
                    <li key={i} className="pd-details-item">
                      <span className="pd-details-dot" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products (static only) ── */}
        {related.length > 0 && (
          <div className="pd-related">
            <div className="container">
              <h2 className="pd-related-title">You May Also Like</h2>
              <div className="pd-related-grid">
                {related.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="pd-related-card">
                    <div className="pd-related-img-wrap">
                      <img src={p.img} alt={p.name} className="pd-related-img" />
                    </div>
                    <p className="pd-related-name">{p.name}</p>
                    <p className="pd-related-price">${p.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
