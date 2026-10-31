import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateUserProfile,
  addAddress,
  removeAddress,
  setDefaultAddress,
  addItem,
  toggleWishlist,
  applyVoucher,
} from '../redux/cartSlice';
import { products, vouchers } from '../data';

export default function ProfilePage({ onNavigate }) {
  const dispatch = useDispatch();
  const userProfile = useSelector((s) => s.cart.userProfile || {});
  const ptitCoins = useSelector((s) => s.cart.ptitCoins || 0);
  const orders = useSelector((s) => s.cart.orders || []);
  const wishlist = useSelector((s) => s.cart.wishlist || []);
  const savedVouchers = useSelector((s) => s.cart.savedVouchers || []);

  const [formState, setFormState] = useState({
    name: userProfile.name || 'Nguyễn Tiến Đức',
    studentId: userProfile.studentId || 'B22DCCN123',
    email: userProfile.email || 'duc.nt.ptit@stu.ptit.edu.vn',
    phone: userProfile.phone || '0988 123 456',
  });

  const [newAddr, setNewAddr] = useState({
    label: '',
    recipient: userProfile.name || 'Nguyễn Tiến Đức',
    phone: userProfile.phone || '0988 123 456',
    detail: '',
    isDefault: false,
  });

  // Tính tổng chi tiêu & hạng thẻ
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  const memberTier =
    totalSpent >= 5000000 || ptitCoins >= 80000
      ? { name: '💎 PTIT DIAMOND VIP', next: 'Đã đạt hạng cao nhất', progress: 100 }
      : totalSpent >= 1500000 || ptitCoins >= 40000
      ? { name: '🥇 PTIT GOLD MEMBER', next: 'Còn thiếu một chút lên Diamond', progress: 72 }
      : { name: '🥈 PTIT SILVER MEMBER', next: 'Mua sắm để nâng hạng Gold', progress: 45 };

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));
  const myVouchers = vouchers.filter((v) => savedVouchers.includes(v.code));

  const handleProfileSave = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formState));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.label.trim() || !newAddr.detail.trim()) return;
    dispatch(addAddress(newAddr));
    setNewAddr({
      label: '',
      recipient: formState.name,
      phone: formState.phone,
      detail: '',
      isDefault: false,
    });
  };

  return (
    <div className="page-container">
      {/* Thẻ Thành Viên VIP */}
      <div className="page-hero-card profile-hero">
        <div className="profile-hero-left">
          <div className="profile-avatar-circle">{userProfile.avatar || '👨‍💻'}</div>
          <div>
            <span className="page-hero-pill">{memberTier.name}</span>
            <h1>{userProfile.name}</h1>
            <p>
              Mã SV / Thành viên: <strong>{userProfile.studentId}</strong> •{' '}
              {userProfile.email}
            </p>
            <div className="tier-progress-wrap">
              <div className="tier-bar">
                <div className="tier-fill" style={{ width: `${memberTier.progress}%` }} />
              </div>
              <small>{memberTier.next} • Đặc quyền hoàn xu 3% mọi đơn hàng</small>
            </div>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <span>Ví PTIT Xu</span>
            <strong>🪙 {ptitCoins.toLocaleString()}</strong>
          </div>
          <div className="profile-stat-box">
            <span>Đơn đã mua</span>
            <strong>📦 {orders.length} đơn</strong>
          </div>
          <div className="profile-stat-box">
            <span>Tổng chi tiêu</span>
            <strong>{(totalSpent / 1000).toLocaleString('vi-VN')}K đ</strong>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Cột trái: Thông tin cá nhân & Sổ địa chỉ */}
        <div className="profile-col">
          <div className="deals-section-card">
            <h3 className="section-title">👤 Thông tin hồ sơ cá nhân</h3>
            <form onSubmit={handleProfileSave} className="checkout-form" style={{ marginTop: '12px' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên thành viên</label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mã Sinh Viên / Mã VIP</label>
                  <input
                    type="text"
                    value={formState.studentId}
                    onChange={(e) => setFormState({ ...formState, studentId: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email nhận hóa đơn điện tử</label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="add-btn" style={{ maxWidth: '220px' }}>
                💾 Lưu cập nhật hồ sơ
              </button>
            </form>
          </div>

          {/* Sổ Địa Chỉ Nhận Hàng */}
          <div className="deals-section-card">
            <h3 className="section-title">
              📍 Sổ địa chỉ nhận hàng ({(userProfile.addresses || []).length})
            </h3>
            <p className="section-subtitle" style={{ marginBottom: '12px' }}>
              Địa chỉ mặc định sẽ tự động điền sẵn khi bạn thanh toán tại Giỏ hàng
            </p>

            <div className="address-book-list">
              {(userProfile.addresses || []).map((addr) => (
                <div
                  key={addr.id}
                  className={`address-book-card ${addr.isDefault ? 'default-addr' : ''}`}
                >
                  <div>
                    <div className="addr-card-top">
                      <strong>{addr.label}</strong>
                      {addr.isDefault && (
                        <span className="default-addr-badge">✓ Mặc định</span>
                      )}
                    </div>
                    <div className="addr-recipient">
                      {addr.recipient} • {addr.phone}
                    </div>
                    <p className="addr-detail-line">{addr.detail}</p>
                  </div>

                  <div className="addr-card-actions">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        className="price-chip"
                        onClick={() => dispatch(setDefaultAddress(addr.id))}
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => dispatch(removeAddress(addr.id))}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddAddress} className="add-addr-form">
              <h4>+ Thêm địa chỉ giao hàng mới</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên gợi nhớ (VD: KTX PTIT, Nhà riêng)</label>
                  <input
                    type="text"
                    placeholder="Nhập tên địa chỉ..."
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại nhận hàng</label>
                  <input
                    type="tel"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ chi tiết</label>
                <input
                  type="text"
                  placeholder="Số nhà, tòa nhà, đường, quận/huyện..."
                  value={newAddr.detail}
                  onChange={(e) => setNewAddr({ ...newAddr, detail: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="detail-btn">
                + Thêm vào sổ địa chỉ
              </button>
            </form>
          </div>
        </div>

        {/* Cột phải: Ví Voucher đã lưu & Sản phẩm Yêu thích */}
        <div className="profile-col">
          <div className="deals-section-card">
            <div className="gamify-header">
              <h3 className="section-title">🎟️ Ví Voucher Đã Lưu ({myVouchers.length})</h3>
              <button
                type="button"
                className="inline-link-btn"
                onClick={() => onNavigate && onNavigate('deals')}
              >
                Săn thêm mã →
              </button>
            </div>

            <div className="profile-vouchers-list">
              {myVouchers.map((v) => (
                <div key={v.code} className="mini-voucher-row">
                  <div>
                    <strong className="mini-v-code">{v.code}</strong>
                    <span>{v.label}</span>
                  </div>
                  <button
                    type="button"
                    className="price-chip active"
                    onClick={() => {
                      dispatch(applyVoucher(v.code));
                      if (onNavigate) onNavigate('home');
                    }}
                  >
                    Dùng ngay
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="deals-section-card">
            <h3 className="section-title">
              ❤️ Danh sách Yêu thích ({wishlistedProducts.length})
            </h3>
            {wishlistedProducts.length === 0 ? (
              <p className="section-subtitle" style={{ marginTop: '8px' }}>
                Bạn chưa lưu sản phẩm yêu thích nào.
              </p>
            ) : (
              <div className="profile-wishlist-list">
                {wishlistedProducts.map((wp) => (
                  <div key={wp.id} className="wishlist-mini-row">
                    <span className="wishlist-mini-icon">{wp.icon}</span>
                    <div className="wishlist-mini-info">
                      <strong>{wp.name}</strong>
                      <span>{wp.price.toLocaleString()} đ</span>
                    </div>
                    <div className="wishlist-mini-actions">
                      <button
                        type="button"
                        className="price-chip active"
                        onClick={() => {
                          dispatch(addItem(wp));
                          if (onNavigate) onNavigate('home');
                        }}
                      >
                        + Giỏ
                      </button>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => dispatch(toggleWishlist(wp.id))}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
