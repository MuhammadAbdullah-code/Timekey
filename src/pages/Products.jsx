import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, SlidersHorizontal, X } from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import productService from '../services/productService';
import { useShop } from '../context/ShopContext';
import './Products.css';
import './pages.css';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured'          },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'         },
];

/* Normalize an API product to the shape the card uses */
const normalizeApiProduct = (p) => ({
  id:          p.id,
  name:        p.name,
  price:       p.price,
  oldPrice:    p.old_price   ?? null,
  badge:       p.badge       ?? null,
  category:    p.category_id ?? p.category ?? '',
  img:         p.image_url   || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
  colors:      Array.isArray(p.colors) ? p.colors : [],
  sizes:       Array.isArray(p.sizes)  ? p.sizes  : [],
  rating:      p.rating      ?? 0,
  reviewCount: p.review_count ?? 0,
  inStock:     (p.stock ?? 1) > 0,
  description: p.description ?? '',
});

const Products = ({ user, onLogout }) => {
  const { toggleWishlist, isWishlisted } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  /* API product state */
  const [apiProducts, setApiProducts] = useState([]);
  const [apiLoading,  setApiLoading]  = useState(false);
  const [apiError,    setApiError]    = useState('');

  /* All available categories built from API results */
  const [categories, setCategories] = useState(['All']);

  /* UI state */
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,          setSortBy]         = useState('default');
  const [filtersOpen,     setFiltersOpen]    = useState(false);

  /* ── Load products from the API ── */
  const loadProducts = useCallback(async (q) => {
    setApiLoading(true);
    setApiError('');
    setActiveCategory('All');
    try {
      let data;
      if (q) {
        data = await productService.searchProducts(q);
      } else {
        data = await productService.getProducts({ skip: 0, limit: 100 });
      }
      const normalized = (Array.isArray(data) ? data : []).map(normalizeApiProduct);
      setApiProducts(normalized);

      const cats = Array.from(new Set(normalized.map(p => p.category).filter(Boolean)));
      setCategories(['All', ...cats]);
    } catch (err) {
      setApiError(err.message || 'Failed to load products.');
      setApiProducts([]);
      setCategories(['All']);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(searchQuery);
  }, [searchQuery, loadProducts]);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = activeCategory === 'All'
      ? [...apiProducts]
      : apiProducts.filter(p => p.category === activeCategory);

    if (sortBy === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [apiProducts, activeCategory, sortBy]);

  const clearSearch = () => setSearchParams({});

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main>
        {/* ── Hero ── */}
        <section className="page-hero products-hero">
          <div className="page-hero-overlay" aria-hidden="true" />
          <div className="container page-hero-content">
            <p className="page-hero-eyebrow">Our Catalogue</p>
            <h1 className="page-hero-title">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
            </h1>
            <p className="page-hero-sub">
              {searchQuery
                ? `Showing products matching your search`
                : 'Handpicked pieces across apparel, accessories, and home — each chosen for quality, craft, and lasting appeal.'}
            </p>
          </div>
        </section>

        {/* ── Search context bar ── */}
        {searchQuery && (
          <div className="products-search-bar">
            <div className="container products-search-bar-inner">
              <span className="products-search-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Searching for: <strong>"{searchQuery}"</strong>
                {!apiLoading && ` — ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
              </span>
              <button className="products-search-clear" onClick={clearSearch}>
                <X size={13} /> Clear search
              </button>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="products-toolbar">
          <div className="container products-toolbar-inner">
            <div className="products-cats">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`products-cat-pill ${activeCategory === cat ? 'products-cat-pill--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="products-controls">
              <span className="products-count">
                {apiLoading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
              </span>
              <div className="products-sort-wrap">
                <label htmlFor="prod-sort" className="sr-only">Sort by</label>
                <select
                  id="prod-sort"
                  className="products-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <button
                className="products-filter-btn"
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-label="Toggle filters"
              >
                {filtersOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
                Filters
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="products-filter-panel">
              <div className="container">
                <p className="products-filter-note">
                  More filter options coming soon — use the category pills and sort above for now.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {apiLoading && (
          <section className="products-grid-section">
            <div className="container">
              <div className="products-grid">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="prod-card prod-card--skeleton">
                    <div className="prod-skeleton-img" />
                    <div className="prod-skeleton-line prod-skeleton-line--name" />
                    <div className="prod-skeleton-line prod-skeleton-line--price" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Error ── */}
        {!apiLoading && apiError && (
          <section className="products-grid-section">
            <div className="container">
              <div className="products-api-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{apiError}</span>
                <button className="products-retry-btn" onClick={() => loadProducts(searchQuery)}>Retry</button>
              </div>
            </div>
          </section>
        )}

        {/* ── Grid ── */}
        {!apiLoading && !apiError && (
          <section className="products-grid-section">
            <div className="container">
              {filtered.length === 0 ? (
                <div className="products-empty">
                  {searchQuery
                    ? <p>No products found for "<strong>{searchQuery}</strong>". Try a different search.</p>
                    : <p>No products found in this category.</p>
                  }
                  {searchQuery
                    ? <button className="products-reset-btn" onClick={clearSearch}>Clear search</button>
                    : <button className="products-reset-btn" onClick={() => setActiveCategory('All')}>Show all products</button>
                  }
                </div>
              ) : (
                <div className="products-grid">
                  {filtered.map((p) => (
                    <div key={p.id} className="prod-card">
                      <Link to={`/product/${p.id}`} className="prod-card-img-wrap">
                        {p.badge && (
                          <span className={`prod-badge ${p.badge === 'LIMITED' ? 'prod-badge--limited' : 'prod-badge--new'}`}>
                            {p.badge}
                          </span>
                        )}
                        <img
                          src={p.img}
                          alt={p.name}
                          className="prod-card-img"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop'; }}
                        />
                        <button
                          className={`prod-wishlist-btn ${isWishlisted(p.id) ? 'prod-wishlist-btn--active' : ''}`}
                          aria-label={isWishlisted(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          onClick={(e) => { e.preventDefault(); toggleWishlist(p); }}
                        >
                          <Heart size={16} fill={isWishlisted(p.id) ? 'currentColor' : 'none'} />
                        </button>
                      </Link>

                      <div className="prod-card-info">
                        <p className="prod-card-category">{p.category}</p>
                        <Link to={`/product/${p.id}`} className="prod-card-name">{p.name}</Link>

                        <div className="prod-card-stars" aria-label={`Rated ${p.rating} out of 5`}>
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className={`prod-star ${s <= Math.round(p.rating) ? 'prod-star--on' : ''}`}>★</span>
                          ))}
                          <span className="prod-card-review-count">({p.reviewCount})</span>
                        </div>

                        <div className="prod-card-footer">
                          <div className="prod-card-price-row">
                            <span className="prod-card-price">${p.price}</span>
                            {p.oldPrice && <span className="prod-card-old-price">${p.oldPrice}</span>}
                          </div>
                          {p.colors.length > 0 && (
                            <div className="prod-card-colors">
                              {p.colors.map((c) => (
                                <span
                                  key={c.hex ?? c.name}
                                  className="prod-color-dot"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <Link to={`/product/${p.id}`} className="prod-card-cta">View Product</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
