import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

store.subscribe(() => {
  const items = store.getState().cart.items;
  localStorage.setItem('cart_items', JSON.stringify(items));
});