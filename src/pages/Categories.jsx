import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/footer';
import { products } from '../data/products';
import './Categories.css';

const categoryData = [
  {
    slug: 'apparel',
    label: 'Apparel',
    tagline: 'Elevated everyday wear, crafted to last.',
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop',
    count: products.filter((p) => p.category === 'Apparel').length,
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    tagline: 'The finishing touch that defines the look.',
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop',
    count: products.filter((p) => p.category === 'Accessories').length,
  },
  {
    slug: 'home',
    label: 'Home',
    tagline: 'Objects that make a space feel intentional.',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop',
    count: products.filter((p) => p.category === 'Home').length,
  },
];

const Categories = ({ user, onLogout }) => {
  const [activeSlug, setActiveSlug] = useState(null);

  const visibleProducts = activeSlug
    ? products.filter((p) => p.category.toLowerCase() === activeSlug)
    : products;

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main>
        {/* ── Page Hero ── */}
        <section className="page-hero categories-hero">
          <div className="page-hero-overlay" aria-hidden="true" />
          <div className="container page-hero-content">
            <p className="page-hero-eyebrow">Explore</p>
            <h1 className="page-hero-title">Browse Categories</h1>
            <p className="page-hero-sub">
              Discover our full range of curated departments — each one a world of its own.
            </p>
          </div>
        </section>

        {/* ── Category Cards ── */}
        <section className="cat-cards-section">
          <div className="container">
            <div className="cat-cards-grid">
              {categoryData.map((cat) => (
                <button
                  key={cat.slug}
                  className={`cat-card ${activeSlug === cat.slug ? 'cat-card--active' : ''}`}
                  onClick={() => setActiveSlug(activeSlug === cat.slug ? null : cat.slug)}
                  aria-pressed={activeSlug === cat.slug}
                >
                  <div className="cat-card-img-wrap">
                    <img src={cat.img} alt={cat.label} className="cat-card-img" />
                    <div className="cat-card-overlay" />
                  </div>
                  <div className="cat-card-body">
                    <div>
                      <h2 className="cat-card-label">{cat.label}</h2>
                      <p className="cat-card-tagline">{cat.tagline}</p>
                    </div>
                    <span className="cat-card-count">{cat.count} items</span>
                  </div>
                </button>
              ))}
            </div>

            {activeSlug && (
              <p className="cat-filter-note">
                Showing <strong>{activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1)}</strong>
                &nbsp;—&nbsp;
                <button className="cat-clear-btn" onClick={() => setActiveSlug(null)}>
                  Clear filter ×
                </button>
              </p>
            )}
          </div>
        </section>

        {/* ── Products Grid ── */}
        <section className="cat-products-section">
          <div className="container">
            <h2 className="cat-products-heading">
              {activeSlug
                ? `${activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1)} Products`
                : 'All Products'}
            </h2>

            <div className="cat-products-grid">
              {visibleProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="cat-product-card">
                  <div className="cat-product-img-wrap">
                    {p.badge && (
                      <span className={`cat-product-badge ${p.badge === 'LIMITED' ? 'cat-badge--limited' : 'cat-badge--new'}`}>
                        {p.badge}
                      </span>
                    )}
                    <img src={p.img} alt={p.name} className="cat-product-img" />
                  </div>
                  <div className="cat-product-info">
                    <p className="cat-product-category">{p.category}</p>
                    <p className="cat-product-name">{p.name}</p>
                    <div className="cat-product-meta">
                      <span className="cat-product-price">${p.price}</span>
                      {p.oldPrice && <span className="cat-product-old">${p.oldPrice}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
