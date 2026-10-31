import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

store.subscribe(() => {
  try {
    const state = store.getState().cart;
    localStorage.setItem('cart_items', JSON.stringify(state.items));
    localStorage.setItem('wishlist_items', JSON.stringify(state.wishlist));
    localStorage.setItem('order_history', JSON.stringify(state.orders));
  } catch {
    // ignore storage errors
  }
});
