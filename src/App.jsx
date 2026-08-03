import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import { useShop } from './context/ShopContext';
import categoryService from './services/categoryService';
import productService from './services/productService';
import cartService from './services/cartService';
import './App.css';

/* Fallback images for categories that don't have one from the API */
const CATEGORY_FALLBACK_IMAGES = {
  apparel:     'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop',
  home:        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop',
  beauty:      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop',
  electronics: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop',
  default:     'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop',
};

const getCategoryImage = (name) => {
  const key = (name || '').toLowerCase();
  return (
    Object.entries(CATEGORY_FALLBACK_IMAGES).find(([k]) => key.includes(k))?.[1] ||
    CATEGORY_FALLBACK_IMAGES.default
  );
};

/* Most demanded product — will be set from API (first active product) */
const mostDemanded = null;



function App({ user, onLogout }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [collections,        setCollections]        = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [featuredProducts,   setFeaturedProducts]   = useState([]);
  const [productsLoading,    setProductsLoading]    = useState(true);
  const [showSignIn,         setShowSignIn]         = useState(false);
  const [cartLoadingId,      setCartLoadingId]      = useState(null);
  const [giftAddedId,        setGiftAddedId]        = useState(null);
  const [giftProducts,       setGiftProducts]       = useState([]);

  /* Guard — requires sign-in, then runs action */
  const requireAuth = (action) => {
    if (!user) { setShowSignIn(true); return; }
    action();
  };

  useEffect(() => {
    // Fetch categories
    categoryService.getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items ?? data?.categories ?? []);
        setCollections(
          list.map((cat) => ({
            id:    cat.id,
            label: cat.name,
            desc:  cat.description || '',
            img:   cat.image_url   || getCategoryImage(cat.name),
          }))
        );
      })
      .catch((err) => {
        console.error('[Home] categories fetch failed:', err.message);
      })
      .finally(() => setCollectionsLoading(false));

    // Fetch featured products (first 8)
    productService.getProducts({ skip: 0, limit: 8 })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items ?? data?.products ?? []);
        setFeaturedProducts(
          list
            .filter((p) => p.is_active !== false)
            .map((p) => ({
              id:          p.id,
              name:        p.name,
              price:       p.price,
              oldPrice:    p.old_price   ?? null,
              badge:       p.badge       ?? null,
              category:    p.category_id ?? '',
              img:         p.image_url   || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
              colors:      p.colors      ?? [],
              reviewCount: p.review_count ?? null,
              inStock:     p.stock > 0,
            }))
        );
      })
      .catch((err) => {
        console.error('[Home] products fetch failed:', err.message);
      })
      .finally(() => setProductsLoading(false));

    // Load gift section products from admin-selected IDs in localStorage
    const loadGiftProducts = async () => {
      try {
        const ids = JSON.parse(localStorage.getItem('luxe_giftbox_ids')) ?? [];
        if (ids.length === 0) return;
        // Fetch all products and pick the ones matching the saved IDs
        const all = await productService.getProducts({ skip: 0, limit: 100 });
        const matched = ids
          .map(id => all.find(p => p.id === id))
          .filter(Boolean)
          .map(p => ({
            id:    p.id,
            name:  p.name,
            desc:  p.description ?? '',
            price: p.price,
            tag:   p.badge ?? null,
            img:   p.image_url || 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop',
          }));
        setGiftProducts(matched);
      } catch { /* silent */ }
    };
    loadGiftProducts();
  }, []);

  // Use first API product as "Most Demanded", fall back to null
  const mostDemanded = featuredProducts[0] ?? null;

  return (
    <div className="app-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main className="app-main">

        {/* ── 1. HERO ── */}
        <section className="hero">
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <p className="hero-eyebrow">Beta Collection</p>
            <h1 className="hero-heading">The Art of Essential<br />Living</h1>
            <p className="hero-sub">
              Discover how seasonal edit, where timeless<br />
              craftsmanship meets modern minimalism. Designed<br />
              for those who appreciate the finer details.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-hero-primary">SHOP NOW</Link>
              <Link to="/categories" className="btn btn-hero-ghost">VIEW LOOKBOOK</Link>
            </div>
          </div>
        </section>

        {/* ── 1b. TRUST BADGES ── */}
        <section className="trust-strip">
          <div className="container trust-strip-inner">
            {[
              { icon: '🚚', title: 'Free Shipping',        sub: 'On all orders over $150'      },
              { icon: '🔒', title: 'Secure Payment',       sub: '256-bit SSL encryption'        },
              { icon: '↩', title: 'Easy Returns',          sub: '30-day hassle-free returns'    },
              { icon: '✦', title: 'Authenticity Guaranteed', sub: '100% genuine products'       },
            ].map((b) => (
              <div key={b.title} className="trust-badge">
                <span className="trust-badge-icon" aria-hidden="true">{b.icon}</span>
                <div className="trust-badge-text">
                  <p className="trust-badge-title">{b.title}</p>
                  <p className="trust-badge-sub">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. MOST DEMANDED PRODUCT ── */}
        {mostDemanded && (
        <section className="most-demanded-section">
          <div className="container">
            <div className="most-demanded-eyebrow-row">
              <span className="most-demanded-eyebrow">Most Demanded</span>
              <span className="most-demanded-rule" aria-hidden="true" />
            </div>

            <div className="most-demanded-grid">
              {/* Image side */}
              <Link to={`/product/${mostDemanded.id}`} className="most-demanded-img-wrap">
                {mostDemanded.badge && (
                  <span className="most-demanded-badge">{mostDemanded.badge}</span>
                )}
                <img
                  src={mostDemanded.img}
                  alt={mostDemanded.name}
                  className="most-demanded-img"
                />
              </Link>

              {/* Info side */}
              <div className="most-demanded-info">
                <p className="most-demanded-category">{mostDemanded.category}</p>
                <h2 className="most-demanded-name">{mostDemanded.name}</h2>

                {mostDemanded.reviewCount && (
                  <div className="most-demanded-stars">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="md-star md-star--on">★</span>
                    ))}
                    <span className="most-demanded-review-count">({mostDemanded.reviewCount} reviews)</span>
                  </div>
                )}

                <div className="most-demanded-price-row">
                  <span className="most-demanded-price">${mostDemanded.price}</span>
                  {mostDemanded.oldPrice && (
                    <span className="most-demanded-old-price">${mostDemanded.oldPrice}</span>
                  )}
                </div>

                <Link to={`/product/${mostDemanded.id}`} className="most-demanded-cta">
                  SHOP NOW →
                </Link>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ── 3. BROWSE COLLECTIONS ── */}
        <section className="collections-section">
          <div className="container">
            <div className="collections-header">
              <div>
                <h2 className="collections-title">Browse Categories</h2>
                <p className="collections-sub">Explore our curated departments</p>
              </div>
              <Link to="/categories" className="explore-all-link">EXPLORE ALL</Link>
            </div>

            {/* Loading skeletons */}
            {collectionsLoading && (
              <div className="collections-grid">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="collection-card collection-skeleton" />
                ))}
              </div>
            )}

            {/* Live categories from API */}
            {!collectionsLoading && collections.length > 0 && (
              <div className="collections-grid">
                {collections.slice(0, 3).map((col) => (
                  <Link
                    key={col.id}
                    to={`/categories`}
                    className="collection-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <img src={col.img} alt={col.label} className="collection-img" />
                    <div className="collection-overlay">
                      <p className="collection-label">{col.label}</p>
                      <span className="collection-shop-link">SHOP COLLECTION →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty — API returned nothing */}
            {!collectionsLoading && collections.length === 0 && (
              <div className="collections-empty">
                <p>No categories found.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── 3b. BRAND STORY ── */}
        <section className="brand-story-section">
          <div className="brand-story-img-side">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop"
              alt="Timekey atelier"
              className="brand-story-img"
            />
          </div>
          <div className="brand-story-text-side">
            <p className="brand-story-eyebrow">Our Story</p>
            <h2 className="brand-story-title">Curated with intention,<br />delivered with care.</h2>
            <p className="brand-story-body">
              Founded in 2024, Timekey was built on a single belief — that beautiful
              things, thoughtfully made, deserve to be discovered. We partner exclusively
              with makers who share our obsession with materials, process, and purpose.
            </p>
            <p className="brand-story-body">
              Every product passes a rigorous selection process, not just for quality,
              but for the story behind it. Knowing where something comes from makes it
              more meaningful.
            </p>
            <div className="brand-story-stats">
              {[
                { value: '10+',  label: 'Years in business'  },
                { value: '200+', label: 'Artisan partners'   },
                { value: '50K+', label: 'Happy customers'    },
              ].map((s) => (
                <div key={s.label} className="brand-stat">
                  <p className="brand-stat-value">{s.value}</p>
                  <p className="brand-stat-label">{s.label}</p>
                </div>
              ))}
            </div>
            <a href="/about" className="brand-story-cta">DISCOVER OUR STORY →</a>
          </div>
        </section>

        {/* ── 4. GIFT BOXES ── */}
        {giftProducts.length > 0 && <section className="gift-section">
          <div className="container">
            <div className="gift-header">
              <p className="gift-eyebrow">Give the Gift of Luxury</p>
              <h2 className="gift-title">Curated Gift Boxes</h2>
              <p className="gift-sub">
                Hand-assembled with care. Each box is ready to give — no wrapping needed.
              </p>
            </div>

            <div className="gift-grid">
              {giftProducts.map((box) => (
                <div key={box.id} className="gift-card">
                  <div className="gift-img-wrap">
                    <span className="gift-tag">{box.tag}</span>
                    <img src={box.img} alt={box.name} className="gift-img" />
                  </div>
                  <div className="gift-info">
                    <h3 className="gift-name">{box.name}</h3>
                    <p className="gift-desc">{box.desc}</p>
                    <div className="gift-footer">
                      <span className="gift-price">${box.price}</span>
                      <button
                        className={`gift-btn${giftAddedId === box.id ? ' gift-btn--added' : ''}`}
                        onClick={() => requireAuth(() => {
                          addToCart(
                            {
                              id:       `gift-${box.id}`,
                              name:     box.name,
                              price:    box.price,
                              img:      box.img,
                              category: 'Gift Box',
                              colors:   [],
                              sizes:    [],
                            },
                            { qty: 1 }
                          );
                          setGiftAddedId(box.id);
                          setTimeout(() => setGiftAddedId(null), 2000);
                        })}
                      >
                        {giftAddedId === box.id ? '✓ ADDED!' : 'BUY AS GIFT'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {/* ── 5. FEATURED PRODUCTS ── */}
        <section className="products-section">
          <div className="container">
            <h2 className="products-title">Featured Products</h2>

            {/* Loading skeletons */}
            {productsLoading && (
              <div className="products-grid">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <div key={i} className="product-skeleton">
                    <div className="product-skeleton-img" />
                    <div className="product-skeleton-line product-skeleton-line--name" />
                    <div className="product-skeleton-line product-skeleton-line--price" />
                  </div>
                ))}
              </div>
            )}

            {/* API products */}
            {!productsLoading && featuredProducts.length > 0 && (
              <div className="products-grid">
                {featuredProducts.map((p) => (
                  <div key={p.id} className="product-item">
                    <div className="product-img-wrap">
                      {p.badge && (
                        <span className={`product-badge ${p.badge === 'LIMITED' ? 'product-badge--limited' : 'product-badge--new'}`}>
                          {p.badge}
                        </span>
                      )}
                      {!p.inStock && (
                        <span className="product-badge product-badge--limited">OUT OF STOCK</span>
                      )}
                      <Link to={`/product/${p.id}`} className="product-img-link">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="product-img"
                          onError={e => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop';
                          }}
                        />
                      </Link>

                      {/* ── Hover action buttons ── */}
                      <div className="product-hover-actions">
                        <button
                          className="product-hover-btn"
                          aria-label="Add to wishlist"
                          onClick={(e) => {
                            e.preventDefault();
                            requireAuth(() => toggleWishlist(p));
                          }}
                          title={isWishlisted(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <svg
                            width="16" height="16"
                            viewBox="0 0 24 24"
                            fill={isWishlisted(p.id) ? '#ef4444' : 'none'}
                            stroke={isWishlisted(p.id) ? '#ef4444' : 'currentColor'}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                          </svg>
                        </button>
                        <button
                          className="product-hover-btn product-hover-btn--cart"
                          aria-label="Add to cart"
                          disabled={cartLoadingId === p.id}
                          onClick={(e) => {
                            e.preventDefault();
                            requireAuth(async () => {
                              setCartLoadingId(p.id);
                              try {
                                await cartService.addItem(p.id, 1);
                                addToCart(p); // keep local state in sync
                              } catch {
                                // silently fall back — local state already updated
                              } finally {
                                setCartLoadingId(null);
                              }
                            });
                          }}
                          title="Add to cart"
                        >
                          <svg
                            width="16" height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                          </svg>
                        </button>
                      </div>

                    </div>
                    <Link to={`/product/${p.id}`} className="product-info-link">
                      <div className="product-info">
                        <p className="product-name">{p.name}</p>
                        <div className="product-meta">
                          <span className="product-price">${p.price}</span>
                          {p.oldPrice && <span className="product-old-price">${p.oldPrice}</span>}
                          {p.reviewCount && (
                            <span className="product-reviews">{p.reviewCount} Reviews</span>
                          )}
                          {p.colors?.length > 0 && (
                            <div className="product-colors">
                              {p.colors.map((c) => (
                                <span
                                  key={c.hex}
                                  className="product-color-dot"
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!productsLoading && featuredProducts.length === 0 && (
              <div className="products-empty">
                <p>No products available at the moment.</p>
                <Link to="/products" className="products-empty-link">Browse all products</Link>
              </div>
            )}

          </div>
        </section>

        {/* ── 6. NEWSLETTER removed ── */}

        {/* ── 6b. TESTIMONIALS ── */}
        <section className="testimonials-section">
          <div className="container">
            <div className="testimonials-header">
              <p className="testimonials-eyebrow">What Customers Say</p>
              <h2 className="testimonials-title">Loved by Thousands</h2>
            </div>
            <div className="testimonials-grid">
              {[
                {
                  name: 'Sophia M.',
                  location: 'New York, USA',
                  rating: 5,
                  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
                  text: 'The Sculptural Wool Coat is everything the description promised. The quality is exceptional — you can feel the craftsmanship the moment you put it on. I\'ve received more compliments wearing this than anything else in my wardrobe.',
                  product: 'Sculptural Wool Coat',
                },
                {
                  name: 'James R.',
                  location: 'London, UK',
                  rating: 5,
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                  text: 'I was skeptical about buying a leather tote online, but Timekey\'s photography and descriptions were completely accurate. The Executive Leather Tote arrived beautifully packaged and the leather is stunning. Worth every penny.',
                  product: 'Executive Leather Tote',
                },
                {
                  name: 'Isabelle F.',
                  location: 'Paris, France',
                  rating: 5,
                  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
                  text: 'Fast shipping, gorgeous packaging, and a product that genuinely lives up to the premium price point. The Atelier Ceramic Lamp is now the focal point of my living room. Timekey has a customer for life.',
                  product: 'Atelier Ceramic Lamp',
                },
              ].map((t) => (
                <div key={t.name} className="testimonial-card">
                  <div className="testimonial-stars" aria-label={`${t.rating} out of 5 stars`}>
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`t-star ${s <= t.rating ? 't-star--on' : ''}`}>★</span>
                    ))}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-footer">
                    <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                    <div>
                      <p className="testimonial-name">{t.name}</p>
                      <p className="testimonial-meta">{t.location} · {t.product}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6c. LOOKBOOK / INSTAGRAM STRIP ── */}
        <section className="lookbook-section">
          <div className="lookbook-header">
            <p className="lookbook-eyebrow">@Timekey</p>
            <h2 className="lookbook-title">The Lookbook</h2>
            <p className="lookbook-sub">Real style, real people. Follow us for daily inspiration.</p>
          </div>
          <div className="lookbook-grid">
            {[
              { img: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop', alt: 'Wool coat look' },
              { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop', alt: 'Leather tote styling' },
              { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', alt: 'Sneakers flat lay' },
              { img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop', alt: 'Home interior' },
              { img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop', alt: 'Ceramic lamp detail' },
              { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop', alt: 'Lifestyle flat lay' },
            ].map((item, i) => (
              <div key={i} className="lookbook-item">
                <img src={item.img} alt={item.alt} className="lookbook-img" />
                <div className="lookbook-item-overlay" aria-hidden="true">
                  <span className="lookbook-item-icon">＋</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lookbook-cta-wrap">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="lookbook-cta"
            >
              FOLLOW @TIMEKEY
            </a>
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Sign-in prompt modal ── */}
      {showSignIn && (
        <div
          className="signin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in required"
          onClick={() => setShowSignIn(false)}
        >
          <div className="signin-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="signin-modal-close"
              onClick={() => setShowSignIn(false)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="signin-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            <p className="signin-modal-eyebrow">Members Only</p>
            <h2 className="signin-modal-title">Sign in to continue</h2>
            <p className="signin-modal-sub">
              Create an account or sign in to add items to your wishlist and cart.
            </p>

            <div className="signin-modal-actions">
              <button
                className="signin-modal-btn signin-modal-btn--primary"
                onClick={() => { setShowSignIn(false); navigate('/login'); }}
              >
                SIGN IN
              </button>
              <button
                className="signin-modal-btn signin-modal-btn--ghost"
                onClick={() => { setShowSignIn(false); navigate('/register'); }}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <button
              className="signin-modal-skip"
              onClick={() => setShowSignIn(false)}
            >
              Continue browsing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
