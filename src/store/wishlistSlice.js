import { createSlice } from '@reduxjs/toolkit';

// Persist wishlist in localStorage
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem('wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem('wishlist', JSON.stringify(items));
  } catch {}
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadFromStorage(),
  },
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.items.some(i => i._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
        saveToStorage(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      saveToStorage(state.items);
    },
    toggleWishlist: (state, action) => {
      const idx = state.items.findIndex(i => i._id === action.payload._id);
      if (idx === -1) {
        state.items.push(action.payload);
      } else {
        state.items.splice(idx, 1);
      }
      saveToStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveToStorage([]);
    },
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
