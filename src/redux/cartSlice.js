import { createSlice } from '@reduxjs/toolkit';
import { defaultReviews } from '../data';

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const defaultProfile = {
  name: 'Nguyễn Tiến Đức',
  studentId: 'B22DCCN123',
  email: 'duc.nt.ptit@stu.ptit.edu.vn',
  phone: '0988 123 456',
  avatar: '👨‍💻',
  addresses: [
    {
      id: 'addr-1',
      label: 'Ký túc xá PTIT',
      recipient: 'Nguyễn Tiến Đức',
      phone: '0988 123 456',
      detail: 'Tòa B5, Học viện Công nghệ Bưu chính Viễn thông (PTIT), Hà Đông, Hà Nội',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Văn phòng thực tập',
      recipient: 'Nguyễn Tiến Đức',
      phone: '0988 123 456',
      detail: 'Tầng 12, Tòa nhà Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
      isDefault: false,
    },
  ],
};

const initialState = {
  items: loadFromStorage('cart_items', []),
  wishlist: loadFromStorage('wishlist_items', [1, 3, 11]),
  recentlyViewed: loadFromStorage('recently_viewed', [1, 4, 2]),
  orders: loadFromStorage('order_history', []),
  appliedVoucher: null,
  savedVouchers: loadFromStorage('saved_vouchers', ['PTIT20', 'GIAM50K']),
  ptitCoins: loadFromStorage('ptit_coins', 35000),
  useCoinsInCart: false,
  checkinDays: loadFromStorage('checkin_days', [1, 2]),
  spinCount: loadFromStorage('spin_count', 3),
  userProfile: loadFromStorage('user_profile', defaultProfile),
  productReviews: loadFromStorage('product_reviews', defaultReviews),
  savedPosts: loadFromStorage('saved_posts', [101]),
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
          selectedColor:
            payload.selectedColor || (payload.colors ? payload.colors[0] : 'Tiêu chuẩn'),
        });
      }
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: `Đã thêm "${payload.name}" vào giỏ hàng!`,
      };
    },

    addMultipleItems: (state, action) => {
      const { productsToAdd = [], label = 'Combo sản phẩm' } = action.payload;
      productsToAdd.forEach((prod) => {
        const qtyToAdd = prod.qty || 1;
        const existingItem = state.items.find((i) => i.id === prod.id);
        if (existingItem) {
          existingItem.qty += qtyToAdd;
        } else {
          state.items.push({
            ...prod,
            qty: qtyToAdd,
            selectedColor:
              prod.selectedColor || (prod.colors ? prod.colors[0] : 'Tiêu chuẩn'),
          });
        }
      });
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: `🚀 Đã thêm trọn bộ "${label}" (${productsToAdd.length} món) vào giỏ hàng!`,
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
      state.useCoinsInCart = false;
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

    addRecentlyViewed: (state, action) => {
      const productId = action.payload;
      state.recentlyViewed = [
        productId,
        ...state.recentlyViewed.filter((id) => id !== productId),
      ].slice(0, 8);
    },

    applyVoucher: (state, action) => {
      state.appliedVoucher = action.payload;
      if (action.payload) {
        if (!state.savedVouchers.includes(action.payload)) {
          state.savedVouchers.push(action.payload);
        }
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🎉 Áp dụng mã "${action.payload}" thành công!`,
        };
      }
    },

    saveVoucherToWallet: (state, action) => {
      const code = action.payload;
      if (!state.savedVouchers.includes(code)) {
        state.savedVouchers.push(code);
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🎟️ Đã lưu mã "${code}" vào Kho Voucher cá nhân!`,
        };
      } else {
        state.appliedVoucher = code;
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🎉 Đã kích hoạt mã "${code}" cho giỏ hàng!`,
        };
      }
    },

    removeVoucher: (state) => {
      state.appliedVoucher = null;
    },

    toggleUseCoins: (state) => {
      state.useCoinsInCart = !state.useCoinsInCart;
    },

    claimDailyCheckin: (state, action) => {
      const { day, reward } = action.payload;
      if (!state.checkinDays.includes(day)) {
        state.checkinDays.push(day);
        state.ptitCoins += reward;
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🪙 Điểm danh Ngày ${day} thành công! +${reward.toLocaleString()} PTIT Xu`,
        };
      }
    },

    rewardFromSpin: (state, action) => {
      if (state.spinCount <= 0) return;
      state.spinCount -= 1;
      const { type, value, code, label } = action.payload;
      if (type === 'coins') {
        state.ptitCoins += value;
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🎰 Chúc mừng! Bạn quay trúng ${label} (+${value.toLocaleString()} Xu)!`,
        };
      } else if (type === 'voucher' && code) {
        if (!state.savedVouchers.includes(code)) {
          state.savedVouchers.push(code);
        }
        state.appliedVoucher = code;
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: `🎰 Tuyệt vời! Bạn trúng mã ${code} (${label}) và đã tự động áp dụng!`,
        };
      }
    },

    placeOrder: (state, action) => {
      const payload = action.payload;
      const coinsUsed = payload.coinsUsed || 0;
      const cashbackCoins = Math.round((payload.finalTotal || 0) * 0.03);

      const newOrder = {
        id: payload.id || `PTIT-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: payload.createdAt || new Date().toLocaleString('vi-VN'),
        items: [...state.items],
        status: 'processing',
        step: 1,
        coinsUsed,
        cashbackCoins,
        ...payload,
      };

      state.orders.unshift(newOrder);
      state.items = [];
      state.appliedVoucher = null;
      state.useCoinsInCart = false;
      state.ptitCoins = Math.max(0, state.ptitCoins - coinsUsed) + cashbackCoins;
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: `🎊 Đặt hàng thành công! Mã đơn: ${newOrder.id} (+${cashbackCoins.toLocaleString()} Xu hoàn tiền)`,
      };
    },

    advanceOrderStatus: (state, action) => {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order && order.status !== 'cancelled') {
        const currentStep = order.step || 1;
        if (currentStep < 4) {
          order.step = currentStep + 1;
          if (order.step === 2) order.status = 'packing';
          if (order.step === 3) order.status = 'shipping';
          if (order.step === 4) order.status = 'delivered';
          state.toast = {
            id: Date.now(),
            type: 'info',
            message: `🚚 Đã cập nhật tiến độ đơn hàng ${orderId}!`,
          };
        }
      }
    },

    cancelOrder: (state, action) => {
      const orderId = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order && (order.step || 1) < 3 && order.status !== 'cancelled') {
        order.status = 'cancelled';
        if (order.coinsUsed) {
          state.ptitCoins += order.coinsUsed;
        }
        state.toast = {
          id: Date.now(),
          type: 'info',
          message: `Đã hủy đơn hàng ${orderId} và hoàn lại Xu (nếu có).`,
        };
      }
    },

    addProductReview: (state, action) => {
      const { productId, review } = action.payload;
      if (!state.productReviews[productId]) {
        state.productReviews[productId] = [];
      }
      state.productReviews[productId].unshift({
        id: `rev-${Date.now()}`,
        date: new Date().toLocaleDateString('vi-VN'),
        ...review,
      });
      state.ptitCoins += 5000;
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: '⭐ Cảm ơn bạn đã đánh giá! Tặng ngay +5.000 PTIT Xu!',
      };
    },

    updateUserProfile: (state, action) => {
      state.userProfile = {
        ...state.userProfile,
        ...action.payload,
      };
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: '✓ Đã lưu thông tin hồ sơ thành viên!',
      };
    },

    addAddress: (state, action) => {
      const newAddr = {
        id: `addr-${Date.now()}`,
        ...action.payload,
      };
      if (newAddr.isDefault) {
        state.userProfile.addresses.forEach((a) => {
          a.isDefault = false;
        });
      }
      state.userProfile.addresses.push(newAddr);
      state.toast = {
        id: Date.now(),
        type: 'success',
        message: '📍 Đã thêm địa chỉ nhận hàng mới!',
      };
    },

    removeAddress: (state, action) => {
      state.userProfile.addresses = state.userProfile.addresses.filter(
        (a) => a.id !== action.payload
      );
    },

    setDefaultAddress: (state, action) => {
      state.userProfile.addresses.forEach((a) => {
        a.isDefault = a.id === action.payload;
      });
      state.toast = {
        id: Date.now(),
        type: 'info',
        message: '📍 Đã đặt làm địa chỉ mặc định khi thanh toán',
      };
    },

    toggleSavedPost: (state, action) => {
      const postId = action.payload;
      const idx = state.savedPosts.indexOf(postId);
      if (idx >= 0) {
        state.savedPosts.splice(idx, 1);
        state.toast = {
          id: Date.now(),
          type: 'info',
          message: 'Đã bỏ lưu bài viết',
        };
      } else {
        state.savedPosts.push(postId);
        state.toast = {
          id: Date.now(),
          type: 'success',
          message: '🔖 Đã lưu bài viết vào cẩm nang cá nhân!',
        };
      }
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
  addMultipleItems,
  decreaseQty,
  removeItem,
  clearCart,
  toggleWishlist,
  addRecentlyViewed,
  applyVoucher,
  saveVoucherToWallet,
  removeVoucher,
  toggleUseCoins,
  claimDailyCheckin,
  rewardFromSpin,
  placeOrder,
  advanceOrderStatus,
  cancelOrder,
  addProductReview,
  updateUserProfile,
  addAddress,
  removeAddress,
  setDefaultAddress,
  toggleSavedPost,
  showToast,
  clearToast,
} = cartSlice.actions;

export default cartSlice.reducer;
