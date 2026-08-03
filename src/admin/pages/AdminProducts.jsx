import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import uploadService from '../../services/uploadService';
import './AdminProducts.css';

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const PRODUCT_CATEGORIES = ['Apparel', 'Accessories', 'Home', 'Beauty', 'Electronics', 'Other'];
const BADGE_OPTIONS       = ['', 'NEW ARRIVAL', 'LIMITED', 'SALE', 'BESTSELLER', 'TRENDING'];
const FILTER_CATEGORIES   = ['All', ...PRODUCT_CATEGORIES];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const StarRating = ({ rating }) => (
  <span className="ap-stars" aria-label={`${rating} out of 5`}>
    {'★'.repeat(Math.floor(rating))}
    {rating % 1 >= 0.5 ? '½' : ''}
    {'☆'.repeat(5 - Math.floor(rating) - (rating % 1 >= 0.5 ? 1 : 0))}
  </span>
);

const Err = ({ msg }) => msg ? <p className="ap-field-err">{msg}</p> : null;

/* ─────────────────────────────────────────
   Gift Box Manager
───────────────────────────────────────── */
const GIFTBOX_KEY     = 'luxe_giftbox_ids';
const GIFTBOX_MAX     = 3;

const loadGiftIds = () => {
  try { return JSON.parse(localStorage.getItem(GIFTBOX_KEY)) ?? []; }
  catch { return []; }
};

const GiftBoxManager = ({ catalogue }) => {
  const [giftIds,   setGiftIds]   = useState(loadGiftIds);
  const [search,    setSearch]    = useState('');
  const [saved,     setSaved]     = useState(false);

  const save = (ids) => {
    localStorage.setItem(GIFTBOX_KEY, JSON.stringify(ids));
    setGiftIds(ids);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (id) => {
    if (giftIds.includes(id)) {
      save(giftIds.filter(g => g !== id));
    } else {
      if (giftIds.length >= GIFTBOX_MAX) return; // max 3
      save([...giftIds, id]);
    }
  };

  const filtered = catalogue.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const giftProducts = catalogue.filter(p => giftIds.includes(p.id));

  return (
    <div className="ap-giftbox">
      {/* Header */}
      <div className="ap-giftbox-header">
        <div>
          <h2 className="ap-giftbox-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8,verticalAlign:'middle'}}>
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
            </svg>
            Gift Box — Home Page
          </h2>
          <p className="ap-giftbox-sub">
            Select up to {GIFTBOX_MAX} products to feature in the "Curated Gift Boxes" section on the home page.
            <span className="ap-giftbox-count"> ({giftIds.length}/{GIFTBOX_MAX} selected)</span>
          </p>
        </div>
        {saved && (
          <span className="ap-giftbox-saved">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Saved
          </span>
        )}
      </div>

      {/* Current selection preview */}
      {giftProducts.length > 0 && (
        <div className="ap-giftbox-preview">
          {giftProducts.map((p, i) => (
            <div key={p.id} className="ap-giftbox-preview-item">
              <img src={p.img} alt={p.name} className="ap-giftbox-preview-img"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=200&auto=format&fit=crop'; }} />
              <div className="ap-giftbox-preview-info">
                <p className="ap-giftbox-preview-name">{p.name}</p>
                <p className="ap-giftbox-preview-price">${p.price}</p>
              </div>
              <button className="ap-giftbox-preview-remove" onClick={() => toggle(p.id)} title="Remove from gift box">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {giftProducts.length === 0 && (
        <div className="ap-giftbox-empty">No products selected yet. Pick up to {GIFTBOX_MAX} below.</div>
      )}

      {/* Search + product list */}
      <div className="ap-giftbox-search-wrap">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',pointerEvents:'none'}}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="ap-giftbox-search"
          placeholder="Search products to add…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="ap-giftbox-list">
        {filtered.map(p => {
          const isSelected = giftIds.includes(p.id);
          const isDisabled = !isSelected && giftIds.length >= GIFTBOX_MAX;
          return (
            <div
              key={p.id}
              className={`ap-giftbox-item${isSelected ? ' ap-giftbox-item--selected' : ''}${isDisabled ? ' ap-giftbox-item--disabled' : ''}`}
              onClick={() => !isDisabled && toggle(p.id)}
              title={isDisabled ? `Max ${GIFTBOX_MAX} products allowed` : isSelected ? 'Click to remove' : 'Click to add'}
            >
              <img src={p.img} alt={p.name} className="ap-giftbox-item-img"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=200&auto=format&fit=crop'; }} />
              <div className="ap-giftbox-item-info">
                <p className="ap-giftbox-item-name">{p.name}</p>
                <p className="ap-giftbox-item-meta">{p.category} · ${p.price}</p>
              </div>
              <div className={`ap-giftbox-item-check${isSelected ? ' ap-giftbox-item-check--on' : ''}`}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{padding:'16px',color:'#9CA3AF',fontSize:13}}>No products match your search.</p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────── */
const DeleteConfirmModal = ({ product, onClose, onConfirm, deleting }) => (
  <div className="ap-modal-overlay" role="dialog" aria-modal="true" aria-label="Delete product" onClick={onClose}>
    <div className="ap-delete-modal" onClick={e => e.stopPropagation()}>
      <div className="ap-delete-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </div>
      <h2 className="ap-delete-title">Delete Product?</h2>
      <p className="ap-delete-sub">
        <strong>"{product.name}"</strong> will be permanently removed from the catalogue. This cannot be undone.
      </p>
      <div className="ap-delete-actions">
        <button className="ap-modal-btn ap-modal-btn--ghost" onClick={onClose} disabled={deleting}>
          Cancel
        </button>
        <button
          className={`ap-modal-btn ap-modal-btn--danger${deleting ? ' ap-modal-btn--loading' : ''}`}
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? <><span className="ap-spinner" /> Deleting…</> : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Add Product Modal
───────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', category: 'Apparel', price: '', oldPrice: '',
  badge: '', description: '', stock: 100,
  imgUrl: '', galleryUrls: ['', '', ''],
  colors: [{ name: '', hex: '#000000' }],
  sizes: [''],
  details: [''],
};

const AddProductModal = ({ onClose, onAdd }) => {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [preview, setPreview] = useState(null); // blob URL from file upload
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');
  const fileRef = useRef();

  /* ── field helpers ── */
  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const setArr = (key, idx, val) => {
    const copy = [...form[key]];
    copy[idx] = val;
    setForm(p => ({ ...p, [key]: copy }));
  };

  const setColorField = (idx, field, val) => {
    const copy = form.colors.map((c, i) => i === idx ? { ...c, [field]: val } : c);
    setForm(p => ({ ...p, colors: copy }));
  };

  const addRow    = (key, empty) => setForm(p => ({ ...p, [key]: [...p[key], empty] }));
  const removeRow = (key, idx)   => setForm(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  /* ── image file handler — uploads to Cloudinary via backend ── */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show local blob preview immediately while uploading
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setErrors(p => ({ ...p, imgUrl: '' }));
    setApiError('');
    setSubmitting(true);
    try {
      const cloudUrl = await uploadService.uploadImage(file);
      set('imgUrl', cloudUrl);   // store the real Cloudinary URL
      setPreview(cloudUrl);      // swap blob preview for the real URL
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setApiError('Image upload failed: ' + err.message);
      setPreview(null);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name        = 'Product name is required.';
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = 'Enter a valid price.';
    if (form.oldPrice && (isNaN(form.oldPrice) || +form.oldPrice <= 0)) e.oldPrice = 'Enter a valid original price.';
    if (!form.description.trim())                   e.description = 'Description is required.';
    // Valid if either a URL was typed OR a file was uploaded (preview exists)
    if (!form.imgUrl.trim() && !preview)            e.imgUrl      = 'Main image is required.';
    if (form.colors.some(c => !c.name.trim()))      e.colors      = 'Each color must have a name.';
    if (form.sizes.some(s => !s.trim()))            e.sizes       = 'Each size entry must be filled.';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');

    try {
      // Map form fields to the API contract
      const created = await productService.createProduct({
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        category_id: form.category,          // using category name as id until categories API is available
        stock:       parseInt(form.stock, 10) || 0,
        image_url:   form.imgUrl.trim(),
        is_active:   true,
      });

      // Build a local product shape from what the API returned
      // (the API returns a minimal object — we enrich it with form data for the table)
      const gallery = [form.imgUrl, ...form.galleryUrls.filter(u => u.trim())];
      onAdd({
        id:          created.id ?? Date.now(),
        name:        created.name,
        description: created.description,
        price:       created.price,
        oldPrice:    form.oldPrice ? parseFloat(form.oldPrice) : null,
        badge:       form.badge || null,
        category:    created.category_id,
        inStock:     created.stock > 0,
        img:         created.image_url,
        gallery,
        colors:      form.colors.filter(c => c.name.trim()),
        sizes:       form.sizes.filter(s => s.trim()),
        details:     form.details.filter(d => d.trim()),
        rating:      0,
        reviewCount: 0,
      });

      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ap-modal-overlay" role="dialog" aria-modal="true" aria-label="Add Product" onClick={onClose}>
      <div className="ap-modal ap-modal--add" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ap-modal-header">
          <div>
            <p className="ap-modal-eyebrow">Catalogue</p>
            <h2 className="ap-modal-title">Add New Product</h2>
          </div>
          <button className="ap-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body — two column */}
        <div className="ap-add-body">

          {/* ── LEFT: image upload ── */}
          <div className="ap-add-left">
            <p className="ap-add-section-title">Main Image</p>

            <div
              className={`ap-img-drop${errors.imgUrl ? ' ap-img-drop--error' : ''}`}
              onClick={() => !submitting && fileRef.current.click()}
              style={{ cursor: submitting ? 'wait' : 'pointer' }}
            >
              {submitting && !form.imgUrl ? (
                <div className="ap-img-placeholder">
                  <span className="ap-spinner" style={{ width: 24, height: 24 }} />
                  <p style={{ marginTop: 8 }}>Uploading to Cloudinary…</p>
                </div>
              ) : preview || form.imgUrl ? (
                <img src={preview || form.imgUrl} alt="Preview" className="ap-img-preview" />
              ) : (
                <div className="ap-img-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Click to upload image</p>
                  <span>PNG, JPG, WEBP — or paste a URL below</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {/* URL input — clears preview when user types a URL instead */}
            <div className="ap-add-field" style={{ marginTop: 10 }}>
              <label className="ap-add-label">Image URL (optional alternative)</label>
              <input
                className={`ap-add-input${errors.imgUrl ? ' error' : ''}`}
                placeholder="https://…"
                value={form.imgUrl}
                onChange={e => {
                  set('imgUrl', e.target.value);
                  if (e.target.value) setPreview(null); // URL takes priority over blob
                }}
              />
              <Err msg={errors.imgUrl} />
            </div>

            {/* Gallery URLs */}
            <p className="ap-add-section-title" style={{ marginTop: 18 }}>Gallery Images (optional)</p>
            {form.galleryUrls.map((url, i) => (
              <div className="ap-add-field" key={i}>
                <label className="ap-add-label">Gallery Image {i + 1}</label>
                <input
                  className="ap-add-input"
                  placeholder="https://…"
                  value={url}
                  onChange={e => setArr('galleryUrls', i, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* ── RIGHT: product details ── */}
          <div className="ap-add-right">

            {/* Name */}
            <div className="ap-add-field">
              <label className="ap-add-label">Product Name *</label>
              <input
                className={`ap-add-input${errors.name ? ' error' : ''}`}
                placeholder="e.g. Sculptural Wool Coat"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              <Err msg={errors.name} />
            </div>

            {/* Category + Badge row */}
            <div className="ap-add-row">
              <div className="ap-add-field">
                <label className="ap-add-label">Category *</label>
                <div className="ap-add-select-wrap">
                  <select className="ap-add-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="ap-add-field">
                <label className="ap-add-label">Badge</label>
                <div className="ap-add-select-wrap">
                  <select className="ap-add-select" value={form.badge} onChange={e => set('badge', e.target.value)}>
                    {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Price + Old Price row */}
            <div className="ap-add-row">
              <div className="ap-add-field">
                <label className="ap-add-label">Price ($) *</label>
                <input
                  className={`ap-add-input${errors.price ? ' error' : ''}`}
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                />
                <Err msg={errors.price} />
              </div>
              <div className="ap-add-field">
                <label className="ap-add-label">Original Price ($)</label>
                <input
                  className={`ap-add-input${errors.oldPrice ? ' error' : ''}`}
                  type="number" min="0" step="0.01" placeholder="Leave blank if no sale"
                  value={form.oldPrice}
                  onChange={e => set('oldPrice', e.target.value)}
                />
                <Err msg={errors.oldPrice} />
              </div>
            </div>

            {/* Stock quantity */}
            <div className="ap-add-field">
              <label className="ap-add-label">Stock Quantity</label>
              <input
                className={`ap-add-input${errors.stock ? ' error' : ''}`}
                type="number" min="0" step="1" placeholder="e.g. 100"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
              />
              <Err msg={errors.stock} />
            </div>

            {/* Description */}
            <div className="ap-add-field">
              <label className="ap-add-label">Description *</label>
              <textarea
                className={`ap-add-textarea${errors.description ? ' error' : ''}`}
                rows={3}
                placeholder="Describe the product…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
              <Err msg={errors.description} />
            </div>

            {/* Colors */}
            <div className="ap-add-field">
              <div className="ap-add-label-row">
                <label className="ap-add-label">Colors *</label>
                <button type="button" className="ap-add-link-btn" onClick={() => addRow('colors', { name: '', hex: '#000000' })}>
                  + Add Color
                </button>
              </div>
              <Err msg={errors.colors} />
              {form.colors.map((c, i) => (
                <div key={i} className="ap-color-row">
                  <input
                    type="color"
                    className="ap-color-picker"
                    value={c.hex}
                    onChange={e => setColorField(i, 'hex', e.target.value)}
                    title="Pick color"
                  />
                  <input
                    className="ap-add-input ap-color-name-input"
                    placeholder="Color name (e.g. Charcoal)"
                    value={c.name}
                    onChange={e => setColorField(i, 'name', e.target.value)}
                  />
                  {form.colors.length > 1 && (
                    <button type="button" className="ap-remove-row-btn" onClick={() => removeRow('colors', i)} aria-label="Remove color">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Sizes */}
            <div className="ap-add-field">
              <div className="ap-add-label-row">
                <label className="ap-add-label">Sizes *</label>
                <button type="button" className="ap-add-link-btn" onClick={() => addRow('sizes', '')}>
                  + Add Size
                </button>
              </div>
              <Err msg={errors.sizes} />
              <div className="ap-tags-row">
                {form.sizes.map((s, i) => (
                  <div key={i} className="ap-tag-input-wrap">
                    <input
                      className="ap-add-input ap-tag-input"
                      placeholder="e.g. M"
                      value={s}
                      onChange={e => setArr('sizes', i, e.target.value)}
                    />
                    {form.sizes.length > 1 && (
                      <button type="button" className="ap-remove-row-btn" onClick={() => removeRow('sizes', i)} aria-label="Remove size">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product details list */}
            <div className="ap-add-field">
              <div className="ap-add-label-row">
                <label className="ap-add-label">Product Details</label>
                <button type="button" className="ap-add-link-btn" onClick={() => addRow('details', '')}>
                  + Add Detail
                </button>
              </div>
              {form.details.map((d, i) => (
                <div key={i} className="ap-detail-row">
                  <input
                    className="ap-add-input"
                    placeholder="e.g. 100% Merino Wool"
                    value={d}
                    onChange={e => setArr('details', i, e.target.value)}
                  />
                  {form.details.length > 1 && (
                    <button type="button" className="ap-remove-row-btn" onClick={() => removeRow('details', i)} aria-label="Remove detail">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="ap-add-footer">
          {apiError && (
            <div className="ap-add-api-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}
          <div className="ap-add-footer-btns">
            <button className="ap-modal-btn ap-modal-btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              className={`ap-modal-btn ap-modal-btn--primary${submitting ? ' ap-modal-btn--loading' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="ap-spinner" /> Saving…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Product
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Edit Product Modal
───────────────────────────────────────── */
const EditProductModal = ({ product, onClose, onUpdate }) => {
  /* Pre-populate form from the existing product */
  const [form, setForm] = useState({
    name:        product.name        || '',
    category:    product.category    || 'Apparel',
    price:       String(product.price ?? ''),
    oldPrice:    product.oldPrice    ? String(product.oldPrice) : '',
    badge:       product.badge       || '',
    description: product.description || '',
    stock:       product.stock != null ? String(product.stock) : product.inStock ? '100' : '0',
    imgUrl:      product.img         || '',
    galleryUrls: product.gallery?.slice(1).concat(['', '', '']).slice(0, 3) ?? ['', '', ''],
    colors:      product.colors?.length ? product.colors : [{ name: '', hex: '#000000' }],
    sizes:       product.sizes?.length  ? product.sizes  : [''],
    details:     product.details?.length ? product.details : [''],
  });
  const [errors,     setErrors]     = useState({});
  const [preview,    setPreview]    = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');
  const fileRef = useRef();

  /* ── field helpers (same as Add) ── */
  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };
  const setArr = (key, idx, val) => {
    const copy = [...form[key]]; copy[idx] = val;
    setForm(p => ({ ...p, [key]: copy }));
  };
  const setColorField = (idx, field, val) => {
    setForm(p => ({ ...p, colors: p.colors.map((c, i) => i === idx ? { ...c, [field]: val } : c) }));
  };
  const addRow    = (key, empty) => setForm(p => ({ ...p, [key]: [...p[key], empty] }));
  const removeRow = (key, idx)   => setForm(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setErrors(p => ({ ...p, imgUrl: '' }));
    setApiError('');
    setSubmitting(true);
    try {
      const cloudUrl = await uploadService.uploadImage(file);
      set('imgUrl', cloudUrl);
      setPreview(cloudUrl);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setApiError('Image upload failed: ' + err.message);
      setPreview(null);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())                                              e.name        = 'Product name is required.';
    if (!form.price || isNaN(form.price) || +form.price <= 0)          e.price       = 'Enter a valid price.';
    if (form.oldPrice && (isNaN(form.oldPrice) || +form.oldPrice <= 0)) e.oldPrice    = 'Enter a valid original price.';
    if (!form.description.trim())                                       e.description = 'Description is required.';
    if (!form.imgUrl.trim())                                            e.imgUrl      = 'Main image is required.';
    if (form.colors.some(c => !c.name.trim()))                          e.colors      = 'Each color must have a name.';
    if (form.sizes.some(s => !s.trim()))                                e.sizes       = 'Each size entry must be filled.';
    return e;
  };

  /* ── submit → PUT /api/v1/products/:id ── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const updated = await productService.updateProduct(product.id, {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        category_id: form.category,
        stock:       parseInt(form.stock, 10) || 0,
        image_url:   form.imgUrl.trim(),
        is_active:   true,
      });

      const gallery = [form.imgUrl, ...form.galleryUrls.filter(u => u.trim())];

      /* Merge API response with form enrichments */
      onUpdate({
        ...product,                           // keep existing fields not in API response
        id:          updated.id   ?? product.id,
        name:        updated.name,
        description: updated.description,
        price:       updated.price,
        category:    updated.category_id,
        inStock:     updated.stock > 0,
        img:         updated.image_url,
        gallery,
        oldPrice:    form.oldPrice ? parseFloat(form.oldPrice) : null,
        badge:       form.badge || null,
        colors:      form.colors.filter(c => c.name.trim()),
        sizes:       form.sizes.filter(s => s.trim()),
        details:     form.details.filter(d => d.trim()),
      });
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ap-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit Product" onClick={onClose}>
      <div className="ap-modal ap-modal--add" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ap-modal-header">
          <div>
            <p className="ap-modal-eyebrow">ID: {product.id}</p>
            <h2 className="ap-modal-title">Edit Product</h2>
          </div>
          <button className="ap-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body — same two-column layout as Add */}
        <div className="ap-add-body">

          {/* LEFT: image */}
          <div className="ap-add-left">
            <p className="ap-add-section-title">Main Image</p>
            <div
              className={`ap-img-drop${errors.imgUrl ? ' ap-img-drop--error' : ''}`}
              onClick={() => !submitting && fileRef.current.click()}
              style={{ cursor: submitting ? 'wait' : 'pointer' }}
            >
              {submitting && !form.imgUrl ? (
                <div className="ap-img-placeholder">
                  <span className="ap-spinner" style={{ width: 24, height: 24 }} />
                  <p style={{ marginTop: 8 }}>Uploading to Cloudinary…</p>
                </div>
              ) : preview || form.imgUrl ? (
                <img src={preview || form.imgUrl} alt="Preview" className="ap-img-preview" />
              ) : (
                <div className="ap-img-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Click to replace image</p>
                  <span>PNG, JPG, WEBP — or paste a URL below</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            <div className="ap-add-field" style={{ marginTop: 10 }}>
              <label className="ap-add-label">Image URL</label>
              <input
                className={`ap-add-input${errors.imgUrl ? ' error' : ''}`}
                placeholder="https://…"
                value={form.imgUrl}
                onChange={e => {
                  set('imgUrl', e.target.value);
                  if (e.target.value) setPreview(null);
                }}
              />
              <Err msg={errors.imgUrl} />
            </div>

            <p className="ap-add-section-title" style={{ marginTop: 18 }}>Gallery Images (optional)</p>
            {form.galleryUrls.map((url, i) => (
              <div className="ap-add-field" key={i}>
                <label className="ap-add-label">Gallery Image {i + 1}</label>
                <input className="ap-add-input" placeholder="https://…" value={url}
                  onChange={e => setArr('galleryUrls', i, e.target.value)} />
              </div>
            ))}
          </div>

          {/* RIGHT: product info */}
          <div className="ap-add-right">

            <div className="ap-add-field">
              <label className="ap-add-label">Product Name *</label>
              <input className={`ap-add-input${errors.name ? ' error' : ''}`}
                placeholder="e.g. Sculptural Wool Coat"
                value={form.name} onChange={e => set('name', e.target.value)} />
              <Err msg={errors.name} />
            </div>

            <div className="ap-add-row">
              <div className="ap-add-field">
                <label className="ap-add-label">Category *</label>
                <div className="ap-add-select-wrap">
                  <select className="ap-add-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="ap-add-field">
                <label className="ap-add-label">Badge</label>
                <div className="ap-add-select-wrap">
                  <select className="ap-add-select" value={form.badge} onChange={e => set('badge', e.target.value)}>
                    {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="ap-add-row">
              <div className="ap-add-field">
                <label className="ap-add-label">Price ($) *</label>
                <input className={`ap-add-input${errors.price ? ' error' : ''}`}
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.price} onChange={e => set('price', e.target.value)} />
                <Err msg={errors.price} />
              </div>
              <div className="ap-add-field">
                <label className="ap-add-label">Original Price ($)</label>
                <input className={`ap-add-input${errors.oldPrice ? ' error' : ''}`}
                  type="number" min="0" step="0.01" placeholder="Leave blank if no sale"
                  value={form.oldPrice} onChange={e => set('oldPrice', e.target.value)} />
                <Err msg={errors.oldPrice} />
              </div>
            </div>

            <div className="ap-add-field">
              <label className="ap-add-label">Stock Quantity</label>
              <input
                className={`ap-add-input${errors.stock ? ' error' : ''}`}
                type="number" min="0" step="1" placeholder="e.g. 100"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
              />
              <Err msg={errors.stock} />
            </div>

            <div className="ap-add-field">
              <label className="ap-add-label">Description *</label>
              <textarea className={`ap-add-textarea${errors.description ? ' error' : ''}`}
                rows={3} placeholder="Describe the product…"
                value={form.description} onChange={e => set('description', e.target.value)} />
              <Err msg={errors.description} />
            </div>

            {/* Colors */}
            <div className="ap-add-field">
              <div className="ap-add-label-row">
                <label className="ap-add-label">Colors *</label>
                <button type="button" className="ap-add-link-btn" onClick={() => addRow('colors', { name: '', hex: '#000000' })}>+ Add Color</button>
              </div>
              <Err msg={errors.colors} />
              {form.colors.map((c, i) => (
                <div key={i} className="ap-color-row">
                  <input type="color" className="ap-color-picker" value={c.hex}
                    onChange={e => setColorField(i, 'hex', e.target.value)} title="Pick color" />
                  <input className="ap-add-input ap-color-name-input" placeholder="Color name"
                    value={c.name} onChange={e => setColorField(i, 'name', e.target.value)} />
                  {form.colors.length > 1 && (
                    <button type="button" className="ap-remove-row-btn" onClick={() => removeRow('colors', i)} aria-label="Remove">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Sizes */}
            <div className="ap-add-field">
              <div className="ap-add-label-row">
                <label className="ap-add-label">Sizes *</label>
                <button type="button" className="ap-add-link-btn" onClick={() => addRow('sizes', '')}>+ Add Size</button>
              </div>
              <Err msg={errors.sizes} />
              <div className="ap-tags-row">
                {form.sizes.map((s, i) => (
                  <div key={i} className="ap-tag-input-wrap">
                    <input className="ap-add-input ap-tag-input" placeholder="e.g. M"
                      value={s} onChange={e => setArr('sizes', i, e.target.value)} />
                    {form.sizes.length > 1 && (
                      <button type="button" className="ap-remove-row-btn" onClick={() => removeRow('sizes', i)} aria-label="Remove">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product details */}
            <div className="ap-add-field">
              <div className="ap-add-label-row">
                <label className="ap-add-label">Product Details</label>
                <button type="button" className="ap-add-link-btn" onClick={() => addRow('details', '')}>+ Add Detail</button>
              </div>
              {form.details.map((d, i) => (
                <div key={i} className="ap-detail-row">
                  <input className="ap-add-input" placeholder="e.g. 100% Merino Wool"
                    value={d} onChange={e => setArr('details', i, e.target.value)} />
                  {form.details.length > 1 && (
                    <button type="button" className="ap-remove-row-btn" onClick={() => removeRow('details', i)} aria-label="Remove">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="ap-add-footer">
          {apiError && (
            <div className="ap-add-api-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}
          <div className="ap-add-footer-btns">
            <button className="ap-modal-btn ap-modal-btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              className={`ap-modal-btn ap-modal-btn--primary${submitting ? ' ap-modal-btn--loading' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="ap-spinner" /> Saving…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Detail View Modal (unchanged)
───────────────────────────────────────── */
const ProductModal = ({ product, onClose, onEdit }) => {
  const [activeImg, setActiveImg] = useState(0);
  if (!product) return null;

  return (
    <div className="ap-modal-overlay" role="dialog" aria-modal="true" aria-label={product.name} onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>

        <div className="ap-modal-header">
          <div>
            <p className="ap-modal-eyebrow">{product.category}</p>
            <h2 className="ap-modal-title">{product.name}</h2>
          </div>
          <button className="ap-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ap-modal-body">
          <div className="ap-modal-gallery">
            <div className="ap-modal-img-main">
              <img src={product.gallery?.[activeImg] ?? product.img ?? ''} alt={product.name} />
              {product.badge && <span className="ap-modal-badge">{product.badge}</span>}
              {!product.inStock && <span className="ap-modal-badge ap-modal-badge--oos">Out of Stock</span>}
            </div>
            {product.gallery?.length > 1 && (
              <div className="ap-modal-thumbs">
                {product.gallery.map((src, i) => (
                  <button key={i} className={`ap-modal-thumb${activeImg === i ? ' ap-modal-thumb--active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ap-modal-details">
            <div className="ap-modal-pricing">
              <span className="ap-modal-price">${product.price.toFixed(2)}</span>
              {product.oldPrice && <span className="ap-modal-old-price">${product.oldPrice.toFixed(2)}</span>}
              {product.oldPrice && (
                <span className="ap-modal-discount">{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF</span>
              )}
            </div>

            <div className="ap-modal-rating-row">
              <StarRating rating={product.rating} />
              <span className="ap-modal-review-count">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className={`ap-modal-stock ${product.inStock ? 'ap-modal-stock--in' : 'ap-modal-stock--out'}`}>
              <span className="ap-modal-stock-dot" />
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            <div className="ap-modal-divider" />

            <div className="ap-modal-section">
              <p className="ap-modal-section-title">Description</p>
              <p className="ap-modal-desc">{product.description}</p>
            </div>

            {product.colors?.length > 0 && (
              <div className="ap-modal-section">
                <p className="ap-modal-section-title">Colors</p>
                <div className="ap-modal-colors">
                  {product.colors.map(c => (
                    <div key={c.hex} className="ap-modal-color-item">
                      <span className="ap-modal-color-dot" style={{ backgroundColor: c.hex }} />
                      <span className="ap-modal-color-name">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="ap-modal-section">
                <p className="ap-modal-section-title">Sizes</p>
                <div className="ap-modal-sizes">
                  {product.sizes.map(s => <span key={s} className="ap-modal-size-tag">{s}</span>)}
                </div>
              </div>
            )}

            {product.details?.length > 0 && (
              <div className="ap-modal-section">
                <p className="ap-modal-section-title">Product Details</p>
                <ul className="ap-modal-detail-list">
                  {product.details.map(d => (
                    <li key={d} className="ap-modal-detail-item">
                      <span className="ap-modal-detail-bullet" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="ap-modal-divider" />

            <div className="ap-modal-actions">
              <Link to={`/product/${product.id}`} target="_blank" className="ap-modal-btn ap-modal-btn--ghost">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View on Store
              </Link>
              <button className="ap-modal-btn ap-modal-btn--primary" onClick={() => { onClose(); onEdit(product); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const AdminProducts = () => {
  const [catalogue,   setCatalogue]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  const [selected,    setSelected]    = useState(null);
  const [addOpen,     setAddOpen]     = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // product being edited
  const [activeTab,     setActiveTab]     = useState('products'); // 'products' | 'giftbox'
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  /* ── Normalise API shape → local table shape ── */
  const normalise = (p) => ({
    id:          p.id,
    name:        p.name,
    description: p.description,
    price:       p.price,
    oldPrice:    p.old_price   ?? null,
    badge:       p.badge       ?? null,
    category:    p.category_id ?? 'Uncategorised',
    inStock:     p.stock > 0,
    img:         p.image_url   || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
    gallery:     p.image_url   ? [p.image_url] : [],
    colors:      p.colors      ?? [],
    sizes:       p.sizes       ?? [],
    details:     p.details     ?? [],
    rating:      p.rating      ?? 0,
    reviewCount: p.review_count ?? 0,
  });

  /* ── Fetch from API on mount ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await productService.getProducts({ skip: 0, limit: 100 });
      setCatalogue(data.map(normalise));
    } catch (err) {
      setFetchError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Add new product to top of list ── */
  const handleAdd = (product) => {
    setCatalogue(prev => [product, ...prev]);
  };

  /* ── Update existing product in list ── */
  const handleUpdate = (updated) => {
    setCatalogue(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  /* ── Delete product ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await productService.deleteProduct(deleteTarget.id);
      setCatalogue(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Build category tabs dynamically from fetched data ── */
  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(catalogue.map(p => p.category)));
    return ['All', ...cats];
  }, [catalogue]);

  /* ── Filter ── */
  const filtered = useMemo(() => catalogue.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    const matchStock    = stockFilter === 'all' ? true : stockFilter === 'in' ? p.inStock : !p.inStock;
    return matchSearch && matchCategory && matchStock;
  }), [catalogue, search, category, stockFilter]);

  return (
    <div className="ap-root">

      {/* Header */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Products</h1>
          <p className="ap-sub">
            {loading ? 'Loading catalogue…' : `${catalogue.length} total products in catalogue`}
          </p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div className="ap-tab-switcher">
            <button
              className={`ap-tab-btn${activeTab === 'products' ? ' ap-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('products')}
            >Products</button>
            <button
              className={`ap-tab-btn${activeTab === 'giftbox' ? ' ap-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('giftbox')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:5,verticalAlign:'middle'}}>
                <polyline points="20 12 20 22 4 22 4 12"/>
                <rect x="2" y="7" width="20" height="5"/>
                <line x1="12" y1="22" x2="12" y2="7"/>
                <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
              </svg>
              Gift Box
            </button>
          </div>
          {activeTab === 'products' && (
        <button className="ap-add-btn" onClick={() => setAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
          )}
        </div>
      </div>

      {/* ── Gift Box Tab ── */}
      {activeTab === 'giftbox' && !loading && (
        <GiftBoxManager catalogue={catalogue} />
      )}
      {activeTab === 'giftbox' && loading && (
        <div style={{padding:'40px',textAlign:'center',color:'#9CA3AF',fontSize:14}}>Loading products…</div>
      )}

      {/* Filters — only show on products tab */}
      {activeTab === 'products' && <div className="ap-filters">
        <div className="ap-search-wrap">
          <svg className="ap-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search products…"
            className="ap-search-input" value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ap-search-clear" onClick={() => setSearch('')} aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <div className="ap-cat-tabs">
          {allCategories.map(c => (
            <button key={c} className={`ap-cat-tab${category === c ? ' ap-cat-tab--active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="ap-stock-tabs">
          {[['all','All'],['in','In Stock'],['out','Out of Stock']].map(([val, label]) => (
            <button key={val} className={`ap-stock-tab${stockFilter === val ? ' ap-stock-tab--active' : ''}`} onClick={() => setStockFilter(val)}>{label}</button>
          ))}
        </div>
      </div>}

      {activeTab === 'products' && <>
      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} className="ap-table-row">
                  <td><div className="ap-skeleton ap-skeleton--product" /></td>
                  <td><div className="ap-skeleton ap-skeleton--short" /></td>
                  <td><div className="ap-skeleton ap-skeleton--short" /></td>
                  <td><div className="ap-skeleton ap-skeleton--short" /></td>
                  <td><div className="ap-skeleton ap-skeleton--short" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Fetch error ── */}
      {!loading && fetchError && (
        <div className="ap-fetch-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{fetchError}</span>
          <button className="ap-retry-btn" onClick={fetchProducts}>Retry</button>
        </div>
      )}

      {/* ── Data loaded ── */}
      {!loading && !fetchError && (
        <>
          <p className="ap-results-label">Showing <strong>{filtered.length}</strong> of {catalogue.length} products</p>

          {filtered.length === 0 ? (
            <div className="ap-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>{catalogue.length === 0 ? 'No products yet. Add your first product.' : 'No products match your filters.'}</p>
            </div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th><th>Price</th>
                    <th>Rating</th><th>Colors</th><th>Sizes</th>
                    <th>Stock</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="ap-table-row">
                      <td>
                        <div className="ap-product-cell">
                          <img
                            src={p.img} alt={p.name} className="ap-product-thumb"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop'; }}
                          />
                          <div>
                            <p className="ap-product-name">{p.name}</p>
                            {p.badge && <span className="ap-product-badge">{p.badge}</span>}
                          </div>
                        </div>
                      </td>
                      <td><span className="ap-category-tag">{p.category}</span></td>
                      <td>
                        <div className="ap-price-cell">
                          <span className="ap-price">${p.price}</span>
                          {p.oldPrice && <span className="ap-old-price">${p.oldPrice}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="ap-rating-cell">
                          <StarRating rating={p.rating} />
                          <span className="ap-rating-num">{p.rating}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ap-color-dots">
                          {p.colors.length > 0
                            ? p.colors.map(c => <span key={c.hex} className="ap-color-dot" style={{ backgroundColor: c.hex }} title={c.name} />)
                            : <span className="ap-na">—</span>}
                        </div>
                      </td>
                      <td>
                        <span className="ap-sizes-text">{p.sizes.length > 0 ? p.sizes.join(', ') : '—'}</span>
                      </td>
                      <td>
                        <span className={`ap-stock-badge ${p.inStock ? 'ap-stock-badge--in' : 'ap-stock-badge--out'}`}>
                          <span className="ap-stock-dot" />{p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="ap-actions-cell">
                          <button className="ap-action-btn ap-action-btn--view" onClick={() => setSelected(p)} title="View">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            View
                          </button>
                          <button className="ap-action-btn ap-action-btn--edit"
                            onClick={() => setEditTarget(p)} title="Edit">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button className="ap-action-btn ap-action-btn--delete"
                            onClick={() => { setDeleteError(''); setDeleteTarget(p); }} title="Delete">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      </>}

      {/* Delete error toast */}
      {deleteError && (
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',zIndex:99999,background:'#fee2e2',border:'1px solid #fca5a5',borderLeft:'3px solid #ef4444',borderRadius:8,padding:'12px 20px',fontSize:13,color:'#7f1d1d',display:'flex',gap:10,alignItems:'center',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {deleteError}
          <button onClick={() => setDeleteError('')} style={{background:'none',border:'none',cursor:'pointer',color:'#991b1b',fontWeight:700,fontSize:13}}>✕</button>
        </div>
      )}

      {/* Modals */}
      <ProductModal product={selected} onClose={() => setSelected(null)} onEdit={(p) => { setSelected(null); setEditTarget(p); }} />
      {addOpen       && <AddProductModal   onClose={() => setAddOpen(false)}    onAdd={handleAdd} />}
      {editTarget    && <EditProductModal  onClose={() => setEditTarget(null)}  product={editTarget} onUpdate={handleUpdate} />}
      {deleteTarget  && <DeleteConfirmModal product={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}

    </div>
  );
};

export default AdminProducts;
