import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getProductImage } from '../../lib/productImage.js';

const STORAGE_KEY = 'luxecart_cart';
const WISHLIST_KEY = 'luxecart_wishlist';

// Safe localStorage helpers
const loadFromStorage = (key, fallback) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initial state
const initialState = {
  items: loadFromStorage(STORAGE_KEY, []),
  appliedCoupon: loadFromStorage('luxecart_coupon', null),
  shippingMethod: 'standard',
  giftMessage: '',
  isGift: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ✅ Add item to cart
    addToCart: (state, action) => {
      const { product, quantity = 1, variant = null } = action.payload;
      const itemId = variant ? `${product._id}-${variant}` : product._id;

      const existingItem = state.items.find((item) => item.itemId === itemId);

      // Calculate price (use finalPrice if available, otherwise price)
      const itemPrice = product.finalPrice ?? product.price;

      if (existingItem) {
        // Update quantity but respect stock limit
        const newQty = existingItem.quantity + quantity;
        existingItem.quantity = Math.min(newQty, product.stock);
        existingItem.updatedAt = new Date().toISOString();
      } else {
        // Add new item
        state.items.push({
          itemId,
          product: product._id,
          title: product.title,
          price: itemPrice,
          originalPrice: product.price,
          image: getProductImage(product),
          stock: product.stock,
          brand: product.brand,
          quantity: Math.min(quantity, product.stock),
          variant,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      saveToStorage(STORAGE_KEY, state.items);
    },

    // ✅ Update item quantity
    updateQuantity: (state, action) => {
      const { productId, quantity, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      const item = state.items.find((i) => i.itemId === itemId);

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter((i) => i.itemId !== itemId);
        } else {
          // Respect stock limit
          item.quantity = Math.min(quantity, item.stock);
          item.updatedAt = new Date().toISOString();
        }
      }

      saveToStorage(STORAGE_KEY, state.items);
    },

    // ✅ Increment quantity
    incrementQuantity: (state, action) => {
      const { productId, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      const item = state.items.find((i) => i.itemId === itemId);

      if (item && item.quantity < item.stock) {
        item.quantity += 1;
        item.updatedAt = new Date().toISOString();
      }

      saveToStorage(STORAGE_KEY, state.items);
    },

    // ✅ Decrement quantity
    decrementQuantity: (state, action) => {
      const { productId, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      const item = state.items.find((i) => i.itemId === itemId);

      if (item) {
        if (item.quantity <= 1) {
          state.items = state.items.filter((i) => i.itemId !== itemId);
        } else {
          item.quantity -= 1;
          item.updatedAt = new Date().toISOString();
        }
      }

      saveToStorage(STORAGE_KEY, state.items);
    },

    // ✅ Remove item from cart
    removeFromCart: (state, action) => {
      const { productId, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      state.items = state.items.filter((i) => i.itemId !== itemId);
      saveToStorage(STORAGE_KEY, state.items);
    },

    // ✅ Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      state.giftMessage = '';
      state.isGift = false;
      saveToStorage(STORAGE_KEY, state.items);
      saveToStorage('luxecart_coupon', null);
    },

    // ✅ Apply coupon
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      saveToStorage('luxecart_coupon', action.payload);
    },

    // ✅ Remove coupon
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      saveToStorage('luxecart_coupon', null);
    },

    // ✅ Set shipping method
    setShippingMethod: (state, action) => {
      state.shippingMethod = action.payload;
    },

    // ✅ Toggle gift wrapping
    toggleGift: (state) => {
      state.isGift = !state.isGift;
    },

    // ✅ Set gift message
    setGiftMessage: (state, action) => {
      state.giftMessage = action.payload;
    },

    // ✅ Move item to wishlist (requires wishlist action)
    moveToWishlist: (state, action) => {
      const { productId, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      const item = state.items.find((i) => i.itemId === itemId);

      if (item) {
        // Remove from cart
        state.items = state.items.filter((i) => i.itemId !== itemId);
        saveToStorage(STORAGE_KEY, state.items);

        // Add to wishlist
        const wishlist = loadFromStorage(WISHLIST_KEY, []);
        if (!wishlist.includes(productId)) {
          wishlist.push(productId);
          saveToStorage(WISHLIST_KEY, wishlist);
        }
      }
    },

    // ✅ Save for later
    saveForLater: (state, action) => {
      const { productId, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      const item = state.items.find((i) => i.itemId === itemId);

      if (item) {
        state.items = state.items.filter((i) => i.itemId !== itemId);
        saveToStorage(STORAGE_KEY, state.items);

        // Store in saved items list
        const savedItems = loadFromStorage('luxecart_saved', []);
        if (!savedItems.find((i) => i.itemId === itemId)) {
          savedItems.push(item);
          saveToStorage('luxecart_saved', savedItems);
        }
      }
    },

    // ✅ Restore from saved
    restoreFromSaved: (state, action) => {
      const itemId = action.payload;
      const savedItems = loadFromStorage('luxecart_saved', []);
      const item = savedItems.find((i) => i.itemId === itemId);

      if (item && !state.items.find((i) => i.itemId === itemId)) {
        state.items.push(item);
        const updated = savedItems.filter((i) => i.itemId !== itemId);
        saveToStorage('luxecart_saved', updated);
        saveToStorage(STORAGE_KEY, state.items);
      }
    },

    // ✅ Sync cart with backend (when user logs in)
    syncCart: (state, action) => {
      const serverCart = action.payload || [];
      const localCart = state.items;

      // Merge strategy: combine quantities, prefer local for newly added items
      const merged = [...localCart];

      serverCart.forEach((serverItem) => {
        const localItem = merged.find((i) => i.itemId === serverItem.itemId);
        if (!localItem) {
          merged.push(serverItem);
        }
      });

      state.items = merged;
      saveToStorage(STORAGE_KEY, state.items);
    },

    // ✅ Update item price (if backend price differs)
    updateItemPrice: (state, action) => {
      const { productId, price, variant = null } = action.payload;
      const itemId = variant ? `${productId}-${variant}` : productId;
      const item = state.items.find((i) => i.itemId === itemId);

      if (item && item.price !== price) {
        item.price = price;
        item.updatedAt = new Date().toISOString();
      }

      saveToStorage(STORAGE_KEY, state.items);
    },
  },
});

// Export actions
export const {
  addToCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  setShippingMethod,
  toggleGift,
  setGiftMessage,
  moveToWishlist,
  saveForLater,
  restoreFromSaved,
  syncCart,
  updateItemPrice,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

// Basic selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCoupon = (state) => state.cart.appliedCoupon;
export const selectShippingMethod = (state) => state.cart.shippingMethod;
export const selectIsGift = (state) => state.cart.isGift;
export const selectGiftMessage = (state) => state.cart.giftMessage;

// Memoized selectors using createSelector
export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectCartSavings = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => {
    const saved = (item.originalPrice || item.price) - item.price;
    return total + saved * item.quantity;
  }, 0)
);

export const selectCartWeight = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + (item.weight || 0) * item.quantity, 0)
);

export const selectIsInCart = (productId) =>
  createSelector([selectCartItems], (items) =>
    items.some((item) => item.product === productId)
  );

export const selectItemQuantity = (productId) =>
  createSelector([selectCartItems], (items) => {
    const item = items.find((i) => i.product === productId);
    return item ? item.quantity : 0;
  });

// Advanced selectors with calculations
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING = 10;
const EXPRESS_SHIPPING = 25;

const SHIPPING_COSTS = {
  standard: STANDARD_SHIPPING,
  express: EXPRESS_SHIPPING,
  overnight: 45,
  pickup: 0,
};

export const selectShippingCost = createSelector(
  [selectCartSubtotal, selectShippingMethod],
  (subtotal, method) => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_COSTS[method] ?? STANDARD_SHIPPING;
  }
);

export const selectDiscountAmount = createSelector(
  [selectCartSubtotal, selectCartCoupon],
  (subtotal, coupon) => {
    if (!coupon) return 0;
    let discount =
      coupon.type === 'percentage'
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    return Math.round(discount * 100) / 100;
  }
);

export const selectTaxAmount = createSelector(
  [selectCartSubtotal, selectDiscountAmount],
  (subtotal, discount) => {
    const taxable = Math.max(0, subtotal - discount);
    return Math.round(taxable * TAX_RATE * 100) / 100;
  }
);

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectDiscountAmount, selectTaxAmount, selectShippingCost, selectIsGift],
  (subtotal, discount, tax, shipping, isGift) => {
    const giftFee = isGift ? 5 : 0;
    return Math.max(0, subtotal - discount + tax + shipping + giftFee);
  }
);

export const selectCartSummary = createSelector(
  [
    selectCartItems,
    selectCartSubtotal,
    selectCartCount,
    selectDiscountAmount,
    selectTaxAmount,
    selectShippingCost,
    selectCartTotal,
    selectCartCoupon,
    selectIsGift,
  ],
  (items, subtotal, count, discount, tax, shipping, total, coupon, isGift) => ({
    items,
    subtotal,
    count,
    discount,
    tax,
    shipping,
    total,
    coupon,
    isGift,
    giftFee: isGift ? 5 : 0,
  })
);

// Validation selectors
export const selectCartIssues = createSelector([selectCartItems], (items) => {
  const issues = [];
  items.forEach((item) => {
    if (item.quantity > item.stock) {
      issues.push({
        type: 'insufficient_stock',
        itemId: item.itemId,
        title: item.title,
        message: `Only ${item.stock} available for ${item.title}`,
      });
    }
  });
  return issues;
});

export const selectHasIssues = createSelector(
  [selectCartIssues],
  (issues) => issues.length > 0
);
