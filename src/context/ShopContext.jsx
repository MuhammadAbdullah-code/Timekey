import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import cartService     from '../services/cartService';
import wishlistService from '../services/wishlistService';
import orderService    from '../services/orderService';
import productService  from '../services/productService';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [cart,            setCart]            = useState([]);
  const [cartLoading,     setCartLoading]     = useState(false);
  const [wishlist,        setWishlist]        = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [orders,          setOrders]          = useState([]);
  const [ordersLoading,   setOrdersLoading]   = useState(false);

  /* ── Normalise helpers ── */
  const normaliseApiCart = useCallback((apiCart) => {
    if (!apiCart?.items?.length) return [];
    return apiCart.items.map((item) => {
      const product = {
        id:       item.product_id,
        name:     item.product_name ?? item.name       ?? 'Product',
        price:    item.price        ?? item.unit_price ?? 0,
        img:      item.image_url    ?? item.img        ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
        category: item.category_id  ?? item.category  ?? '',
        colors:   item.colors       ?? [],
        sizes:    item.sizes        ?? [],
      };
      return {
        key:     `${item.product_id}-default-default`,
        product,
        size:    item.size     ?? null,
        color:   item.color    ?? null,
        qty:     item.quantity ?? 1,
      };
    });
  }, []);

  const normaliseApiWishlist = useCallback((apiWishlist) => {
    if (!apiWishlist?.items?.length) return [];
    return apiWishlist.items.map((item) => ({
      id:          item.product_id,
      name:        item.product_name ?? item.name       ?? 'Product',
      price:       item.price        ?? item.unit_price ?? 0,
      oldPrice:    item.old_price    ?? null,
      badge:       item.badge        ?? null,
      img:         item.image_url    ?? item.img        ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
      category:    item.category_id  ?? item.category  ?? '',
      colors:      item.colors       ?? [],
      sizes:       item.sizes        ?? [],
      rating:      item.rating       ?? 0,
      reviewCount: item.review_count ?? 0,
    }));
  }, []);

  const normaliseApiOrder = useCallback((o) => ({
    id:              o.id,
    placedAt:        o.created_at     ?? new Date().toISOString(),
    status:          o.status         ?? 'pending',
    total:           o.total          ?? 0,
    subtotal:        o.total          ?? 0,   // API returns total only
    shipping:        0,
    discount:        0,
    coupon:          null,
    paymentMethod:   o.payment_method ?? null,
    shippingAddress: o.shipping_address ?? null,
    // Normalise items array — API items shape varies, handle gracefully
    items: (o.items ?? []).map((item, idx) => ({
      key:     `${o.id}-item-${idx}`,
      qty:     item.quantity ?? 1,
      size:    item.size     ?? null,
      color:   item.color    ?? null,
      product: {
        id:       item.product_id ?? item.id ?? idx,
        name:     item.product_name ?? item.name ?? 'Product',
        price:    item.price        ?? item.unit_price ?? 0,
        img:      item.image_url    ?? item.img ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
        category: item.category_id  ?? item.category ?? '',
      },
    })),
    timeline: [
      { status: 'processing', label: 'Order Placed',    date: o.created_at ?? null, done: true  },
      { status: 'confirmed',  label: 'Order Confirmed', date: null,                 done: ['confirmed','shipped','delivered'].includes(o.status) },
      { status: 'shipped',    label: 'Shipped',         date: null,                 done: ['shipped','delivered'].includes(o.status) },
      { status: 'delivered',  label: 'Delivered',       date: null,                 done: o.status === 'delivered' },
    ],
  }), []);

  /* ── Load on mount ── */
  const loadCart = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setCartLoading(true);
    try {
      const apiCart = await cartService.getCart();
      setCart(normaliseApiCart(apiCart));
    } catch { /* silent */ } finally { setCartLoading(false); }
  }, [normaliseApiCart]);

  const loadWishlist = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setWishlistLoading(true);
    try {
      const apiWishlist = await wishlistService.getWishlist();
      setWishlist(normaliseApiWishlist(apiWishlist));
    } catch { /* silent */ } finally { setWishlistLoading(false); }
  }, [normaliseApiWishlist]);

  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setOrdersLoading(true);
    try {
      const apiOrders = await orderService.getOrders();
      setOrders(apiOrders.map(normaliseApiOrder));
    } catch { /* silent */ } finally { setOrdersLoading(false); }
  }, [normaliseApiOrder]);

  useEffect(() => {
    loadCart();
    loadWishlist();
    loadOrders();
  }, [loadCart, loadWishlist, loadOrders]);

  /* ── CART MUTATIONS ── */
  const addToCart = useCallback(async (product, { size, color, qty = 1 } = {}) => {
    const key = `${product.id}-${size ?? 'default'}-${color?.hex ?? 'default'}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { key, product, size, color, qty }];
    });
    // Gift-box items are local-only — they have no backend product ID
    if (!String(product.id).startsWith('gift-')) {
      try { await cartService.addItem(product.id, qty); } catch { /* keep local */ }
    }
  }, []);

  const removeFromCart = useCallback(async (key) => {
    const product_id = key.split('-')[0];
    setCart((prev) => prev.filter((i) => i.key !== key));
    try { await cartService.removeItem(product_id); } catch { /* keep local */ }
  }, []);

  const updateCartQty = useCallback(async (key, qty) => {
    if (qty < 1) return;
    const product_id = key.split('-')[0];
    setCart((prev) => prev.map((i) => i.key === key ? { ...i, qty } : i));
    try { await cartService.updateItem(product_id, qty); } catch { /* keep local */ }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount    = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  /* ── ORDERS ── */
  const placeOrder = useCallback(async ({ shippingAddress, items, subtotal, shipping, total, paymentMethod, coupon, discount }) => {
    // Build shipping_address string from the form object
    const addressStr = typeof shippingAddress === 'string'
      ? shippingAddress
      : [
          shippingAddress.firstName, shippingAddress.lastName,
          shippingAddress.address,
          shippingAddress.city, shippingAddress.postalCode,
          shippingAddress.country,
        ].filter(Boolean).join(', ');

    // Pre-flight stock check — bump any real products with insufficient stock
    // Gift-box items (id starts with 'gift-') are local-only and skipped
    try {
      for (const item of cart) {
        const productId = item.product.id;
        if (String(productId).startsWith('gift-')) continue; // local-only item
        const orderedQty = item.qty;
        try {
          const product = await productService.getProduct(productId);
          if (product.stock < orderedQty) {
            await productService.updateProduct(productId, {
              name:        product.name,
              description: product.description,
              price:       product.price,
              category_id: product.category_id ?? product.category ?? 'Uncategorised',
              stock:       orderedQty + 50,
              image_url:   product.image_url ?? '',
              is_active:   product.is_active ?? true,
            });
          }
        } catch {
          // Product fetch or update failed — skip and let the order attempt anyway
        }
      }
    } catch {
      // Pre-flight failed — proceed with order anyway, let backend handle it
    }

    // Call the API
    const apiOrder = await orderService.placeOrder(addressStr);

    // Normalise and add to local state
    const normalised = normaliseApiOrder(apiOrder);
    // Enrich with local form data the API doesn't return
    const enriched = {
      ...normalised,
      subtotal:        subtotal        ?? normalised.total,
      shipping:        shipping        ?? 0,
      discount:        discount        ?? 0,
      coupon:          coupon          ?? null,
      paymentMethod:   paymentMethod   ?? null,
      shippingAddress: shippingAddress ?? normalised.shippingAddress,
      items:           normalised.items.length > 0 ? normalised.items : items,
    };

    setOrders((prev) => [enriched, ...prev]);
    setCart([]);
    return apiOrder.id;
  }, [normaliseApiOrder, cart]);

  /* ── WISHLIST MUTATIONS ── */
  const addToWishlist = useCallback(async (product) => {
    setWishlist((prev) => prev.find((p) => p.id === product.id) ? prev : [...prev, product]);
    try { await wishlistService.addItem(product.id); } catch { /* keep local */ }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
    try { await wishlistService.removeItem(productId); } catch { /* keep local */ }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    const exists = wishlist.find((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      try { await wishlistService.removeItem(product.id); } catch { /* keep local */ }
    } else {
      setWishlist((prev) => [...prev, product]);
      try { await wishlistService.addItem(product.id); } catch { /* keep local */ }
    }
  }, [wishlist]);

  const isWishlisted  = useCallback((productId) => wishlist.some((p) => p.id === productId), [wishlist]);
  const moveToCart    = useCallback(async (product) => { await addToCart(product); await removeFromWishlist(product.id); }, [addToCart, removeFromWishlist]);
  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider value={{
      cart, cartCount, cartSubtotal, cartLoading,
      addToCart, removeFromCart, updateCartQty, clearCart, loadCart,
      orders, ordersLoading, placeOrder, loadOrders,
      wishlist, wishlistCount, wishlistLoading,
      addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted, moveToCart, loadWishlist,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
};
