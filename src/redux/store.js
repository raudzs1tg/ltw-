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
    localStorage.setItem('recently_viewed', JSON.stringify(state.recentlyViewed));
    localStorage.setItem('order_history', JSON.stringify(state.orders));
    localStorage.setItem('saved_vouchers', JSON.stringify(state.savedVouchers));
    localStorage.setItem('ptit_coins', JSON.stringify(state.ptitCoins));
    localStorage.setItem('checkin_days', JSON.stringify(state.checkinDays));
    localStorage.setItem('spin_count', JSON.stringify(state.spinCount));
    localStorage.setItem('user_profile', JSON.stringify(state.userProfile));
    localStorage.setItem('product_reviews', JSON.stringify(state.productReviews));
    localStorage.setItem('saved_posts', JSON.stringify(state.savedPosts));
  } catch {
    // ignore storage errors
  }
});
