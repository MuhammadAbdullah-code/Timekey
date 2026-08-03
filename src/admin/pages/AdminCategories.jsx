import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import categoryService from '../../services/categoryService';
import uploadService from '../../services/uploadService';
import './AdminCategories.css';

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const EMOJI_OPTIONS = [
  '👗','👜','🏠','✨','📱','💍','👟','🧴','🎒','🕶️',
  '🛋️','🧥','💄','⌚','🎨','📦','🌿','🍃','🔑','🧸',
];

const DEFAULT_EMOJI = '📦';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const ErrMsg = ({ msg }) => msg ? <p className="ac-field-err">{msg}</p> : null;

const ApiError = ({ msg }) =>
  msg ? (
    <div className="ac-api-error" role="alert">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </div>
  ) : null;

/* ─────────────────────────────────────────
   Add / Edit Category Modal
───────────────────────────────────────── */
const CategoryFormModal = ({ mode, initial, onClose, onSave }) => {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name:        initial?.name        || '',
    description: initial?.description || '',
    emoji:       initial?.emoji       || DEFAULT_EMOJI,
    imageUrl:    initial?.image_url   || '',
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [imgPreview,   setImgPreview]   = useState(initial?.image_url || '');
  const nameRef = useRef();
  const fileRef = useRef();

  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setImgPreview(blobUrl);
    setApiError('');
    setImgUploading(true);
    try {
      const cloudUrl = await uploadService.uploadImage(file);
      set('imageUrl', cloudUrl);
      setImgPreview(cloudUrl);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setApiError('Image upload failed: ' + err.message);
      setImgPreview('');
    } finally {
      setImgUploading(false);
    }
  };

  useEffect(() => { nameRef.current?.focus(); }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required.';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');

    try {
      // API only accepts { name, description } — emoji is frontend-only
      const apiPayload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        ...(form.imageUrl ? { image_url: form.imageUrl } : {}),
      };

      const result = isEdit
        ? await categoryService.updateCategory(initial.id, apiPayload)
        : await categoryService.createCategory(apiPayload);

      // Merge the API response with the local emoji for display
      onSave({ ...result, emoji: form.emoji });
      onClose();
    } catch (err) {
      setApiError(err.message || `Failed to ${isEdit ? 'update' : 'create'} category.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ac-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>

        <div className="ac-modal-header">
          <div>
            <p className="ac-modal-eyebrow">Categories</p>
            <h2 className="ac-modal-title">{isEdit ? 'Edit Category' : 'New Category'}</h2>
          </div>
          <button className="ac-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ac-modal-body">
          {/* Icon picker */}
          <div className="ac-field">
            <label className="ac-label">Icon</label>
            <div className="ac-emoji-row">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`ac-emoji-btn${form.emoji === e ? ' ac-emoji-btn--active' : ''}`}
                  onClick={() => set('emoji', e)}
                  aria-label={e}
                  aria-pressed={form.emoji === e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div className="ac-field">
            <label className="ac-label">Category Image <span style={{fontWeight:400,color:'#9CA3AF'}}>(optional)</span></label>
            <div
              className="ac-img-drop"
              onClick={() => !imgUploading && fileRef.current.click()}
              style={{ cursor: imgUploading ? 'wait' : 'pointer' }}
            >
              {imgUploading ? (
                <div className="ac-img-placeholder">
                  <span className="ac-spinner" />
                  <p>Uploading…</p>
                </div>
              ) : imgPreview ? (
                <img src={imgPreview} alt="Category preview" className="ac-img-preview"
                  onError={() => setImgPreview('')} />
              ) : (
                <div className="ac-img-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Click to upload</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
            </div>
            {imgPreview && !imgUploading && (
              <button type="button" className="ac-img-remove-btn"
                onClick={() => { setImgPreview(''); set('imageUrl', ''); }}>
                Remove image
              </button>
            )}
          </div>

          {/* Name */}
          <div className="ac-field">
            <label className="ac-label" htmlFor="ac-name">Category Name *</label>
            <input
              id="ac-name"
              ref={nameRef}
              className={`ac-input${errors.name ? ' error' : ''}`}
              placeholder="e.g. Apparel"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            />
            <ErrMsg msg={errors.name} />
          </div>

          {/* Description */}
          <div className="ac-field">
            <label className="ac-label" htmlFor="ac-desc">Description</label>
            <textarea
              id="ac-desc"
              className="ac-textarea"
              placeholder="Brief description of this category…"
              value={form.description}
              rows={3}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <ApiError msg={apiError} />
        </div>

        <div className="ac-modal-footer">
          <button className="ac-btn ac-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="ac-btn ac-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <><span className="ac-spinner" /> Saving…</>
              : isEdit ? 'Save Changes' : 'Create Category'
            }
          </button>
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────── */
const DeleteModal = ({ category, onClose, onDeleted }) => {
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  const handleDelete = async () => {
    setSubmitting(true);
    setApiError('');
    try {
      await categoryService.deleteCategory(category.id);
      onDeleted(category.id);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to delete category.');
      setSubmitting(false);
    }
  };

  return (
    <div className="ac-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ac-modal ac-modal--danger" onClick={e => e.stopPropagation()}>

        <div className="ac-modal-header">
          <div>
            <p className="ac-modal-eyebrow">Danger Zone</p>
            <h2 className="ac-modal-title">Delete Category</h2>
          </div>
          <button className="ac-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ac-confirm-body">
          <div className="ac-confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </div>
          <p className="ac-confirm-text">
            Are you sure you want to delete <strong>{category.emoji} {category.name}</strong>?
          </p>
          <p className="ac-confirm-warn">
            Products in this category will become uncategorised. This cannot be undone.
          </p>
          <ApiError msg={apiError} />
        </div>

        <div className="ac-modal-footer">
          <button className="ac-btn ac-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="ac-btn ac-btn--danger"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting
              ? <><span className="ac-spinner" /> Deleting…</>
              : 'Yes, Delete'
            }
          </button>
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const AdminCategories = () => {
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [search,      setSearch]      = useState('');

  /* modal state */
  const [addOpen,    setAddOpen]    = useState(false);
  const [editTarget, setEditTarget] = useState(null); // category to edit
  const [delTarget,  setDelTarget]  = useState(null); // category to delete

  /* ── Fetch ── */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await categoryService.getCategories();
      /* preserve local emoji field if re-fetching */
      setCategories(prev => {
        const emojiMap = Object.fromEntries(prev.map(c => [c.id, c.emoji]));
        return data.map(c => ({ ...c, emoji: emojiMap[c.id] || DEFAULT_EMOJI }));
      });
    } catch (err) {
      setFetchError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── CRUD callbacks ── */
  const handleSaved = (saved) => {
    setCategories(prev => {
      const exists = prev.find(c => c.id === saved.id);
      return exists
        ? prev.map(c => c.id === saved.id ? { ...c, ...saved } : c)
        : [{ ...saved }, ...prev];
    });
  };

  const handleDeleted = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() =>
    categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
    ),
  [categories, search]);

  /* ── Stats ── */
  const totalProducts = categories.reduce((s, c) => s + (c.product_count ?? 0), 0);

  return (
    <div className="ac-root">

      {/* ── Page header ── */}
      <div className="ac-header">
        <div>
          <h1 className="ac-title">Categories</h1>
          <p className="ac-sub">
            {loading ? 'Loading…' : `${categories.length} categories managing your product catalogue`}
          </p>
        </div>
        <button className="ac-add-btn" onClick={() => setAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Category
        </button>
      </div>

      {/* ── Stats ── */}
      {!loading && !fetchError && (
        <div className="ac-stats">
          <div className="ac-stat-card">
            <div className="ac-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <p className="ac-stat-val">{categories.length}</p>
              <p className="ac-stat-label">Total Categories</p>
            </div>
          </div>
          <div className="ac-stat-card">
            <div className="ac-stat-icon ac-stat-icon--accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div>
              <p className="ac-stat-val">{totalProducts}</p>
              <p className="ac-stat-label">Total Products</p>
            </div>
          </div>
          <div className="ac-stat-card">
            <div className="ac-stat-icon ac-stat-icon--green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p className="ac-stat-val">
                {categories.length > 0
                  ? Math.round(totalProducts / categories.length)
                  : 0}
              </p>
              <p className="ac-stat-label">Avg Products / Category</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Search toolbar ── */}
      <div className="ac-toolbar">
        <div className="ac-search-wrap">
          <svg className="ac-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="ac-search-input"
            placeholder="Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ac-search-clear" onClick={() => setSearch('')} aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        {!loading && (
          <p className="ac-results-label">
            Showing <strong>{filtered.length}</strong> of {categories.length}
          </p>
        )}
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="ac-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="ac-card" style={{ padding: 18, gap: 10, display: 'flex', flexDirection: 'column' }}>
              <div className="ac-skeleton" style={{ height: 44, width: 44, borderRadius: 10 }} />
              <div className="ac-skeleton" style={{ height: 16, width: '60%' }} />
              <div className="ac-skeleton" style={{ height: 12, width: '90%' }} />
              <div className="ac-skeleton" style={{ height: 12, width: '70%' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Fetch error ── */}
      {!loading && fetchError && (
        <div className="ac-fetch-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{fetchError}</span>
          <button className="ac-retry-btn" onClick={fetchCategories}>Retry</button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div className="ac-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <p>
            {categories.length === 0
              ? 'No categories yet. Create your first one.'
              : 'No categories match your search.'}
          </p>
        </div>
      )}

      {/* ── Category grid ── */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div className="ac-grid">
          {filtered.map(cat => (
            <div key={cat.id} className="ac-card">
              <div className="ac-card-header">
                <div className="ac-card-icon">{cat.emoji || DEFAULT_EMOJI}</div>
                <div className="ac-card-meta">
                  <p className="ac-card-name">{cat.name}</p>
                  <p className="ac-card-id">{cat.id}</p>
                </div>
              </div>

              <p className={`ac-card-desc${!cat.description ? ' ac-card-desc--empty' : ''}`}>
                {cat.description || 'No description provided.'}
              </p>

              <div className="ac-card-footer">
                <span className="ac-card-product-count">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  {cat.product_count ?? 0} product{(cat.product_count ?? 0) !== 1 ? 's' : ''}
                </span>

                <div className="ac-card-actions">
                  <button
                    className="ac-card-btn ac-card-btn--edit"
                    onClick={() => setEditTarget(cat)}
                    title="Edit category"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button
                    className="ac-card-btn ac-card-btn--delete"
                    onClick={() => setDelTarget(cat)}
                    title="Delete category"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {addOpen && (
        <CategoryFormModal
          mode="add"
          onClose={() => setAddOpen(false)}
          onSave={handleSaved}
        />
      )}

      {editTarget && (
        <CategoryFormModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaved}
        />
      )}

      {delTarget && (
        <DeleteModal
          category={delTarget}
          onClose={() => setDelTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

    </div>
  );
};

export default AdminCategories;
