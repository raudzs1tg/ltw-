import { useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { applyVoucher, clearToast } from './redux/cartSlice';
import { vouchers } from './data';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import './App.css';

function MainLayout() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const toast = useSelector((s) => s.cart.toast);
  const orders = useSelector((s) => s.cart.orders || []);
  const appliedVoucher = useSelector((s) => s.cart.appliedVoucher);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // Đồng hồ đếm ngược Flash Sale trực tiếp
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 38, seconds: 52 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 4;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tự động ẩn thông báo Toast sau 2.8 giây
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      dispatch(clearToast());
    }, 2800);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  const scrollToCart = () => {
    const el = document.getElementById('cart-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`app-wrapper ${theme}`}>
      {/* Toast thông báo nổi */}
      {toast && (
        <div className={`toast-banner toast-${toast.type}`} onClick={() => dispatch(clearToast())}>
          <span>{toast.message}</span>
          <button className="toast-close">✕</button>
        </div>
      )}

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectWishlist={setActiveCategory}
        onOpenOrders={() => setShowOrdersModal(true)}
        onScrollToCart={scrollToCart}
      />

      <main className="shop-container">
        {/* Hero Banner Flagship */}
        <div className="hero-banner">
          <div className="hero-content-left">
            <div className="hero-top-pills">
              <span className="hero-badge">⚡ Giảm giá 20% hôm nay</span>
              <span className="hero-live-pill">● FLASH SALE ĐANG DIỄN RA</span>
            </div>

            <h1>PTIT Tech Store — Siêu Thị Gear & Phụ Kiện Đỉnh Cao</h1>
            <p>
              Trải nghiệm mua sắm phụ kiện công nghệ chính hãng với kiến trúc{' '}
              <strong>React Context (Dark/Light Mode)</strong> &{' '}
              <strong>Redux Toolkit (Smart Cart)</strong> mượt mà, tức thì.
            </p>

            {/* Thanh săn mã Voucher 1 chạm */}
            <div className="hero-vouchers-strip">
              <span className="strip-label">🎁 Săn mã liền tay:</span>
              {vouchers.map((v) => {
                const isUsed = appliedVoucher === v.code;
                return (
                  <button
                    key={v.code}
                    className={`hero-voucher-btn ${isUsed ? 'active' : ''}`}
                    onClick={() => dispatch(applyVoucher(v.code))}
                  >
                    <strong>{v.code}</strong>
                    <span>{isUsed ? '✓ Đã lưu' : v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hero-countdown-card">
            <span className="countdown-label">⏳ KẾT THÚC TRONG</span>
            <div className="countdown-boxes">
              <div className="cd-box">
                <strong>{pad(timeLeft.hours)}</strong>
                <small>Giờ</small>
              </div>
              <span className="cd-sep">:</span>
              <div className="cd-box">
                <strong>{pad(timeLeft.minutes)}</strong>
                <small>Phút</small>
              </div>
              <span className="cd-sep">:</span>
              <div className="cd-box">
                <strong>{pad(timeLeft.seconds)}</strong>
                <small>Giây</small>
              </div>
            </div>
            <div className="hero-stats-mini">
              <div>
                <strong>4.9★</strong>
                <span>15K+ Đánh giá</span>
              </div>
              <div className="stat-divider" />
              <div>
                <strong>2 Giờ</strong>
                <span>Giao hỏa tốc</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Cam kết dịch vụ vàng */}
        <div className="trust-features-bar">
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <div>
              <strong>Chính hãng 100%</strong>
              <p>Bảo hành điện tử 24 tháng</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🚀</span>
            <div>
              <strong>Giao hỏa tốc 2H</strong>
              <p>Miễn phí vận chuyển toàn quốc</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔄</span>
            <div>
              <strong>1 Đổi 1 trong 30 ngày</strong>
              <p>Hỗ trợ đổi mới tận nhà</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🎓</span>
            <div>
              <strong>Đặc quyền SV PTIT</strong>
              <p>Mã PTIT20 giảm ngay 20%</p>
            </div>
          </div>
        </div>

        {/* Cột trái: Danh mục & Sản phẩm */}
        <ProductList
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Cột phải: Hóa đơn giỏ hàng */}
        <Cart />
      </main>

      {/* Modal Lịch Sử Đơn Hàng */}
      {showOrdersModal && (
        <div className="modal-backdrop" onClick={() => setShowOrdersModal(false)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowOrdersModal(false)}>
              ✕
            </button>
            <h3 className="section-title">📦 Lịch sử đơn hàng đã đặt ({orders.length})</h3>
            {orders.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">📭</div>
                <p className="empty-cart-title">Bạn chưa có đơn hàng nào</p>
                <span className="empty-cart-sub">
                  Các đơn hàng sau khi thanh toán sẽ được lưu tự động tại đây!
                </span>
              </div>
            ) : (
              <div className="orders-history-list">
                {orders.map((ord) => (
                  <div key={ord.id} className="order-history-card">
                    <div className="order-history-header">
                      <div>
                        <span className="order-code-badge">{ord.id}</span>
                        <span className="order-date-text">{ord.createdAt}</span>
                      </div>
                      <span className="order-status-pill">✓ Đã xác nhận</span>
                    </div>
                    <div className="order-customer-line">
                      📍 Giao tới: <strong>{ord.customer?.name}</strong> ({ord.customer?.phone}) —{' '}
                      {ord.customer?.address}
                    </div>
                    <div className="order-items-mini">
                      {ord.items?.map((it) => (
                        <span key={it.id} className="order-item-chip">
                          {it.icon} {it.name} × {it.qty}
                        </span>
                      ))}
                    </div>
                    <div className="order-history-footer">
                      <span>
                        Thanh toán:{' '}
                        <strong>
                          {ord.customer?.paymentMethod === 'qr'
                            ? 'VietQR'
                            : ord.customer?.paymentMethod === 'momo'
                            ? 'Ví MoMo'
                            : 'COD'}
                        </strong>
                      </span>
                      <span className="order-total-highlight">
                        Tổng tiền: {(ord.finalTotal || 0).toLocaleString()} đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer hiện đại */}
      <footer className="shop-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="brand-title">
              <span>🛍️</span> PTIT Tech Store
            </div>
            <p>
              Hệ thống bán lẻ Gear, Bàn phím cơ Custom, Chuột Gaming & Thiết bị Setup
              hàng đầu dành cho lập trình viên và game thủ.
            </p>
          </div>
          <div className="footer-tech-badges">
            <span>⚛️ React 19</span>
            <span>🎨 ThemeContext (Light/Dark)</span>
            <span>🧰 Redux Toolkit</span>
            <span>💾 LocalStorage Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}
