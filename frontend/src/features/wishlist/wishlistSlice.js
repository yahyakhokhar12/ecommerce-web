import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'wishlist';
const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: load() },
  reducers: {
    addToWishlist: (state, action) => {
      const id = action.payload;
      if (!state.items.includes(id)) state.items.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i !== action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.setItem(STORAGE_KEY, '[]');
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = slice.actions;
export default slice.reducer;
export const selectWishlistItems = (s) => s.wishlist.items;
export const selectWishlistCount = (s) => s.wishlist.items.length;
