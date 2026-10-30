import { createSlice } from '@reduxjs/toolkit';

const savedItems = localStorage.getItem('cart_items');
const initialState = {
  items: savedItems ? JSON.parse(savedItems) : [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find((i) => i.id === action.payload.id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },

    decreaseQty: (state, action) => {
      const existingItem = state.items.find((i) => i.id === action.payload);
      if (existingItem) {
        existingItem.qty -= 1;
        if (existingItem.qty <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }
    },

    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, decreaseQty, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;