import { createSlice } from '@reduxjs/toolkit';

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const initialState = {
  items: loadFromStorage('cart_items', []),
  wishlist: loadFromStorage('wishlist_items', [1, 3]),
  orders: loadFromStorage('order_history', []),
  appliedVoucher: null,
  toast: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const payload = action.payload;
      const qtyToAdd = payload.addQty || 1;
      const existingItem = state.items.find((i) => i.id === payload.id);
      if (existingItem) {
        existingItem.qty += qtyToAdd;
        if (payload.selectedColor) {
          existingItem.selectedColor = payload.selectedColor;
        }
      } else {
        const { addQty, ...rest } = payload;
        state.items.push({
          ...rest,
          qty: qtyToAdd,
          selectedColor: payload.selectedColor || (payload.colors ? payload.colors[0] : 'Tiêu chuẩn'),
        });
      }
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: `Đã thêm "${payload.name}" vào giỏ hàng!`,
      };
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
      const target = state.items.find((i) => i.id === action.payload);
      state.items = state.items.filter((i) => i.id !== action.payload);
      if (target) {
        state.toast = {
          id: Date.now(),
          type: 'info',
          message: `Đã xoá "${target.name}" khỏi giỏ hàng`,
        };
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.appliedVoucher = null;
      state.toast = {
        id: Date.now(),
        type: 'info',
        message: 'Đã làm trống giỏ hàng',
      };
    },

    toggleWishlist: (state, action) => {
      const productId = action.payload;
      const idx = state.wishlist.indexOf(productId);
      if (idx >= 0) {
        state.wishlist.splice(idx, 1);
        state.toast = {
          id: Date.now(),
          type: 'info',
          message: 'Đã bỏ khỏi danh sách yêu thích',
        };
      } else {
        state.wishlist.push(productId);
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: '❤️ Đã lưu vào danh sách yêu thích!',
        };
      }
    },

    applyVoucher: (state, action) => {
      state.appliedVoucher = action.payload;
      if (action.payload) {
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🎉 Áp dụng mã "${action.payload}" thành công!`,
        };
      }
    },

    removeVoucher: (state) => {
      state.appliedVoucher = null;
    },

    placeOrder: (state, action) => {
      const newOrder = {
        id: `PTIT-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toLocaleString('vi-VN'),
        items: [...state.items],
        ...action.payload,
      };
      state.orders.unshift(newOrder);
      state.items = [];
      state.appliedVoucher = null;
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: `🎊 Đặt hàng thành công! Mã đơn: ${newOrder.id}`,
      };
    },

    showToast: (state, action) => {
      state.toast = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
      };
    },

    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  addItem,
  decreaseQty,
  removeItem,
  clearCart,
  toggleWishlist,
  applyVoucher,
  removeVoucher,
  placeOrder,
  showToast,
  clearToast,
} = cartSlice.actions;

export default cartSlice.reducer;
